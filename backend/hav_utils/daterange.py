import aniso8601 as iso8601
from aniso8601.resolution import DateResolution, TimeResolution
from datetime import datetime, time, date
import calendar
import re
from enum import Enum
from django.utils import formats

split_date_time = re.compile(r"(?P<date>[\d\-]+)[\ T]?(?P<time>.*)?")


def _parse(dt_string):
    match = split_date_time.match(dt_string)
    if match is None:
        raise ValueError(f"Unable to parse {dt_string}.")
    d = match.groupdict()
    date_part = d.get("date")
    time_part = d.get("time")
    start, end = parse_date(date_part)
    if time_part:
        d = start.date()
        tMin, tMax = parse_time(time_part)
        start, end = datetime.combine(d, tMin), datetime.combine(d, tMax)
    return start, end


def parse(dt_startend_string):
    dt_string_list = [s.strip() for s in dt_startend_string.split("<>")]
    dt_string_list_length = len(dt_string_list)

    if dt_string_list_length == 1:
        start, end = _parse(dt_string_list[0])

    elif dt_string_list_length == 2:
        parsed_dates = []
        for dt_string in dt_string_list:
            parsed_dates.append(_parse(dt_string))
        # check that we got the parsed ranges in the correct order
        if parsed_dates[0][1] <= parsed_dates[1][0]:
            start = parsed_dates[0][0]
            end = parsed_dates[1][1]
        elif parsed_dates[1][1] <= parsed_dates[0][0]:
            start = parsed_dates[1][0]
            end = parsed_dates[0][1]
        # ...and assume overlapping ranges are a mistake
        else:
            raise ValueError(f"Unable to parse '{dt_string_list}': \
Overlapping start/end dateranges")

    else:
        raise ValueError(f"Unable to parse '{dt_string_list}': \
zero or more than two datestrings for start/end'")

    return start, end


def parse_time(time_string):
    t, resolution = (
        iso8601.parse_time(time_string),
        iso8601.get_time_resolution(time_string),
    )
    tMin = t
    if resolution == TimeResolution.Hours:
        tMax = t.replace(
            minute=time.max.minute,
            second=time.max.second,
            microsecond=time.max.microsecond,
        )
    elif resolution == TimeResolution.Minutes:
        tMax = t.replace(second=time.max.second, microsecond=time.max.microsecond)
    elif resolution == TimeResolution.Seconds:
        if t.microsecond:
            tMax = t
        else:
            tMax = t.replace(microsecond=time.max.microsecond)
    else:
        raise NotImplementedError(f'Unable to deal with time input "{time_string}".')
    return tMin, tMax


def parse_date(date_string):
    d, resolution = (
        iso8601.parse_date(date_string),
        iso8601.get_date_resolution(date_string),
    )
    dMin = datetime.combine(d, time.min)
    if resolution == DateResolution.Year:
        dMax = d.replace(month=12, day=31)
    elif resolution == DateResolution.Month:
        lastDayOfMonth = calendar.monthrange(d.year, d.month)[1]
        dMax = d.replace(day=lastDayOfMonth)
    elif resolution == DateResolution.Day:
        dMax = d
    else:
        raise NotImplementedError(f'Unable to deal with input "{date_string}".')
    dMax = datetime.combine(dMax, time.max)
    return dMin, dMax


class Resolutions(Enum):
    YEAR = 0
    MONTH = 1
    DAY = 2


class ReverseDateTimeRange:
    def __init__(self, start: datetime, end: datetime):
        self.start, self.end = sorted([start, end])
        self.min_time = time.min
        self.max_time = time.max

    def get_resolution(self):
        # breakpoint()
        if self.start.time() == self.min_time and self.end.time() == self.max_time:
            sd = self.start.date()
            ed = self.end.date()

            if sd == ed:
                return Resolutions.DAY

            if (sd.year, sd.month) == (ed.year, ed.month):
                if sd.day == 1 and ed.day == calendar.monthrange(sd.year, sd.month)[1]:
                    return Resolutions.MONTH

            if (
                sd.year == ed.year
                and sd == date(sd.year, 1, 1)
                and ed == date(sd.year, 12, 31)
            ):
                return Resolutions.YEAR

        return None


def calculate_date_resolution(d1: datetime, d2: datetime):
    rdtr = ReverseDateTimeRange(d1, d2)
    return rdtr.get_resolution()


def format_datetime(dt: datetime, resolution=Resolutions.DAY):
    return formats.date_format(dt, "DATE_FORMAT")
