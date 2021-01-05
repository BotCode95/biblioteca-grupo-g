const express = require('express');
const conexion = require('../db/conexion');
const router = express.Router();

router.get("/persona", async (req, res)=>{ //para pedir todas las personas
    try{
        const query = "SELECT * FROM persona";
        const respuesta = await conexion.query(query);
    
        res.status(200).send({"Respuesta" : respuesta}); 
    }
    catch(error){
        console.error(error.message);
        res.status(413).send({"Error" : error.message}); 
    }
});

router.get("/persona/:id", async (req, res)=>{//para pedir solo una persona
    const {id} = req.params;
    try{
        if(!id){
            throw new Error("No completaste el campo de busqueda");
        }
        const query = "SELECT * FROM persona WHERE id = ?";
        const respuesta = await conexion.query(query, [id]);
    
        if(respuesta.length == 0){
        throw new Error("Esa persona no se encuentra");
        }
    
        res.status(200).send({"respuesta" : respuesta});
    }
    
    catch(error){
        console.error(error.message);
        res.status(413).send({"Error" : error.message});
    }
    });

router.post("/persona", async (req, res)=>{
    const {nombre, apellido, email, alias} = req.body;
    try{
        //valido que me envie correctamente la info
        if (isEmpty(nombre) || isEmpty(apellido) || isEmpty(alias) || isEmpty(email)){
            throw new Error("Faltaron completar datos");
           }
       //verifico que no existe ese email previamente
       let query = "SELECT id FROM persona WHERE email = ?";
       let respuesta = await conexion.query(query, [email]);

       if(respuesta.length > 0){
           throw new Error("Ese email ya existe");
       }
       
       //Guardo la nueva persona
       query = "INSERT INTO persona (nombre, apellido, alias, email) VALUE (?,?,?,?)";
       respuesta = await conexion.query(query, [nombre.toUpperCase(), apellido.toUpperCase(), alias.toUpperCase(), email]);
        
       query = "SELECT * FROM persona WHERE email = ?";
       respuesta = await conexion.query(query, [email])
       res.status(200).send({"respuesta" : respuesta});
}
catch(e){
    console.error(e.message);
    res.status(413).send({"Error" : e.message});
}
});


router.put("/persona/:id" , async (req, res)=>{ //Para modificar una persona
    const {id} = req.params;
    const {nombre, apellido, email, alias} = req.body;

try{
    if(email){
        throw new Error("El campo mail no se puede modificar")
    }
    if(isEmpty(nombre) || isEmpty(apellido) || isEmpty(alias)){
        throw new Error('No completaste los campos');
    }

    let query = "SELECT * FROM persona WHERE nombre = ? AND apellido = ? AND alias = ? AND id <> ?";
    let respuesta = await conexion.query(query, [nombre,apellido, alias, id]);

    if(respuesta.length >0){
        throw new Error("La persona que queres ingresar ya existe");
    }
    query = 'SELECT * FROM persona WHERE  id = ?';
    respuesta = await conexion.query(query, [id]);

    if (respuesta.length == 0){
        throw new Error("No se encuentra esa persona");
    }

    query = "UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id= ?";
    respuesta = await conexion.query(query, [nombre.toUpperCase(),apellido.toUpperCase(), alias.toUpperCase(), id]);

    query = "SELECT * FROM persona WHERE id = ?";
    respuesta = await conexion.query(query, [id]);

    res.status(200).send({"Respuesta" : respuesta});
   }
catch(error){
       res.status(413).send({"Error" : error.message});
   }
});



router.delete("/persona/:id", async (req, res)=>{
    const {id} =req.params;
try{
    let query = "SELECT * FROM persona WHERE id = ?";
    let respuesta = await conexion.query(query, [id]);
    
    if (respuesta.length == 0) {
       throw new Error("Esa persona no existe");
    }
    
    if (respuesta.length > 0) {
        throw new Error("Esta persona tiene libros asociados, no se puede borrar");
    }

    query = "DELETE FROM persona WHERE id = ?";

     respuesta = await conexion.query(query, [id]);
     

     res.status(200).send({"respuesta" : "Se borro correctamente"});
 }
 catch(error){
    console.error(error.message);
    res.status(413).send({"Error" : error.message});
}
});

function isEmpty(str){
    return (!str || 0 === str.trim().length);
}

module.exports = router;