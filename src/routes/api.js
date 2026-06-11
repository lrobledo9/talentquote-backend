import express from 'express';
import ImagenRoutes from './v1/ImagenRoutes.js';
import StripeRoutes from './v1/StripeRoutes.js';
import CustomerRoutes from './v1/CustomerRoutes.js';
import { auth } from '../middleware/authMiddleware.js'

const routers = express.Router();

routers.use('/img',auth, ImagenRoutes);
routers.use('/stripe', StripeRoutes);
routers.use('/customer',auth, CustomerRoutes);

export default routers;
