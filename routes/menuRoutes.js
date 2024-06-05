//Routes för menyn

const express = require('express');
const menuRouter = express.Router();

//Visa alla produkter i menyn URL:  http://localhost:3333/api/menu 
menuRouter.get('/', (req, res) => {
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
menuRouter.post('/menu', (req, res) => {
    const db = req.db;
        const {prod_category, prod_name, prod_price, prod_description} = req.body;

    let stmt = db.prepare(`INSERT INTO menu(prod_category, prod_name, prod_price, prod_description)VALUES(?, ?, ?, ?);`);
    stmt.run(prod_category, prod_name, prod_price, prod_description);
    stmt.finalize();
       
         let product = {
            prod_category : prod_category, 
            prod_name: prod_name, 
            prod_price: prod_price, 
            prod_description: prod_description
        };
        if(res.status === 200){
            res.json({message: "Product added", product});
        } else {
            res.status(500).json({message: "Fel när produkt skulle läggas till"});
        }           
        
    });

//Ändra produktinformation
//http://localhost:3333/api/menu/edit/3
menuRouter.put("/edit/:prod_id", async (req, res) => {
    const db = req.db;
    let prod_id = req.params.prod_id;

    const {prod_category, prod_name, prod_price, prod_description} = req.body;

    try{

        let stmt = db.prepare(`UPDATE menu SET prod_category=?, prod_name=?, prod_price=?, prod_description=? WHERE prod_id=?;`);
        stmt.run(prod_category, prod_name, prod_price, prod_description, prod_id);
        stmt.finalize();
    
        let product = {
            prod_category : prod_category, 
            prod_name: prod_name, 
            prod_price: prod_price, 
            prod_description: prod_description
        };
    
        res.status(200).json({message: "Product updated", product});
    } catch {
    res.status(500).json({message: "Fel vid uppdatering"});
}
});

//Radera produkt
//ÄNDRA! http://localhost:3333/api/menu/delete/3
menuRouter.delete("/delete/:id", (req, res) => {
    const db = req.db;
    let id = req.params.id;
    db.run(`DELETE FROM menu WHERE prod_id=?`, id, function(err) {
        if(err){
            res.status(400).json({"error": err.message});
            console.log(err.message);
            return;
        }
        res.json({message: "Produkten raderad"});
        console.log("Produkt raderad: ", id);
    })
   
});

module.exports = menuRouter;