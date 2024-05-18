const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require("./routes/authRoutes");
//const menuRoutes = require("./routes/menuRoutes");
const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config;

const app = express();
app.use(cors());
const port = process.env.PORT || 3335;
app.use(bodyParser.json());

//Routes
app.use("/api", authRoutes);
/*app.get("/bakery", (req, res) => {
    res.json({message: "Welcome tom my API"});
    console.log("Bakery startad");
});*/
//app.use("api/menu", menuRoutes);

//Skyddade routes
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({message: "Skyddad route!"});
});

//Visa alla produkter i menyn (göra lista i adminvyn, med möjlighet att välja produkt att ändra?)
/*app.get('/menu', (req, res) => {
    db.all('SELECT * FROM menu;', (err, rows) => {
        if(err){
            res.status(500).json({error: "Något gick fel: " +err});
            return;
        }
        //Kontrollera resultatet
        if(rows.length === 0){
            res.status(404).json({message: "Inga poster funna!"});
        }else {
            res.json(rows);
            console.table(rows);
        };
    });
});*/

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

