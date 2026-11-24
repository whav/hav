"""Import the pages formerly stored as Markdown files in templates/flatpages/."""

from django.db import migrations

PAGES = [
    {
        "slug": "index",
        "title": "The Himalaya Archive Vienna",
        "content": "# The Himalaya Archive Vienna\n\nThe **HAV** is a modern multimedia archive at the [Center for Inter\xaddisciplinary Research and Documentation of Inner and South Asian Cultural History (CIRDIS)](http://www.univie.ac.at/cirdis/), [University of Vienna](https://www.univie.ac.at/), and home to research documentation from South and Inner Asia with a special focus on the Himalaya.\n\nIts over-arching archive structure houses multi-disciplinary data originating from largely third-party funded research projects as well as private collections or donations. It aims to provide a strong foundation for the successful collaboration between research partners from various disciplines united by a common interest and wish to preserve and share their data according to the policies of the open science community.\n\nThe HAV is under active development. This first release is a glimpse into the thematic and geographical width and depth of the material currently being archived and a series of advanced representational features planned to be integrated later on. At the time of writing a number of further collections are already being evaluated and/or prepared for ingestion.\n\nFurther information about us, our ongoing research initiatives and related news can be found on the website of [CIRDIS](http://www.univie.ac.at/cirdis).\n\n## The HAV's Core Area\n\n![](geo:35.6037,82.4853?z=5)\n",
    },
    {
        "slug": "imprint",
        "title": "Imprint",
        "content": "---\ntitle: 'Imprint / Accessiblity'\ndate: 2017-08-07T00:33:01+02:00\n---\n# Imprint\n\n## Himalaya Archive Vienna (HAV)\n\n_at the_\n**Center for Interdisciplinary Research and Documentation of Inner and South Asian Cultural History (CIRDIS)**\nDepartment for South Asian, Tibetan and Buddhist Studies\nSpitalgasse 2-4, Hof 2.1\nA-1090 Vienna, Austria\n\n## Layout\n\nJan Seifert and Jürgen Schörflinger (CIRDIS)\n\n## Technical Realisation\n\nJürgen Schörflinger (CIRDIS)\n\n## Responsibility for contents\n\nAll content presented in the HAV has been compiled carefully. The HAV and its contributors make no guarantees of accuracy, completeness and timeliness of the informations provided and therefore accept no responsibility or liability for damages or losses resulting from the use of this website. Links to external websites have been chosen carefully. As they are outside the control of the HAV, it accepts no responsibility for these sites.\n\n## Technical Support\n\nIf you experience technical problems, please send an e-mail to the [hav@univie.ac.at](mailto: hav@univie.ac.at).\n",
    },
    {
        "slug": "accessibility",
        "title": "Accessibility",
        "content": "---\ntitle: 'Accessiblity'\ndate: 2024-09-01T01:23:01+02:00\n---\n## Accessiblity\n\nThe HAV attempts to make the contents of this website as widely and easily accessible as possible. We are also committed to the [general guidelines on accessibilty](https://www.univie.ac.at/en/about-us/accessibility/) as stipulated by the University of Vienna.\n\nShould you have problems in accessing particular contents on our website, please contact us at [hav@univie.ac.at](mailto: hav@univie.ac.at).\n",
    },
    {
        "slug": "cooperation",
        "title": "How to cooperate with us",
        "content": "---\ntitle: 'How to cooperate with us'\ndate: 2017-08-07T00:17:36+02:00\n---\n# How to cooperate with us\n\nCIRDIS welcomes all research initiatives working in the extended Himalayan area, especially those wishing to preserve and share their data according to the policies of an open science community. If you want to profit from and contribute to our interdisciplinary approach and ideas and concepts on multi-modal archiving, CIRDIS is looking forward to share its expertise and infrastructure. We encourage you to [contact us](mailto:hav@univie.ac.at,office.cirdis@univie.ac.at) - we are always looking forward to collaborations strengthening the field of Himalayan studies through open and innovative ideas.\n\nMore information about us and our previous and ongoing research and documentation initiatives can be found on our [center's website](http://www.univie.ac.at/cirdis). If you are interessted in a cooperation, consider giving a look at our [Data Management Plan](http://www.univie.ac.at/cirdis/documentation/data-management-plan) and our recently published [Technical Considerations and Preparations for Anthropological Field Research Documentation](http://www.univie.ac.at/cirdis/documentation/technical-fieldresearch). Both of which can be found at the [\"documentation\" section](http://www.univie.ac.at/cirdis/documentation) of our website.\n",
    },
    {
        "slug": "open-knowledge",
        "title": "Open Access, Open Knowledge and Licenses",
        "content": "---\ntitle: 'Open Access, Open Knowledge and Licenses'\ndate: 2017-08-07T00:17:28+02:00\n---\n# Open Access, Open Knowledge and Licenses\n\nIn accordance with the [reusability considerations of FAIR](https://www.force11.org/group/fairgroup/fairprinciples) the HAV supplies its data and metadata with clearly specified and accessible – both to humans and machines – licensing in order to ensure their availability and reusability.\n\nThe HAV's metadata is made available under Creative Commons Attribution 4.0 International (CC BY 4.0). The larger part of the HAV's initial collections will be made available under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) but more open licences such as CC BY and CC0 will be supported as well.\nOn the other end of the spectrum – to address copyright and complex ethical and/or moral issues – a number of non-open licenses such as CC BY-NC-SA 4.0, CC BY-NC-ND 4.0 and “all rights reserved” are available in order to accommodate these diverse needs. In addition to the above, the HAV will provide the possibility of archiving materials with a predefinable embargo period. It thus allows for the secure archiving of research data prior to its open release (e.g. while still being the object of ongoing research within a running project).\n",
    },
]


def import_pages(apps, schema_editor):
    Page = apps.get_model("pages", "Page")
    for page in PAGES:
        Page.objects.get_or_create(slug=page["slug"], defaults=page)


def remove_pages(apps, schema_editor):
    Page = apps.get_model("pages", "Page")
    Page.objects.filter(slug__in=[page["slug"] for page in PAGES]).delete()


class Migration(migrations.Migration):

    dependencies = [("pages", "0001_initial")]

    operations = [migrations.RunPython(import_pages, remove_pages)]
