$(document).ready(function() {

	$("#form").submit(function(event){
	    event.preventDefault();
	    var fname = document.getElementById("fname").value;
	    var lname = document.getElementById("lname").value;
	    var email = document.getElementById("email").value;
	    var password1 = document.getElementById("password1").value;
	    var password2 = document.getElementById("password2").value;
		var notificationTime = document.getElementById("notificationTime").value;
		

	    if(password1.length < 6 || password1.length > 25) {
	    	alert("Password must be between 6-25 characters");
	    }
	    else if(password1 != password2) {
	    	alert("Passwords don't match!");
	    } else if(email.trim() === "" || fname.trim() === "" || lname.trim() === "" || notificationTime === "") {
			alert("Must have email, first name, last name, and notification time");
		}
	    else {
	    	$.post('/create_profile', {
	    		fname: fname, email: email, password: password1, lname: lname, course1: document.getElementById("class1").value,
	    		course2: document.getElementById("class2").value, course3: document.getElementById("class3").value,
	    		course4: document.getElementById("class4").value, course5: document.getElementById("class5").value,
				notificationTime: notificationTime,
			}, function(data){
				if(data == 'Error') {
					alert("Username already in use!");
				} else {
					console.log(data);
					window.location.href = data;
				}
            });



	    }


  });
});
