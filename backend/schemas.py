from pydantic import BaseModel, field_validator
import re
from datetime import datetime

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
from pydantic import field_validator

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