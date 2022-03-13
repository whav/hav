import calendar
from datetime import date, datetime, time


def range_from_partial_date(year, month=None, day=None):

    start = None
    end = None

    if day and not month:
        raise ValueError("Cannot create range from year and day.")

    if year and month and day:
        d = date(year, month, day)
        start = d
        end = d
    elif year and month and day is None:
        _, last = calendar.monthrange(year, month)
        start = date(year, month, 1)
        end = date(year, month, last)
    elif year and month is None and day is None:
        start = date(year, 1, 1)
        end = date(year, 12, 31)

    start = datetime.combine(start, time.min)
    end = datetime.combine(end, time.max)

    return start, end
