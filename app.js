const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// MethodOverride
app.use(methodOverride('_method'));

app.listen(port, function(){
    console.log('Server started on port '+port);
});

// Searching processing
app.get('/', function(req, res, next){
 res.render('searchusers');
});

app.post('/user/search', function (req, res, next) {
    let id = req.body.id;

    client.hgetall(id, function (err, obj) {
        if(!obj)
        {
          res.render('searchusers', {
            error: 'User does not exist.'
          });
        }else{
          obj.id = id;
          res.render('details', {
            user: obj
          });
        }
    });
});

// Adding user
app.get('/user/add', function(req, res, next){
    res.render('adduser');
});

app.post('/user/add', function (req, res, next) {
    let id = req.body.id;
    let firs_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, {
        'first_name' : firs_name,
        'last_name' : last_name,
        'email' : email,
        'phone' : phone,
    }, function (err, reply) {
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// Deleting user
app.delete('/user/delete/:id', function (req, res, next) {
    client.del(req.params.id);
    res.redirect('/');
});