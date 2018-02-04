struct = {
    'analogue': [
        'slide',
        'negative',
        'photo',
        'compact casette',
        'compact_audio_disc'
    ],
    'digital': [
        'photo',
        'video',
        'sound'
    ]
}


def iter_struct():
    for classification, items in struct.items():
        for i in items:
            yield('{}: {}'.format(classification, i))

media_types = list(enumerate(iter_struct(), 1))

