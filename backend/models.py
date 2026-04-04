# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    decks = relationship("Deck", back_populates="owner")
    sessions = relationship("StudySession", back_populates="user")
    schedules = relationship("Schedule", back_populates="user")


class Deck(Base):
    __tablename__ = "decks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    subject = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck")


class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"))
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    retention_score = Column(Float, default=1.0)
    next_review = Column(DateTime, default=datetime.datetime.utcnow)
    last_reviewed = Column(DateTime, nullable=True)

    deck = relationship("Deck", back_populates="cards")
    reviews = relationship("CardReview", back_populates="card")


class CardReview(Base):
    __tablename__ = "card_reviews"
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    session_id = Column(Integer, ForeignKey("study_sessions.id"))
    was_correct = Column(Boolean, nullable=False)
    response_time_ms = Column(Integer)
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)

    card = relationship("Card", back_populates="reviews")
    session = relationship("StudySession", back_populates="reviews")


class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    cards_reviewed = Column(Integer, default=0)
    accuracy = Column(Float, nullable=True)

    user = relationship("User", back_populates="sessions")
    reviews = relationship("CardReview", back_populates="session")


class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)

    user = relationship("User", back_populates="schedules")
    items = relationship("ScheduleItem", back_populates="schedule")


class ScheduleItem(Base):
    __tablename__ = "schedule_items"
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    deck_id = Column(Integer, ForeignKey("decks.id"))
    study_date = Column(Date, nullable=False)
    minutes_allocated = Column(Integer, default=30)
    focus_note = Column(String)

    schedule = relationship("Schedule", back_populates="items")
    deck = relationship("Deck")