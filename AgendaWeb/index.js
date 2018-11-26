// JavaScript Document

var user;

function goRegister() {
    'use strict';
    history.pushState(history.state, "注册", "/register");
    document.title = "注册";
	$("#login-form").fadeOut(100, function () {
		$("#register-form").fadeIn();
    });
}

function goLogin() {
    'use strict';
    history.pushState(history.state, "登录", "/login");
    document.title = "登录";
	$(".user-info").fadeOut(100);
	$("#register-form").fadeOut(100, function () {
		$("#login-form").fadeIn();
    });
}

function showUserInfo() {
	'use strict';
	$("#user-id").text(user.id);
	$("#user-name").text(user.name);
	$("#user-phone").text(user.phone);
	$("#user-email").text(user.email);
	$(".user-info").fadeIn();
}

function sendLoginData() {
    'use strict';
    var req = new XMLHttpRequest();
    req.open("POST", "/user", "true");
    req.setRequestHeader("Content-type", "text/plain");
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                user = JSON.parse(req.responseText);
                document.title = user.name;
                history.pushState(history.state, user.name, "/?username=" + user.name);
                $("#status").text("");
                $("#login-form").fadeOut(100, function () {
                    showUserInfo();
                });
            } else {
				$("#status").text(req.responseText);
			}
        }
    };
    req.send("name=" + $("#name").val());
}

function sendRegisterData() {
	'use strict';
	var req = new XMLHttpRequest();
	req.open("POST", "/register", "true");
	req.setRequestHeader("Content-type", "text/plain");
	req.onreadystatechange = function () {
		if (req.readyState === 4) {
            if (req.status === 200) {
                $("#status").text("");
                $("#register-form").fadeOut(100, function () {
                    user = JSON.parse(req.responseText);
                    document.title = user.name;
                    history.pushState(history.state, user.name, "/?username=" + user.name);
					showUserInfo();
				});
            } else if (req.status === 409) {
                var err = JSON.parse(req.responseText);
                if (err.name) {
                    $("#reg-name").addClass("invalid");
                }
                if (err.id) {
                    $("#reg-id").addClass("invalid");
                }
                if (err.phone) {
                    $("#reg-phone").addClass("invalid");
                }
                if (err.email) {
                    $("#reg-email").addClass("invalid");
                }
                $("#status").text("某些项与已注册的信息重复，请换一下画红线的内容");
            } else {
				$("#status").text(req.responseText);
			}
        }
	};
	req.send("name=" + $("#reg-name").val() + "&id=" + $("#reg-id").val() + "&phone=" + $("#reg-phone").val() + "&email=" + $("#reg-email").val());
}

function checkData(login) {
	'use strict';
	if (login) {
		if ($("#name").val() === "") {
			$("#name").addClass("invalid");
			return false;
		} else {
			return true;
		}
	} else {
		var status = true;
		if (!$("#reg-name").val().match(/[A-Za-z][A-Za-z0-9_]{5,17}/)) {
			status = false;
			$("#reg-name").addClass("invalid");
		}
		if (!$("#reg-id").val().match(/[1-9][0-9]{7}/)) {
			status = false;
			$("#reg-id").addClass("invalid");
		}
		if (!$("#reg-phone").val().match(/[1-9][0-9]{10}/)) {
			status = false;
			$("#reg-phone").addClass("invalid");
        }
        if (!$("#reg-email").val().match(/^[a-zA-Z_\-]+@(([a-zA-Z_\-])+\.)+[a-zA-Z]{2,4}$/)) {
			status = false;
			$("#reg-email").addClass("invalid");
		}
		if (!status) {
			$("#status").text("划红线的项目必填，请按格式填写");
		}
		return status;
	}
}

$(document).ready(function () {
    'use strict';

    $("#login-form").submit(function () {
		if (checkData(true)) {
			sendLoginData();
		}
        return false;
    });
	
	$("#register-form").submit(function () {
		if (checkData(false)) {
			sendRegisterData();
		}
        return false;
    });
	
	$("#go-register").click(function () {
		goRegister();
		return false;
	});
	
	$("#go-login").click(function () {
		goLogin();
		return false;
	});
	
	$("#logout").click(goLogin);
	
	$("input").keydown(function () {
		$(this).removeClass("invalid");
	});
});