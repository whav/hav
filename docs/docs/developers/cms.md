# The HAV's CMS

Just like this documentation the free-form pages of the HAV are currently
being built with [mkdocs](https://mkdocs.org).
 
This means that you will be writing markdown in order to generate 
content for tha HAV's website.


## Quick start

Please make sure that you have mkdocs installed either system wide or in 
your virtual python environment.

In the source checkout execute the following commands:

```
cd cms/site/
mkdocs serve
```


This should start a development server at 
[http://127.0.0.1:8000](http://127.0.0.1:8000) 

You can then grab your favourite text editor and start working on the 
files found in the content directory. Your browser should refresh every 
time you save a file.


## Frontend development

The static files of the HAV theme are located in ```cms/src```

To develop the CSS and Javascript parts of the CMS you will need to install 
some frontend tooling.
If you have [yarn](https://yarnpkg.com/) installed a simple ```yarn install```
inside that folder should do the trick.

Once that command completes successfully you can start developing by running
```
yarn dev
```

Again, as with the content parts, every file change should trigger a rebuild 
of the assets and result in automatic reloading of the development website.





