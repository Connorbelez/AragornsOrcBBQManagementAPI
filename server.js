/***********************************************************************************************/
//global variables
const restDataBase = []; // a list holding each restraunt object read in from the DB (data base) directory,

const restNames = []; //restNames = a list holding the names of each restraunt in the DB (data base) directory,

const restIds = []; //restNames = a list holding the names of each restraunt in the DB (data base) directory,

/***********************************************************************************************/

const express = require('express');
const fs = require('fs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
let app = express();

let mongo = require('mongodb');


let MongoClient = mongo.MongoClient;
let db;


MongoClient.connect("mongodb+srv://Palentier:SuperSecurePassword@cluster0.ls2xr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", function(err, client) {
  if(err) throw err;	
  db = client.db('a4');
});




let mongoStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
  });

app.use(session({secret:"some secret here",store:mongoStore}));
app.use(express.static("public"));
app.set('view engine','pug')
app.use(express.json());


/***********************************************************************************************/
//Route Handlers
app.get(['/','/home'],(req, res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.render("./pages/home",{home:true,loggedin:req.session.LoggedIn}) //also send true of false if the user is logged in or not
})

app.get(["/orderForm"],(req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
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


//This returns the desired restaurant data to the client.
app.put('/order',(request,response)=>{
    //send info
    response.setHeader("Content-Type","application/JSON");
    let name = request.body
    let currest = restDataBase[name.selection];
    response.write(JSON.stringify(currest));
    response.end();
})

//This responds with a list of restaurants to the client
app.get('/list',(request,response)=>{
    response.setHeader("Content-Type","application/JSON");
    response.write(JSON.stringify(restNames));
    response.end();
})


//route hanldler for login requests, also handles validation.
app.put('/login',(request,response)=>{
    let UserName = request.body.username;
    let pw = request.body.password;
    db.collection("users").findOne({username:UserName},(err,result)=>{
        if(err) throw err;
        if(!result){
            response.status(401);
            response.end();
            return;
        }
        if(pw === result.password){
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

//Route handler for registration requests. Checks if the username exists, if it does
//then throw 401 login error, if not create a new user document and log the user in.
app.put('/register',(req,res)=>{
    let UserName = req.body.username;
    let pw = req.body.password;

    db.collection("users").findOne({username:UserName},(err,result)=>{
        if(err) throw err;

        if(result){
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
                req.session.username = UserName;
                res.status(200);
                res.end();
            })
        }
    });


})

//Render the user search page
app.get('/userRegistry', (req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.render("./pages/userRegistry",{users:true,loggedin:req.session.LoggedIn});
});


app.get('/logout',(req,res)=>{

    req.session.LoggedIn = false;
    req.session.ident = null;
    req.session.username = null;

    res.end();
});

//Handles searches by username


//Route handler for queries to /users converts the id in the url param to a Mongo object id, then finds the user with the mathing id,
//the function checks if the profile is public or private and performs authentication. If the username associated with the session
//matches the profile found then the user can view the profile and make privacy changes. if the profile is private and the usernames do not match then send 403
//if there is no match send 404
app.get('/users/:userid',handleUser);


//Handles searches by username, uses regex to perform a case insensitive search to
//find a user with the
app.get('/users:username?',handleSearch);



function handleSearch(req, res){
    console.log("Got 220");
    let userName = req.query.username;
    let queryList = [];
    queryList.push({privacy:false});
    if(userName){
        queryList.push({username:{'$regex':userName,'$options':'i' } });
    }
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

function handleUser(req, res) {
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
            res.statusCode = 403;
            res.write("No Public Profiles Found with user ID: "+req.params.userid);
            res.end();
            return;
        }

        let orderarray = result.orders;
        if(result.username === req.session.username && req.session.LoggedIn){
            res.status(200).render("./pages/SingleUser",{orderHistory:orderarray,results:result,loggedin:req.session.LoggedIn,sameUser:true,users:true});
        }else{
            res.status(200).render("./pages/SingleUser",{orderHistory:orderarray,results:result,loggedin:req.session.LoggedIn,sameUser:false,users:true});
        }
    })
}


//Route handler for the profile tab in the header, only visible when logged in, gets the user page for the profile the user is currently logged in as
app.get('/user-profile',(req, res)=>{

    db.collection("users").findOne({username:req.session.username},(err,result)=>{
        if(!result){
            res.status(404).send("Unknown ID!!");
            return;
        }
        if(err) throw err;
        if(result.privacy === true && result.username !== req.session.username){
            res.statusCode = 401;
            res.write("Not Authorized");
            response.end();
            return;
        }
        let orderarray = result.orders;
        res.status(200).render("./pages/SingleUser",{profile:true,orderHistory:orderarray,results:result,loggedin:req.session.LoggedIn,sameUser:true});
    });
}) //gets profile user is logged into


//route handler for requests to change privacy settings.
app.put('/privacySettings',(req,res)=>{
    if(req.session.LoggedIn){
        db.collection('users').updateOne(
            {username:req.session.username},
            {$set: {privacy:req.body.private}},
            (err,result)=>{
                if (err) throw err;
            }
        )
    }
    res.end()
})

//handles post requests to orders from the order.js file. The request contains an order object containing relevant information to the users most recent order,
//the handler inserts the order in the collection orders and updates the user collection to include their order.
app.post('/orders',(req,res)=>{

    let orderObj = {order: req.body, username:req.session.username};

    db.collection("orders")
    .insertOne(orderObj,(err,result)=>{
        db.collection('users')
        .updateOne(
            {username:req.session.username},
            {$push:{orders:orderObj}} //Maybe switch this out with orderObj "$ref":"orders","$id":result._id,"$db":"a4"
        );

        console.log("ORDER OBJECT TO BE ADDED: "+JSON.stringify(result));
        console.log("ORDER OBJECT TO BE ADDED ID:: "+result.insertedId);
        console.log("ID OF ORDER OBJ ACTUALLY ADDED:"+orderObj._id);
    });

    res.end()
})


//Route handler for order summary page. Finds an order with a matching object id
//then finds the user who made that order, then peforms authentication to see if the
//current user is authorized to view the summary, if the profile is set to private
//and the attached username does not match the session username, or if there is no session user
//name the server respons with a 403 not authorized message.
app.get('/orders/:orderID',(req, res)=>{ //ToDo Make Order ID page
    let oid;
    let username;
    console.log("REQ FOR ORDER: ID:" + req.params.orderID);
    try{
        oid = new mongo.ObjectID(req.params.orderID);
    }catch{
        res.status(404).send("Unknown ID!!");
        return;
    }
    db.collection("orders")
        .findOne({_id:oid},(err,result)=>{
            if(!result){
                res.status(404).send("Unknown ID!!");
                return;
            }
            if(err) throw err;
            username = result.username;
            db.collection("users").findOne({username:username},(err,result1)=>{
                if(err) throw err;
                if(!result1){
                    res.status(404).send("Cant find user!");
                    return;
                }
                if(result1.privacy && username !== req.session.username){
                    res.status(403).send("Not Authorized");
                    return;
                }

                // let orderarray = result.body;

                console.log("ABOUT TO RENDER WITH: "+result);
                console.log("SESSION INFO: "+req.session.LoggedIn +req.session.username);

                res.status(200).render("./pages/orderSummary",{profile:false,orderSummary:result,results:result,loggedin:req.session.LoggedIn});

            })


    });
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

});
