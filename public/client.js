

function login(){
    console.log("Logging in");
    let username = document.getElementById("userName").value;
    let pw = document.getElementById("PW").value;

    if(username!=''&&pw!=''){
        console.log("USERNAME"+username);
        console.log("PW"+pw);

        let loginInfo = {
            username: username, 
            password: pw
        }
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if(req.readyState=== 4 && this.status === 200){
                alert("Logged in successfully");
                window.location.href = "http://127.0.0.1:3000/"

                //Check if login successful, if it is then redirect to home page
                //if not then show alert it wasnt successful
            }else if(this.status === 401){
                alert("Login unsuccessful");
                window.location.href = "http://127.0.0.1:3000/login"
            }
        }
        req.open('PUT','/login');
        req.setRequestHeader('Content-Type','application/JSON');
        req.send(JSON.stringify(loginInfo));
    }else{
        alert("Please enter your username and password");
    }
}


function register(){
    console.log("Registering");
    let username = document.getElementById("userNameRegister").value;
    let pw = document.getElementById("PWRegister").value;

    if(username!=''&&pw!=''){
        console.log("USERNAME"+username);
        console.log("PW"+pw);

        let loginInfo = {
            username: username, 
            password: pw
        }
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if(req.readyState=== 4 && this.status === 200){
                alert("Registered successfully");
                window.location.href = "http://127.0.0.1:3000/"

                //Check if login successful, if it is then redirect to home page
                //if not then show alert it wasnt successful
            }else if(this.status === 401){
                alert("Registration unsuccessful");
                window.location.href = "http://127.0.0.1:3000/login"
            }
        }
        req.open('PUT','/register');
        req.setRequestHeader('Content-Type','application/JSON');
        req.send(JSON.stringify(loginInfo));
    }else{
        alert("Please enter your username and password");
    }
}