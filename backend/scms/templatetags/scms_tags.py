import os
import json
from django import template

register = template.Library()

# this directory holds a bunch of json files
example_dir = os.path.join(
    os.path.dirname(__file__),
    '../static/examples/'
)

@register.inclusion_tag('scms/example_assets.html')
def render_example(oid):
    jsonPath = os.path.join(
            example_dir,
            '%s.json' % str(oid)
    )
    data = json.load(open(jsonPath))
    sources = data.get('src', [])
    sources = sources if isinstance(sources, list) else [sources]
    sources = map(lambda s: os.path.join('examples/', s), sources)

    data.update({
        'src': list(sources),
        'source_file': jsonPath,
        'oid': oid
    })
    print(data)
    return data
