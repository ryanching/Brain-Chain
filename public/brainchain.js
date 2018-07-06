$( document ).ready(getSessions)
var user = {};
function run() {
  setInterval(getSessions, 50000);
}
checkLoggedIn();

function checkLoggedIn(){
    var isLoggedIn = false;
    $.get('/check_logged_in', function(data, status) {
		if(status === 'success') {
			console.log(data);
            user = data;
            isLoggedIn = true;
		} else {
			console.log("got here");
			$('#error').show();
		}

    });
    return isLoggedIn;
}

function join(num){
    var didJoin = false;
    if(num == -1){
        return didJoin;
    }
    else{
        $.post('/join_session', {
            email: user.email, session_id: num,
        }, function(data){
    		console.log(data);
    		if(data === "Login") {
    			window.location.href = "/login";
			} else if(data === "Duplicate") {
				alert("Already registered for this session!");
			} else if(data === "Expired") {
				alert("Session no longer exists!");
				window.location.href = "/";
    		} else {
    			window.location.href = "/mysessions";
                didJoin = true;
    		}
        });
    }
    return didJoin;
}

function getSessions() {

	var url = "/getActiveSessions";
	var ul = $('#sessions');
    var sessionsReceived = false;
	$.get('/getActiveSessions', function(data, status) {
		if(status === 'success') {
			console.log(data);
			if(data.length == 0) {
				noActive = $("#noActive");
				noActive.show();
			}
			for(var i = 0; i < data.length; i++) {
				var li = $('<li></li>');
				generateSessionCard(li, data[i], i);
				ul.prepend(li);
			}
            sessionsReceived = true;
		} else {
			console.log("got here");
			$('#error').show();
		}
    });
    return sessionsReceived;
}

function generateSessionCard(li, data, num) {
	datetime = new Date(data.time);
	hours = datetime.getHours();
	isPm = hours >= 12 ? true : false;
	if(hours == 0 || hours == 12) {
		hours = 12;
	} else {
		hours %= 12;
	}
	console.log(data.professor);
	dateString = (datetime.getMonth()+1) + "/" + datetime.getDate() + "/" + datetime.getFullYear() + " " + hours + ":" 
									+ (datetime.getMinutes() < 10 ? "0" : "") + datetime.getMinutes() + " " + (isPm ? "PM" : "AM");
	modalText = "Course: " + data.course_id + "<br>Professor: " + data.professor + "<br>Date: " + dateString + "<br>Location: " + data.location + 
			" " + data.floor + "<br>Purpose: " + data.purpose + "<br>Registered Users: " + data.count + "<br><br>Notes: " + data.notes;
	li.html(
	"<div class='card' onclick='showModal("+ num +")'>" +
					"<div>" +
						"<h3 class ='course-name'>" + data.course_id + "</h3>" +
						"<h6 class='professor'>" + data.professor + "</h6>" + 
					"</div>" +
					"<div style='display: none;'><p id='" + num + "'>" + data.session_id + "</p></div>" +
					"<div>" +

						"<h6 class='purpose'>" + data.purpose +"</h6>" +
						"<h6 class='date'>" + dateString + "</h6>" +
					"</div>" +
					"</div" +
					"<!-- Modal -->" +
					"<div id='myModal" + num + "' class='modal fade' role='dialog'>" +
					  "<div class='modal-dialog'>" +
						"<!-- Modal content-->" +
						"<div class='modal-content'>" +
						  "<div class='modal-body'>" +
							"<p>" + modalText + "</p>" +
						  "</div>" +
						  "<div class='modal-footer'>" +
							"<button type='button' class='btn btn-default' onclick='join(" + data.session_id + ")'>Join Session</button>" +
							"<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>" +
						  "</div>" +
						"</div>" +
					  "</div>" +
					"</div>")
}

function filterSessions() {
    // Declare variables
    
    var input, filter, ul, li, a, i;
    input = document.getElementById('searchBar');
    filter = input.value.toUpperCase();
    ul = document.getElementById("sessions");
    li = ul.getElementsByTagName('li');
	
	noActive = $("#noActive");
	noActive.hide();
	var numActive = 0;

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (li[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
			numActive += 1;
        } else {
            li[i].style.display = "none";
        }
    }
	if(numActive == 0) {
		noActive.show();
	}
}

function showModal(n) {
	$('#myModal' + n).modal('show');
}
