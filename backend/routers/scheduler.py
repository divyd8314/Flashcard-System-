from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import datetime
from services.scheduler import generate_schedule

router = APIRouter()

# CREATE a schedule — takes decks + date range + daily minutes
@router.post("/", response_model=schemas.ScheduleResponse)
def create_schedule(data: schemas.ScheduleCreate, user_id: int, db: Session = Depends(get_db)):
    # get all decks for this user
    decks = db.query(models.Deck)\
        .filter(models.Deck.user_id == user_id)\
        .all()

    if not decks:
        raise HTTPException(status_code=404, detail="No decks found for this user")

    # create the schedule container first
    schedule = models.Schedule(
        user_id=user_id,
        title=data.title,
        start_date=data.start_date,
        end_date=data.end_date
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    # generate the items using your service logic
    items = generate_schedule(
        decks=decks,
        start_date=data.start_date,
        end_date=data.end_date,
        minutes_per_day=data.minutes_per_day
    )

    # bulk insert all schedule items
    for item in items:
        db_item = models.ScheduleItem(
            schedule_id=schedule.id,
            deck_id=item["deck_id"],
            study_date=item["study_date"],
            minutes_allocated=item["minutes_allocated"],
            focus_note=item["focus_note"]
        )
        db.add(db_item)

    db.commit()
    return schedule


# GET today's scheduled deck for a user
# this is the endpoint that pairs with core —
# whatever is scheduled today is what shows up in the session
@router.get("/today")
def get_todays_schedule(user_id: int, db: Session = Depends(get_db)):
    today = datetime.date.today()

    # find the active schedule for this user
    schedule = db.query(models.Schedule)\
        .filter(models.Schedule.user_id == user_id)\
        .filter(models.Schedule.start_date <= today)\
        .filter(models.Schedule.end_date >= today)\
        .first()

    if not schedule:
        return {"message": "No active schedule", "deck": None}

    # find today's item in that schedule
    item = db.query(models.ScheduleItem)\
        .filter(models.ScheduleItem.schedule_id == schedule.id)\
        .filter(models.ScheduleItem.study_date == today)\
        .first()

    if not item:
        return {"message": "No study item for today", "deck": None}

    # get the actual deck
    deck = db.query(models.Deck)\
        .filter(models.Deck.id == item.deck_id)\
        .first()

    return {
        "deck_id": deck.id,
        "deck_title": deck.title,
        "minutes_allocated": item.minutes_allocated,
        "focus_note": item.focus_note,
        "exam_date": deck.exam_date
    }


# GET full schedule — all items for a user
@router.get("/full")
def get_full_schedule(user_id: int, db: Session = Depends(get_db)):
    today = datetime.date.today()

    schedule = db.query(models.Schedule)\
        .filter(models.Schedule.user_id == user_id)\
        .filter(models.Schedule.end_date >= today)\
        .first()

    if not schedule:
        raise HTTPException(status_code=404, detail="No schedule found")

    items = db.query(models.ScheduleItem)\
        .filter(models.ScheduleItem.schedule_id == schedule.id)\
        .order_by(models.ScheduleItem.study_date.asc())\
        .all()

    result = []
    for item in items:
        deck = db.query(models.Deck).filter(models.Deck.id == item.deck_id).first()
        result.append({
            "date": item.study_date,
            "deck_title": deck.title,
            "minutes": item.minutes_allocated,
            "note": item.focus_note
        })

    return result