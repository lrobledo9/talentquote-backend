import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const projectId = process.env.SUPABASE_ID;
const serviceRole = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(
    `https://${projectId}.supabase.co`,
    serviceRole
);


export async function auth(req, res, next) {
    try {

        const token =
            req.headers.authorization?.replace(
                'Bearer ',
                ''
            );

        if (!token) {
            return res.status(401).json({
                error: 'No token'
            });
        }

        const {
            data: { user },
            error
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
}