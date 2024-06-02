//Routes för menyn

const express = require('express');
//const sqlite3 = require("sqlite3").verbose();
const menuRouter = express.Router();
//const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");
//const cors = require('cors');
//app.use(cors());
//app.use(express.json());
//require("dotenv").config();


//Visa alla produkter i menyn (göra lista i adminvyn, med möjlighet att välja produkt att ändra?) URL:  http://localhost:3333/api/menu FUNKAR
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


//Lägg till produkt i menyn FUNKAR URL: http://localhost:3333/api/menu/menu 
menuRouter.post('/menu', (req, res) => {
    const db = req.db;
        const {prod_category, prod_name, prod_price, prod_description} = req.body;
   
   /*if(prod_category.length === 0){
        return res.status(400).json({error: "Invalid input, send category"});
    }*/

    let stmt = db.prepare(`INSERT INTO menu(prod_category, prod_name, prod_price, prod_description)VALUES(?, ?, ?, ?);`);
    stmt.run(prod_category, prod_name, prod_price, prod_description);
    stmt.finalize();
       
         let product = {
            prod_category : prod_category, 
            prod_name: prod_name, 
            prod_price: prod_price, 
            prod_description: prod_description
        };
            res.json({message: "Product added", product});
        
    });

//Ändra produktinformation
//http://localhost:3333/api/menu/menu/3 Uppdaterar databas, men thunderclient står och tuggar.
//ÄNDRA http://localhost:3333/api/menu/edit/3
menuRouter.put("/edit/:prod_id", (req, res) => {
    const db = req.db;
    let prod_id = req.params.prod_id;

    const {prod_category, prod_name, prod_price, prod_description} = req.body;

    let stmt = db.prepare(`UPDATE menu SET prod_category=?, prod_name=?, prod_price=?, prod_description=? WHERE prod_id=?;`);
    stmt.run(prod_category, prod_name, prod_price, prod_description, prod_id);
    stmt.finalize();
    
    let product = {
        prod_category : prod_category, 
        prod_name: prod_name, 
        prod_price: prod_price, 
        prod_description: prod_description
    };
        res.json({message: "Product updated", product});
});


//Radera produkt
////http://localhost:3333/api/menu/menu/3
//ÄNDRA! http://localhost:3333/api/menu/delete/3
menuRouter.delete("/delete/:prod_id", (req, res) => {
    const db = req.db;
    let prod_id = req.params.prod_id;
    db.run("DELETE FROM menu WHERE prod_id=?;", prod_id, (err) => {
        if(err){
            console.log(err.message);
        }
    })
    res.json({message: "Produkten raderad"});
    console.log("Produkt raderad: ", id);
});

/*menuRouter.get("/get/:prod_id", (req, res) => {
    const db = req.db;
    const prod_id = req.params.prod_id;
    const sql = `SELECT FROM menu WHERE prod_id=?;`;
    db.get(sql, [prod_id], (err, row) => {
        if(err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "hämtningen lyckades",
            "data": row
        });
    });
});*/



module.exports = menuRouter;