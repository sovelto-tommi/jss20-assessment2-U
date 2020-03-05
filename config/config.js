const env = process.env.NODE_ENV || 'development';

// default
const development = {
 app: {
   port: process.env.PORT || 5000,
   development: true
 },
 db: {
   host: 'localhost',
   port: 5432,
   database: process.env.DATABASENAME,
   user: process.env.PGUSER,
   password: process.env.PGPASSWORD
 }
};

// e.g. running tests with jest sets this automatically
const test = {
  app: {
    port: process.env.PORT || 5000,
    development: true
  },
  db: {
    host: 'localhost',
    port: 5432,
    database: 'a2utest',
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
  }
 };
 
const heroku = {
 app: {
   port: process.env.PORT
 },
 db: {
     connectionString: process.env.DATABASE_URL,
     ssl: true
 }
};

const config = {
 development,
 test,
 heroku
};

module.exports = config[env];