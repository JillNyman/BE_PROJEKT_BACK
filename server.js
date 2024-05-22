const express = require('express');
//const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const authCstRoutes = require("./routes/authCstRoutes");
const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config;

const app = express();
app.use(cors());
const port = process.env.PORT || 3333;
app.use(bodyParser.json());
app.use(express.json());

//Koppla upp mot databasen
//const db = new sqlite3.Database("./db/bakery.db");

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/authcst", authCstRoutes);
/*app.get("/bakery", (req, res) => {
    res.json({message: "Welcome tom my API"});
    console.log("Bakery startad");
});*/
app.use("/api/menu", menuRoutes);

//Skyddade routes
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({message: "Skyddad route!"});
});

//Validera token för admin
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

//Starta applikation
app.listen(port, () => {
    console.log(`Servern startad på http://localhost:${port}`);
})

