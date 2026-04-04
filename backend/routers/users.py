from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"])

@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # check if email already exists
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # never store raw passwords — always hash
    hashed = pwd_context.hash(user.password)

    new_user = models.User(email=user.email, hashed_password=hashed)
    db.add(new_user)       # stage the insert
    db.commit()            # actually write to Postgres
    db.refresh(new_user)   # get the auto-generated id back
    return new_user