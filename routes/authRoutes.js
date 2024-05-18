//Routes för autentisering

const express = require('express');
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
//const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");
//const cors = require('cors');
require("dotenv").config();

//Koppla upp mot databasen
const db = new sqlite3.Database(process.env.DATABASE);

/*router.get('/admin_users', (req, res) => {
    const sql = 'SELECT * FROM admin_users;';
    db.all(sql, (err, rows) => {
        if(err){
            res.status(400).json({ message: "Error creating user"});
            return;
        } else {
            res.json(rows);
            console.table(rows);
        }
    });
})*/

//Skapa ny adminanvändare
router.post("/regadmin", async(req, res) =>{
    console.log("Initierat registrering...");
    try{
        const {admin_name, admin_password} = req.body;
        /*let admin_name = req.body.admin_name;
        let admin_password = req.body.admin_password;*/

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
                res.status(400).json({ message: "Error creating user"});
            } else {
                res.status(201).json({message: "User created"});
            }
        });
        

    } catch (error) {
        res.status(500).json({error: "Server error"});
    }
    
});


//Logga in adminanvändare
router.post("/loginadmin", (req, res) => {
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
            res.status(400).json({message: "Error authenticating..."});
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


//Skapa ny kundanvändare
/*router.post("/admin_user/regcustomer", async(req, res) =>{
    try{
        let customer_name = req.body.customer_name;
        let customer_password = req.body.customer_password;
        let customer_email = req.body.customer_email;

        //validera input
        if(!customer_name || !customer_password || !customer_email) {
            return res.status(400).json({error: "Invalid input, send username and password"});
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
    
});*/

//Logga in kundanvändare
/*router.post("/logincustomer", (req, res) => {
    try{
        let customer_name = req.body.customer_name;
        let customer_password = req.body.customer_password;

        console.log("Tagit emot: " + customer_name + " " + customer_password);

        //validera input
        if(!customer_name || !customer_password) {
            return res.status(400).json({error: "Invalid input, send username and password"});
        }
    
       //Kontrollera om användaren finns
       const sql = `SELECT * FROM customer_users WHERE customer_name=?`;
       db.get(sql, [customer_name], async (err, row) => {
        if(err){
            res.status(400).json({message: "Error authenticating..."});
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
    
});*/

module.exports = router;

//db.close();