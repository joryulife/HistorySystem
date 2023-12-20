import mysql from 'mysql2';

import { dbConfig } from './dbconfig';

// データベース接続の作成
const connection = mysql.createPool(dbConfig).promise();

const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const createHistoryTable = `
    CREATE TABLE IF NOT EXISTS history (
        id INT AUTO_INCREMENT,
        userId INT,
        nodeid VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        height INT,
        img VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        imgcreate BOOLEAN DEFAULT false,
        parent VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        url VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        width INT,
        created_at BIGINT,
        firstVisit DATETIME,
        lastVisit DATETIME,
        x INT,
        y INT,
        PRIMARY KEY(id),
        UNIQUE(userId, nodeid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

connection.query(createUserTable).then(() => {
    //console.log('Available Tables:', rows);
}).catch(err => {
    console.error('Database connection error:', err);
});

connection.query(createHistoryTable).then(() => {
    //console.log('Available Tables:', rows);
}).catch(err => {
    console.error('Database connection error:', err);
});

connection.query('SHOW TABLES').then(() => {
    //([rows])=>
    //console.log('Available Tables:', rows);
}).catch(err => {
    console.error('Database connection error:', err);
});

export default connection;