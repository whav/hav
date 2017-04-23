from django.core.exceptions import ValidationError


def validate_list_of_lists(data):
    try:
        assert(isinstance(data, list))
        for item in data:
            assert(isinstance(item, list))
            for d in item:
                assert(isinstance(d, (str, int)))
    except AssertionError:
        raise ValidationError(
            'JSON structure does not fit expected format.'
        )