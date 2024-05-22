require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.DATABASE);

const addColumn = `ALTER TABLE menu ADD COLUMN prod_img TEXT;`;

db.run(addColumn,function(err) {
    if(err){
        return console.error(err.message);
    }
    console.log('Kolumn tillagd.');
});

//Skapa tabell: menu
/*db.serialize(() => {
    db.run("DROP TABLE IF EXISTS menu");

    db.run(`CREATE TABLE menu(
        prod_id INTEGER PRIMARY KEY AUTOINCREMENT,
        prod_category VARCHAR(255),
        prod_name VARCHAR(255),
        prod_price VARCHAR(255),
        prod_description VARCHAR(255)    
    )`);
    console.log("Table MENU created");
})

//BOOL 1=true 0=false

//Skapa tabell: inbox
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS inbox");

    db.run(`CREATE TABLE inbox(
        email_id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_name VARCHAR(255),
        sender_email VARCHAR(255),
        sender_number INTEGER,
        sender_message VARCHAR(255),
        email_date DATE,
        callback BOOLEAN   
    )`);
    console.log("Table INBOX created");
})

//Skapa tabell: admin_users
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS admin_users");

    db.run(`CREATE TABLE admin_users(
        admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_name VARCHAR(255),
        admin_password VARCHAR(255),
        admin_created DATETIME DEFAULT CURRENT_TIMESTAMP  
    )`);
    console.log("Table ADMIN_USERS created");
})

//Skapa tabell: customer_users
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS customer_users");

    db.run(`CREATE TABLE customer_users(
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name VARCHAR(255),
        customer_password VARCHAR(255),
        customer_email VARCHAR(255),
        customer_created DATETIME DEFAULT CURRENT_TIMESTAMP  
    )`);
    console.log("Table CUSTOMER_USERS created");
})*/

db.close((err) => {
    if(err) {
        console.error(err.message);
    }

    console.log('Databasen frånkopplad');
});
