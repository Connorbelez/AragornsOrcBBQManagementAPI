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
let app = express();



app.use(express.static("public"));
app.set('view engine','pug')

//Start adding route handlers here
app.use(express.json());

app.get(['/','/home'],(req, res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.render("./pages/home",{home:true}) //also send true of false if the user is logged in or not
})

app.get(["/orderForm"],(req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.render("./pages/orderform",{order:true})
})

app.put('/order',(request,response)=>{
    //send info
    response.setHeader("Content-Type","application/JSON");
    // console.log("GER GERSFGDSDFGSFDGS");
    // console.log(JSON.stringify(restDataBase));
    // restDataBase.forEach(rest => {
    //     restNames.push(rest.name);
    // });
    let name = request.body
    console.log("recieved::::",name);
    let currest = restDataBase[name.selection];
    response.write(JSON.stringify(currest));
    response.end();


    // request.on('data',chunk=>{
    //     data += chunk;
    // });

    // request.on("end",()=>{
    //     let name = JSON.parse(data);
    //     console.log("recieved::::",name);
    //     let currest = restDataBase[name.selection];
    //     response.write(JSON.stringify(currest));
    //     response.end();

    // });

    // response.write(JSON.stringify(data));
    // response.end();
})

app.get('/list',(request,response)=>{
    response.setHeader("Content-Type","application/JSON");

    console.log("About to send:",restNames);
    response.write(JSON.stringify(restNames));
    response.end();
})

// app.put()











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
    console.log("Server listening at http://localhost:3000");

    console.log(restNames);
});
