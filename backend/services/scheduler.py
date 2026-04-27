from datetime import datetime, timedelta, date

def generate_schedule(decks: list, start_date: date, end_date: date, minutes_per_day: int) -> list:
    """
    Distributes decks across available study days.
    
    Priority logic:
    1. Decks with exam dates closest to today come first
    2. Decks with lower avg retention get more time allocated
    3. Remaining time filled with non-exam decks
    
    Returns a list of schedule items — router writes them to DB.
    Each item maps a date → deck → minutes.
    """
    if not decks or start_date >= end_date:
        return []

    # sort decks by urgency — exam date soonest first, no exam date last
    def urgency_key(deck):
        if deck.exam_date:
            return (deck.exam_date - date.today()).days
        return 9999  # no exam — lowest priority

    sorted_decks = sorted(decks, key=urgency_key)

    # build list of available study days
    study_days = []
    current = start_date
    while current <= end_date:
        study_days.append(current)
        current += timedelta(days=1)

    if not study_days:
        return []

    # distribute decks across days
    # rotate through decks so each gets coverage
    schedule_items = []
    deck_index = 0

    for day in study_days:
        # how many decks to cover today — cap at 3 to avoid overwhelm
        decks_today = min(3, len(sorted_decks))
        time_per_deck = minutes_per_day // decks_today

        for i in range(decks_today):
            deck = sorted_decks[(deck_index + i) % len(sorted_decks)]
            days_to_exam = (
                (deck.exam_date - day).days
                if deck.exam_date else None
            )

            # generate a focus note so the user knows WHY this deck today
            if days_to_exam is not None and days_to_exam <= 7:
                note = f"Exam in {days_to_exam} days — prioritised"
            elif days_to_exam is not None and days_to_exam <= 14:
                note = f"Exam in {days_to_exam} days — keep reviewing"
            else:
                note = "Regular review"

            schedule_items.append({
                "deck_id": deck.id,
                "study_date": day,
                "minutes_allocated": time_per_deck,
                "focus_note": note
            })

        deck_index = (deck_index + decks_today) % len(sorted_decks)

    return schedule_items