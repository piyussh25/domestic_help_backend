const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', // Replace with your host name
  user:   process.env.DB_USER || 'root',     // Replace with your database username   // Replace with your database username      // Replace with your database username
  password:  process.env.DB_PASSWORD || 'piyush25',// Replace with your database password
  database:  process.env.DB_DATABASE || 'domestic_help_db' // The database name we created in the .sql file
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;
