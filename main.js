var _ = require('underscore')
  , RSVP = require('rsvp');

module.exports = function(db, jade, tasker) {
    
    /*
     * CMS - interface for structuring content & rendering
     */
    function CMS() {
        
        this.pagelist = {};
        this.chain = '';
        
    }
    
    /*
     * CMS.pages() - configures page rendering and URI scheme
     * 
     * - name, string (optional) identifying page configuration (defaults to 'default')
     * - config, object with:
     *      - uri: the path template to match db record fields, defines folder structure
     *      - collection: the db Schema object you wish to search or any array of records or a string referring to a schema object
     *      - search: the object to pass to find(), defaults to {} (all records)
     *      - template: jade template or a Renderer object
     * - cb, function callback
     */
    CMS.prototype.pages = function(name, cfg, cb) {
        
        if(typeof name !== 'string') {
            if(typeof cfg === 'function')
                cb = cfg;
            cfg = name;
            name = 'default';
        }
        
        if(typeof cfg !== 'object')
            return console.error('  ! CMS.pages(), no cfg object provided.');
        
        if(!this.pagelist[name])    this.pagelist[name] = {};
        
        _.extend(this.pagelist[name], cfg);
        
        if(typeof cfg.collection === 'string') {
            cfg.collection = db.schema(cfg.collection);
        }
        
        if(_.isArray(cfg.collection))
            this._renderPages(name, cfg.collection).then(cb);
        else
            this._getRecords(cfg.collection, cfg.search || {})
            
                .then(function(recs) {
                    return this._renderPages(name, recs);
                }.bind(this))
            
                .then(cb)
                
                .catch(function(err) {
                    console.error('  ! CMS.pages() error', err);
                });
    };
    
    /*
     * _getRecords: returns a promise that resolves with db recs
     * 
     * - schema, object
     * - search, object
     * 
     * returns new RSVP.Promise
     */
    CMS.prototype._getRecords = function(schema, search) {
        
        return new RSVP.Promise(function(resolve, reject) {
            schema.find(search, function(err, recs) {
                if(err) reject(err);
                else    resolve(recs);
            });
        });
    };
    
    /*
     * _getPageUri: generates page path from config
     * 
     * - name, string name of page type
     * - rec, object database record to pull values from
     */
    CMS.prototype._getPageUri = function(name, rec) {
        
        var cfg = this.pagelist[name];
        if(!cfg || !cfg.uri || !rec)
            return console.warn('  ! CMS could not build page URI for ' + name);
        
        var parts = cfg.uri.replace(/^\/|\/$/g,'').split('/')
          , uriParts = [];
        
        _.each(parts, function(part) {
            var uriPart = '';
            if(part.indexOf(':')==0 && rec[part.substr(1)] && typeof rec[part.substr(1)] === 'string')
                uriPart = rec[part.substr(1)];
            else if(typeof part === 'string')
                uriPart = part;
            
            uriParts.push( encodeURIComponent(uriPart.replace(/\s+/g,'-').toLowerCase()) );
        });
        
        return uriParts.join('/')+'.html';
    };
    
    /*
     * _renderPages: takes db recs and renders pages based on config specified by cfgName
     * 
     * - cfgName, string name of page type config
     * - recs, array of db records
     * 
     * returns a new RSVP.Promise
     */
    CMS.prototype._renderPages = function(cfgName, recs) {
        
        var cfg = this.pagelist[cfgName]
          , promises = [];
        
        _.each(recs, function(rec) {
            
            var tpl;
            if(typeof cfg.template === 'string') {
                // just have a jade template, render from rec data
                tpl = new jade.Renderer({
                    templateFile:   cfg.template,
                    data:   rec
                });
                
            }
            else {
                // assume we have a Renderer object, augment data with rec data
                tpl = cfg.template;
            }
            
            promises.push(tasker.writeFile( this._getPageUri(cfgName,rec), tpl.render() ));
            
        }.bind(this));
        
        return RSVP.all(promises);
    };
    
    
    /*
     * CMS.add() - chain helper, delegates depending on what it follows
     */
    CMS.prototype.add = function() {
        var method = '_add'+this.chain;
        if(!this[method])
            return console.warn('! CMS.add() - invalid call. Must follow pages() or posts().');
        
        return this[method].apply(this, Array.prototype.slice.call(arguments, 0));
    };
    
    return CMS;
    
};