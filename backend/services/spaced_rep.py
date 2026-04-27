from datetime import datetime, timedelta, date

def compute_quality(was_correct: bool, response_time_ms: int) -> int:
    """
    Converts user input into a 0-5 quality score for SM-2.
    
    This is your anti-spam layer — response time affects score
    even when the user clicks 'Got it'. A correct answer in 400ms
    is impossible to have genuinely recalled.
    """
    if not was_correct:
        return 1  # wrong answer, near failure

    # correct answer — quality depends on how fast
    if response_time_ms < 1000:
        return 2  # impossibly fast — penalised, likely spam
    elif response_time_ms < 3000:
        return 5  # fast and correct — strong recall
    elif response_time_ms < 8000:
        return 4  # correct but thought about it — decent recall
    else:
        return 3  # correct but slow — weak recall, needs more review


def apply_exam_urgency(interval: int, exam_date: date) -> int:
    """
    Compresses review intervals as exam date approaches.
    
    This is your differentiator from Anki — the algorithm
    knows about deadlines and gets aggressive near them.
    """
    days_until_exam = (exam_date - date.today()).days

    if days_until_exam <= 0:
        return interval  # exam passed, no compression needed

    if days_until_exam <= 7:
        return min(interval, 1)   # final week — review daily
    elif days_until_exam <= 14:
        return min(interval, 3)   # two weeks out — every 3 days max
    elif days_until_exam <= 30:
        return min(interval, 7)   # one month out — weekly max

    return interval  # far from exam — normal interval


def run_sm2(card, was_correct: bool, response_time_ms: int, exam_date=None):
    """
    Full SM-2 algorithm.
    
    Takes a card object + review result, returns a dict of
    updated values. Router writes these to the database.
    
    Why SM-2: it's the algorithm behind Anki, backed by
    decades of memory research. Intervals grow exponentially
    for well-known cards and reset for failed ones.
    """
    quality = compute_quality(was_correct, response_time_ms)

    # --- ease factor update ---
    # ease_factor controls how fast intervals grow
    # good answers push it up, bad answers drag it down
    # floor of 1.3 prevents intervals from shrinking to nothing
    new_ef = card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ef = max(1.3, round(new_ef, 2))

    # --- interval update ---
    # quality < 3 means failed — always reset to 1 day
    # first success → 6 days
    # after that → previous interval * ease_factor (grows exponentially)
    if quality < 3:
        new_interval = 1
    elif card.interval_days <= 1:
        new_interval = 6
    else:
        new_interval = round(card.interval_days * new_ef)

    # --- exam urgency compression ---
    if exam_date:
        new_interval = apply_exam_urgency(new_interval, exam_date)

    # --- next review date ---
    next_review = datetime.utcnow() + timedelta(days=new_interval)

    return {
        "ease_factor": new_ef,
        "interval_days": new_interval,
        "next_review": next_review,
        "last_reviewed": datetime.utcnow()
    }