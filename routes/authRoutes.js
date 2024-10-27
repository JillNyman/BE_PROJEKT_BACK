//Routes för autentisering admin

const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { authenticateToken } = require('../authMiddleware');


//Skapa ny adminanvändare
router.post("/regadmin", authenticateToken, async(req, res) =>{
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


//Logga in adminanvändare URL: http://localhost:3333/api/auth/loginadmin 
router.post("/loginadmin", async(req, res) => {
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
            return res.status(400).json({message: "Error authenticating admin..."});
        } else if(!row) {
            return res.status(401).json({message: "Incorrect username/password!"});
        } else {
            //Användaren finns
            console.log("Användaren finns");
        

        //Kontroll av lösenord
        const passwordMatch = await bcrypt.compare(admin_password, row.admin_password);

            if(!passwordMatch) {
                return res.status(401).json({message: "Incorrect username/password"});
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

 

module.exports = router;

