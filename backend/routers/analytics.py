from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from datetime import datetime, date, timedelta
from services.decay import compute_retention, compute_deck_health, get_decay_status

router = APIRouter()

# GET study streak — consecutive days studied
@router.get("/streak")
def get_streak(user_id: int, db: Session = Depends(get_db)):
    sessions = db.query(models.StudySession)\
        .filter(models.StudySession.user_id == user_id)\
        .filter(models.StudySession.ended_at.isnot(None))\
        .order_by(models.StudySession.started_at.desc())\
        .all()

    if not sessions:
        return {"streak_days": 0, "last_studied": None}

    streak = 0
    check_date = date.today()

    # walk backwards through dates counting consecutive days
    for session in sessions:
        session_date = session.started_at.date()
        if session_date == check_date or session_date == check_date - timedelta(days=1):
            if session_date != check_date:
                check_date = session_date
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break  # gap found — streak ends here

    return {
        "streak_days": streak,
        "last_studied": sessions[0].started_at
    }


# GET accuracy over time — one data point per session
# React uses this to draw your accuracy line chart
@router.get("/accuracy")
def get_accuracy_over_time(user_id: int, db: Session = Depends(get_db)):
    sessions = db.query(models.StudySession)\
        .filter(models.StudySession.user_id == user_id)\
        .filter(models.StudySession.accuracy.isnot(None))\
        .order_by(models.StudySession.started_at.asc())\
        .all()

    return [
        {
            "date": s.started_at,
            "accuracy": s.accuracy,
            "cards_reviewed": s.cards_reviewed
        }
        for s in sessions
    ]


# GET retention snapshot — all cards with current decay score
# this powers your heatmap / card health view
@router.get("/retention")
def get_retention_snapshot(user_id: int, db: Session = Depends(get_db)):
    cards = db.query(models.Card)\
        .join(models.Deck)\
        .filter(models.Deck.user_id == user_id)\
        .all()

    result = []
    for card in cards:
        current_retention = compute_retention(card.last_reviewed, card.ease_factor)
        result.append({
            "card_id": card.id,
            "front": card.front,
            "deck_id": card.deck_id,
            "retention": current_retention,
            "status": get_decay_status(current_retention),
            "next_review": card.next_review
        })

    # sort by retention ascending — most forgotten first
    result.sort(key=lambda x: x["retention"])
    return result


# GET deck health summary — per deck avg retention + cards due
@router.get("/deck-health")
def get_deck_health(user_id: int, db: Session = Depends(get_db)):
    decks = db.query(models.Deck)\
        .filter(models.Deck.user_id == user_id)\
        .all()

    result = []
    for deck in decks:
        cards = db.query(models.Card)\
            .filter(models.Card.deck_id == deck.id)\
            .all()

        health = compute_deck_health(cards)
        result.append({
            "deck_id": deck.id,
            "deck_title": deck.title,
            "avg_retention": health["avg_retention"],
            "status": health["status"],
            "cards_due": health["cards_due"],
            "exam_date": deck.exam_date
        })

    return result


# GET cards due right now across ALL decks
@router.get("/due-now")
def get_all_due_cards(user_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()

    cards = db.query(models.Card)\
        .join(models.Deck)\
        .filter(models.Deck.user_id == user_id)\
        .filter(models.Card.next_review <= now)\
        .order_by(models.Card.retention_score.asc())\
        .all()

    return {
        "total_due": len(cards),
        "cards": [
            {
                "card_id": c.id,
                "front": c.front,
                "deck_id": c.deck_id,
                "retention": compute_retention(c.last_reviewed, c.ease_factor),
                "days_overdue": (now - c.next_review).days
            }
            for c in cards
        ]
    }