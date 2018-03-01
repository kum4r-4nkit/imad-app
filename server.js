var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');

var config = {
    user : 'kumar805231',
    database : 'kumar805231',
    host : 'db.imad.hasura-app.io',
    port : '5432',
    password : process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

function createTemplate(data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    var htmlTemplate = `
    <html>
        <head>
            <title>
                ${title}
            </title>
            <meta name = "viewport" content = "width = device-width, initial-scale=1"/>
            <link href="/ui/style.css" rel="stylesheet" />
        </head>
        <body>
            <div class= "con">
                <div>
                    <a href="/">home</a>
                </div>
                <h2>${heading}</h2>
                <div>
                    ${date.toDateString()}
                </div>
                <div>
                    ${content}
                </div>
            </div>
        </body>
    </html>
    `;
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input, salt){
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512,'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function(req,res){
    var hashedString = hash(req.params.input, 'this-is-some-random-string');
    res.send(hashedString);
});

app.post('/create-user', function (req, res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    Pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)',[username, dbString], function(errr, result){
        if(errr) {
            res.status(500).send(errr.toString());
        } else {
            res.send('User Successfully Created : ' + username);
        }
    });
});

app.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    
    Pool.query('SELECT * FROM "user" WHERE username = $1', [username], function(errr, result){
        if(errr) {
            res.status(500).send(errr.toString());
        } else {
            if(result.rows.length === 0) {
                res.status(403).send('username/password is invalid');
            } else {
                var dbString = result.rows[0].password;
                var salt = dbString.split('$')[2];
                var hashedPassword = hash(password, salt);
                if(hashedPassword === dbString){
                    res.send('Credentials Correct !');
                } else {
                    res.send(403).send('username|password is invalid');
                }
            }
        }
    });
});

var Pool = new Pool(config);
app.get('/test-db', function (req, res) {
    Pool.query('SELECT * from test', function(errr, result){
        if(errr) {
            res.status(500).send(errr.toString());
        } else {
            res.send(JSON.stringify(result.rows));
        }
    });
});

app.get('/articles/:articleName', function(req, res){
  Pool.query("SELECT * from article WHERE title = $1", [req.params.articleName], function(errr, result){
        if(errr) {
            res.status(500).send(errr.toString());
        } else {
            if(result.rows.length === 0) {
                res.status(404).send('Article not Found !');
            } else {
                var articleData = result.rows[0];
                res.send(createTemplate(articleData));
            }
        }
    });
  
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
