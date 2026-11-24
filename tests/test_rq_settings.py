import django_rq
import pytest


@pytest.mark.parametrize("name", ["default", "webassets", "archive"])
def test_queues_are_synchronous_and_separate_in_tests(name):
    # jobs must not end up in the real queues, where workers would run them
    # against the development database
    queue = django_rq.get_queue(name)
    assert queue.is_async is False
    assert queue.connection.connection_pool.connection_kwargs["db"] == 5


def test_search_index_is_separate_in_tests():
    from django.conf import settings

    assert settings.MEILISEARCH_INDEX.endswith("_test")
