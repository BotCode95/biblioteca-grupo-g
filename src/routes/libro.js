const express = require('express');
const conexion = require('../db/conexion');
const router = express.Router();


router.get("/libro", async (req,res) => {
    try {
        const query = 'SELECT * FROM libro';
        const respuesta = await conexion.query(query);
        res.status(200).send({"respuesta" : respuesta});
    } catch (error) {
        res.status(413).send({"error": error.message});
        
    }
});

   
router.get('/libro/:id', async (req,res) => {
    const {id} = req.params;
  try {
      const query = 'SELECT * FROM libro WHERE id = ?';
      const respuesta = await conexion.query(query, [id]);
      
      if(respuesta.length == 0){
        throw new Error("Ese libro no se esta en inventario");
        }

      res.status(200).send({"respuesta" : respuesta});
  } catch (error) {
      res.status(413).send({"Error" : error.message});
  }
});

router.post("/libro", async (req, res) => {
    const {nombre, descripcion, categoria_id, persona_id} = req.body;
    try{
        //valido que me envie correctamente la info
        if(isEmpty(nombre)||isEmpty(categoria_id)){
            throw new Error("Nombre y categoria son datos obligatorios");
           }

           //verifico que no existe ese libro previamente
           let query = "SELECT id FROM libro WHERE nombre = ?";
           let respuesta = await conexion.query(query, [nombre.toUpperCase()]);
       
        if(respuesta.length > 0){
             throw new Error("Ese libro ya existe");
           }
           //verifico que exista el genero
           query = "SELECT id FROM categoria WHERE id = ?";
           respuesta = await conexion.query(query, [categoria_id]);
           console.log(respuesta.length);

           if(respuesta.length == 0){
               throw new Error("esa categoria no existe");
           }           
                       
            query = "INSERT INTO libro (nombre, descripcion, categoria_id, persona_id) VALUES (?, ?, ?,?)";
            respuesta = await conexion.query(query, [nombre.toUpperCase(), descripcion, categoria_id, persona_id]);
            
            query = "SELECT * FROM libro WHERE nombre = ?";
            respuesta = await conexion.query(query, [nombre])
            res.status(200).send({"respuesta" : respuesta});
    
        }
        catch(error){
            res.status(413).send({"Error" : error.message});
        }
        });


router.put("/libro/:id" , async (req, res)=>{ 
   const {nombre, descripcion, categoria_id, persona_id} = req.body;
   const {id} = req.params;
    try{
        if(isEmpty(nombre) ||isEmpty(categoria_id) ){
            throw new Error("No completaste los campos obligatorios");
        }
 
        let query = "SELECT * FROM libro WHERE nombre = ? AND categoria_id = ? AND id = ?";
        let respuesta = await conexion.query(query, [nombre, categoria_id, id]);

         query = "UPDATE libro SET nombre = ?, descripcion = ?, categoria_id = ? WHERE id = ?";
         respuesta = await conexion.query(query, [nombre.toUpperCase(), descripcion, categoria_id, id]);
 
         query = "SELECT * FROM libro WHERE id = ?";
         respuesta = await conexion.query(query, [id]);
         res.status(200).send({"MODIFICADO" : respuesta});
        }
        catch(error){
          
            res.status(413).send({"Error" : error.message});
        }
 });

 router.put("/libro/prestar/:id" , async (req, res)=>{ //Para modificar el campo persona_id para prestar libro
    const {persona_id} = req.body;
    const {id} = req.params;
    try{
        let query = "UPDATE libro SET persona_id = ? WHERE id = ?";
        let respuesta = await conexion.query(query, [persona_id, id]);
 
         query = "SELECT * FROM libro WHERE id = ?";
         respuesta = await conexion.query(query, [id]);
         res.status(200).send({"response" : respuesta});
        }
        catch(error){
            res.status(413).send({"Error" : error.message});
        }

 });

 router.put("/libro/devolver/:id" , async (req, res)=>{ 
  
    const {id} = req.params;
    try{
        let query = "SELECT * FROM libro WHERE id = ?";
        let respuesta = await conexion.query(query, [id]);
               
        if(respuesta.length == 0){
            throw new Error("Ese libro no existe");
        }

         query = "SELECT persona_id FROM libro WHERE id = ? AND persona_id IS NOT NULL";
         respuesta = await conexion.query(query, [id]);
               
        if(respuesta.length == 0){
            throw new Error("Ese libro no esta prestado");
        }
        
        query = "UPDATE libro SET persona_id = NULL WHERE id = ?";
        respuesta = await conexion.query(query, [id]);

        query = "SELECT * FROM libro WHERE id = ?";
        respuesta = await conexion.query(query, [id]);
        res.status(200).send({"El libro fue devuelto correctamente" : respuesta});
       
       }
       catch(error){
           res.status(413).send({"Error" : error.message});
       }
});

router.delete('/libro/:id', async(req, res) => {
    const { id } = req.params;
    const { persona_id } = req.body;

    try {
        //verificar si existe el libro
        let query = "SELECT * FROM libro WHERE id = ?";
        let respuesta = await conexion.query(query, [id]);
        console.log(respuesta.length);

        if (respuesta.length == 0) {
            throw new Error("No se encuentra ese libro");
        }

        //verificar si está prestado
        query = "SELECT persona_id FROM libro WHERE id = ? AND persona_id IS NULL";
        respuesta = await conexion.query(query, [id]);

        if (respuesta.length == 0) {
            throw new Error("Ese libro está prestado, no se puede borrar");
        }

        //si no está prestado, borrar
        query = 'DELETE FROM libro WHERE id = ?';
        respuesta = await conexion.query(query, [id]);

        res.status(200).send({ "respuesta": "El libro se borró correctamente" });

        console.log(respuesta);

    } catch (error) {
        res.status(413).send({ "Error": error.message });
    }
});

function isEmpty(str){
    return (!str || 0 == str.length);
}

module.exports = router;