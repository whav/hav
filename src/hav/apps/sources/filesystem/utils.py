import base64
import binascii

import logging

logger = logging.getLogger(__name__)


def encodePath(path):
    return base64.urlsafe_b64encode(path.encode("utf-8")).decode("utf-8")


def decodePath(encodedPath):
    try:
        return base64.urlsafe_b64decode(encodedPath).decode("utf-8")
    except binascii.Error as e:
        logger.warning(e)
        raise ValueError("%s can not be decoded." % encodedPath)
