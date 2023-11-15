import mysql from 'mysql2';

import { dbConfig } from './dbconfig';

// データベース接続の作成
const connection = mysql.createPool(dbConfig).promise();

const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )`;

    const createHistoryTable = `
    CREATE TABLE IF NOT EXISTS history (
        id INT AUTO_INCREMENT,
        userId INT,
        nodeid VARCHAR(255),
        height INT,
        img VARCHAR(255),
        imgcreate BOOLEAN DEFAULT false,
        parent VARCHAR(255),
        title VARCHAR(255),
        url VARCHAR(255),
        width INT,
        created_at BIGINT,
        firstVisit DATETIME,
        lastVisit DATETIME,
        x INT,
        y INT,
        PRIMARY KEY(id),
        UNIQUE(userId, nodeId)
    )`;
connection.query(createUserTable).then(([rows]) => {
    console.log('Available Tables:', rows);
}).catch(err => {
    console.error('Database connection error:', err);
});

connection.query(createHistoryTable).then(([rows]) => {
    console.log('Available Tables:', rows);
}).catch(err => {
    console.error('Database connection error:', err);
});

connection.query('SHOW TABLES').then(([rows]) => {
    console.log('Available Tables:', rows);
}).catch(err => {
    console.error('Database connection error:', err);
});

export default connection;