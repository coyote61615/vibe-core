// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Essa variável o Heroku já define automaticamente
  ssl: {
    rejectUnauthorized: false, // Para conexão segura no Heroku
  },
});

module.exports = pool;
