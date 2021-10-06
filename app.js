const express = require(`express`);
const app = express();
const path = require(`path`);
const https = require(`https`);
const port = process.env.PORT || 3000;
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { create } = require('domain');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, `public`)));

app.get(`/login`, (req, res) => {
    res.sendFile(path.join(__dirname, `login.html`));
});
app.get(`/about`, (req, res) => {
    res.sendFile(path.join(__dirname, `about.html`));
});
app.get(`/create_user`, (req, res) => {
    res.sendFile(path.join(__dirname, `create_acc_user.html`));
});
app.get(`/create_driver`, (req, res) => {
    res.sendFile(path.join(__dirname, `create_acc_driver.html`));
});
app.get(`/booking`,(req,res)=>{
    res.sendFile(path.join(__dirname,`booking.html`));
});
app.post(`/login_check`, (req, res) => {
    if (req.body.userType == "user") {

        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `SELECT pass_hash FROM users WHERE email = ?`;
        let insert = [req.body.email];
        query = mysql.format(query, insert);
        conn.query(query, (err, result_pass, fields) => {
            if (err) throw err;
            if (result_pass.length > 0) {
                bcrypt.compare(req.body.password, result_pass[0].pass_hash,(err, result)=>{
                    if(result==true){
                        res.send("succesfull");}
                    else{
                        res.send("wrong password");
                    }
                });         
            }
            else {
                res.send("Not registered");
            }
        });
    }
    else if (req.body.userType == "driver") {
        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `SELECT pass_hash FROM drivers WHERE email = ?`;
        let insert = [req.body.email];
        query = mysql.format(query, insert);
        conn.query(query, (err, result_pass, fields) => {
            if (err) throw err;
            if (result_pass.length > 0) {
                bcrypt.compare(req.body.password, result_pass[0].pass_hash,(err, result)=>{
                    if(result==true){
                        res.send("succesfull driver");}
                    else{
                        res.send("wrong password");
                    }
                });         
            }
            else {
                res.send("Not registered");
            }
        });
    }
});

app.post(`/create_user_acc`, (req, res) => {
    const conn = mysql.createConnection({
        host: `localhost`,
        user: `root`,
        password: `nayan-2002`,
        database: `bus_ticket_booking_system`
    });
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        let query = `INSERT INTO users(email,username,name,contact,college_id,usertype,pass_hash) VALUES(?,?,?,?,?,?,?)`;
        let insert = [req.body.email, req.body.username, (req.body.fname + ` ` + req.body.lname), Number(req.body.contact), req.body.college_id, Number(req.body.userType), hash];
        query = mysql.format(query, insert);
        conn.query(query, (err, result, fields) => {
            if (err) {
                res.write(`
                <!DOCTYPE html>
                        <html>          
                        <head>
                            <title>Failure</title>
                            <!-- Bootstrap and CSS -->
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet"
                                integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous">
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js"
                                integrity="sha384-/bQdsTh/da6pkI1MST/rWKFNjaCP5gBSY4sEBT38Q/9RBh9AH40zEOg7Hlq2THRZ" crossorigin="anonymous"
                                defer></script>
                        </head>
                        <body>
                        <main class="container py-4 mt-4" >
                        <article class="h-50 p-5 text-white bg-dark border rounded-3">
                            <h2 class="text-danger display-1 fw-normal">Failure</h2>
                            <p class="col-md-8 fs-4 ps-1">Data insertion failure!<br />Error code: ${err}</p>
                            <a class="btn btn-outline-light btn-lg ms-1" href="/create_user">Go Back</a>
                        </article>
                        </main>
                        </body> `);
                        res.end();
            }
            else{
                res.sendFile(path.join(__dirname,`success_user.html`));
            }
        });
    });
});

app.post(`/create_driver_acc`, (req, res) => {
    const conn = mysql.createConnection({
        host: `localhost`,
        user: `root`,
        password: `nayan-2002`,
        database: `bus_ticket_booking_system`
    });
    console.log(conn);
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        let query = `INSERT INTO drivers(email,username,name,contact,driver_id,pass_hash,license_no) VALUES(?,?,?,?,?,?,?)`;
        let insert = [req.body.email, req.body.username, (req.body.fname + ` ` + req.body.lname), Number(req.body.contact), req.body.driver_id, hash,req.body.license_no];
        query = mysql.format(query, insert);
        conn.query(query, (err, result, fields) => {
            if (err) {
                res.write(`
                <!DOCTYPE html>
                        <html>          
                        <head>
                            <title>Failure</title>
                            <!-- Bootstrap and CSS -->
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet"
                                integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous">
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js"
                                integrity="sha384-/bQdsTh/da6pkI1MST/rWKFNjaCP5gBSY4sEBT38Q/9RBh9AH40zEOg7Hlq2THRZ" crossorigin="anonymous"
                                defer></script>
                        </head>
                        <body>
                        <main class="container py-4 mt-4" >
                        <article class="h-50 p-5 text-white bg-dark border rounded-3">
                            <h2 class="text-danger display-1 fw-normal">Failure</h2>
                            <p class="col-md-8 fs-4 ps-1">Data insertion failure!<br />Error code: ${err}</p>
                            <a class="btn btn-outline-light btn-lg ms-1" href="/create_driver">Go Back</a>
                        </article>
                        </main>
                        </body> `);
                        res.end();
            }
            else{
                res.sendFile(path.join(__dirname,`success_driver.html`));
            }
        });
    });
});


app.listen(port, () => {
    console.log(`Server runnning at port ${port}`);
});