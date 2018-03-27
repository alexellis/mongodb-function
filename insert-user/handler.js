"use strict"

var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

var clientsDB;  // Cached connection-pool for further requests.

let prepareDB = () => {
    let url = "mongodb://"+ process.env.mongo +":27017/clients"

    return new Promise((resolve, reject) => {
        if(clientsDB) {
            console.error("DB already connected.");
            return resolve(clientsDB);
        }
        console.error("DB connecting");

        MongoClient.connect(url, (err, database) => {
            if(err) {
                return reject(err)
            }
    
            clientsDB = database.db("clients");
            return resolve(clientsDB)
        });
    });
}

module.exports = (event, context) => {
    prepareDB()
    .then((users) => {
        let record = {"name": event.body };

        users.collection("users").insertOne(record, (insertErr) => {
            if(insertErr) {
                return context.fail(insertErr.toString());
            }

            const result =  {
                status: "Insert done of: " + JSON.stringify(event.body)
            };
    
            context
                .status(200)
                .succeed(result);
        });
    })
    .catch(err => {
        context.fail(err.toString());
    });
}
