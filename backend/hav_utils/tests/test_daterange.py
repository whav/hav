import unittest
from ..daterange import (
    parse,
    parse_date,
    parse_time,
    calculate_date_resolution,
    Resolutions,
)
from datetime import date, datetime, time


class TestDateString(unittest.TestCase):
    def test_year(self):
        self.assertEqual(
            parse_date("2008"),
            (
                datetime.combine(date(2008, 1, 1), time.min),
                datetime.combine(date(2008, 12, 31), time.max),
            ),
        )

    def test_month(self):
        self.assertEqual(
            parse_date("2008-05"),
            (
                datetime.combine(date(2008, 5, 1), time.min),
                datetime.combine(date(2008, 5, 31), time.max),
            ),
        )

        self.assertEqual(
            parse_date("2020-02"),
            (
                datetime.combine(date(2020, 2, 1), time.min),
                datetime.combine(date(2020, 2, 29), time.max),
            ),
            "deal with leap years",
        )

    def test_day(self):
        day = date(2019, 2, 26)
        self.assertEqual(
            parse_date("2019-02-26"),
            (datetime.combine(day, time.min), datetime.combine(day, time.max)),
        )


class TestTimeParsing(unittest.TestCase):
    def test_minute(self):
        self.assertEqual(
            parse_time("14:01"), (time(14, 1), time.max.replace(hour=14, minute=1))
        )

    def test_hour(self):
        self.assertEqual(parse_time("14"), (time(14, 0), time.max.replace(hour=14)))

    def test_second(self):
        self.assertEqual(
            parse_time("14:03:22"),
            (time(14, 3, 22), time.max.replace(hour=14, minute=3, second=22)),
        )

    def test_microseconds(self):
        t = time(14, 42, 5, 123000)
        self.assertEqual(parse_time("14:42:05.123"), (t, t))


class TestTopLevelParser(unittest.TestCase):
    def test_year(self):
        self.assertEqual(
            parse("2008"),
            (
                datetime.combine(date(2008, 1, 1), time.min),
                datetime.combine(date(2008, 12, 31), time.max),
            ),
        )


class TestReverseDTRange(unittest.TestCase):
    def test_year(self):
        self.assertEqual(
            calculate_date_resolution(
                datetime.combine(date(2008, 1, 1), time.min),
                datetime.combine(date(2008, 12, 31), time.max),
            ),
            Resolutions.YEAR,
        )

    def test_month(self):
        self.assertEqual(
            calculate_date_resolution(
                datetime.combine(date(2008, 3, 1), time.min),
                datetime.combine(date(2008, 3, 31), time.max),
            ),
            Resolutions.MONTH,
        )

    def test_day(self):
        self.assertEqual(
            calculate_date_resolution(
                datetime.combine(date(2008, 3, 13), time.min),
                datetime.combine(date(2008, 3, 13), time.max),
            ),
            Resolutions.DAY,
        )


if __name__ == "__main__":
    unittest.main()
