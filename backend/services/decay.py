from datetime import datetime
import math

def compute_retention(last_reviewed: datetime, ease_factor: float) -> float:
    """
    Ebbinghaus forgetting curve: R = e^(-t/S)
    
    t = days since last review
    S = stability (derived from ease_factor — better known cards
        decay slower because their stability is higher)
    
    Returns a score between 0.0 and 1.0:
    1.0 = perfect retention (just reviewed)
    0.0 = completely forgotten
    
    This runs whenever a user loads their deck — it shows
    them how much they've forgotten since their last session.
    This is what Anki doesn't show you.
    """
    if last_reviewed is None:
        return 0.0  # never reviewed — assume forgotten

    days_elapsed = (datetime.utcnow() - last_reviewed).total_seconds() / 86400
    
    if days_elapsed <= 0:
        return 1.0  # just reviewed

    # stability grows with ease_factor
    # a card with ef=2.5 decays slower than one with ef=1.3
    stability = ease_factor * 8  # tune this multiplier as needed

    retention = math.exp(-days_elapsed / stability)
    return round(max(0.0, min(1.0, retention)), 3)


def get_decay_status(retention: float) -> str:
    """
    Human readable label for retention score.
    React uses this to colour code cards on the dashboard.
    """
    if retention >= 0.8:
        return "strong"    # green
    elif retention >= 0.5:
        return "fading"    # yellow
    elif retention >= 0.2:
        return "weak"      # orange
    else:
        return "forgotten" # red


def compute_deck_health(cards: list) -> dict:
    """
    Aggregates retention across all cards in a deck.
    Used by analytics to show overall deck health.
    """
    if not cards:
        return {"avg_retention": 0.0, "status": "empty", "cards_due": 0}

    retentions = []
    cards_due = 0
    now = datetime.utcnow()

    for card in cards:
        retention = compute_retention(card.last_reviewed, card.ease_factor)
        retentions.append(retention)
        if card.next_review and card.next_review <= now:
            cards_due += 1

    avg = round(sum(retentions) / len(retentions), 3)

    return {
        "avg_retention": avg,
        "status": get_decay_status(avg),
        "cards_due": cards_due
    }