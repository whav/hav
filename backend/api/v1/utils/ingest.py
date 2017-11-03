
def buildIngestId(source_identifier, path):
    if ':' in source_identifier:
        raise ValueError('":" in source identifier is not allowed.')
    return ':'.join([source_identifier, path])


def splitIngestId(ingest_id):
    source_identifier, path = ingest_id.split(':', maxsplit=1)
    return source_identifier, path