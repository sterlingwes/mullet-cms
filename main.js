var _ = require('underscore')
  , RSVP = require('rsvp');

module.exports = function(db, jade, tasker) {
    
    /*
     * CMS - interface for structuring content & rendering
     */
    function CMS() {
        
        this.pages = {};
        this.chain = '';
        
    }
    
    /*
     * CMS.pages() - configures page rendering and URI scheme
     * 
     * - name, string (optional) identifying page configuration (defaults to 'default')
     * - config, object with:
     *      - uri: the path template to match db record fields, defines folder structure
     *      - collection: the db Schema object you wish to search or any array of records
     *      - search: the object to pass to find(), defaults to {} (all records)
     *      - template: jade template or a Renderer object
     */
    CMS.prototype.pages = function(name, cfg) {
        
        if(typeof name !== 'string') {
            cfg = name;
            name = 'default';
        }
        
        if(typeof cfg !== 'object')
            return console.error('  ! CMS.pages(), no cfg object provided.');
        
        this.pages = this.pages[name] || {};
        
        _.extend(this.pages[name], cfg);
        
        if(_.isArray(cfg.collection))
            this._renderPages(name, cfg.collection);
        else
            this._getRecords(cfg.collection, cfg.search || {})
                .then(function(recs) {
                    return this._renderPages(name, recs);
                    
                }.bind(this))
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
        
        var cfg = this.pages[name];
        if(!cfg || !cfg.uri || !rec)
            return console.warn('  ! CMS could not build page URI for ' + name);
        
        var parts = cfg.uri.replace(/^\/|\/$/g,'').split('/')
          , uriParts = [];
        
        _.each(parts, function(part) {
            if(rec[part] && typeof rec[part] === 'string')
                uriParts.push(rec[part]);
        });
        
        return uriParts.join('/');
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
        
        var cfg = this.pages[cfgName]
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