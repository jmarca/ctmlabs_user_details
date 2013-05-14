var putdoc = require('couchdb_put_doc')

/**
 * put_details
 * initialize with the couchdb to save to
 *
 * expects that the url, port, username, password are in environment
 * variables.  If not, add these to the options object.
 *
 * var cuser = process.env.COUCHDB_USER ;
 * var cpass = process.env.COUCHDB_PASS ;
 * var chost = process.env.COUCHDB_HOST || '127.0.0.1';
 * var cport = process.env.COUCHDB_PORT || 5984;
 *
 * var cdb = process.env.USER_DETAILS_DB || 'user%2fdetail'
 *
 * Options:
 *
 * {"cuser":"somerthineg",
 *  "cpass":"password",
 *  "chost":"couchdb host",
 *  "cport":"couchdb port",  // must be a number
 *  "cdb"  :"the%2fcouchdb%2fto%2fuse" // be sure to properly escape your db names
 * }
 *
 * The options hash always  overrides env var based defaults
 *
 * returns a function that will read an incoming request and save it to couchdb
 *
 * make sure to seed the _id field first, as in
 *
 * req.params['_id'] = ldapid
 *
 * This function will not do that
 *
 */
var cdb = process.env.USER_DETAILS_DB || 'user%2fdetail'

function  put_details(opts){
    if(opts.cdb === undefined) opts.cdb = cdb
    var putter = putdoc(opts)
    return function(req,res,next){

        // store the doc

        var doc = req.body

        var _id = req.params._id
        if (_id !== undefined){
            doc._id = _id
        }
        putter(doc,function(e,r){
            if(e){
                return next(e)
            }
            if(r.ok === undefined){
                return next(r)
            }
            return next()
        })
    }
}
module.exports=put_details
