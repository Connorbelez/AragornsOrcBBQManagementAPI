

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

function logout(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(req.readyState=== 4 && this.status === 200){
            alert("Logged out successfully");
            window.location.href = "http://127.0.0.1:3000/"
        }
    }
    req.open("GET",'/logout');
    req.send();
}

function search() {
    // let searchObj = {
    //     username: document.getElementById("userSearch").value
    // }

    // let req = new XMLHttpRequest();
    // req.onreadystatechange = function() {
    //     if(req.readyState=== 4 && this.status === 200){
    //         console.log("Search response recieved");
    //         window.location.href = req.url;
    //     }
    // }
    console.log('http://127.0.0.1:3000/users?username='+document.getElementById("userSearch").value);
    window.location.href = "http://127.0.0.1:3000/users?username="+document.getElementById("userSearch").value;
    // req.open("GET",'http://127.0.0.1:3000/search/?username='+document.getElementById("userSearch").value);
    // req.setRequestHeader('Content-Type','application/JSON');
    // // req.send(JSON.stringify(searchObj));
    // req.send();
}

function SubmitPrivacy(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(req.readyState=== 4 && this.status === 200){
            alert("Updated Privacy Settings");
            // window.location.href = window.location.href;
        }
    }
    let public = document.getElementById('setToPublic').checked;
    let private = document.getElementById('setToPrivate').checked;
    console.log("SELECTED PRIVACY SETTINGS: Public:"+public+" PRIVATE: "+private);
    if(public){
        let privacyInfo = {private:false,public:true};
        req.open("PUT",'/privacySettings');
        console.log("Setting to public!!");
        req.setRequestHeader('Content-Type','application/JSON');
        req.send(JSON.stringify(privacyInfo));

    }
    if(private){
            let privacyInfo = {private:true,public:false};
            req.open("PUT",'/privacySettings');
            console.log("Setting to Private!!");
            req.setRequestHeader('Content-Type','application/JSON');
            req.send(JSON.stringify(privacyInfo));
    }
}
