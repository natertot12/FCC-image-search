var express = require('express'),
    app = express(), 
    path = require("path"),
    mongo = require('mongodb').MongoClient,
    util = require("util"),
    Search = require("bing.search"),
    mongoUrl = 'mongodb://localhost:27017/searches';

Search = new Search("jRsvdTRF4iNiRtoM376DjUshimNtHIL9ba0lQDLfnik");

mongo.connect(mongoUrl, function(err, db) {
    if(err) throw err;
    db.createCollection("searches", {
        capped: true,
        size: 5242880,
        max: 5000
    });

    function log(url, res) {
        var searches = db.collection('searches');
        var id = {"Search": url};
        searches.insertOne(id, function(err) {
            if(err) throw err;
        });
    }
    
    function search(url, res) {
        Search.images(url, {top: 10},
            function(err, results) {
                if(err) throw err;
                res.send(util.inspect(results, {colors: true, depth: null}));
            }
        );
        log(url);
    }
    
    function latest(res) {
        var searches = db.collection('searches').find().limit(10).sort({_id:-1});
        /*
        searches.each(function(err, doc) {
            if(err) throw err;
            if(doc != null) res.write(JSON.stringify(doc) + "\n");
            else res.end();
        });
        
        searches.forEach(function(doc) {
            res.write(JSON.stringify(doc) + "\n");
        }, function(err) {
            if(err) throw err;
            res.end();
        })
        */
        searches.toArray(function(err, docs) {
            if (err) throw err;
            res.end(JSON.stringify(docs));
        });
    }
    
    app.get('/:query', function(req, res) {
        var url = req.params.query;
        if(req.url != '/favicon.ico') {
            if(url == "latest" || url == "latest/") {
                latest(res);
            } else {
                url = url.toString();
                console.log(url);
                search(url, res);
            }
        }
    });
    app.listen(8081);
});