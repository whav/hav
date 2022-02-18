import pytest
from django.urls import reverse
from apps.sets.models import Node


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
