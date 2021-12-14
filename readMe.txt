To run program:
    1: run npm install to install dependencies
    2: run your Mongo Daemon in the directory with server.js file ie mongod --dbpath=/Users/connorbeleznay/Documents/2406/assignemnts/a4/MongoDB
        I have provided a file folder MongoDB that is meant to hold the mongo database
    3: run: node database-initializer.js
    4: run: node server.js
    5: This program uses 127.0.0.1:3000, please navigate to the correct url: http://127.0.0.1:3000/

Explanation files/directories:
    public: Holds static files/resources for the server and client. include images directory
        -client.js: client side JS file, holds functions used for the header and all html pages except order
        -order.js: contains client side functionality for the order page
        -orderform.html: Order Form and Submission, re-used resource from A2, is included in the orderform.pug file which renders it with a header
        -orderFormStyle.css: css file specifically for orderpage
    views: contains pug template files
        -home.pug: Home page
        -login.pug: login page, is rendered when the user clicks login/register when their session is not logged in
        -orderform.pug: rendered the Order Form and Submission form, really just connects the header to the orderform.html file
        -singleUser.pug: User page for a specific user, reached via clicking one of the users after a username search or by
            a matching user id
        -userRegistry.pug: Linked to by the "Users" tab in the header, this is the user search page.
        -userResult.pug: This is the page that is rendered with the results of the query from the above page.
    partials: Contains the header file






-Connor Beleznay, 101208030