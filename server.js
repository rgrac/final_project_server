const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pws = require('p4ssw0rd');
const cors = require('cors');
const DB = require('./modules/db');
const axios = require('axios')

const app = express();

app.use(cors());

app.set('port', 5000);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


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
                res.send({user});
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

app.route('/favorites')
    .post((req,res) => {
    // console.log(req.body)
        DB.addToFavorites(req.body)
        .then( favorite => {
            res.send(
                {response: 'city added to your favorite section'}
                )
        })
        .catch(err => {
            
            console.log(err)
        })
    })
    
const fetchWeatherByKeys = (favList) => {
    return Promise.all(favList.map(item => {
        return axios(`http://dataservice.accuweather.com/currentconditions/v1/${item.city_key}?apikey=utoFZGZYIOvMSbYro0m1L0zHojNT4pk3`)
        .then(res => res)
    }))
}

const filterRelevantData = (wholeData) => {
    let filteredWeather = wholeData.map(item => {
        let extractData = {}
        extractData = item.data
        return extractData
    })
    console.log(filteredWeather)
    return filteredWeather
}

app.route('/favoritelist')
.post((req,res) => {
    console.log(req.body)
    DB.getFavoriteCities(req.body)
        .then(favList => {
            console.log('from server ', favList)
            return fetchWeatherByKeys(favList)
        }).then( wholeData => {
            console.log('after function in server (data) ', wholeData[0].data[0])
            return (filterRelevantData(wholeData))
        })
        .then(
            filteredWeather => {
                console.log('console log of test ', filteredWeather)
                res.send(filteredWeather)
            }
        )
        // .then(  
        //     res.send(test)
        // )
        .catch(
            err => {
            console.log(err)
            })
})

app.route('/favoritecitylist')
    .post((req,res) => {
        DB.getCityNames(req.body)
        .then(data => {
            res.send(data)
        })
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


favList = [];