'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var port = process.env.PORT || 8000;

var storage = {
    "readFromFile": function () {
        fs.readFile("data/users.json", (err, data) => {
            if (!err) {
                this.users = JSON.parse(data.toString());
            } else {
                this.users = [];
            }
        });
    },

    "writeToFile": function () {
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        }
        fs.writeFile("data/users.json", JSON.stringify(this.users), (err) => {
            if (err) {
                console.log(err.message);
            }
        });
    },

    "createUser": function (user) {
        if (!this.users) this.users = [];
        this.users.push(user);
        this.writeToFile();
    },

    "queryUser": function (filter) {
        if (!this.users) return [];
        return this.users.filter((value, index, users) => {
            return filter(value);
        });
    },

    "updateUser": function (filter, switcher) {
        if (!this.users) return 0;
        var count = 0;
        this.users.forEach((value, index, users) => {
            if (filter(value)) {
                switcher(value);
                count++;
            }
        });
        if (count) this.writeToFile();
        return count;
    },

    "deleteUser": function (filter) {
        if (!this.users) return 0;
        var index;
        var count = 0;
        while ((index = this.users.findIndex((value, index, users) => {
            return filter(value);
        })) !== -1) {
            this.users.splice(index, 1);
            count++;
        }
        if (count) this.writeToFile();
        return count;
    },

    "users": null
};

function registerUser(user) {
    if (user.name && user.id && user.phone && user.email) {
        var status = true;
        var err = {
            name: false,
            id: false,
            phone: false,
            email: false
        };
        if (!user.name.match(/[A-Za-z][A-Za-z0-9_]{5,17}/) || storage.queryUser((usr) => {
            return usr.name === user.name;
        }).length !== 0) {
            err.name = true;
            status = false;
        }
        if (!user.id.match(/[1-9][0-9]{7}/) ||  storage.queryUser((usr) => {
            return usr.id === user.id;
        }).length !== 0) {
            err.id = true;
            status = false;
        }
        if (!user.phone.match(/[1-9][0-9]{10}/) || storage.queryUser((usr) => {
            return usr.phone === user.phone;
        }).length !== 0) {
            err.phone = true;
            status = false;
        }
        if (!user.email.match(/^[a-zA-Z_\-]+@(([a-zA-Z_\-])+\.)+[a-zA-Z]{2,4}$/) || storage.queryUser((usr) => {
            return usr.email === user.email;
        }).length !== 0) {
            err.email = true;
            status = false;
        }
        if (status) {
            storage.createUser(user);
            return true;
        } else {
            throw err;
        }
    } else {
        throw "请完整填写用户名、学号、电话和邮箱后注册";
    }
}

function queryUser(nameStr) {
    if (nameStr) {
        var arr;
        arr = storage.queryUser((usr) => {
            return usr.name === nameStr;
        });
        if (arr.length !== 0) {
            return arr[0];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function deleteUser(idStr) {
    if (idStr) {
        if (storage.deleteUser((usr) => {
            return usr.id === idStr;
        })) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

http.createServer(function (req, res) {
    var post = "";

    if (storage.users === null) {
        storage.readFromFile();
    }

    req.on("data", (chunk) => {
        post += chunk;
    });

    req.on("end", () => {
        var pars = url.parse(req.url);

        if (post !== "") {
            var post_body = querystring.parse(post);
            if (pars.pathname === "/register" && post_body.name && post_body.id && post_body.phone && post_body.email) {
                var reg_user = { "name": post_body.name, "id": post_body.id, "phone": post_body.phone, "email": post_body.email };
                try {
                    if (registerUser(reg_user)) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end(JSON.stringify(reg_user));
                    } else {
                        res.writeHead(409, { 'Content-Type': 'text/plain' });
                        res.end("Register fail.");
                    }
                } catch (e) {
                    res.writeHead(409, { 'Content-Type': 'text/plain' });
                    res.end(JSON.stringify(e));
                }
            } else if (pars.pathname === "/user" && post_body.name) {
                var query_user = queryUser(post_body.name);
                if (query_user) {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(JSON.stringify(query_user));
                } else {
                    res.writeHead(403, { 'Content-Type': 'text/plain' });
                    res.end("Login fail.");
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end("Bad request.");
            }
        } else {
            var get_user;
            if (pars.pathname === "/index.js") {
                fs.readFile("index.js", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/javascript' });
                        res.write(data.toString());
                        res.end();
                    }
                });
            } else if (pars.pathname === "/css/index.css") {
                fs.readFile("css/index.css", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/css' });
                        res.write(data.toString());
                        res.end();
                    }
                });
            } else if (pars.pathname === "/assets/background.png") {
                fs.readFile("assets/background.png", "binary", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'image/png' });
                        res.write(data, "binary");
                        res.end();
                    }
                });
            } else if (pars.pathname === "/register") {
                fs.readFile("register/register.html", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(data.toString());
                        res.end();
                    }
                });
            } else if (pars.pathname === "/" && (get_user = queryUser(querystring.parse(pars.query).username))) {
                fs.readFile("i/i.html", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        var str = data.toString();
                        str = str.replace("{name}", get_user.name);
                        str = str.replace("{name}", get_user.name);
                        str = str.replace("{id}", get_user.id);
                        str = str.replace("{phone}", get_user.phone);
                        str = str.replace("{email}", get_user.email);
                        res.write(str);
                        res.end();
                    }
                });
            } else {
                fs.readFile("index.html", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(data.toString());
                        res.end();
                    }
                });
            }
        }
    });
}).listen(port);

console.log("Server running at localhost:8000.\nPress Ctrl + C to quit the server.");