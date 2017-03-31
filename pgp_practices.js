var fs = require("fs-promise");
var Promise = require("bluebird");
var pgp = require("pg-promise")({
  promiseLib: Promise
});
var co = require('co');
var prompt = require('prompt-promise');


function addMore(db){
  return new Promise(function(resolve, reject){
    prompt("What's the Album name")
      .then(function(name){
        return [name, prompt("What's the album year")];
      })
      .spread(function(name, year){
        return db.result("insert into album values(default,$1,$2) returning id",[name,year]);
      })
      .then(function(){
        console.log("done adding.");
        return db.one("select * from album order by id desc limit 1");
      })
      .then(function(result){
        console.log("here's the row",result);
        resolve();
      })
  });
}

function addAlbum(db){
  return new Promise(function(resolve, reject){
    db.query("select * from album")
      .then(function(results){
        console.log(results);
        return db.result("insert into album values(default, 'The Squeezed Apple', 1998) returning id")
      })
      .then(function(){
        console.log("added the squeezed apple")
        return prompt("want to add one more?(y/n)")
      })
      .then(function(result){
        if(result === "y"){
          return addMore(db);
        }else{
          console.log("your loss!");
        }
      })
      .then(function(){
        console.log("here are the updated table: ")
        return db.query("select * from album");
      })
      .then(function(results){
        console.log(results);
        prompt.done();
        pgp.end();
        resolve();
      })
  })
}

fs.readFile("si.config", "utf-8")
  .then(function(result){
    result = result.replace("\n", "")
    var db = pgp({
      host: "54.70.124.137",
      port: 5432,
      user: "postgres",
      password: result,
      database: "test"
    })
    return db;
  })
  .then(function(db){
    return addAlbum(db);
  })
  .catch(function(err){
    throw err;
  })
