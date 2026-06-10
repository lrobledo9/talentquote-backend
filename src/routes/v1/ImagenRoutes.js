import express from 'express';
import ImagenController from '../../controllers/ImagenController.js'


const route = express.Router();

route.post('/blur', express.raw({ type: 'image/*', limit: '5mb' }) ,ImagenController.blur);

route.post('/background', express.raw({ type: 'image/*', limit: '5mb' }) ,ImagenController.background);

export default route;