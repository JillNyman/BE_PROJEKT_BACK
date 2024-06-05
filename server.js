//Projektets server

//Import av moduler
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config;

//Skapa express-app
const app = express();

//Koppla upp mot databasen
const db = new sqlite3.Database("./db/bakery.db");

app.use((req, res, next) => {
    req.db = db;
    next();
});

//Konfiguration av middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('src'));

const port = process.env.PORT || 3333;

//Importera routes
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const contactRoutes = require("./routes/customerRoutes");

//Använda routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/contact", contactRoutes);

//Skyddade routes
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({message: "Skyddad route!"});
});

//Validera token för admin, ge access till skyddade routes
//URL: http://localhost:3333/api/protected 
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //Token

    if(token == null) {
        return res.status(401).json({message: "Not authorized - token missing!"});
        //console.log("Token missing");
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, admin_name) => {
        if(err){ 
            return res.status(403).json({message: "Unvalid JWT"});
           
    };
        console.log("Lyckat!");
        req.admin_name = admin_name;        
        next();
    });
};

//Starta servern
const server = app.listen(port, () => {
    console.log(`Servern startad på http://localhost:${port}`);
})

//Stäng servern
const shutDown = () => {
    console.log("Stänger ner databasen...");
    db.close((err) => {
        if(err) {
            console.error("Fel när databasen skulle stängas");
        } else {
            console.log("Databasen stängdes ned");
        }

        server.close(() => {
            console.log("Servern stängd.");
            process.exit(0);
        });
        
    });
};

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

