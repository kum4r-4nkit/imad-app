var express = require('express');
var morgan = require('morgan');
var path = require('path');

var Pool = require('pg').Pool;

var config = {
    user : 'kumar805231',
    database : 'kumar805231',
    host : 'db.imad.hasura-app.io',
    port : '5432',
    password : process.env.DB_PASSWORD
}

var app = express();
app.use(morgan('combined'));

var articles = {
    'article-one' : {
    title : 'Article One | Ankit Kumar',
    heading : 'Article One',
    date : 'Feb 21, 2018',
    content : `<p>
                    this is my first page.
                </p>
    `
},
    'article-two' : {
    title : 'Article Two | Ankit Kumar',
    heading : 'Article Two',
    date : 'March 1, 2018',
    content : `<p>
                    this is my Second Page.
                </p>
    `
},
    'article-three' : {
    title : 'Article Third | Ankit Kumar',
    heading : 'Article Third',
    date : 'March 2, 2018',
    content : `<p>
                    this is my Third page.
                </p>
    `
}
};

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
  Pool.query('SELECT * from article WHERE title = "' + req.params.articleName + '"', function(errr, result){
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

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
