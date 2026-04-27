from pydantic import BaseModel, field_validator
import re
from datetime import datetime
from datetime import date


class UserCreate(BaseModel):
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        
        letters = re.findall(r'[a-zA-Z]', v)
        numbers = re.findall(r'[0-9]', v)
        capitals = re.findall(r'[A-Z]', v)

        if len(letters) < 4:
            raise ValueError("Password must contain at least 4 letters")
        if len(numbers) < 4:
            raise ValueError("Password must contain at least 4 numbers")
        if len(capitals) < 1:
            raise ValueError("Password must contain at least 1 capital letter")

        return v
    
class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True
        

# ─── DECKS ───────────────────────────────────────
class DeckCreate(BaseModel):
    title: str
    subject: str

class DeckResponse(BaseModel):
    id: int
    user_id: int
    title: str
    subject: str

    class Config:
        from_attributes = True
    

# ─── CARDS ───────────────────────────────────────

class CardCreate(BaseModel):
    front: str
    back: str

    @field_validator("front", "back")
    @classmethod
    def no_empty_strings(cls, v):
        if not v.strip():
            raise ValueError("Cannot be blank")
        if len(v) > 500:
            raise ValueError("Cannot exceed 500 characters")
        return v.strip()   # also cleans up accidental whitespace

class CardResponse(BaseModel):
    id: int
    deck_id: int
    front: str
    back: str
    ease_factor: float
    interval_days: int
    retention_score: float
    next_review: datetime

    class Config:
        from_attributes = True
        
# ─── SESSIONS ───────────────────────────────────────
class SessionStart(BaseModel):
    user_id: int
    deck_id: int

class SessionEnd(BaseModel):
    user_id: int
    deck_id: int

class SessionResponse(BaseModel):
    id: int
    user_id: int
    started_at: datetime
    ended_at: datetime | None
    cards_reviewed: int
    accuracy: float | None

    class Config:
        from_attributes = True

# ─── REVIEWS (card result inside a session) ───────
class ReviewSubmit(BaseModel):
    session_id: int
    card_id: int
    was_correct: bool
    response_time_ms: int

    @field_validator("response_time_ms")
    @classmethod
    def reasonable_response_time(cls, v):
        if v < 0:
            raise ValueError("Response time cannot be negative")
        if v > 300000:  # 5 minutes — if it took longer they walked away
            raise ValueError("Response time unreasonably long")
        return v

class ReviewResponse(BaseModel):
    id: int
    card_id: int
    was_correct: bool
    response_time_ms: int
    reviewed_at: datetime
    next_review: datetime       # send this back so React can show "see you in X days"
    new_retention: float

    class Config:
        from_attributes = True

# ─── EXAM DATE ────────────────────────────────────
class ExamDateSet(BaseModel):
    deck_id: int
    exam_date: date

    @field_validator("exam_date")
    @classmethod
    def exam_must_be_future(cls, v):
        if v <= date.today():
            raise ValueError("Exam date must be in the future")
        return v

class ScheduleCreate(BaseModel):
    title: str
    start_date: date
    end_date: date
    minutes_per_day: int

    @field_validator("minutes_per_day")
    @classmethod
    def reasonable_study_time(cls, v):
        if v < 10:
            raise ValueError("Minimum 10 minutes per day")
        if v > 480:
            raise ValueError("Maximum 8 hours per day")
        return v

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v, info):
        if "start_date" in info.data and v <= info.data["start_date"]:
            raise ValueError("End date must be after start date")
        return v
    
class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    title: str
    start_date: date
    end_date: date

    class Config:
        from_attributes = True