const express = require(`express`);
const app = express();
const path = require(`path`);
const https = require(`https`);
const ejs = require(`ejs`);
const port = process.env.PORT || 4000;
const fs = require(`fs`);
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { create } = require('domain');

app.set(`view engine`,`ejs`);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, `public`)));

app.get(`/login`, (req, res) => {
    res.render(`login`);
});
app.get(`/about`, (req, res) => {
    res.render(`about`);
});
app.get(`/create_user`, (req, res) => {
    res.render(`create_acc_user`);
});
app.get(`/create_driver`, (req, res) => {
    res.render(`create_acc_driver`);
});
app.get(`/booking`,(req,res)=>{
        res.render(`booking`);
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
                res.render(`failure_user`,{error:err});
            }
            else{
                res.render(`success_user`);
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
                res.render(`failure_driver`,{error:err});
            }
            else{
                res.render(`success_driver`);
            }
        });
    });
});

app.post(`/available_buses`,(req,res)=>{
    
});

app.listen(port, () => {
    console.log(`Server runnning at port ${port}`);
});