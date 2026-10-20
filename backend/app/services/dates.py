from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
import dateparser

def parse_natural_date(text: Optional[str]) -> Tuple[Optional[datetime], str]:
    """
    Parses natural language date string (e.g. 'tomorrow', 'today 4:00 PM', 'next Friday')
    Returns a tuple of (parsed_datetime, human_friendly_display_string).
    """
    if not text or not text.strip():
        return None, ""

    text = text.strip()
    now = datetime.now(timezone.utc)
    
    settings = {
        "PREFER_DATES_FROM": "future",
        "RELATIVE_BASE": now.replace(tzinfo=None),
        "RETURN_AS_TIMEZONE_AWARE": False
    }

    parsed = dateparser.parse(text, settings=settings)
    if not parsed:
        return None, text

    # Make aware with UTC
    dt = parsed.replace(tzinfo=timezone.utc)
    
    # Format human-friendly display string
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    day_after_start = today_start + timedelta(days=2)

    has_time = parsed.hour != 0 or parsed.minute != 0

    if today_start <= dt < tomorrow_start:
        time_str = dt.strftime("%I:%M %p").lstrip("0") if has_time else ""
        display = f"Today{', ' + time_str if time_str else ''}"
    elif tomorrow_start <= dt < day_after_start:
        time_str = dt.strftime("%I:%M %p").lstrip("0") if has_time else ""
        display = f"Tomorrow, {dt.strftime('%b %d')}{' ' + time_str if time_str else ''}"
    else:
        time_str = dt.strftime("%I:%M %p").lstrip("0") if has_time else ""
        display = f"{dt.strftime('%b %d')}{', ' + time_str if time_str else ''}"

    return dt, display
