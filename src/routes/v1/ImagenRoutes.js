import express from 'express';
import multer from "multer";
import ImagenController from '../../controllers/ImagenController.js'

const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

route.post('/blur', express.raw({ type: 'image/*', limit: '5mb' }) ,ImagenController.blur);
route.post('/photo/edit', upload.single('photo') ,ImagenController.photoEdit);
route.post('/background', express.raw({ type: 'image/*', limit: '5mb' }) ,ImagenController.background);

export default route;