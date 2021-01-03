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
      const respuesta = await conexion.query(query, id);

      res.status(200).send({"respuesta" : respuesta});
  } catch (error) {
      res.status(413).send({"Error" : error.message});
  }
});

router.post("/libro", async (req, res) => {
    const {nombre, descripcion, categoria_id} = req.body;
    try{
        //valido que me envie correctamente la info
        if(!nombre||!descripcion||!categoria_id){
            throw new Error("Faltaron completar datos");
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
                       
        //Guardo el nuevo libro
               query = "INSERT INTO libro (nombre, descripcion, categoria_id, persona_id) VALUES (?, ?, ?,?)";
               respuesta = await conexion.query(query, [nombre.toUpperCase(), req.body.descripcion, req.body.categoria_id, req.body.persona_id]);
                
               query = "SELECT * FROM libro WHERE nombre = ?";
               respuesta = await conexion.query(query, [nombre])
               res.status(200).send({"respuesta" : respuesta});
    
        }
        catch(error){
            res.status(413).send({"Error" : error.message});
        }
        });


router.put("/libro/:id" , async (req, res)=>{ //Para modificar un libro
   const {nombre, descripcion, categoria_id, persona_id} = req.body;
   const {id} = req.params;
    try{
         if(!nombre || !descripcion || !categoria_id){
              throw new Error("No completaste los campos");
         }
 
         let query = "SELECT * FROM libro WHERE nombre = ? AND categoria_id = ? AND id = ?";
         let respuesta = await conexion.query(query, [nombre, categoria_id, id]);
 
        
         if(respuesta.length == 0){
             throw new Error("Solo se puede modificar la descripcion");
         }
 
         query = "UPDATE libro SET nombre = ?, descripcion = ?, categoria_id = ?, persona_id = ? WHERE id = ?";
         respuesta = await conexion.query(query, [nombre.toUpperCase(), descripcion, categoria_id, persona_id, id]);
 
         query = "SELECT * FROM libro WHERE id = ?";
         respuesta = await conexion.query(query, [req.params.id]);
         res.status(200).send({"MODIFICADO" : respuesta});
        
        }
        catch(error){
          
            res.status(413).send({"Error" : error.message});
        }
 });

 //PUT '/libro/prestar/:id' y {id:numero, persona_id:numero} devuelve 200 y {mensaje: "se presto correctamente"} o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva", "no se encontro el libro", "no se encontro la persona a la que se quiere prestar el libro"

 router.put("/libro/prestar/:id" , async (req, res)=>{ //Para modificar el campo persona_id para prestar libro
    const {persona_id} = req.body;
    const {id} = req.params;
    try{
         if(!persona_id){
              throw new Error("Ingresa la persona a la que se presta el libro");
         }
 
         let query = "SELECT * FROM libro WHERE id = ?";
         let respuesta = await conexion.query(query, [id]);
         
        
         if(respuesta.length == 0){
             throw new Error("No se encontro el libro");
         }
         
         query = "SELECT * FROM persona WHERE id = ? ";
         respuesta = await conexion.query(query, [persona_id]);
 
         if(respuesta.length == 0){
             throw new Error("No se encontro la persona a la que se quiere prestar el libro");
         }

         query = "SELECT persona_id FROM libro WHERE id = ? AND persona_id IS NULL"; //
         respuesta = await conexion.query(query, [id]);
         
        console.log(respuesta.persona_id);
         if(respuesta.length == 0 ){
             throw new Error("El libro se encuentra prestado");
         }

         query = "UPDATE libro SET persona_id = ? WHERE id = ?";
         respuesta = await conexion.query(query, [persona_id, id]);
 
         query = "SELECT * FROM libro WHERE id = ?";
         respuesta = await conexion.query(query, [id]);
         res.status(200).send({"El libro fue prestado correctamente" : respuesta});
        }
        catch(error){
            res.status(413).send({"Error" : error.message});
        }

 });

 router.put("/libro/devolver/:id" , async (req, res)=>{ 
  
    const {id} = req.params;
    try{
        if(!id){
             throw new Error("No completaste el id del libro"); //SI NO LO COMPLETAS NO ME TIRA ESTE ERROR (REVISAR)
        }
        let query = "SELECT persona_id FROM libro WHERE id = ? AND persona_id IS NOT NULL";
        let respuesta = await conexion.query(query, [id]);
               
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
module.exports = router;