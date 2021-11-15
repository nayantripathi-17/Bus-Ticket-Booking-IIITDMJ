const express = require(`express`);
const app = express();
const path = require(`path`);
const https = require(`https`);
const ejs = require(`ejs`);
const port = process.env.PORT || 4000;
const session = require(`express-session`);
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let datamsg=``;
let sess;


app.set(`view engine`,`ejs`);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, `public`)));
app.use(session({secret:'Keep it secret',name:'sessionID',resave:false,saveUninitialized:false,rolling:true,cookie: { maxAge: 900000 }}));
app.get(`/login`, (req, res) => {
    res.render(`login`,{data:datamsg});
    datamsg=``;
});
app.get(`/logout`, (req, res) => {
    req.session.destroy((err)=>{
        sess=``;
        if(err) throw err;
        res.redirect(`/about`);
    });
});
app.get(`/about`, (req, res) => {
    const conn = mysql.createConnection({
        host: `localhost`,
        user: `root`,
        password: `nayan-2002`,
        database: `bus_ticket_booking_system`
    });
    let q1 = `SELECT routes.src,routes.des,DATE_FORMAT(follows.departure_time,'%l:%i %p') as Out_Time,routes.purpose from follows,routes where (follows.route_no = routes.route_no) and (weekday(follows.doj) = 0) and (follows.bus_no = 'CB1') order by follows.departure_time;`;
    let q2 = `SELECT routes.src,routes.des,DATE_FORMAT(follows.departure_time,'%l:%i %p') as Out_Time,routes.purpose from follows,routes where (follows.route_no = routes.route_no) and (weekday(follows.doj) = 0) and (follows.bus_no = 'CB2') order by follows.departure_time;`;
    let q3 = `SELECT routes.src,routes.des,DATE_FORMAT(follows.departure_time,'%l:%i %p') as Out_Time,routes.purpose from follows,routes where (follows.route_no = routes.route_no) and (weekday(follows.doj) = 0) and (follows.bus_no = 'IB') order by follows.departure_time;`;
    let q4 = `SELECT routes.src,routes.des,DATE_FORMAT(follows.departure_time,'%l:%i %p') as Out_Time,routes.purpose from follows,routes where (follows.route_no = routes.route_no) and (weekday(follows.doj) = 5) and (follows.bus_no = 'IB') order by follows.departure_time;`;
    conn.query(q1, (err, result, fields) => {
        q1 = result;
        conn.query(q2, (err, result, fields) => {
            q2 = result;
            conn.query(q3, (err, result, fields) => {
                q3 = result;
                conn.query(q4, (err, result, fields) => {
                    q4 = result;
                    sess=req.session;
                    if(sess.userid){
                        if(sess.userType){
                            res.render(`about`,{state:`navbar_logged_admin`,userID:sess.userid,q1_res:q1,q2_res:q2,q3_res:q3,q4_res:q4});
                        }
                        else{
                            res.render(`about`,{state:`navbar_logged`,userID:sess.userid,q1_res:q1,q2_res:q2,q3_res:q3,q4_res:q4});
                        }
                    }
                    else{
                        res.render(`about`,{state:`navbar_unlogged`,q1_res:q1,q2_res:q2,q3_res:q3,q4_res:q4});
                    }
                });
            });
        });
    });
});
app.get(`/create_user`, (req, res) => {
    res.render(`create_acc_user`,{data:``});
});
app.get(`/create_driver`, (req, res) => {
    res.render(`create_acc_driver`,{data:``});
});
// app.get(`/create_admin`, (req, res) => {
//     res.render(`admin_create`,{data:``});
// });
app.get(`/booking`,(req,res)=>{

    const conn = mysql.createConnection({
        host: `localhost`,
        user: `root`,
        password: `nayan-2002`,
        database: `bus_ticket_booking_system`
    });
    let q2 = `SELECT DISTINCT des FROM routes;`;
    let q1 = `SELECT DISTINCT src FROM routes;`;
    conn.query(q1, (err, result, fields) => {
        q1 = result;
        conn.query(q2, (err, result, fields) => {
            q2 = result;
            sess=req.session;
            if(sess.userid){
                if(sess.userType){
                    res.render(`booking`,{state:`navbar_logged_admin`,userID:sess.userid,q1_res:q1,q2_res:q2});
                }
                else{
                res.render(`booking`,{state:`navbar_logged`,userID:sess.userid,q1_res:q1,q2_res:q2});
                }
            }
            else{
                res.render(`booking`,{state:`navbar_unlogged`,q1_res:q1,q2_res:q2});
            } 

        });
    });  
});

app.get(`/dashboard`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `select routes.route_no as route_no,name,src,des,bus_no,doj,departure_time from ticket,routes where ticket.username= ? and routes.route_no = ticket.route_no;`;
        let inserts = [sess.userid];
        query = conn.format(query,inserts);
        conn.query(query, (err, result, fields) => {
            query=result;
            if(query.length>0){
                res.render(`dashboard`,{state:`navbar_logged`,userID:sess.userid,data:query,msg:``});
                }
            else{
                res.render(`dashboard`,{state:`navbar_logged`,userID:sess.userid,data:query,msg:`No Prior Booked Tickets`});
            }
        });
        }
    else{
        datamsg=`Please Login to continue`;
        res.redirect(`/login`);
    }
});

app.get(`/admin_dash`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        if(sess.userType){
            const conn = mysql.createConnection({
                host: `localhost`,
                user: `root`,
                password: `nayan-2002`,
                database: `bus_ticket_booking_system`
            });
            let query = `select * from routes;`;
            conn.query(query, (err, result, fields) => {
                query=result;
                res.render(`admin_dash`,{userID:sess.userid,data:query,state:`routes`});
            });
        }
        else{
            res.redirect(`/logout`);
        }}
    else{
        datamsg=`Please Login as ADMIN to continue`;
        res.redirect(`/login`);
    }
});

app.post(`/all_buses`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        if(sess.userType){
            const conn = mysql.createConnection({
                host: `localhost`,
                user: `root`,
                password: `nayan-2002`,
                database: `bus_ticket_booking_system`
            });
            let query = `select * from follows where route_no = ?;`;
            let inserts=[req.body.route_no];
            query = conn.format(query,inserts);
            conn.query(query, (err, result, fields) => {
                query=result;
                res.render(`admin_dash`,{userID:sess.userid,data:query,state:`bus`,source:req.body.source,destination:req.body.destination,route_no:req.body.route_no});
            });
        }
        else{
            res.redirect(`/logout`);
        }}
    else{
        datamsg=`Please Login as ADMIN to continue`;
        res.redirect(`/login`);
    }
});

app.post(`/all_tickets`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        if(sess.userType){
            const conn = mysql.createConnection({
                host: `localhost`,
                user: `root`,
                password: `nayan-2002`,
                database: `bus_ticket_booking_system`
            });
            let query = `select * from ticket where route_no = ? and bus_no = ? and doj = ? and departure_time = ?;`;
            let inserts=[Number(req.body.route_no),req.body.bus_no,new Date(req.body.doj).toLocaleDateString(`en-ca`),req.body.departure_time];
            query = conn.format(query,inserts);
            conn.query(query, (err, result, fields) => {
                query=result;
                if(result.length>0){
                    res.render(`admin_dash`,{userID:sess.userid,data:query,state:`ticket`,source:req.body.source,destination:req.body.destination,route_no:req.body.route_no,doj:req.body.doj,departure_time:req.body.departure_time,bus_no:req.body.bus_no,msg:""});
                }
                else{
                    res.render(`admin_dash`,{userID:sess.userid,data:query,state:`ticket`,source:req.body.source,destination:req.body.destination,route_no:req.body.route_no,doj:req.body.doj,departure_time:req.body.departure_time,bus_no:req.body.bus_no,msg:"No Tickets Have Been Booked"});
                }
            });
        }
        else{
            res.redirect(`/logout`);
        }}
    else{
        datamsg=`Please Login as ADMIN to continue`;
        res.redirect(`/login`);
    }
});



app.get(`/view_tickets`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        if(sess.userType){
    
            res.render(`admin_dash`,{userID:sess.userid});
        }
        else{
            res.redirect(`/logout`);
        }}
    else{
        datamsg=`Please Login as ADMIN to continue`;
        res.redirect(`/login`);
    }
});



app.post(`/login_check`, (req, res) => {
    if (req.body.userType === `user`) {

        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `SELECT pass_hash FROM users WHERE username = ?`;
        let insert = [req.body.username];
        query = mysql.format(query, insert);
        conn.query(query, (err, result_pass, fields) => {
            if (err) throw err;
            if (result_pass.length > 0) {
                bcrypt.compare(req.body.password, result_pass[0].pass_hash,(err, result)=>{
                    if(result==true){
                        sess=req.session;
                        sess.userid=req.body.username;

                        res.redirect(`/about`);
                    }
                    else{
                        datamsg=`Incorrect Password`;
                        res.redirect(`/login`);
                    }
                });         
            }
            else {
                res.render(`create_acc_user`,{data: `Please Register First to Sign In`});
            }
        });
    }
    else if (req.body.userType === `driver`) {
        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `SELECT pass_hash FROM drivers WHERE username = ?`;
        let insert = [req.body.username];
        query = mysql.format(query, insert);
        conn.query(query, (err, result_pass, fields) => {
            if (err) throw err;
            if (result_pass.length > 0) {
                bcrypt.compare(req.body.password, result_pass[0].pass_hash,(err, result)=>{
                    if(result==true){
                        sess=req.session;
                        sess.userid=req.body.username;
                        res.redirect(`/about`);}
                    else{
                        datamsg=`Incorrect Password`;
                        res.redirect(`/login`);
                    }
                });         
            }
            else {
                res.render(`create_acc_driver`,{data:`Please Register First to Sign In`});
            }
        });
    }
    else if (req.body.userType === `admin`) {

        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `SELECT pass_hash FROM admin WHERE username = ?`;
        let insert = [req.body.username];
        query = mysql.format(query, insert);
        conn.query(query, (err, result_pass, fields) => {
            if (err) throw err;
            if (result_pass.length > 0) {
                bcrypt.compare(req.body.password, result_pass[0].pass_hash,(err, result)=>{
                    if(result==true){
                        sess=req.session;
                        req.session.userType=`admin`;
                        sess.userid=req.body.username;
                        res.redirect(`/about`);
                    }
                    else{
                        datamsg=`Incorrect Password`;
                        res.redirect(`/login`);
                    }
                });         
            }
            else {
                res.render(`create_acc_user`,{data: `Please Register First to Sign In`});
            }
        });
    }
});


// app.post(`/create_admin`, (req, res) => {
//     const conn = mysql.createConnection({
//         host: `localhost`,
//         user: `root`,
//         password: `nayan-2002`,
//         database: `bus_ticket_booking_system`
//     });
//     bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
//         let query = `INSERT INTO admin(email,username,pass_hash) VALUES(?,?,?)`;
//         let insert = [req.body.email, req.body.username, hash];
//         query = mysql.format(query, insert);
//         conn.query(query, (err, result, fields) => {
//             if (err) {
//                 res.render(`failure`,{error:err,link:`/create_admin`});
//             }
//             else{
//                 res.render(`success`,{msg:`You're now signed up, look forward to hassle free bookings!`,link:`/login`,link_msg:`Sign In`});
//             }
//         });
//     });
// });


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
                res.render(`failure`,{error:err,link:`/create_user`});
            }
            else{
                res.render(`success`,{msg:`You're now signed up, look forward to hassle free bookings!`,link:`/login`,link_msg:`Sign In`});
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
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        let query = `INSERT INTO drivers(email,username,name,contact,driver_id,pass_hash,license_no) VALUES(?,?,?,?,?,?,?)`;
        let insert = [req.body.email, req.body.username, (req.body.fname + ` ` + req.body.lname), Number(req.body.contact), req.body.driver_id, hash,req.body.license_no];
        query = mysql.format(query, insert);
        conn.query(query, (err, result, fields) => {
            if (err) {
                res.render(`failure`,{error:err,link:`/create_driver`});
            }
            else{
                res.render(`success`,{msg:`You're now in queue to be signed up as our driver.<br />Please wait 3-4 business days for Admin to verify details!`,link:`/about`,link_msg:`Home`});
            }
        });
    });
});

app.post(`/available_buses`,(req,res)=>{
    const conn = mysql.createConnection({
        host: `localhost`,
        user: `root`,
        password: `nayan-2002`,
        database: `bus_ticket_booking_system`
    });
    let query = `SELECT routes.route_no as route_no,src,des,doj,departure_time,bus_no,seats_available from follows,routes where routes.src = ? and routes.des = ? and doj = ? and follows.seats_available>0 and follows.route_no = routes.route_no order by bus_no  asc;`;
    let insert = [req.body.source,req.body.destination,req.body.doj];
    query = conn.format(query,insert);
    conn.query(query, (err, result, fields) => {
        query = result;
        sess=req.session;
        if(sess.userid){
            if(sess.userType){
                if(query.length>0){
                    res.render(`available_buses`,{state:`navbar_logged_admin`,msg:``,userID:sess.userid, data:query,source:req.body.source,destination:req.body.destination});
                    }
                else{
                    res.render(`available_buses`,{state:`navbar_logged_admin`,msg:`No Buses Available`,userID:sess.userid, data:query,source:req.body.source,destination:req.body.destination});
                }
            }
            else{
                if(query.length>0){
                    res.render(`available_buses`,{state:`navbar_logged`,msg:``,userID:sess.userid, data:query,source:req.body.source,destination:req.body.destination});
                    }
                else{
                    res.render(`available_buses`,{state:`navbar_logged`,msg:`No Buses Available`,userID:sess.userid, data:query,source:req.body.source,destination:req.body.destination});
                }
            }}
        else{
            if(query.length>0){
                res.render(`available_buses`,{state:`navbar_unlogged`,msg:``,data:query,source:req.body.source,destination:req.body.destination});
                }
            else{
                res.render(`available_buses`,{state:`navbar_unlogged`,msg:`No Buses Available`,data:query,source:req.body.source,destination:req.body.destination});
            }}
    }); 
});

app.post(`/checkout`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `SELECT email from users where username = ?`;
        let inserts = [sess.userid];
        query = conn.format(query,inserts);
        conn.query(query, (err, result, fields) => {
            if(sess.userType){
                res.render(`checkout`,{state:`navbar_logged_admin`,userID:sess.userid,data:req.body,email:"nayantripathi2002@gmail.com"});
            }
            else{
                res.render(`checkout`,{state:`navbar_logged`,userID:sess.userid,data:req.body,email:result[0].email});
            }
        });
        }
    else{
        datamsg=`Please Login to continue`;
        res.redirect(`/login`);
    }
});

app.post(`/checkout_confirm`,(req,res)=>{
    sess=req.session;
    if(sess.userid){
        const conn = mysql.createConnection({
            host: `localhost`,
            user: `root`,
            password: `nayan-2002`,
            database: `bus_ticket_booking_system`
        });
        let query = `INSERT INTO ticket (route_no, bus_no, name, username, doj, departure_time) VALUES (?, ? , ? , ? , ? , ?)`;
        let inserts = [Number(req.body.route_no),req.body.bus_no,(req.body.firstName+' '+req.body.lastName),req.body.username,new Date(req.body.doj).toLocaleDateString('en-ca'),req.body.departure_time];
        query = conn.format(query,inserts);
        conn.query(query, (err, result, fields) => {
            if (err) {
                res.render(`failure`,{error:`You've already booked the ticket. Please visit dashboard to see booked tickets.`,link:`/booking`});
            }
            else{
                let query = `UPDATE follows set seats_available = seats_available-1 where route_no = ? and bus_no=? and doj=? and departure_time=?`;
                let inserts = [Number(req.body.route_no),req.body.bus_no,new Date(req.body.doj).toLocaleDateString('en-ca'),req.body.departure_time];
                query = conn.format(query,inserts);
                conn.query(query, (err, result, fields) => {
                    res.render(`success`,{msg:`Ticket has been reserved. Please visit Dashboard to view booked tickets.`,link:`/about`,link_msg:`Home`});
                });
            }
        });
        }
    else{
        datamsg=`Please Login to continue`;
        res.redirect(`/login`);
    }
});



app.listen(port, () => {
    console.log(`Server runnning at port ${port}`);
});