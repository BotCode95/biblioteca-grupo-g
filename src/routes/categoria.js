const express = require('express');
const conexion = require('../db/conexion');
const router = express.Router();

router.get('/categoria', async (req,res) => {
    try {
        const query = 'SELECT * FROM categoria';
        const respuesta = await conexion.query(query);
        res.status(200).send({"respuesta" : respuesta});
    } catch (error) {
        res.status(413).send({"error": error.message});
    }
});

router.get('/categoria/:id', async (req,res) => {
    const {id} = req.params;
  try {
      const query = 'SELECT * FROM categoria WHERE id = ?';
      const respuesta = await conexion.query(query, id);

      if (respuesta.length == 0) {
        throw new Error("Categoría no encontrada");
      }

      res.status(200).send({"respuesta" : respuesta});
  } catch (error) {
      res.status(413).send({"Error" : error.message});
  }
});

router.post('/categoria', async (req,res) => {
    const {nombre}=req.body;
    try {
        if(!nombre) { 
            throw new Error('Ingrese un nombre de categoría');
        }

        let query = "SELECT id FROM categoria WHERE nombre = ?";
        let respuesta = await conexion.query(query, [nombre]);
    
        if(respuesta.length > 0) {
            throw new Error("Ese nombre de categoría ya existe");
        }

        query = 'INSERT INTO categoria (nombre) VALUE (?)';
        respuesta = await conexion.query(query, [nombre]);

        query = "SELECT * FROM categoria WHERE nombre = ?";
        respuesta = await conexion.query(query, [nombre]);
        res.status(200).send({"respuesta" : respuesta});
    } catch (error) {
        res.status(413).send({"Error" : error.message});
    }
});

router.delete('/categoria/:id', async (req,res) => {
    const {id} = req.params;
    try {
        let query = 'SELECT * FROM libro WHERE categoria_id = ?';

        let respuesta = await conexion.query(query, [id]);

        if (respuesta.length == 0) {
            throw new Error("Esa categoría no existe");
        }

        if (respuesta.length > 0) {
            throw new Error("Esta categoría tiene libros asociados, no se puede borrar");
        }

        query = 'DELETE FROM categoria WHERE id = ?';

        respuesta = await conexion.query(query, [id]);

        res.status(200).send({'respuesta': "Se borro correctamente"});
    } catch (error) {
        res.status(413).send({"Error" : error.message});
    }
})

//No es necesario el PUT
module.exports = router;
