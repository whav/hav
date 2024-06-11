import time

from hav.apps.media.models import Media
from hav.apps.sets.models import Node

from .indexer.media import index as index_media
from .indexer.nodes import index as index_node


def wait_for_processing(search_client, indexing_process, progress_to_stdout=False):
    if progress_to_stdout:
        print(
            f"running: SearchIndex - {indexing_process.type} \
(TaskUID: {indexing_process.task_uid})"
        )
        print("-" * 30)
    while True:
        resp = search_client.get_task(indexing_process.task_uid)
        if resp.status == "succeeded":
            progress_to_stdout and print(f"success (TaskUID: {resp.uid})")
            break
        if resp.status == "failed":
            raise ValueError(resp.error, f"FAILED (TaskUID: {resp.uid})")
        elif resp.status in ["enqueued", "processing"]:
            progress_to_stdout and print(f"processing (TaskUID: {resp.uid})")
            time.sleep(0.5)
            continue

        raise NotImplementedError(f"Unknown status {resp.status}.")


def update_document_in_index(item_pk, document_type, index):
    if document_type is Node:
        search_item = index_node(item_pk)
    elif document_type is Media:
        search_item = index_media(item_pk)
    else:
        raise NotImplementedError(
            f'Unknown item_type "{type}". Unable to update search index.'
        )
    wait_for_processing(index, index.update_documents([search_item.dict()]))
