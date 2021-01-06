const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
//routes
app.use(require('./src/routes'));
app.use(require('./src/routes/persona'));
app.use(require('./src/routes/categoria'));
app.use(require('./src/routes/libro'));


app.listen(port, () => {
    console.log(`estoy escuchando en el puerto ${port}`);
})
