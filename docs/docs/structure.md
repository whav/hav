# The Structure of the HAV

## Media

In it's most simple form a media entry maps to a single file. This file might be a high
quality scan of an existing slide inside a physical archive or an audio/video file produced 
by a digital recording device.
A media entry mainly holds metadata related to the file such as creator, creation date, 
copyright information etc.

Above all, a media entry receives a unique and permanent identifier that can be used inside 
permalinks and for citation reasons.

***TODO: create a dedicated page to describe the media metadata***

## Collections

At the top level the HAV is structured into collections. A collection is a grouping of 
media files that share some common attributes. Usually questions such as copyright, a broad 
creation timeframe and a number media creators (e.g. photographers) are shared between the media entries
of a collection.
As such the HAV's understanding of a collection maps closely to what an archivist 
would understand as such.

## Folders

We suggest (and actually technically require) that each collection has an initial structure. 
This is similar to how files would be arranged on a computer within directories.
The technical requirement might be satisfied with all files residing in a single folder, which
might actually a usable approach for small, private collections.

For all other collections we recommend a more elaborate approach. A folder structure should ideally map 
to the way the collection administrators think about the structure of their content. 
Folder structures might map to dates (`2006/February/26/`), geographic entities (`Nepal/Kathmandu/`) 
or even a mix of both (`2006/Nepal/Kathmandu`). 

The HAV does not dictate the use of any particular logical grouping within a collection but is designed to handle 
folder structures of any size. 

The hard requirement for a valid folder structure is that it can can hold any 
media entry of that collection in a way that a single media entry maps to *exactly one folder* inside the collections struture.

A soft requirement is that this structure should not change once a collection has been archived because the struture itself holds 
important information about a media entry's place inside a collection. 
Under certain circumstances this requirement might be lifted for some collections.

### Browsing a collection

By default the folder structure allows visitors to browse a collection in the way the collection is organized.
This is a feature of the frontend and can be toggled on/off on a collection basis.

### Folder Metadata

As seen above each folder is described by a hierarchical path. 
This on it's own already has some value to the visitor of a collection and
might actually be sufficient for small collections whose folder structures are
comparatively shallow.
Apart from the name of a folder there are various attributes that can be attached to a folder.
These include:

- **name** 
- **description**: a free form text field that will be displayed on any listing page of the folder. 
- **tags**: folders can have any number of associated tags. These tags are inherited by the media entries inside a folder (or any of it's subfolders). 
    Please see the section on **Tags** for more information on how these work.
- **representative media**: a link to a single media entry that will be used to give the folder the possibility to 
display something more than text.  

The amount of required metadata that can be attached to a folder is kept to a minimum. Additional metadata can be 
added on a per collection basis. More on that later.

Please note that the requirement of a static folder hierarchy as outlined above does not affect the collection administrators 
ability to edit these metadata fields. In deed it is explicitly welcome that administrators curate their collections and 
attach more metadata to their entries over time.
    
