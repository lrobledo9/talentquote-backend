import express from 'express';
import ImagenRoutes from './v1/ImagenRoutes.js';
import StripeRoutes from './v1/StripeRoutes.js';
import { auth } from '../middleware/authMiddleware.js'

const routers = express.Router();

routers.use('/img',auth, ImagenRoutes);
routers.use('/stripe', StripeRoutes);

export default routers;
