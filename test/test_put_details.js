/* global require console process describe it */

const tap = require('tap')
const utils = require('./utils.js')

const put_details = require('../lib/put_details')
const get_details = require('../lib/get_details')

const superagent = require('superagent')

const path    = require('path')
// const rootdir = path.normalize(__dirname)
// const config_okay = require('config_okay')
// const config_file = rootdir+'/../test.config.json'

const config={}

const express = require('express')
//const connect = require('connect')

const http = require('http');
const bodyParser = require('body-parser');
const  _ = require('lodash')



var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;
var chost = env.COUCHDB_HOST || 'localhost';
var cport = env.COUCHDB_PORT || 5984;



var testhost = env.LINKS_TEST_HOST || '127.0.0.1'
var testport = env.LINKS_TEST_PORT || 3001

var test_db ='test%2fput%2fdocs'

config.couchdb = {db:test_db,
                  host:chost,
                  port:cport,
                  auth:{username:cuser,
                        password:cpass}}

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
var app
function launch_server(){
    app=express()
    // parse urlencoded request bodies into req.body
    app.use(bodyParser.urlencoded({extended: false}));
    const putter = put_details({cdb:config.couchdb.db,
                              cuser:cuser,
                              cpass:cpass,
                              chost:chost,
                              cport:cport
                             })
    const getter = get_details({db:config.couchdb.db,
                                auth:{"username":cuser,
                                      "password":cpass},
                                host:chost,
                                port:cport
                               })
    app.post('/'
            ,function(req,res,next){
                // req.params = req.body
                req.body._id=testingid
                next()
            })
    app.post('/',putter)
    app.post('/'
            ,function(req,res,next){
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({'done':'done'}))
             })
    app.get('/:uid'
            ,getter
            ,function(req,res,next){
                res.setHeader('Content-Type', 'application/json')

                res.end(JSON.stringify({'user_details':req.params.user_details}))
                return null
            })
    return new Promise((resolve,reject)=>{
        const server = app.listen(testport,function(){
            console.log('listening')
            resolve(server)
        })
    })


}

// async function put_test(t){

//     // not sure how to do this anymore
//     await t.test('should get user details', async ttt => {

//         // now test the getter
//         console.log('testing the getter')
//         await superagent.get(uri+testingid)
//             .then( res => {
//                 ttt.ok(res.body)
//                 ttt.ok(res.body.user_details)

//                 var c = res.body.user_details
//                         _.each(c,function(v,k){
//                             if(k != '_id' && k != '_rev'){
//                                 ttt.equal(v,doc[k])
//                             }
//                         })

//             })
//             .catch(err => {
//                 console.log(err.message)
//             })
//         console.log('done with ttt')
//         await ttt.end()
//     })
//     t.end()
//     console.log('done with t')
// }




console.log('create db with', config)
const res = utils.create_tempdb(config)

async function runit() {
    const server = await launch_server()
    console.log('server launched')



    await tap.test('put function', async function(t){
        const uri=testhost+':'+testport+'/'
        console.log('testing post to',uri)
        await superagent.post(uri)
            .type('form')
            .send(doc)
            .then((res)=>{
                console.log(res.body)
                t.pass()
            })
            .catch( ()=>{
                console.log('caught error')
                t.fail()
            })
            .then (()=>{
                t.end()
            })
    })
    await tap.test('meh',async function(t){
        console.log('doc posted')
        const couch = 'http://'+chost+':'+cport+'/'+config.couchdb.db
        await  superagent.get(couch+'/_all_docs')
            .then( res => {
                // console.log('from get alldocs', couch, res)
                t.ok(res.body)
                return null
            })
            .catch( ()=>{
                console.log('caught error')
            })

        console.log('alldocs is fine')

        const couch_doc_uri =[couch,testingid].join('/')
        console.log(couch_doc_uri)
        await superagent.get(couch_doc_uri)
            .then( res => {
                console.log('from get document,')
                t.ok(res.body)
                var b = res.body
                _.each(doc,function(v,k){
                    t.equal(b[k],v)
                })
            })
            .catch( ()=>{
                console.log('caught error')
            })
        console.log('done with test')
        t.end()
        return null
    })
    console.log('done with test?')

    tap.end()
    server.close()
}
runit()
