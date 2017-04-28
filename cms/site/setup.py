from setuptools import setup, find_packages

VERSION = '0.0.1'


setup(
    name="hav",
    version=VERSION,
    url='https://hav.univie.ac.at',
    license='BSD',
    description='HAV theme for MkDocs',
    author='Sean Mc Allister',
    author_email='sean@brickwall.at',
    packages=find_packages(),
    include_package_data=True,
    entry_points={
        'mkdocs.themes': [
            'hav = hav',
        ]
    },
    zip_safe=False
)
