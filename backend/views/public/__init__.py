from django.views.generic import TemplateView, DetailView
from apps.hav_collections.models import Collection
from apps.sets.models import Node
from apps.media.models import Media
from apps.search.paginator import SearchPaginator
from apps.search.client import search
from django.utils.functional import cached_property
from .forms import SearchForm


class LandingPage(TemplateView):
    template_name = "home.html"


class CollectionNodeMixin:

    collection_slug_url_kwarg = "collection_slug"
    node_pk_url_kwarg = "node_pk"

    @cached_property
    def node(self):
        node_pk = self.kwargs.get(self.node_pk_url_kwarg)
        if node_pk is not None:
            return Node.objects.get(pk=node_pk)
        return self.collection.root_node

    @cached_property
    def collection(self):
        return Collection.objects.select_related("root_node").get(
            slug=self.kwargs[self.collection_slug_url_kwarg]
        )

    def get_ancestors(self):
        root_node = self.collection.root_node
        node = self.node
        collection_ancestors = node.get_ancestors().filter(depth__gte=root_node.depth)
        return collection_ancestors

    def get_children(self):
        node = self.node
        return node.get_children()

    def get_media_entries(self):
        return (
            Media.preview_manager.with_image_previews()
            .prefetch_related("files")
            .filter(set=self.node)
            .select_related("collection")
        )

    def get_shared_context(self):
        return {
            "collection": self.collection,
            "node": self.node,
            "ancestors": self.get_ancestors(),
            "children": self.get_children(),
            "media_entries": self.get_media_entries(),
            "is_collection_root": self.node == self.collection.root_node,
        }


class CollectionRoot(CollectionNodeMixin, DetailView):
    model = Node
    template_name = "ui/collection_root.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.get_shared_context())
        return ctx

    def get_object(self, queryset=None):
        collection = self.collection
        return collection.root_node


class FolderView(CollectionNodeMixin, DetailView):
    model = Node
    template_name = "ui/collection.html"

    def get_object(self, queryset=None):
        return self.node

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.get_shared_context())
        return ctx


class MediaView(CollectionNodeMixin, DetailView):
    model = Media
    template_name = "ui/media.html"
    pk_url_kwarg = "media_pk"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.get_shared_context())
        return ctx


class SearchView(CollectionNodeMixin, TemplateView):
    template_name = "ui/search.html"

    def search(self, query, node=None):
        return [{"query": query}]

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(self.get_shared_context())
        form = SearchForm(data=self.request.GET or None)
        ctx.update({"search_form": form})

        limit = 20

        if form.is_valid():
            query = form.cleaned_data.get("q")
            node = form.cleaned_data.get("node") or self.collection.root_node

            # safety measure
            assert isinstance(node, Node)

            try:
                page = self.request.GET.get("page", 1)
                page = int(page)
            except TypeError:
                page = 1

            results = search(
                query,
                node=node.pk,
                limit=limit,
                offset=limit * (page - 1),
            )

            paginator = SearchPaginator(results, limit)
            ctx.update(
                {
                    "query": query,
                    "search_results": paginator.page(page),
                    "response": paginator._result,
                    "paginator": paginator,
                    "node": node,
                }
            )
        return ctx
