import express  from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import 'dotenv/config';
import api from './routes/api.js'
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.json());
app.use('/api/v1',api);

app.listen(port, () => {
    console.log('🚀 Servidor corriendo en el puerto:', port);
});

