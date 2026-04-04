from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

# CREATE a card inside a deck
@router.post("/", response_model=schemas.CardResponse)
def create_card(deck_id: int, card: schemas.CardCreate, db: Session = Depends(get_db)):
    # first confirm the deck actually exists
    deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    new_card = models.Card(
        deck_id=deck_id,
        front=card.front,
        back=card.back
        # ease_factor, interval_days, retention_score all default
        # automatically from your models.py — no need to set them here
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card

# GET all cards in a deck
@router.get("/", response_model=list[schemas.CardResponse])
def get_cards(deck_id: int, db: Session = Depends(get_db)):
    cards = db.query(models.Card).filter(models.Card.deck_id == deck_id).all()
    return cards

# GET a single card
@router.get("/{card_id}", response_model=schemas.CardResponse)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

# UPDATE a card (edit front/back text)
@router.put("/{card_id}", response_model=schemas.CardResponse)
def update_card(card_id: int, updated: schemas.CardCreate, db: Session = Depends(get_db)):
    card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    card.front = updated.front
    card.back = updated.back
    db.commit()
    db.refresh(card)
    return card

# DELETE a card
@router.delete("/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
    return {"message": "Card deleted"}