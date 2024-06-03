//Routes för kundsidan; kontaktformulär

const express = require('express');
const customerRouter = express.Router();

//Visa alla meddelanden för admin från kunder:  http://localhost:3333/api/contact 
customerRouter.get('/', (req, res) => {
    const db = req.db;
    db.all('SELECT * FROM inbox;', (err, rows) => {
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
});

//Skicka meddelande  URL: http://localhost:3333/api/contact 
customerRouter.post('/', (req, res) => {
    const db = req.db;
    const {sender_name, sender_email, sender_number, sender_message} = req.body;

    let stmt = db.prepare(`INSERT INTO inbox(sender_name, sender_email, sender_number, sender_message)VALUES(?, ?, ?, ?);`);
    stmt.run(sender_name, sender_email, sender_number, sender_message);
    stmt.finalize();
   
     let inboxMessage = {
        sender_name: sender_name, 
        sender_email: sender_email, 
        sender_number: sender_number, 
        sender_message: sender_message
    };
        res.json({message: "Message added", inboxMessage});
    
});

module.exports = customerRouter;