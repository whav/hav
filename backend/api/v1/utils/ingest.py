from urllib.parse import urlunsplit

def buildIngestId(source_identifier, path):
    return urlunsplit((
        str(source_identifier),
        str(path),
        '',
        '',
        ''
    ))