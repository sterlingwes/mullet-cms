var Tasker = require('../main.js')({
        path:   '/path/to/app'
    })

  , Jade = require('../../jade/main.js')

  , appBase = '/path/to/app/apps/myapp'
  , path = '/path/to/app'

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
  };

var tasker = new Tasker(app1)
  , CMS = require('../main.js')({}, Jade, tasker)
  , cms = new CMS();

describe('CMS', function() {
    
    it('should setup properly', function() {
        expect(cms.pages).toEqual({});
        expect(cms.chain).toEqual('');
    });
    
    it('should setup pages from db', function() {
        
    });
    
});