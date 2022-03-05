from django.test import SimpleTestCase
from datetime import date, time, datetime

from hav.apps.media.utils.dtrange import range_from_partial_date


class DateTimeRangeTest(SimpleTestCase):
    def testYearOnly(self):
        self.assertEqual(
            range_from_partial_date(2017),
            (
                datetime.combine(date(2017, 1, 1), time.min),
                datetime.combine(date(2017, 12, 31), time.max),
            ),
        )

    def testYearAndMonth(self):
        self.assertEqual(
            range_from_partial_date(2017, 2),
            (
                datetime.combine(date(2017, 2, 1), time.min),
                datetime.combine(date(2017, 2, 28), time.max),
            ),
        )

    def testYearMonthAndDay(self):
        self.assertEqual(
            range_from_partial_date(2017, 2, 15),
            (
                datetime.combine(date(2017, 2, 15), time.min),
                datetime.combine(date(2017, 2, 15), time.max),
            ),
        )

    def testErrors(self):
        with self.assertRaises(ValueError):
            range_from_partial_date(2017, None, 2)
