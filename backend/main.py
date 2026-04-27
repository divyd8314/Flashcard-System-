# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import users, decks, cards, sessions, scheduler, analytics

# This line actually creates all your tables in Postgres on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Adaptive Learning API")
app.include_router(users.router,  prefix="/api/users")
app.include_router(decks.router,  prefix="/api/decks")   # add this line
app.include_router(users.router, prefix="/api")
app.include_router(users.router,  prefix="/api/users")
app.include_router(decks.router,  prefix="/api/decks")
app.include_router(cards.router,  prefix="/api/cards")
app.include_router(sessions.router, prefix="/api/sessions")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "running"}

app.include_router(scheduler.router,  prefix="/api/scheduler")
app.include_router(analytics.router,  prefix="/api/analytics")
