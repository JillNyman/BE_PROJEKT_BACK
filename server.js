//Projektets server
Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
//Import av moduler
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); //
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config();
const { authenticateToken } = require('./authMiddleware'); 

//Skapa express-app
const app = express();

//Koppla upp mot databasen
const db = new sqlite3.Database("./db/bakery.db");

// Lägg till denna middleware tidigt i din app-konfiguration
app.use((req, res, next) => {
    console.log(`Request for: ${req.url}`);
    next();
  });
  

//Konfiguration av middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
    req.db = db;
    next();
});

const port = process.env.PORT || 3333;

//Importera routes
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const contactRoutes = require("./routes/customerRoutes");

// Referens till mappen som serversidan ska utgå från
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

//Använda API routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/contact", contactRoutes);

//Skyddade routes
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({message: "Skyddad route!"});
});

//Statiska filer från "dist" katalogen
app.use(express.static(path.join(__dirname, 'dist')));

//Hantera klient- och server-sidor
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

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

