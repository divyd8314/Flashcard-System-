# So the main goal of this file is it talks to my databse, the sqlalchemy is the ORM which lets me talk to sql without writing raw 
# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:newpassword123@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# This function gets called by every route that needs the database
# FastAPI automatically opens a session, gives it to your route, then closes it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()