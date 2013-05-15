var getdoc = require('couchdb_get_doc')

/**
 * get_details
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
 * returns a function that will read an incoming request and get the
 * necessary doc from couchdb.
 *
 * the request object will be modified, s.t.
 *
 * req.params.user_details={details doc}
 *
 * make sure to seed the _id field first, as in
 *
 * req.params['_id'] = ldapid
 *
 * This function will not do that
 *
 */
var cdb = process.env.USER_DETAILS_DB || 'user%2fdetail'

function  get_details(opts){
    if(opts.cdb === undefined) opts.cdb = cdb
    var getter = getdoc(opts)
    return function(req,res,next){

        // store the doc
        var _id = req.params.uid
        getter(_id,function(e,r){
            if(e){
                return next(e)
            }
            if(r.error !== undefined){
                return next(r)
            }
            req.params.user_details=r
            return next()
        })
    }
}
module.exports=get_details
