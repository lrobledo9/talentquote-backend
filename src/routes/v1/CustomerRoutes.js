import express from 'express';
import CustomerController from '../../controllers/CustomerController.js';


const route = express.Router();

route.post('/cv/candidate',CustomerController.cvCandidate);
export default route;