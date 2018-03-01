var submit = document.getElementById('submitBtn');
submit.onclick = function () {
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function () {
        
        if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200){
                alert('Logged in Successfully');
            } else if ((request.status === 403)){
                alert('username#password is invalid');
            } else if ((request.status === 500)){
                alert('Something went worng');
            }
        }
    };
    
    var username = document.getElementById('username');
    var password = document.getElementById('password');
    console.log('username');
    console.log('password');
    request.open('POST','http://kumar805231.imad.hasura-app.io/login',true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username: username, password: password}));
};