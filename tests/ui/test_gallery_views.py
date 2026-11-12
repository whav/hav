import pytest
from django.urls import reverse

from hav.apps.sets.models import Node


@pytest.mark.django_db
@pytest.mark.parametrize("media_count", [1, 5, 10])
def test_folder_view(client, create_media, django_assert_max_num_queries, media_count):
    """This runs multiple time to not run into N+1 queries by mistake."""

    media_items = [create_media() for x in range(media_count)]
    node = media_items[0].set
    collection = node.get_collection()

    folder_view_url = reverse(
        "hav:folder_view",
        kwargs={"collection_slug": collection.slug, "node_pk": node.pk},
    )

    num_queries = []
    resp_bodies = []
    for display_type in Node.DisplayOptions.values:
        node.display_type = display_type
        node.save()
        with django_assert_max_num_queries(10) as captured:
            resp = client.get(folder_view_url)

        num_queries.append(len(captured))
        resp_bodies.append(resp.content)
        assert resp.status_code == 200

        # now find links to the specific media item
        # this is not exact ....
        body = resp.content.decode("utf-8")
        for m in media_items:
            assert f"/{m.pk}/" in body

    assert len(set(resp_bodies)) == len(
        Node.DisplayOptions.values
    ), "Display options lead to different response bodies"

    # TODO: this currently fails....
    # assert (
    #     len(set(num_queries)) == 1
    # ), "All display otions use the same amount of database queries"


@pytest.mark.django_db
def test_folder_view_grouped_by_creation_date(client, create_media):
    from datetime import datetime, timezone

    from psycopg.types.range import TimestamptzRange

    def day(y, m, d, hour=0):
        start = datetime(y, m, d, hour, tzinfo=timezone.utc)
        return TimestamptzRange(start, start.replace(hour=23), "[]")

    later, earlier, same_day, undated = [create_media() for _ in range(4)]
    later.creation_date = day(2020, 5, 2)
    earlier.creation_date = day(1988, 3, 1)
    same_day.creation_date = day(1988, 3, 1, hour=12)
    for m in (later, earlier, same_day):
        m.save()

    node = later.set
    node.display_type = Node.DisplayOptions.GROUPED_CREATION_DATE
    node.save()

    url = reverse(
        "hav:folder_view",
        kwargs={"collection_slug": node.get_collection().slug, "node_pk": node.pk},
    )
    body = client.get(url).content.decode("utf-8")

    headings = [
        line.split(">", 1)[1].split("<", 1)[0]
        for line in body.splitlines()
        if line.startswith('<h2 class="text-xl')
    ]
    # one group per calendar day, chronological, undated media last
    assert headings == ["March 1, 1988", "May 2, 2020", "Undated"]
    assert body.index(f"/{earlier.pk}/") < body.index(f"/{later.pk}/")
    assert body.index(f"/{same_day.pk}/") < body.index(f"/{later.pk}/")
    assert body.index(f"/{later.pk}/") < body.index(f"/{undated.pk}/")
