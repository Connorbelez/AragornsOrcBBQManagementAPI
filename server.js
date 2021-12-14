/***********************************************************************************************/
//global variables
const restDataBase = []; // a list holding each restraunt object read in from the DB (data base) directory,

const restNames = []; //restNames = a list holding the names of each restraunt in the DB (data base) directory,

const restIds = []; //restNames = a list holding the names of each restraunt in the DB (data base) directory,

/***********************************************************************************************/
//global variables

let numOrder = 0; //Number of orders submitted, incrememnted each time server recieves a request to /checkout
let total = 0; //Running total of all orders
let orders = new Map(); //Holds each item ordered, and the number of said item ordered
let mostPopularItem = ""; //item ordered the most times
let average = 0; //Average order cost.
/***********************************************************************************************/



const express = require('express');
const pug = require('pug');
const fs = require('fs');
const { send } = require('process');
const session = require('express-session');
const mongoose = require('mongoose');
const res = require('express/lib/response');
const MongoDBStore = require('connect-mongodb-session')(session);
const dbfile = require("./database-initializer.js");
let app = express();

let mongo = require('mongodb');
const e = require('express');
const { syncBuiltinESMExports } = require('module');
let MongoClient = mongo.MongoClient;
let db;


MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;	
  db = client.db('a4');
});




let mongoStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
  });

app.use(session({secret:"some secret here",store:mongoStore}));

// app.use(session({secret:"some secret here"}))


// const userSchema = new mongoose.Schema({
//     userName: String,
//     password: String, 
//     orders: Map,
//     private: Boolean
// });

// const Users = mongoose.model('Users',userSchema)

// let map1 = new Map();
// const admin = new Users({userName:"Connor",password:"123",orders:map1,private:false});

// admin.save();
// app.get('/search/images/maxresdefault.jpg',(req, res, next) => {
//     req.url = '/images/maxresdefault.jpg';
//     console.log('revised URL!!!');
//     next();
// })

// app.get('/search/client.js',(req, res, next) => {
//     req.url = 'client.js';
//     console.log('revised JS URL!!!');
//     next();
// })

// app.get('/search/images/maxresdefault.jpg',(req, res, next) => {
//     req.url = '/images/maxresdefault.jpg';
//     console.log('revised URL!!!');
//     next();
// })

app.use(express.static("public"));
app.set('view engine','pug')

//Start adding route handlers here
app.use(express.json());


app.get(['/','/home'],(req, res,next)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    // req.session.LoggedIn = true; // use this line in the login page
    console.log("Logged in: "+ req.session.LoggedIn);
    console.log("session id at login:"+req.session.ident);
    res.render("./pages/home",{home:true,loggedin:req.session.LoggedIn}) //also send true of false if the user is logged in or not
})

app.get(["/orderForm"],(req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    // req.session.LoggedIn = true; // Use this line in the login page
    console.log("Logged in: "+ req.session.LoggedIn);
    res.render("./pages/orderform",{order:true,loggedin:req.session.LoggedIn})
})

app.get('/login',(req,res)=>{

    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.render("./pages/login",{login:true})
})

app.get('/users/admin',(req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.render("./pages/home",{home:true})
})



app.put('/order',(request,response)=>{
    //send info
    response.setHeader("Content-Type","application/JSON");

    let name = request.body
    console.log("recieved::::",name);
    let currest = restDataBase[name.selection];
    response.write(JSON.stringify(currest));
    response.end();


})

app.get('/list',(request,response)=>{
    response.setHeader("Content-Type","application/JSON");

    console.log("About to send:",restNames);
    response.write(JSON.stringify(restNames));
    response.end();
})

app.put('/login',(request,response)=>{
    let UserName = request.body.username;
    let pw = request.body.password;


    db.collection("users").findOne({username:UserName},(err,result)=>{
        if(err) throw err;

        if(!result){
            console.log("No users mathing:"+ UserName + pw);
            //Send login unsucessful message back to client
            response.status(401);
            response.end();
            return;
        }

        console.log("User found: " + result.username);
        console.log("With ID: " + result._id);

        if(pw === result.password){
            console.log("Loggin successful!");
            response.status(200);
            request.session.LoggedIn = true; // use this line in the login page
            request.session.username = result.username;
            response.end()
        }else{
            //Send login unsucessful message back to client
            response.status(401);
            response.end()
        }
    })

})

app.put('/register',(req,res)=>{
    let UserName = req.body.username;
    let pw = req.body.password;

    db.collection("users").findOne({username:UserName},(err,result)=>{
        if(err) throw err;

        if(result){
            console.log("USER ALREADY EXISTS");
            res.status(401);
            res.end;
        }else{
            let newUser = {
                username:UserName,
                password:pw,
                privacy:false,
                orders:[]
            };
            db.collection("users").insertOne(newUser,(err,result)=>{
                if (err) throw err;
                req.session.LoggedIn = true;
                req.session.id = newUser._id;
                req.session.username = UserName;

                res.status(200);
                res.end();
            })

            
            

        }
    });


})
app.get('/userRegistry', (req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    console.log("LOGGED IN?"+req.session.LoggedIn);
    res.render("./pages/userRegistry",{users:true,loggedin:req.session.LoggedIn});
});

app.get('/logout',(req,res)=>{

    req.session.LoggedIn = false;
    req.session.ident = null;
    req.session.userName = null;

    console.log("LOGGED OUT");
    res.end();
});


function handleSearch(req, res,next){
    console.log("Got 220");
    let userName = req.query.username;
    let queryList = [];
    queryList.push({privacy:false});
    if(userName){ 
        queryList.push({username:{'$regex':userName,'$options':'i' } }) 
    };
    let searchObj = {$and:queryList };
    db.collection("users").find(searchObj)
    .toArray(function(err,result){
        if(err) throw err;
        console.log("Executing multi-userSearch");
        if(!result){
            res.status(404).send("Unknown ID!!");
            return;
        }

        res.status(200).render("./pages/userResult",{users:true,results:result,loggedin:req.session.LoggedIn});



    });

}


app.get('/users/:userid',handleUser);

app.get('/users:username?',handleSearch);

function handleUser(req, res,next) { //ToDO Chnage this back to userID
    let oid;
    try{
        oid = new mongo.ObjectID(req.params.userid);
    }catch{
        res.status(404).send("Unknown ID!!");
        return;
    }

    db.collection("users").findOne({_id:oid},(err,result)=>{

        if(err) throw err;
        if(!result){
            res.status(404).send("Unknown ID!!");
            return;
        }
        if(result.privacy === true && result.username !== req.session.username){
            res.statusCode = 401;
            res.write("Not Authorized");
            response.end();
            return;
        }
        console.log("RESULT: "+result);
        let orderarray = result.orders;
        console.log("SESSION USERNAME AT FIND USER: "+req.session.username);
        console.log("SESSION LOGIN STATUS AT FIND USER: "+req.session.LoggedIn);
        if(result.username === req.session.username && req.session.LoggedIn){
            res.status(200).render("./pages/SingleUser",{orderHistory:orderarray,results:result,loggedin:req.session.LoggedIn,sameUser:true,users:true});
        }else{
            res.status(200).render("./pages/SingleUser",{orderHistory:orderarray,results:result,loggedin:req.session.LoggedIn,sameUser:false,users:true});
        }
    })
}

app.get('/user-profile',(req, res)=>{
    // let oid =req.session.ident;
    // let oid;
	// try{
	// 	oid = new mongo.ObjectID(req.session.ident);
	// }catch{
	// 	res.status(404).send("Unknown ID!!");
	// 	return;
	// }
    // console.log("session ident going into user-profile: "+req.session.ident);

    db.collection("users").findOne({username:req.session.username},(err,result)=>{
        console.log("RESULT: "+ result);
        if(!result){
            res.status(404).send("Unknown ID!!");
            return;
        }
        if(err) throw err;
        if(result.privacy === true && result.username != req.session.username){
            res.statusCode = 401;
            res.write("Not Authorized");
            response.end();
            return;
        }
        let orderarray = result.orders;
        console.log(orderarray);
        if(orderarray.length>0){
            console.log("Order Array"+orderarray[0]);
            console.log("Order Array at 0:"+JSON.stringify(orderarray[0]));
            console.log("Order Array at 0:"+JSON.stringify(orderarray[0].username));
        }
        res.status(200).render("./pages/SingleUser",{profile:true,orderHistory:orderarray,results:result,loggedin:req.session.LoggedIn,sameUser:true});
    });
}) //gets profile user is logged into



app.put('/privacySettings',(req,res)=>{
    if(req.session.LoggedIn){
        db.collection('users').updateOne(
            {username:req.session.username},
            {$set: {privacy:req.body.private}},
            (err,result)=>{
                if (err) throw err;
                console.log("1 document updated");
            }
        )
    }
    res.end()
})

app.post('/orders',(req,res)=>{
    console.log(JSON.stringify(req.body));

    let orderObj = {order: req.body, username:req.session.username};

    db.collection("orders")
    .insertOne(orderObj,(err,result)=>{
        db.collection('users')
        .updateOne(
            {username:req.session.username},
            {$push:{orders:orderObj}} //Maybe switch this out with orderObj "$ref":"orders","$id":result._id,"$db":"a4"
        );
    
    })
    

    res.end()
})
















/*********************************************************************
Function: readdir(directory,function)
Description: Helper function Used to iterate through each file in the provided directory, checks if its
a JSON file then pushes the object to an array holding each restraunt object, and 
pushes the name of the restraunt to an array holding their names.  
Global Variables: 
	restNames = a list holding the names of each restraunt in the DB (data base) directory,
    used to send to the client for the dropdown menu. 
    restDataBase = an array holding each restraunt object read in by the function. 

*/
fs.readdir("./DB",(err,files) => {
    if(err) return console.error(err);

    for(let i = 0; i< files.length; i++){
        // if (files[i].type)
        if (files[i].includes(".json")){
            let rest = require("./DB/"+files[i]);
            // console.log(rest);
            restNames.push(rest.name);
            restDataBase.push(rest);
            restIds.push(rest.id);
        }

    }

    app.listen(3000);
    console.log("Server listening at http://127.0.0.1:3000");

    console.log(restNames);
});
