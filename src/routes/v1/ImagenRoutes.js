import express from 'express';
import ImagenController from '../../controllers/ImagenController.js'


const route = express.Router();

route.post('/blur', express.raw({ type: 'image/*', limit: '5mb' }) ,ImagenController.blur);

route.post('/ia', express.raw({ type: 'image/*', limit: '5mb' }) ,ImagenController.generateImgIa);

export default route;