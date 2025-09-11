// test-db-connection.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'kimjongseo_db',
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('Port:', process.env.DB_PORT || 5432);
    console.log('Database:', process.env.DB_NAME || 'kimjongseo_db');
    console.log('Username:', process.env.DB_USERNAME || 'postgres');

    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);

    client.release();
    pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check if the port 5432 is correct');
      console.log('3. Verify your database credentials');
    } else if (error.code === '28P01') {
      console.log('\n🔧 Authentication failed:');
      console.log('1. Check your username and password');
      console.log('2. Make sure the user has access to the database');
    } else if (error.code === '3D000') {
      console.log('\n🔧 Database does not exist:');
      console.log(
        '1. Create the database using: CREATE DATABASE kimjongseo_db;',
      );
    }
  }
}

testConnection();
