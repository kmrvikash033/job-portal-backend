const express = require('express');
const app = express();
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');
const authRoute = require('./routes/auth');
const user = require('./routes/user');
const jobRoute  = require('./routes/job');
const mongoose = require('mongoose');
const fs = require('fs');
const bodyParser = require('body-parser');
dotenv.config();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: false}));
app.get('/',(req,res)=>{
    res.send("Hello World");
});
//MiddleWare things
// app.use((req,res,next)=>{
//     const reqString = `${req.method} ${req.url} ${Date.now()}\n`
//     fs.writeFile('log.txt',reqString, {flag:'a'},(err)=>{
//         if(err){
//             console.log(err);
//         }
//     });
//     res.status(500).send('Internal Server Error');
//     next();
// });
//Error Handler and stroging in file
app.use((err,req,res,next)=>{
    const reqString = `${req.method} ${req.url} ${Date.now()} ${err.message}`;
    fs.writeFile('error.txt',reqString,{flag: 'a'},(err)=>{
        if(err){
            console.log(err);
        }
    })
})
 
app.use('/v1/user',user);
app.use('/v1/auth',authRoute);
app.use('/v1/job',authMiddleware,jobRoute);

app.listen(port,()=>{
    console.log(`Exaple app listening on port ${port}`);
    mongoose.connect(process.env.DATABASEURL);
});
