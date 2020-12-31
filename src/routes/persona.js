const express = require('express');
const conexion = require('../db/conexion');
const router = express.Router();

router.get('/persona', async (req,res) => {
    try {
        const query = 'SELECT * FROM persona';
        const respuesta = await conexion.query(query);
        res.status(200).send({"respuesta" : respuesta});
    } catch (error) {
        res.status(413).send({"error": error.message});
    }
});

    
router.post("/persona", async (req, res)=>{
    try{
        //valido que me envie correctamente la info
        if(!req.body.nombre||!req.body.apellido||!req.body.email||!req.body.alias){
            throw new Error("Faltaron completar datos");
           }

       //verifico que no existe ese email previamente
       let query = "SELECT id FROM persona WHERE email = ?";
       let respuesta = await conexion.query(query, [req.body.email]);

       if(respuesta.length > 0){
           throw new Error("Ese email ya existe");
       }
       
       //Guardo la nueva persona
       query = "INSERT INTO persona (nombre, apellido, alias, email) VALUE (?,?,?,?)";
       respuesta = await conexion.query(query, [req.body.nombre.toUpperCase(), req.body.apellido.toUpperCase(), req.body.alias.toUpperCase(), req.body.email]);
        
       query = "SELECT * FROM persona WHERE nombre = ?";
       respuesta = await conexion.query(query, [req.body.nombre])
       res.status(200).send({"respuesta" : respuesta});

}
catch(e){
    console.error(e.message);
    res.status(413).send({"Error" : e.message});
}
});


//GET '/persona' retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, email; string}] o bien status 413 y []

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


//GET '/persona/:id' retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} - status 413 , {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"

router.get("/persona/:id", async (req, res)=>{//para pedir solo una persona
try{
    if(!req.params.id){
        throw new Error("No completaste el campo de busqueda");
    }
    const query = "SELECT * FROM persona WHERE id = ?";
    const respuesta = await conexion.query(query, [req.params.id]);

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


// PUT '/persona/:id' recibe: {nombre: string, apellido: string, alias: string, email: string} el email no se puede modificar. retorna status 200 y el objeto modificado o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"

router.put("/persona/:id" , async (req, res)=>{ //Para modificar una persona
    const {id} = req.params;
    const {nombre, apellido, email, alias} = req.body;
try{
    if(email){
        throw new Error("El campo mail no se puede modificar")
    }
    if(!nombre || !apellido || !alias){
        throw new Error("No completaste los campos");
    }

    let query = "SELECT * FROM persona WHERE nombre = ? AND apellido = ? AND alias = ? AND id <> ?";
    let respuesta = await conexion.query(query, [nombre,apellido, alias, id]);

   
    if(respuesta.length >0){
        throw new Error("La persona que queres ingresar ya existe");
    }

    query = "UPDATE persona SET nombre = ?, apellido = ?, alias = ?";
    respuesta = await conexion.query(query, [nombre.toUpperCase(),apellido.toUpperCase(), alias.toUpperCase()]);

    query = "SELECT * FROM persona WHERE id = ?";
    respuesta = await conexion.query(query, [id]);
    res.status(200).send({"Respuesta" : respuesta});
   
   }
   catch(error){
       console.error(error.message);
       res.status(413).send({"Error" : error.message});
   }


});

// DELETE '/persona/:id' retorna: 200 y {mensaje: "se borro correctamente"} o bien 413, {mensaje: <descripcion del error>} "error inesperado", "no existe esa persona", "esa persona tiene libros asociados, no se puede eliminar"


router.delete("/persona/:id", async (req, res)=>{
    const {id} =req.params;
try{
     const query = "DELETE FROM persona WHERE id = ?";

     const respuesta = await conexion.query(query, [id]);
     console.log(respuesta);

     res.status(200).send({"respuesta" : "Se borro correctamente"});
 }
 catch(error){
    console.error(error.message);
    res.status(413).send({"Error" : error.message});
}
});

module.exports = router;