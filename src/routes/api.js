import express from 'express';
import ImagenRoutes from './v1/ImagenRoutes.js'

const routers = express.Router();

routers.use('/img',ImagenRoutes);

export default routers;