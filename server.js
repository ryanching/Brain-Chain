var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://brainchain.db');
var fs = require('fs');
var engines = require('consolidate');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var randomstring = require("randomstring");

app.engine('html', engines.hogan);
app.set('view engine', 'html');

//prevent direct access to html files
app.get('/404page.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/aboutus.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/brainchain.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/brainchain.db', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/brainchain.pem', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/brainchain.ppk', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/package.json', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/package-lock.json', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/server.js', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/editProfile.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/forgot.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/login.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/myprofile.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/mysessions.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/passwordEmailSent.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/postverification.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/preverification.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/profile.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/reset.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.get('/session.html', function(request, response) {
	response.render('404page.html');
    response.status(404).type('html');
});

app.set('views', __dirname + "/public");

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({secret: "very secure",
				resave: true,
				saveUninitialized: true}));

const saltRounds = 10;

sendReminderEmails();
deleteOldSessions();
setInterval(sendReminderEmails, 10000);
setInterval(deleteOldSessions, 10000);

var query = "CREATE TABLE IF NOT EXISTS sessions (session_id INTEGER PRIMARY KEY AUTOINCREMENT , course_id INTEGER, professor TEXT, time TEXT, location TEXT, floor TEXT, purpose TEXT, notes TEXT, private INTEGER)"
conn.query(query);
var query = "CREATE TABLE IF NOT EXISTS session_users (email TEXT, session_id INTEGER, notified INTEGER, UNIQUE (email, session_id))";
conn.query(query);
var query = "CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY , fname TEXT, lname TEXT, password TEXT, image TEXT, notificationTime INTEGER, verified INTEGER)";
conn.query(query);
var query = "CREATE TABLE IF NOT EXISTS user_courses (email TEXT, course TEXT)";
conn.query(query);

var query = "CREATE TABLE IF NOT EXISTS user_verified (email TEXT, hash TEXT)";
conn.query(query);

var query = "CREATE TABLE IF NOT EXISTS tokens (email TEXT PRIMARY KEY, token TEXT)";
conn.query(query);

function sendReminderEmails() {
	var now = new Date();
	var query = "SELECT email, session_id, fname, notificationTime, notified, course_id, professor, time, location, " +
				"floor, purpose, notes FROM (SELECT * FROM users U JOIN " +
				"(SELECT * FROM session_users SU JOIN sessions S ON SU.session_id = S.session_id) J ON "
				+ "U.email = J.email) WHERE notified=0";
	conn.query(query, function(error, result) {
		if(result !== undefined) {
			for(var i = 0; i < result.rows.length; i++) {
				row = result.rows[i];
				date = new Date(row.time);
				date.setMinutes(date.getMinutes() - row.notificationTime);
				if(date < now) {
					sendConfirmationEmail(row.time, row.course_id, row.location, row.floor, row.purpose, row.notes, row.professor, row.email, false);
					var q2 = "UPDATE session_users SET notified=1 WHERE email=$1 AND session_id=$2";
					conn.query(q2, [row.email, row.session_id]);
				}
			}
		}
	});
}

function deleteOldSessions() {
	var now = new Date();
	now.setHours(now.getHours() - 1);
	conn.query("SELECT session_id, time FROM sessions", function(error, result) {
		expiredSessions = [];
		if(result !== undefined) {
			rows = result.rows;
			for(var i = 0; i < rows.length; i++) {
				rowDate = new Date(rows[i].time);
				if(now > rowDate) {
					expiredSessions.push(rows[i].session_id);
				}
			}
		}
		conn.query("DELETE FROM sessions WHERE session_id IN (" + expiredSessions + ")");
		conn.query("DELETE FROM session_users WHERE session_id IN (" + expiredSessions + ")");
	});
}

app.post('/createSession', createSession);

var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'confirmation.brainchain@gmail.com',
			pass: '2018development'
		}
	});

app.post('/forgot', function (req, res) {

	var email = req.body.email;
	var query = 'SELECT * FROM users WHERE email=$1';
	conn.query(query, [email], function(error, result) {
		if(error != null || result.rows[0] == undefined){
			console.log(error);
			res.redirect("/emaildoesnotexist");
		}
		else{
			var token = randomstring.generate(10);
			var mailOptions = {
				from: 'confirmation.brainchain@gmail.com',
				to: email,
				subject: 'Password reset',
				html: '<p>To reset your password, go to <a href=\"' + 'www.mybrainchain.com/reset/' + token + '\">this link</a>\n\n'
			};
			transporter.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log("Email sent");
				}
			});
			query = "INSERT OR REPLACE INTO tokens (email, token) VALUES ($1, $2)";
			conn.query(query,[email, token], function(error, result){
				if(error != null){
					console.log(error)
				}
				res.redirect("/passwordemail")
			});
		}
	});

});

app.get('/forgot/', function(request, response) {
	response.status(200).type('html');
	response.render('forgot.html');
});

app.post('/reset/:token', function (req, res) {
	query = "SELECT * FROM tokens WHERE token=$1";
	 conn.query(query,[req.params.token], function(error, result){
		 if(result === undefined) {
			console.log("Invalid token");
			res.redirect("/404");
			return;
		 }
		 if(result.rows.length == 0) {
			console.log("Invalid token");
			res.redirect("/404");
			return;
		 }
	 	var resultRow = result.rows[0]
	 	var email = resultRow.email;
		if(error != null){
			console.log(error)
		}
		console.log(email)
		console.log(req.body.newpassword)
		query2 =  "UPDATE users SET password = $1 WHERE email = $2";
		bcrypt.genSalt(saltRounds, function(err, salt) {
			bcrypt.hash(req.body.newpassword, salt, function(err, hash) {
	   			conn.query(query2,[hash, email], function(error, result){
					if(error != null ){
						console.log(error);
						res.redirect("/404");

					} else {
						q2 = "DELETE FROM tokens WHERE token=$1";
						conn.query(q2, [req.params.token]);
						res.redirect("/");
					}
				});
	   		});
		});
	});
});

app.get('/reset/:token', function(request, response) {
	response.status(200).type('html');
	response.render('reset.html');
});

app.post('/create_profile', function(request, response) {
	var course1 = request.body.course1;
	var course2 = request.body.course2;
	var course3 = request.body.course3;
	var course4 = request.body.course4;
	var course5 = request.body.course5;
	var notificationTime = parseInt(request.body.notificationTime);

	conn.query("INSERT INTO user_courses (email, course) VALUES ($1, $2)", [request.body.email, course1]);
	conn.query("INSERT INTO user_courses (email, course) VALUES ($1, $2)", [request.body.email, course2]);
	conn.query("INSERT INTO user_courses (email, course) VALUES ($1, $2)", [request.body.email, course3]);
	conn.query("INSERT INTO user_courses (email, course) VALUES ($1, $2)", [request.body.email, course4]);
	conn.query("INSERT INTO user_courses (email, course) VALUES ($1, $2)", [request.body.email, course5]);

	query = "INSERT INTO users (email, fname, lname, notificationTime, password, verified) VALUES ($1, $2, $3, $4, $5, 0)";

	bcrypt.genSalt(saltRounds, function(err, salt) {
		bcrypt.hash(request.body.password, salt, function(err, hash) {
			conn.query(query,[request.body.email, request.body.fname, request.body.lname, notificationTime, hash], function(error, result){
				if (error) {
					console.log("error in create profile: ");
					console.log(error.message);
					response.send("Error");
				}
				else{
					returnTo = request.session.returnTo;
					request.session.returnTo = undefined;

					var id = crypto.randomBytes(20).toString('hex');
					var verifyQuery = "INSERT INTO user_verified (email, hash) VALUES ($1, $2)"
					conn.query(verifyQuery,[request.body.email, id], function(error, result){
						if(error) {
							console.log("error in email verification");
							console.log(error.message);
							response.send("Error");
							response.end();
						}
						else{
							sendVerificationEmail(request.body.email, id)
						}
					});
					response.send("/preverification");
				}
			});
		});
	});
});

function sendVerificationEmail(email, hash){
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'confirmation.brainchain@gmail.com',
			pass: '2018development'
		}
	});
	var mailOptions = {
		from: 'confirmation.brainchain@gmail.com',
		to: email,
		subject: 'BrainChain Account Verification ',
		text: 'Click on localhost:8080/verify/' + hash + ' to verify',
		//html: '<p>Please click <a href=\"' + 'localhost:8080/verify/' + hash + '\">here</a> to verify your account</p>'
	};
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent");
		}
	});
}

app.get('/editProfile', function(request, response) {
	response.status(200).type('html');
	response.render("editProfile.html");
});

app.post('/editProfile', function(request, response) {
	delete_query = "DELETE FROM user_courses WHERE email=$1";
	conn.query(delete_query, [request.session.user.email]);

	query1 = "INSERT INTO user_courses (email, course) VALUES ($1, $2)"
	console.log(request.body.class1);
	conn.query(query1, [request.session.user.email, request.body.class1]);

	query2 = "INSERT INTO user_courses (email, course) VALUES ($1, $2)"
	conn.query(query2, [request.session.user.email, request.body.class2]);

	query3 = "INSERT INTO user_courses (email, course) VALUES ($1, $2)"
	conn.query(query3, [request.session.user.email, request.body.class3]);

	query4 = "INSERT INTO user_courses (email, course) VALUES ($1, $2)"
	conn.query(query4, [request.session.user.email, request.body.class4]);

	query5 = "INSERT INTO user_courses (email, course) VALUES ($1, $2)"
	conn.query(query5, [request.session.user.email, request.body.class5]);


	query = "UPDATE users SET notificationTime=$1 WHERE email=$2";
	conn.query(query, [request.body.notificationTime, request.session.user.email]);

});

app.post('/delete_session', function(request, response) {
	query = "DELETE FROM sessions WHERE session_id = " + request.body.sessionId + ";";
	conn.query(query);
});

app.get("/login", function(request, response) {
		response.status(200).type('html');
		response.render("login.html");
});

app.get("/mysessions", function(request, response) {
	response.status(200).type('html');
	response.render("mysessions.html");
});

app.get("/verify/:hash", function(request, response) {
	var hash = request.params.hash;
	var query = "select email FROM user_verified WHERE hash=$1"
	conn.query(query,[hash], function(error, result){
		if(error || result.rows[0] == undefined){
			console.log(error)
			response.redirect("/404")
		}
		else{
			console.log("verifying: "+result.rows[0].email);
			var q2 = "UPDATE users SET verified=1 WHERE email=$1";
			conn.query(q2, [result.rows[0].email]);
			q2 = "DELETE FROM user_verified WHERE email=$1";
			conn.query(q2, [result.rows[0].email]);
			var q2 = "select * from users where email = $1";
			conn.query(q2, [result.rows[0].email], function(error, result2){
				var newUser = {email: result.rows[0].email, password: result2.rows[0].password, fname: result2.rows[0].fname, lname: result2.rows[0].lname};
				request.session.user = newUser;
				var hour = 1800000;
				request.session.cookie.maxAge = hour;
				response.redirect("/postverification");
			})
		}
	});

});

function sendConfirmationEmail(time, course_id, loc, floorRoom, purpose, notes, professor, email, isConfirmation) {
	console.log("About to send " + (isConfirmation ? 'confirmation' : 'reminder') + " email");
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'confirmation.brainchain@gmail.com',
			pass: '2018development'
		}
	});

	var mailOptions = {
		from: 'confirmation.brainchain@gmail.com',
		to: email,
		subject: 'BrainChain Session ' + (isConfirmation ? 'Confirmation' : 'Reminder') + " - " + getDateStringForEmail(new Date(time), true),
		html: '<p>This is a ' + (isConfirmation ? 'confirmation' : 'reminder') + ' that you have registered for a BrainChain session:<br><br>Course: '
				+ course_id + "<br>Professor: " + professor + "<br>Time: " + getDateStringForEmail(new Date(time), false) + "<br>Location: " + loc + " " + floorRoom
				+ "<br>Purpose: " + purpose + "<br>Additional Notes: " + notes + "<br><br>If you need to leave this session, go to <b><a href=\"www.mybrainchain.com/mysessions\">My Sessions</a></b>.</p>"
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent");
		}
	});
}

function getDateStringForEmail(date, isSubject) {
	hours = date.getHours();
	isPm = hours >= 12 ? true : false;
	if(hours == 0 || hours == 12) {
		hours = 12;
	} else {
		hours %= 12;
	}
	return (date.getMonth()+1) + "/" + (date.getDate()) + "/" +
			date.getFullYear() + (isSubject ? " at " : " ") + hours + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
			+ (isPm ? "pm" : "am");
}

app.post('/leave_session', function(request, response) {
	email = request.session.user.email;
	session_id = request.body.session_id;
	conn.query("SELECT * FROM session_users", function(error, result) {

	});
	query = "DELETE FROM session_users WHERE email=$1 AND session_id=$2";
	conn.query(query, [email, session_id]);
	response.json("");
});

app.post('/join_session', function(request, response) {
	selectQuery = "SELECT * FROM session_users WHERE email=$1 AND session_id=$2";
	conn.query(selectQuery, [request.body.email, request.body.session_id], function(error, result) {
		if(result.rows.length > 0) {
			response.json("Duplicate");
		} else {
			query = "INSERT INTO session_users (email, session_id, notified) VALUES ($1, $2, $3)";
			conn.query(query,[request.body.email, request.body.session_id, 0], function(error, result){
				if(error != null){
					console.log(error)
				}
				else{
					isLoggedIn = false;
					if(request.body.email === undefined) {
					} else {
						isLoggedIn = true;
					}
					sessionInfoQuery = "SELECT * FROM sessions WHERE session_id = $1";
					conn.query(sessionInfoQuery, [request.body.session_id], function(error, result) {
						if(error) {
							console.log(error);
						} else {
							if(result === undefined) {
								console.log("Session no longer exists");
							} else {
								resultRow = result.rows[0];
								if(resultRow === undefined) {
									console.log("Expired");
									response.json("Expired");
								} else {
									if(!isLoggedIn) {
										response.json("Login");
									} else {
										response.json("MainPage");
										q = "SELECT notificationTime FROM users WHERE email=$1";
										conn.query(q, [request.body.email], function(error, result) {
											notificationTime = result.rows[0].notificationTime;
											now = new Date();
											session_time = new Date(resultRow.time);
											now.setMinutes(now.getMinutes() + notificationTime);
											if(now > session_time) {
												conn.query("UPDATE session_users SET notified=1 WHERE email=$1 AND session_id=$2",
														[request.body.email, request.body.session_id]);
											}
										});
										sendConfirmationEmail(resultRow.time, resultRow.course_id, resultRow.location, resultRow.floor,
											resultRow.purpose, resultRow.notes, resultRow.professor, request.body.email, true);
									}
								}

							}

						}
					});
				}
			});
		}
	});
});

app.get('/session', function(request, response) {
	if(request.session.user) {
		response.status(200).type('html');
		response.render("session.html");
	} else {
		response.status(200).type('html');
		request.session.returnTo = "/session";
		response.redirect("/login");
	}
});

app.get('/get_class_list', function(request, response) {
  fs.readFile("brown_classes.txt", 'utf8', function(err, data) {
	  if (err) throw err;
	  var obj = JSON.parse(data);
	  var courses = obj.courses;
	  response.json(courses);
	});
});

app.get('/getActiveSessions', function(request, response) {
	var query = "SELECT S.session_id, course_id, professor, time, location, floor, purpose, notes, count FROM sessions S " +
				"JOIN (SELECT session_id, COUNT(email) AS count FROM session_users GROUP BY session_id) U on S.session_id = U.session_id";
	var now = new Date();
	now.setHours(now.getHours() - 1);
	conn.query(query, function(error, result) {
		if(error) {
			console.log(error);
		} else {
			response.json(result.rows);
		}
	});
});

function createSession(request, response) {
	var query = "INSERT INTO sessions VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
	className = request.body.classname;
	datepicker = request.body.datepicker;
	datetime = new Date(datepicker);
	time = request.body.time;
	timeComponents = time.split(":");
	hours = parseInt(timeComponents[0]);
	minutes = parseInt(timeComponents[1]);
	timeLength = time.length;
	if(time.substring(timeLength-2) === "pm") {
		if(hours != 12) {
			hours += 12;
		}
	} else {
		if(hours == 12) {
			hours -= 12;
		}
	}
	datetime.setHours(hours);
	datetime.setMinutes(minutes);
	purpose = request.body.purpose;
	loc = request.body.loc;
	floorRoom = request.body.floorRoom;
	professor = request.body.professor;
	notes = request.body.notes;
	conn.query(query, [null, className, professor, datetime.toString(), loc, floorRoom, purpose, notes, 0], function(error, result) {
		if(error) {
			console.log(error);
		} else {
			query2 = "INSERT INTO session_users (email, session_id, notified) VALUES ($1, $2 , $3)";
			conn.query(query2,[request.session.user.email, result.lastInsertId, 0], function(error, result2){
				if(error != null){
					console.log(error)
				}
				q = "SELECT notificationTime FROM users WHERE email=$1";
				conn.query(q, [request.session.user.email], function(error, result3) {
					notificationTime = result3.rows[0].notificationTime;
					now = new Date();
					session_time = datetime;
					now.setMinutes(now.getMinutes() + notificationTime);
					if(now > session_time) {
						conn.query("UPDATE session_users SET notified=1 WHERE email=$1 AND session_id=$2",
								[request.session.user.email, result.lastInsertId]);
					}
				});
				sendConfirmationEmail(datetime.toString(), className, loc, floorRoom, purpose, notes, professor, request.session.user.email, true);
			});
		}
	});
}

app.post('/login', function(request, response) {
	var username = request.body.username;
	var query = 'SELECT * FROM users WHERE email=$1';
	conn.query(query, [username], function(error, result) {
		if(result === undefined) {
			response.send('error');
		} else {
			var rows = result.rows;
			if(rows.length == 0) {
				response.send("error");
			} else {
				bcrypt.compare(request.body.pass, rows[0].password, function(err, res) {
					if(res) {
						//check if user is verified or not
						if(rows[0].verified == 0){
							response.send("/preverification");
							response.end()
							return;
						}
						var newUser = {email: username, password: rows[0].password, fname: rows[0].fname, lname: rows[0].lname};
						request.session.user = newUser;
						var hour = 1800000;
						request.session.cookie.maxAge = hour;
						if(request.session.returnTo === undefined) {
							response.send("good");
						} else {
							returnTo = request.session.returnTo;
							request.session.returnTo = undefined;
							response.send(returnTo);
						}

					} else {
						response.send('error');
					}
				});
			}
		}
	});
});

app.get('/aboutus', function(request, response) {
	response.status(200).type('html');
	response.render("aboutus.html");
});

app.get('/profile', function(request, response) {
	response.status(200).type('html');
	response.render('profile.html');
});

app.get('/myprofile', function(request, response) {
  if(request.session.user){
	 query = "SELECT DISTINCT * FROM session_users su join sessions s ON su.session_id = s.session_id WHERE su.email = '"+request.session.user.email+"';"
	 conn.query(query, function(error, result){
 		if(result !== undefined) {
			response.status(200).type('html');
 			response.render('myprofile.html', {sessions: result.rows, firstName: request.session.user.fname,
							email: request.session.user.email, notificationTime: request.session.user.notificationTime});
 		} else {
			response.status(200).type('html');
			response.render('myprofile.html', {sessions: []})
 		}
     });
  } else {
	 response.redirect("/login");
  }
});

app.get('/classes', function(request, response){
    query = "SELECT * FROM classes";
    conn.query(query, function(error, result){
        response.json(result.rows);
    });
});

app.get('/myCourses', function(request, response) {
	if(request.session.user) {
		var query = "SELECT course FROM user_courses WHERE email=$1";
		conn.query(query, [request.session.user.email], function(error, result) {
			courses = result.rows;
			response.json(courses);
		});
	} else {
		response.json("");
	}
});

app.get('/check_logged_in', function(request, response){
	if(request.session.user){
	   var query = "SELECT notificationTime FROM users WHERE email=$1";
	   conn.query(query, [request.session.user.email], function(error, result) {
			notificationTime = result.rows[0].notificationTime;
			//If session exists, proceed to page
			var userInfo = {"loggedIn":true, "email": request.session.user.email, "fname": request.session.user.fname, "lname": request.session.user.lname, "notificationTime": notificationTime}
			response.json(userInfo)
	   });
	} else {
	   response.json({"loggedIn":false})
	}
});

app.get('/get_user_sessions', function(request, response){
	var query = "SELECT * FROM session_users su JOIN (SELECT S.session_id, course_id, professor, time, location, floor, purpose, notes, count FROM sessions S " +
				"JOIN (SELECT session_id, COUNT(email) AS count FROM session_users GROUP BY session_id) U on S.session_id = U.session_id) A " +
				"ON su.session_id = A.session_id WHERE email=$1";
	conn.query(query, [request.session.user.email], function(error, result) {
		if(error) {
			console.log(error);
		} else {
			response.json(result.rows);
		}
	});
});

app.get('/logout', function(request, response){
   request.session.destroy(function(){
   });
   response.redirect('/');
});

app.get('/', function(request, response) {
  var query = "SELECT * FROM sessions";
  conn.query(query, function(error, result) {
	response.status(200).type('html');
	response.render('brainchain.html', {sessions: result.rows});
  });
});

app.get('/about', function(request, response) {
	response.status(200).type('html');
	response.render('aboutus.html');
});

app.get('/preverification', function(request, response) {
	response.status(200).type('html');
	response.render('preverification.html');
});

app.get('/postverification', function(request, response) {
	response.status(200).type('html');
	response.render('postverification.html');
});

//renders the "we sent you an email to recover your password page"
app.get('/passwordemail', function(request, response) {

	response.status(200).type('html');
	response.render('passwordEmailSent.html');
});

//renders the "we sent you an email to recover your password page"
app.get('/passwordemail', function(request, response) {

	response.status(200).type('html');
	response.render('emaildoesnotexist.html');
});

app.get('*', function(request, response){
    response.render('./404page.html');
    response.status(404).type('html');

});

server.listen(8080, function() {
  console.log("- Server listening on port 8080");
});


