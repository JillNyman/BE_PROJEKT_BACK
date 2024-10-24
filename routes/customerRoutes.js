//Routes för kundsidan; kontaktformulär

const express = require('express');
const customerRouter = express.Router();
const { authenticateToken } = require('../authMiddleware');



//Validera data från frontend
function validateInput(message) {
    const { sender_name, sender_email, sender_number, sender_message} = message;

    if(typeof sender_name !== 'string' || sender_name.trim() === ''){
        return { isValid: false, message: 'Avsändarens namn saknas'};
    }

    if (typeof sender_email !== 'string' || sender_email.trim() === '') {
        return { isValid: false, message: 'Avsändarens e-post saknas' };
    }

    if (sender_number !== undefined && (typeof sender_number !== 'number' || sender_number <= 0)) {
        return { isValid: false, message: 'Ogiltigt telefonnummer' };
    }

    if (typeof sender_message !== 'string' || sender_message.trim() === '') {
        return { isValid: false, message: 'Meddelande saknas' };
    }

    return { isValid: true };
}

//Visa alla meddelanden för admin från kunder:  http://localhost:3333/api/contact 
customerRouter.get('/', authenticateToken, (req, res) => {
    const db = req.db;
    db.all('SELECT * FROM inbox;', (err, rows) => {
        if(err){
            res.status(500).json({error: "Något gick fel: " + err.message});
            return;
        }
        //Kontrollera resultatet
        if(rows.length === 0){
            res.status(404).json({message: "Inga poster funna!"});
        }else {
            res.status(200).json(rows);
            //res.json(rows);
            console.table(rows);
        };
    });
});

customerRouter.delete('/:id', authenticateToken, (req, res) => {
    const db = req.db;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({message: "Ogiltigt ID-format"});
    }

    db.run(`DELETE FROM inbox WHERE email_id = ?`, id, function(err) {
        if (err) {
            console.error("Error occurred:", err.message);
            return res.status(500).json({"error": err.message});
        }
        
        if (this.changes === 0) {
            return res.status(404).json({message: "Inget meddelande hittades med det angivna ID:t"});
        }
        
        res.status(200).json({message: "Meddelande raderat"});
    });
});

//Skicka meddelande  URL: http://localhost:3333/api/contact 
customerRouter.post('/', (req, res) => {
    const db = req.db;
    const message = req.body;

    const validate = validateInput(message);

    if(!validate.isValid) {
        return res.status(400).json({ message: validate.message});
    }

    const { sender_name, sender_email, sender_number, sender_message} = message;

    try{
    let stmt = db.prepare(`INSERT INTO inbox(sender_name, sender_email, sender_number, sender_message)VALUES(?, ?, ?, ?);`);
    stmt.run(sender_name, sender_email, sender_number, sender_message);
    stmt.finalize();
   
     
        res.json({message: "Message added", message});
    } catch(error){
        console.error("Error occurred:", error);
            res.status(500).json({message: "Fel när meddelande skulle skickas"});
    }
    
});

module.exports = customerRouter;
