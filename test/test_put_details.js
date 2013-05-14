/* global require console process describe it before after */

var should = require('should')
var superagent = require('superagent')

var put_details = require('../lib/put_details')
var get_details = require('../lib/get_details')


var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;
var chost = env.COUCHDB_HOST || 'localhost';
var cport = env.COUCHDB_PORT || 5984;

var http = require('http')
var express = require('express')
var _ = require('lodash')

var testhost = env.LINKS_TEST_HOST || '127.0.0.1'
var testport = env.LINKS_TEST_PORT || 3001

var test_db ='test%2fput%2fdocs'

var couch = 'http://'+chost+':'+cport+'/'+test_db
console.log('testing couchdb='+couch)

/**
 * create a test db, and populate it with data
 * and with a view
 *
 * Instead, because I want to get some real work done, this test is
 * going to just use an exsiting db that I have with existing views
 *
 * If your name is not James E. Marca, you should change this
 *
 */
var testingid='blablablah_12345'
var doc = {'StreetAddress1':'200 Clarendon St'
          ,'StreetAddress2':'Suite 4000'
          ,'Company':'Widgeter'
          ,'Title':'Foo'
          ,'City':'Boston'
          ,'State':'MA'
          ,'Zip':'02113'
          ,'myurl':'http://www.example.com'
          ,'Phone':'617-555-1212'
          }

describe('put',function(){
    var app,server
    var created_locally=false
    before(function(done){
        // create a test db, the put data into it
        superagent.put(couch)
        .auth(cuser,cpass)
        .end(function(e,r){
            r.should.have.property('error',false)
            if(!e)
                created_locally=true
            app = express()
            app.use(express.bodyParser());
            var putter = put_details({cdb:test_db,
                                      cuser:cuser,
                                      cpass:cpass,
                                      chost:chost,
                                      cport:cport
                                     })
            var getter = get_details({cdb:test_db,
                                      cuser:cuser,
                                      cpass:cpass,
                                      chost:chost,
                                      cport:cport
                                     })
            app.post('/'
                    ,function(req,res,next){
                         req.params._id=testingid
                         return next()
                     }
                    ,putter
                    ,function(req,res,next){
                         res.json({'done':'done'})
                         res.end()
                         return null
                     })
            app.get('/:id'
                    ,getter
                    ,function(req,res,next){
                         res.json({'user_details':req.params.user_details})
                         return null
                     })
            server=http
                   .createServer(app)
                   .listen(testport,testhost,function(e){
                       return done()
                   })
            return null
        })
        return null
    })

    after(function(done){
        if(!created_locally) return done()

        // bail in development
        //console.log(couch)
        //return done()
        superagent.del(couch)
        .type('json')
        .auth(cuser,cpass)
        .end(function(e,r){
            return done(e)
        })
        return null
    })

    it('should put user details',function(done){
        var uri=testhost+':'+testport+'/'
        superagent.post(uri)
        .type('json')
        .send(doc)
        .end(function(e,r){
            if (e){
                return done(e)
            }
            var doc_uri=[couch,testingid].join('/')
            superagent.get(doc_uri)
            .set('accept','application/json')
            .end(function(e,r){
                should.not.exist(e)
                r.should.have.property('body')
                var b = r.body
                _.each(doc,function(v,k){
                    v.should.eql(b[k])
                });
                // now test the getter
                superagent.get(uri+testingid)
                .set('accept','application/json')
                .end(function(e,r){
                    r.should.have.property('body')
                    r.body.should.have.property('user_details')
                    var c = r.body.user_details
                    _.each(c,function(v,k){
                        v.should.eql(b[k])
                    });
                    return done()
                })
                return null
            })

            return null
        })

    })

})