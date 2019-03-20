[![Build Status](https://travis-ci.org/jmarca/ctmlabs_user_details.svg?branch=master)](https://travis-ci.org/jmarca/ctmlabs_user_details)

# User details

We are using ldap to save users, but i need something intermediate to
store user data on creation.

There might be a way to store these in ldap, but i dont know the
schemas well enough.

Anyway, these dettails will rarely be used, whereas the ldap stuff
will be used for each login.

I am hinking that the easiest approach is to use couchdb, because I
know what i am doing there.  unique id is the same as the ldap key.
Store everyrthing collected in the request acct dialog, and save it.

# operations

## put

the initial put of the fdata into a new couchdb doc.  after the
temporary ldap account is created, uses the same id

## get

get a doc ata time.  no need for bulk docs in this use case.

## save

save modifications to docs.

## del

when an ldap account is removed, remove the corresponding entry in the
details db.

# overall ops

This can mostly be a client side app, with just a basic passthrough
app on the sever to proxy couchdb.

The difficulty is that it has to integrate nicely with the user edit
app.

What i really need is just a page that shows the details of the
request for account.  Also a way to transparently put the rfa details

bail on the editing ops for now.
