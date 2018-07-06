
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://brainchain.db');
var fs = require('fs');

// USERS email (pkey), first name, last name, password (hash), user image
// EXISTING COURSES course_id (pkey autoincrement), course code, university, UNIQUE CONSTRAINT (course code, university)
// SESSIONS session_id (pkey), course_id, time, location, addt'l notes, isPrivate
// REGISTERED USERS email, session_id, UNIQUE CONSTRAINT(email, session_id)
// CLASS USERS email, course_id, UNIQUE CONTRAINS (email, course_id)

makeSessions();
makeCourses();
makeUsers();
makeSessionUsers();
makeClassUsers()

function makeCourses(){
    fs.readFile("brown_classes.txt", 'utf8', function(err, data) {
      if (err) throw err;
      var obj = JSON.parse(data);
      var courses = obj.courses;
      var query = "CREATE TABLE IF NOT EXISTS classes (course_id INTEGER PRIMARY KEY AUTOINCREMENT, course_code STRING, course_name STRING, school STRING)";
      conn.query(query);

      for(var i=0; i<courses.length; i++){
          //console.log(courses[i]);
          query = "INSERT INTO classes (course_name, course_code, school) VALUES ( $1, $2, $3)"
          conn.query(query, [courses[i].title, courses[i].code, "Brown University"], function(error, result){
              if(error != null){
                  console.log(error)
              }
          });
      }

      var query = "SELECT * FROM classes";
      conn.query(query, function(error, result){
          //console.log(result)
      });

    });
}

function makeSessions(){
    var query = "CREATE TABLE IF NOT EXISTS sessions (session_id INTEGER PRIMARY KEY AUTOINCREMENT ,course_id TEXT, time TEXT, location TEXT, notes TEXT, private INTEGER)"
    conn.query(query, function(error, result){
        //TODO: Do we want to go back to index.html after creating a session? What data do we want to send back?
        console.log("CERATING")
        console.log(error)
        console.log(result)
    });
    var course_ids = ["CSCI1420", "CSCI1320", "CSCI1570", "CSCI1430", "CSCI1420"];
    var times = ["4/19/18 2:00PM - 4:00PM","4/20/18 2:00PM - 4:00PM","4/21/18 2:00PM - 4:00PM","4/22/18 2:00PM - 4:00PM","4/23/18 2:00PM - 4:00PM"];
    var locations = ["SciLi 208", "CIT 316", "The Rock", "SciLi 312", "CIT 201"];
    var notes = ["Working on ML!", "Working on Web apps final project", "Working on Algos", "Working on computer vision", "working on linear regression algorithm"];
    var privates = [1,0,1,1,0];

    for(var i=0; i<times.length; i++){
        query = "INSERT INTO sessions (course_id, time, location, notes, private) VALUES ($1, $2, $3, $4, $5)";
        conn.query(query,[course_ids[i], times[i], locations[i], notes[i], privates[i]], function(error, result){
            //TODO: Do we want to go back to index.html after creating a session? What data do we want to send back?
            console.log(error)
            console.log(result)
        });
    }
    query = "SELECT * FROM sessions"
    conn.query(query, function(error, result){
        //TODO: Do we want to go back to index.html after creating a session? What data do we want to send back?
        console.log(result);
    });

}

function makeUsers(){
    var query = "CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY , fname TEXT, lname TEXT, password TEXT, image TEXT, notificationTime INTEGER)"
    conn.query(query);
    var emails = ["ryan@ryan.com", "blah@blah.com", "foo@barr.com", "bazz@buzz.com", "blah@blahh.com"];
    var fnames = ["Jack","Joe","John","Jane","Jill"];
    var lnames = ["lname1", "lname2", "lname3", "lname4", "lname5"];
    var passwords = ["pword123", "pword122", "pword129", "pword127", "pword120"];
    var images = ["image1","image2","image3","image4","image5"];    
    var notificationTimes = [5,10,15,20,25]

    for(var i=0; i<emails.length; i++){
        query = "INSERT INTO users (email, fname, lname, password, image, notificationTime) VALUES ($1, $2, $3, $4, $5, $6)";
        conn.query(query,[emails[i], fnames[i], lnames[i], passwords[i], images[i], notificationTimes[i]], function(error, result){
            //TODO: This probably shouldn't be profile.html, and should maybe send some data back?
            console.log(result);
        });
    }
    query = "SELECT * FROM users"
    conn.query(query, function(error, result){
        //TODO: Do we want to go back to index.html after creating a session? What data do we want to send back?
        //console.log(result)
    });
}

function makeSessionUsers(){
    var query = "CREATE TABLE IF NOT EXISTS session_users (email TEXT, session_id INTEGER)"
    conn.query(query);
    var emails = ["ryan@ryan.com", "blah@blah.com", "foo@barr.com", "bazz@buzz.com", "blah@blahh.com"];
    var session_ids = [1,2,3,4,5];

    for(var i=0; i<emails.length; i++){
        query = "INSERT INTO session_users (email, session_id) VALUES ($1, $2)";
        conn.query(query,[emails[i], session_ids[i]], function(error, result){
            //TODO: This probably shouldn't be profile.html, and should maybe send some data back?
            console.log(result);
        });
    }
    query = "SELECT * FROM session_users"
    conn.query(query, function(error, result){
        //TODO: Do we want to go back to index.html after creating a session? What data do we want to send back?
        //console.log(result)
    });
}

function makeClassUsers(){
    var query = "CREATE TABLE IF NOT EXISTS class_users (email TEXT, course_id INTEGER)"
    conn.query(query);
    var emails = ["ryan@ryan.com", "blah@blah.com", "foo@barr.com", "bazz@buzz.com", "blah@blahh.com"];
    var course_ids = [1,2,3,4,5];

    for(var i=0; i<emails.length; i++){
        query = "INSERT INTO class_users (email, course_id) VALUES ($1, $2)";
        conn.query(query,[emails[i], course_ids[i]], function(error, result){
            //TODO: This probably shouldn't be profile.html, and should maybe send some data back?
            console.log(result);
        });
    }
    query = "SELECT * FROM class_users"
    conn.query(query, function(error, result){
        //TODO: Do we want to go back to index.html after creating a session? What data do we want to send back?
        //console.log(result)
    });
}
