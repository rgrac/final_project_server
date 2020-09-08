const knex = require('knex');
const pws = require('p4ssw0rd');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'zxcv1234',
    database : 'weatherfinal'
  }
});

const createUser = ({ username,email,password }) => {
  return db('users')
    .returning('*')
    .insert({username: username,
             email: email.toLowerCase(),
             password: pws.hash(password,10),
             createdat: new Date()});
}

const findUser = (username) => {
  return db.select('*')
    .from('users')
    .where({username})
}

const addToFavorites = ({ userId,cityKey,cityName,countryName }) => {
  console.log('database ',userId,cityKey,cityName,countryName)
  try {
    return db('favorites')
      .returning('*')
      .insert({user_id: userId,
              city_key: cityKey,
              createdat: new Date(),
              city_name: cityName,
              country_name: countryName
      });
      
    
  } catch (error) {
    console.log('error is ' + error)
  }
}

///Get favorites from DB and send to server
const getFavoriteCities = ({userId}) => {
  console.log('database receives ', userId)
  return db('favorites')
  .select('city_key')
  .where({user_id: userId})
}

const getCityNames = ({userId}) => {
  return db('favorites')
  .select('city_name', 'country_name', 'city_key')
  .where({user_id: userId})
}

module.exports = {
  findUser,
  createUser,
  getFavoriteCities,
  addToFavorites,
  getCityNames
};
