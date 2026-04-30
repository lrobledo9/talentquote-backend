import 'dotenv/config';
import Stripe from 'stripe';
import axios from 'axios';

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
            await axios.post('https://talentquotedev.onikom.io/webhook/stripe/hook', event, {
                headers:{
                    'X-Webhook-Secret':'7941606991ee5f0a227b868a3e046e4adb2c8e0e5e7aeff957bd183aea5580cass'
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
