import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import recintos from './routes/recintos.js';
import eventos from './routes/eventos.js';

// Conexión con la base de datos
mongoose.connect(process.env.URL_BD)
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => console.error('Error conectando a la base de datos:', error));

// Crear la app de Express y cargar middleware JSON
const app = express();
app.use(express.json());

// Montar los enrutadores
app.use('/recintos', recintos);
app.use('/eventos', eventos);

// Arrancar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
