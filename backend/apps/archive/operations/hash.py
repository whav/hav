import hashlib

BUF_SIZE = 1024 * 1024 * 10  # lets read stuff in 10MB chunks!

def generate_hash(filename):
    sha1 = hashlib.sha1()

    with open(filename, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            sha1.update(data)

    return sha1.hexdigest()