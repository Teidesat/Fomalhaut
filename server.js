const express = require('express');
const cors = require('cors'); // Importa el middleware de CORS
const app = express();
const port = 3000;

// Habilita CORS para todas las solicitudes
app.use(cors());
//Si se puede hacer cada segundo quitando el setInterval se borra de la 9 a la 21 y se pone res.send(`Temperature,Humidity ${Math.floor(Math.random() * 101)},${Math.floor(Math.random() * 101)}`)
let humidity = 10;
let temperature = 50;
let csvData = `Temperature,Humidity
${temperature},${humidity}`;

// Actualiza los valores cada 5 segundos
setInterval(() => {
    humidity = Math.floor(Math.random() * 101); // Valores de 0 a 100
    temperature = Math.floor(Math.random() * 101); // Valores de 0 a 100
    csvData = `Temperature,Humidity
${temperature},${humidity}`;
}, 5000);

app.get('/data', (req, res) => {
    // Envía los datos como texto plano
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvData);
});

app.listen(port, () => {
    console.log("Server running at http://localhost:" + port);
});
