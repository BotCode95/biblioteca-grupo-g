const express = require('express');
const {qy} = require('../db/conexion');
const router = express.Router();


router.get('/categoria', async (req,res) => {
    try {
        const query = 'SELECT * FROM categoria';
        const respuesta = await qy(query);
        res.status(200).send({"respuesta" : respuesta});
    } catch (error) {
        res.status(413).send({"error": error.message});
    }
});

router.get('/categoria/:id', async (req,res) => {
    const {id} = req.params;
  try {
      const query = 'SELECT * FROM categoria WHERE id = ?';
      const respuesta = await qy(query, id);

      res.status(200).send({"respuesta" : respuesta});
  } catch (error) {
      res.status(413).send({"Error" : error.message});
  }
})

router.post('/categoria', async (req,res) => {
     const {nombre}=req.body;
    try {
        if(!nombre) {
            throw new Error('Ingrese un nombre de categoría');
        }

        const query = 'INSERT INTO categoria (nombre) VALUE (?)';
        const respuesta = await qy(query, [nombre]);
        res.status(200).send({"respuesta" : respuesta.inserId});
    } catch (error) {
        res.status(413).send({"Error" : error.message});
    }
})

router.delete('/categoria/:id', async (req,res) => {
    const {id} = req.params;
    try {
        let query = 'SELECT * FROM libro WHERE categoria_id = ?';

        let respuesta = await qy(query, [id]);

        if (respuesta.length > 0) {
            throw new Error("Esta categoria tiene libros asociados, no se puede borrar");
        }

        query = 'DELETE FROM categoria WHERE id = ?';

        respuesta = await qy(query, [id]);

        res.send({'respuesta': respuesta.affectedRows}); //add se borro correctamente
    } catch (error) {
        res.status(413).send({"Error" : error.message});
    }
})


//No es necesario el PUT
module.exports = router;