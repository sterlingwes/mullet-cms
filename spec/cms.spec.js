var pathlib = require('path')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , Promise = require('es6-promise').Promise
  , path = __dirname
  , appBase = path + '/apps/myapp'

  , Tasker = require('../../tasker/main.js')({
        path:   path
    })

  , Jade = require('../../jade/main.js')

  , Mongo
  , DB

  , app1 = {
      mtime:    new Date(),
      name:     'myapp',
      base:     appBase,
      info: {
          name: 'my app package',
          mullet: {
              vhost:    'localhost'
          }
      }
  }

  , PostSchema

  , tasker
  , CMS
  , cms;

describe('CMS', function() {
    
    it('should cleanup (test only)', function(done) {
        rimraf( pathlib.resolve(__dirname, './public'), function(err) {
            expect(err).toBeFalsy();
            done();
        });
    });
    
    it('should init mongo, schema (test only) & test data', function(done) {
        Mongo = require('../../db_mongo/main')({ mongo: 'mongodb://localhost:27017/mullet' }).then(function(api) {
            DB = require('../../db/main')(api);
            
            api.insert('posts__')([
                { title: 'My First Post', text: 'Hello World!' },
                { title: 'Second Post', text: 'Is really about nothing in particular.' }
            ], function(err,recs) {

                PostSchema = DB.schema('posts__', {
                  fields: {
                      title: {
                          type: String
                      },
                      text: {
                          type: String
                      }
                  }
                });
                tasker = new Tasker(app1);
                CMS = require('../main.js')(DB, Jade, tasker);
                cms = new CMS();
                done();
            });
        });
    });
    
    it('should setup properly', function() {
        expect(cms.pagelist).toEqual({});
        expect(cms.chain).toEqual('');
    });
    
    it('should setup pages from db', function(done) {
        cms.pages({
            uri:        'post/:title',
            collection: 'posts__',
            template:   pathlib.resolve( __dirname, './test.jade' )
        }, function(pathsWrittenTo) {
            
            expect(pathsWrittenTo.length).toBe(2);
            
            // clean up db (should drop collection entirely once api method added TODO:)
            DB.remove('posts__')({}, function(err) {
                DB._db.close();
            });
            done();
        });
    });
    
    it('should have written pages', function(done) {
        var checks = [];
        [{
            fn:     'my-first-post',
            data:   '<html><head><title>My First Post</title></head><body><h1>My First Post</h1><section>Hello World!</section></body></html>'
        },{
            fn:     'second-post',
            data:   '<html><head><title>Second Post</title></head><body><h1>Second Post</h1><section>Is really about nothing in particular.</section></body></html>'
        }].forEach(function(file) {
            checks.push(new Promise(function(yes,no) {
                fs.readFile( pathlib.resolve(__dirname,'./public/sites/localhost/post/',file.fn + '.html'), function(err,res) {
                    expect(err).toBeFalsy();
                    expect(!res ? '' : res.toString()).toBe(file.data);
                    yes();
                });
            }));
        });
        
        Promise.all(checks).then(function(res) {
            done();
        }).catch(function(err) { console.error(err) });
    });
    
});