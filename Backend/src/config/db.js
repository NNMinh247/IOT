const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_ROOT,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then((connection) => {
        console.log('Kết nối thành công');
        connection.release();
    })
    .catch((err) => {
        console.error(`Lỗi: ${err}`);
    });
    
module.exports = pool;