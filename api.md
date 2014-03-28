CMS - interface for structuring content & rendering

****

CMS.pages() - configures page rendering and URI scheme

- name, string (optional) identifying page configuration (defaults to 'default')
- config, object with:
     - uri: the path template to match db record fields, defines folder structure
     - collection: the db Schema object you wish to search or any array of records or a string referring to a schema object
     - search: the object to pass to find(), defaults to {} (all records)
     - template: jade template or a Renderer object
- cb, function callback

****

_getRecords: returns a promise that resolves with db recs

- schema, object
- search, object

returns new RSVP.Promise

****

_getPageUri: generates page path from config

- name, string name of page type
- rec, object database record to pull values from

****

_renderPages: takes db recs and renders pages based on config specified by cfgName

- cfgName, string name of page type config
- recs, array of db records

returns a new RSVP.Promise

****

CMS.add() - chain helper, delegates depending on what it follows