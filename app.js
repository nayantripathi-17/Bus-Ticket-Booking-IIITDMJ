const express = require(`express`);
const app = express();
const path = require(`path`);
const https = require(`https`);
const port = process.env.PORT || 3000;



app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,`public`)));

app.get(`/login`,(req,res)=>{
    res.sendFile(path.join(__dirname,`login.html`));
});

app.listen(port,()=>{
    console.log(`Server runnning at port ${port}`);
});