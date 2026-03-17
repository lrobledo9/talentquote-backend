import 'dotenv/config';
import sharp from 'sharp';
import axios from 'axios';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';


const projectId = process.env.SUPABASE_ID;
const serviceRole = process.env.SUPABASE_ROLE_KEY;

const supabase = createClient(
    `https://${projectId}.supabase.co`,
    serviceRole // importante: usa service role en backend
);

class ImagenController {
    constructor() { }

    async blur(req, res) {
        try {
            const {idUser } = req.body

            let { data: engineers, error: engineersError } = await supabase
                .from('Engineers')
                .select("*")
                .eq('id', idUser).single();
            let buket = idUser
            if (engineers.id_airtable != null) {
                buket = engineers.id_airtable
            }

            const imageUrl = engineers.photo;


            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer'
            })

            const buffer = await sharp(response.data)
                .blur(15)
                .toBuffer()

            const fileName = `blur-${Date.now()}.jpg`

            const { data, error } = await supabase.storage
                .from(`profile_files/${buket}`) // tu bucket
                .upload(fileName, buffer, {
                    contentType: 'image/jpeg'
                })

            if (error) throw error

            const { data: publicUrlData } = supabase.storage
                .from('profile_files')
                .getPublicUrl(fileName)

            const publicUrl = publicUrlData.publicUrl
            const { error: dbError } = await supabase
                .from('Engineers') // tu tabla
                .update({
                    photo_blur: publicUrl,
                }).eq('id', idUser);

            if (dbError) throw dbError

            return res.json({
                success: true,
                url: publicUrl
            })

        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error procesando imagen' })
        }
    }
}


export default new ImagenController();