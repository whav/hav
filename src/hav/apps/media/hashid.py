# Do not ever change the arguments
# of the hashing function
# this would invalidate all previous links

from hashids import Hashids

salt = "Welease Wodger!"

hashid = Hashids(salt=salt, min_length=7)


def encode(*values: int):
    return hashid.encode(*values)


def decode(hash: str):
    return hashid.decode(hash)
