import express from 'express';
import ImagenRoutes from './v1/ImagenRoutes.js';
import StripeRoutes from './v1/StripeRoutes.js';

const routers = express.Router();

routers.use('/img', ImagenRoutes);
routers.use('/stripe', StripeRoutes);

export default routers;
