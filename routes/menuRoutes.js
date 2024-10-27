//Routes för menyn

const express = require('express');
const menuRouter = express.Router();
const { authenticateToken } = require('../authMiddleware');


//Validera data från frontend
function validateInput(product) {
    const { prod_category, prod_name, prod_price, prod_description } = product;

    if (typeof prod_category !== 'string' || prod_category.trim() === '') {
        return { isValid: false, message: 'Kategorin finns inte' };
    }

    if (typeof prod_name !== 'string' || prod_name.trim() === '') {
        return { isValid: false, message: 'Produktnamn saknas' };
    }

    if (typeof prod_price !== 'string' || prod_price.trim() === '') {
        return { isValid: false, message: 'Priset saknas' };
    }

    if (typeof prod_description !== 'string' || prod_description.trim() === '') {
        return { isValid: false, message: 'Produktbeskrivningen saknas' };
    }

    return { isValid: true };
}


//Visa alla produkter i menyn URL:  http://localhost:3333/api/menu 
menuRouter.get('/', async(req, res) => {
    const db = req.db;
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
});


//Lägg till produkt i menyn URL: http://localhost:3333/api/menu/menu 
menuRouter.post("/menu", authenticateToken, (req, res) => {
    const db = req.db;
        const product = req.body;

        const validate = validateInput(product);
        if(!validate.isValid) {
            return res.status(400).json({ message: validate.message});
        }

        const { prod_category, prod_name, prod_price, prod_description } = product;
        try{
    let stmt = db.prepare(`INSERT INTO menu(prod_category, prod_name, prod_price, prod_description)VALUES(?, ?, ?, ?);`);
    stmt.run(prod_category, prod_name, prod_price, prod_description);
    stmt.finalize();
       
            res.status(200).json({message: "Produkt tillagd", product});
    
    } catch(error){
            console.error("Error occurred:", error);
            res.status(500).json({message: "Fel när produkt skulle läggas till!"});
        }           
        
    });

//Ändra produktinformation
//http://localhost:3333/api/menu/edit/3
menuRouter.put("/edit/:prod_id", authenticateToken, async (req, res) => {
    const db = req.db;
    const prod_id = parseFloat(req.params.prod_id);

    const product = req.body;

    const validate = validateInput(product);
    if (!validate.isValid) {
        return res.status(400).json({ message: validate.message });
    }

    const { prod_category, prod_name, prod_price, prod_description } = product;
    
    console.log("Mottaget: " + product);
    
    if (isNaN(prod_id)) {
        return res.status(400).json({ message: 'Id är inte ett giltigt nummer' });
    }

    try {
        const stmt = db.prepare(`UPDATE menu SET prod_category = ?, prod_name = ?, prod_price = ?, prod_description = ? WHERE prod_id = ?`);
        stmt.run(prod_category, prod_name, prod_price, prod_description, prod_id, function(err) {
            if (err) {
                console.error("Error when updating the product", err);
                return res.status(500).json({ message: "Fel vid uppdatering" });
            }
            res.status(200).json({ message: "Produkt uppdaterad", product });
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ message: "Fel vid uppdatering" });
    }
});

//Radera produkt
// http://localhost:3333/api/menu/delete/3
menuRouter.delete("/delete/:id", authenticateToken, (req, res) => {
    const db = req.db;
    let id = req.params.id;
    try{
    db.run(`DELETE FROM menu WHERE prod_id=?`, id, function(err) {
        if(err){
            console.error("Error occurred:", err.message);
            res.status(400).json({"error": err.message});
            
            return;
        }
        res.json({message: "Produkten raderad"});
        console.log("Produkt raderad: ", id);
    });
    } catch(error){
        console.error("Fel när produkten skulle raderas", error);
          
        res.status(500).json({message: "Fel när produkt skulle raderas"});
    }  

   
});

module.exports = menuRouter;