import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import 'dotenv/config';
import api from './routes/api.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use((req, res, next) => {
    const pathname = req.originalUrl.split('?')[0];

    if (pathname === '/api/v1/stripe/hook') {
        return next();
    }

    return bodyParser.json()(req, res, next);
});
app.use('/api/v1', api);

app.listen(port, () => {
    console.log('Servidor corriendo en el puerto:', port);
});
