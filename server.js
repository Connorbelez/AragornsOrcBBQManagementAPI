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

app.use(express.static("public"));
app.set('view engine','pug')

//Start adding route handlers here
app.use(express.json());

app.get(['/','/home'],(req, res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    // req.session.LoggedIn = true; // use this line in the login page
    console.log("Logged in: "+ req.session.LoggedIn);
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

        if(pw === result.password){
            console.log("Loggin successful!");
            response.status(200);
            request.session.LoggedIn = true; // use this line in the login page
            request.session.username = UserName;
            request.session.id = result._id;

            console.log("1 document inserted with ID:"+newUser._id);
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
            };
            db.collection("users").insertOne(newUser,(err,result)=>{
                if (err) throw err;
                req.session.LoggedIn = true;
                req.session.id = newUser._id;

                console.log("1 document inserted with ID:"+newUser._id);
                res.status(200);
                res.end();
            })

            
            

        }
    });


})
app.get('/users', (req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    // req.session.LoggedIn = true; // use this line in the login page

    res.render("./pages/users",{users:true,loggedin:req.session.LoggedIn});
});

app.get('/logout',(req,res)=>{

    req.session.LoggedIn = false;
    req.session.id = null;

    console.log("LOGGED OUT");
    res.end();
});


function handleSearch(req, res){
    let userName = req.query.username;
    db.collection("users").find({username:{'$regex':userName,'$options':'i' } }).toArray(function(err,result){
        if(err) throw err;

        console.log("FOUND THE FOLLOWING:"+result[0].username+result[0]._id);
        res.status(200).render("./pages/userResult",{results:result});



    });

}

app.get('/search:username?',handleSearch);

















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
