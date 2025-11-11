 const mysql = require('mysql2/promise');
    
   // Create a connection pool instead of a single connection
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
       password: process.env.DB_PASSWORD || 'piyush25',
       database: process.env.DB_DATABASE || 'domestic_help_db',
     ssl: {
        rejectUnauthorized: true
    },
     waitForConnections: true,
    connectionLimit: 10, // The maximum number of connections to create at once
     queueLimit: 0
    });
  
  // Export the pool for use in other files
    module.exports = pool;
