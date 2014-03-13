var _ = require('underscore')
  , RSVP = require('rsvp');

module.exports = function(db) {
    
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
     * _renderPages: takes db recs and renders pages based on config specified by cfgName
     * 
     * - cfgName, string name of page type config
     * - recs, array of db records
     * 
     * returns a new RSVP.Promise
     */
    CMS.prototype._renderPages = function(cfgName, recs) {
        
        var cfg = this.pages[cfgName];
        
        if(typeof cfg.template === 'string') {
            // just have a jade template, render from rec data
        }
        else {
            // assume we have a Renderer object, augment data with rec data
        }
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
    
};