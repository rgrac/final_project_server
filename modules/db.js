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

const createUser = ({ username,email, password }) => {
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

///replace for the favorites
const getcities = () => {
  return db.select('*')
  .from('cities')
}


module.exports = {
  findUser,
  createUser,
  getcities
};
