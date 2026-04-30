import express from 'express';
import StripeController from '../../controllers/StripeController.js';


const route = express.Router();

route.post('/hook', express.raw({ type: 'application/json' }),StripeController.hook);
export default route;