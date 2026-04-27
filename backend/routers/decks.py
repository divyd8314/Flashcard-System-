from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

# CREATE a deck
@router.post("/", response_model=schemas.DeckResponse)
def create_deck(deck: schemas.DeckCreate, user_id: int, db: Session = Depends(get_db)):
    new_deck = models.Deck(
        title=deck.title,
        subject=deck.subject,
        user_id=user_id
    )
    db.add(new_deck)
    db.commit()
    db.refresh(new_deck)
    return new_deck

# GET all decks for a user
@router.get("/", response_model=list[schemas.DeckResponse])
def get_decks(user_id: int, db: Session = Depends(get_db)):
    decks = db.query(models.Deck).filter(models.Deck.user_id == user_id).all()
    return decks

# GET one deck by id
@router.get("/{deck_id}", response_model=schemas.DeckResponse)
def get_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck

# DELETE a deck
@router.delete("/{deck_id}")
def delete_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(deck)
    db.commit()
    return {"message": "Deck deleted"}

@router.put("/{deck_id}/exam-date")
def set_exam_date(deck_id: int, data: schemas.ExamDateSet, db: Session = Depends(get_db)):
    deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    deck.exam_date = data.exam_date
    db.commit()
    return {"message": f"Exam date set to {data.exam_date}"}