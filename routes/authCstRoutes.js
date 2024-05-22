//Routes för autentisering admin

const express = require('express');
const cstRouter = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require('cors');
require("dotenv").config();

//Koppla upp mot databasen
let db = new sqlite3.Database(process.env.DATABASE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


//URL: http://localhost:3333/api/authcst FUNKAR
cstRouter.get('/', (req, res) => {
    const sql = 'SELECT * FROM customer_users;';
    db.all(sql, (err, rows) => {
        if(err){
            res.status(400).json({ message: "Error when retrieving list of users"});
            return;
        } else {
            res.json(rows);
            console.table(rows);
        }
    });
})

//Skapa ny kundanvändare URL: http://localhost:3334/api/authcst/regcustomer FUNKAR
cstRouter.post("/regcustomer", async(req, res) =>{
    console.log("Initierat registrering av ny kund...");
    try{
        const {customer_name, customer_password, customer_email} = req.body;

        //validera input
        if(!customer_name || !customer_password || !customer_email) {
            return res.status(400).json({error: "Invalid input, send username, password and email"});
        }

        //Hasha lösenord 
        const hashedPassword = await bcrypt.hash(req.body.customer_password, 10);
        

        //Om korrekt - spara användare i tabell
        const sql = `INSERT INTO customer_users(customer_name, customer_password, customer_email) VALUES(?, ?, ?)`;
        db.run(sql, [customer_name, hashedPassword, customer_email], (err) => {
            if(err){
                res.status(400).json({ message: "Error creating user"});
            } else {
                res.status(201).json({message: "User created"});
            }
        });
        

    } catch (error) {
        res.status(500).json({error: "Server error"});
    }
    
});

//Logga in kundanvändare URL: http://localhost:3333/api/authcst/logincustomer FUNKAR
cstRouter.post("/logincustomer", (req, res) => {
    try{
        let customer_name = req.body.customer_name;
        let customer_password = req.body.customer_password;

        console.log("Tagit emot: " + customer_name + " " + customer_password);

        //validera input
        if(!customer_name || !customer_password) {
            return res.status(400).json({error: "Invalid input, send username AND password"});
        }
    
       //Kontrollera om användaren finns
       const sql = `SELECT * FROM customer_users WHERE customer_name=?`;
       db.get(sql, [customer_name], async (err, row) => {
        if(err){
            res.status(400).json({message: "Error authenticating user..."});
        } else if(!row) {
            res.status(401).json({message: "Incorrect username/password!"});
        } else {
            //Användaren finns
            console.log("Användaren finns");
            const passwordMatch = await bcrypt.compare(customer_password, row.customer_password);

            if(!passwordMatch) {
                res.status(401).json({message: "Incorrect username/password"});
            } else {
                //Skapa JWT
                const payload = {customer_name: row.customer_name}; // <----
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
                const response = {
                    message: "User logged in!",
                    token: token
                }
                res.status(200).json({response});
                console.log("Skickat token: " + token);
            }
        }
       });

    } catch (error) {
        res.status(500).json({error: "Server error"});
    }       
    
});

//Radera kund

//Uppdatera kund

// Stäng databasen
process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } 
            console.log('Closed the database connection.');
            process.exit(0);
    
    });
});

module.exports = cstRouter;

