//Routes för autentisering admin

const express = require('express');
const router = express.Router();
//const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const cors = require('cors');
require("dotenv").config();

//Koppla upp mot databasen
/*let db = new sqlite3.Database(process.env.DATABASE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});*/

//Hämta alla användare
// http://localhost:333X/api/auth/ FUNKAR
router.get('/', (req, res) => {
    const db = req.db;
    const sql = 'SELECT * FROM admin_users;';
    db.all(sql, (err, rows) => {
        if(err){
            res.status(400).json({ message: "Error when retrieving list of admins"});
            return;
        } else {
            res.json(rows);
            console.table(rows);
        }
    });
})

//Skapa ny adminanvändare
router.post("/regadmin", async(req, res) =>{
    const db = req.db;
    console.log("Initierat registrering av ny admin...");
    try{
        const {admin_name, admin_password} = req.body;

        //validera input
        if(!admin_name || !admin_password) {
            return res.status(400).json({error: "Invalid input, send username AND password"});
        }

        //Hasha lösenord 
        const hashedPassword = await bcrypt.hash(req.body.admin_password, 10);
        

        //Om korrekt - spara användare i tabell
        const sql = `INSERT INTO admin_users(admin_name, admin_password) VALUES(?, ?)`;
        db.run(sql, [admin_name, hashedPassword], (err) => {
            if(err){
                res.status(400).json({ message: "Error creating admin"});
            } else {
                res.status(201).json({message: "Admin created"});
            }
        });
        

    } catch (error) {
        res.status(500).json({error: "Server error"});
    }
    
});


//Logga in adminanvändare URL: http://localhost:3333/api/auth/loginadmin svar 20 maj kväll:  "message": "Error authenticating admin..." 2 min senare, efter omstart av fönstret: FUNKAR
router.post("/loginadmin", (req, res) => {
    const db = req.db;
    try{
        let admin_name = req.body.admin_name;
        let admin_password = req.body.admin_password;

        console.log("Tagit emot: " + admin_name + " " + admin_password);

        //validera input
        if(!admin_name || !admin_password) {
            return res.status(400).json({error: "Invalid input, send username AND password"});
        }
    
       //Kontrollera om användaren finns
       const sql = `SELECT * FROM admin_users WHERE admin_name=?`;
       db.get(sql, [admin_name], async (err, row) => {
        if(err){
            res.status(400).json({message: "Error authenticating admin..."});
        } else if(!row) {
            res.status(401).json({message: "Incorrect username/password!"});
        } else {
            //Användaren finns
            console.log("Användaren finns");
            const passwordMatch = await bcrypt.compare(admin_password, row.admin_password);

            if(!passwordMatch) {
                res.status(401).json({message: "Incorrect username/password"});
            } else {
                //Skapa JWT
                const payload = {admin_name: row.admin_name}; // <----
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
                const response = {
                    message: "Admin logged in!",
                    token: token
                }
                console.log("Skickat token: " + token);
                return res.status(200).json({response});
                
            }
        }
       });

    } catch (error) {
        res.status(500).json({error: "Server error"});
    }       
    
});

//Uppdatera admin

//Radera admin

// Stäng databasen
/*process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } 
            console.log('Closed the database connection.');
            process.exit(0);
    
    });
});*/

module.exports = router;

