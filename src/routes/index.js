const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    try {
        res.json('Hola Mundo ruta de prueba');
        // next();
    } catch (error) {
        res.status(413).send({"error": error.message});
    }
});
module.exports = router;