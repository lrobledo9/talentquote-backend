import 'dotenv/config';
import Stripe from 'stripe';
import axios from 'axios';


const n8nUrl = process.env.N8N_URL;
const n8nKey = process.env.N8N_SECRET

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripeHookKey = process.env.STRIPE_HOOK_KEY;
const stripe = new Stripe(stripeKey);

class StripeController {
    constructor() { }

    async hook(req, res) {
        const signature = req.headers['stripe-signature'];
        const {body} = req;
        
        let event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, stripeHookKey);
        } catch (err) {
            console.error('Firma invalida:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            await axios.post(`${n8nUrl}/stripe/hook`, event, {
                headers:{
                    'X-Webhook-Secret': n8nKey
                }
            });
            
        } catch (error) {
            console.error('n8n:', error.message);
        }
       
        return res.json({
            success: true
        });
    }
}

export default new StripeController();
