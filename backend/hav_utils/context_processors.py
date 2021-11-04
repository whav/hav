from apps.hav_collections.models import Collection


def collections(request):
    return {"all_collections": Collection.objects.all().order_by("type", "short_name")}
