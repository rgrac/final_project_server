const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pws = require('p4ssw0rd');
const cors = require('cors');
const DB = require('./modules/db');

const app = express();

app.set('port', 5000);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use(cookieParser());

app.use(
  session({
    key: 'user_sid',
    secret: 'some_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 500000
    }
  })
);

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});


// *****TRY TO MAKE THIS FOR THE FAVORITES******
// app.get('/getcities', (req,res) =>{
//     DB.getcities()
//     .then(data => {
//         res.send(data)
//     })
//     .catch (err => {
//         console.log('PAY ATTENTION TO GET CITIES => ',err)
//     })
// })

const sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.send({redirect: '/'});
  } else {
      next();
  }
};

app.get('/', sessionChecker, (req, res) => {
    res.send({redirect: '/signup'});
});

app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.send({redirect: '/signup'});
    })
    .post((req, res) => {
        DB.createUser(req.body)
        .then(user => {
            req.session.user = user[0];
            res.send({redirect: '/', user});
        })
        .catch(error => {
            res.send({redirect: '/signup'});
        });
    });


app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.send({redirect: '/login'});
    })
    .post((req, res) => {
        const {username, password} = req.body;
        DB.findUser(username)
        .then( user => {
            if (!user) {
                console.log('not user');
                res.send({message: 'Wrong username, please check and try again'});
            } else if (!pws.check(password,user[0].password, 10)) {
                console.log('wrong user/pass')
                res.send({message: 'Wrong password, please check and try again'});
            } else {
                console.log('success ' )
                req.session.user = user[0];
                res.send({redirect: '/', user});
            }
        })
        .catch(error => {
            console.log(error)
          res.send({message: 'Wrong username, please check and try again'});
        });
    });


app.route('/')
  .get( (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.send({redirect: '/'});
    } else {
        res.send({redirect: '/login'});
    }
  })


app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.send({redirect: '/'});
    } else {
        res.send({redirect: '/login'});
    }
});

app.get('/getUserList', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      console.log(req.session.user.id);
      console.log(req.cookies);
      res.send({user:req.session.user})
      //res.redirect('/');
  } else {
      res.send({redirect: '/login'});
  }
});


app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


app.listen(app.get('port'), () => {
  console.log(`App started on port ${app.get('port')}`)
});
