# routers/sessions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from database import get_db
import models, schemas
from datetime import datetime
from services.spaced_rep import run_sm2

router = APIRouter()

# START a session
@router.post("/start", response_model=schemas.SessionResponse)
def start_session(data: schemas.SessionStart, db: DBSession = Depends(get_db)):
    # confirm deck exists
    deck = db.query(models.Deck).filter(models.Deck.id == data.deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    session = models.StudySession(
        user_id=data.user_id,
        deck_id=data.deck_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

# SUBMIT a card review inside a session — this is where SM-2 fires
@router.post("/review", response_model=schemas.ReviewResponse)
def submit_review(data: schemas.ReviewSubmit, db: DBSession = Depends(get_db)):
    # get the card
    card = db.query(models.Card).filter(models.Card.id == data.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # get session
    session = db.query(models.StudySession)\
        .filter(models.StudySession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # check if this deck has an exam date set
    deck = db.query(models.Deck).filter(models.Deck.id == card.deck_id).first()
    exam_date = deck.exam_date if hasattr(deck, 'exam_date') else None

    # run the SM-2 algorithm
    updates = update_card(card, data.was_correct, data.response_time_ms, exam_date)

    # write updated card values back to DB
    card.ease_factor = updates["ease_factor"]
    card.interval_days = updates["interval_days"]
    card.retention_score = updates["retention_score"]
    card.next_review = updates["next_review"]
    card.last_reviewed = updates["last_reviewed"]

    # log the review event
    review = models.CardReview(
        card_id=data.card_id,
        session_id=data.session_id,
        was_correct=data.was_correct,
        response_time_ms=data.response_time_ms
    )
    db.add(review)

    # update session card count
    session.cards_reviewed += 1
    db.commit()
    db.refresh(review)

    return {
        "id": review.id,
        "card_id": review.card_id,
        "was_correct": review.was_correct,
        "response_time_ms": review.response_time_ms,
        "reviewed_at": review.reviewed_at,
        "next_review": updates["next_review"],
        "new_retention": updates["retention_score"]
    }

# END a session — calculates final accuracy
@router.put("/end", response_model=schemas.SessionResponse)
def end_session(data: schemas.SessionEnd, db: DBSession = Depends(get_db)):
    session = db.query(models.StudySession)\
        .filter(models.StudySession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # calculate accuracy from all reviews in this session
    reviews = db.query(models.CardReview)\
        .filter(models.CardReview.session_id == data.session_id).all()

    if reviews:
        correct = sum(1 for r in reviews if r.was_correct)
        session.accuracy = round(correct / len(reviews), 2)

    session.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session

# GET cards due for review in a deck right now
@router.get("/due/{deck_id}", response_model=list[schemas.CardResponse])
def get_due_cards(deck_id: int, db: DBSession = Depends(get_db)):
    now = datetime.utcnow()
    cards = db.query(models.Card)\
        .filter(models.Card.deck_id == deck_id)\
        .filter(models.Card.next_review <= now)\
        .order_by(models.Card.retention_score.asc())\
        .all()
    return cards