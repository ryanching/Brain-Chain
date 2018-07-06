//To run these tests, go to main directory and run following command:
//  ./node_modules/mocha/bin/mocha test 

var server = require('../server.js');

describe('server', function () {
  before(function () {
    server.listen(8080);

  });

  after(function () {
    server.close();
  });
});

var assert = require('assert'),
    fs = require('fs'),
    http = require('http');

    describe('/', function () {

        it('should return brainchain.html', function (done) {
            http.get('http://localhost:8080/', function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                var page = fs.readFile("brainchain.html", 'utf8', function(err, data2) {
                  assert.equal(data2, data);
              	});
                done();
            });
        });

        it('should return profile.html', function (done) {
            http.get('http://localhost:8080/profile', function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                var page = fs.readFile("profile.html", 'utf8', function(err, data2) {
                  assert.equal(data2, data);
              	});
                done();
            });
        });

        it('should return aboutme.html', function (done) {
            http.get('http://localhost:8080/about', function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                var page = fs.readFile("aboutus.html", 'utf8', function(err, data2) {
                  assert.equal(data2, data);
              	});
                done();
            });
        });



        it('should return login.html', function (done) {
            http.get('http://localhost:8080/login', function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                var page = fs.readFile("login.html", 'utf8', function(err, data2) {
                  assert.equal(data2, data);
              	});
                done();
            });
        });

        it('check home page 200 status', function (done) {
            http.get('http://localhost:8080/', function (res) {
              assert.equal(200, res.statusCode);
              done();
            });
        });

        it('check session page 200 status', function (done) {
            http.get('http://localhost:8080/session', function (res) {
              assert.equal(200, res.statusCode);
              done();
            });
        });

        it('check profile page 200 status', function (done) {
            http.get('http://localhost:8080/profile', function (res) {
              assert.equal(200, res.statusCode);
              done();
            });
        });

        it('should return 404 error', function (done) {
            http.get('http://localhost:8080/notARealUrl', function (res) {
              assert.equal(404, res.statusCode);
              done();
            });
        });

        it('should return logged in as false', function (done) {
            http.get('http://localhost:8080/check_logged_in', function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                assert.equal(data, false);
                done();
            });
        });

        it('should return classes json object', function (done) {
            http.get('http://localhost:8080/classes', function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });

                fs.readFile("brown_classes.txt", 'utf8', function(err, data2) {
                    if (err) throw err;
                    var obj = JSON.parse(data2);
                    var courses = obj.courses;

                    assert.equal(data, courses);
                });
                done();
            });
        });
});





  // it('should say "Hello, world!"', function (done) {
  //   http.get('http://localhost:8080', function (res) {
  //     var data = '';
  //
  //     res.on('data', function (chunk) {
  //       data += chunk;
  //     });
  //
  //     res.on('end', function () {
  //        console.log(data);
  //       assert.equal('Hello, world!\n', data);
  //
  //       done();
  //     });
  //   });
  // });
