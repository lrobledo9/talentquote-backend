import 'dotenv/config';
import axios from "axios";
import path from "path";
import { createClient } from '@supabase/supabase-js';
import BlurService from '../services/blur.service.js'
import StorageService from '../services/storage.service.js';

import OpenAIService from '../services/openai.service.js';



const projectId = process.env.SUPABASE_ID;
const serviceRole = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(
    `https://${projectId}.supabase.co`,
    serviceRole 
);

class ImagenController {
    constructor() { }

    async blur(req, res) {
        try {
            const {idUser } = req.body

            let { data: engineers, error: engineersError } = await supabase.from('Engineers')
                .select("*")
                .eq('id', idUser).single();

            if(engineersError){
                res.status(400).json({ error: engineersError.message })
            }

            let folder = idUser
            if (engineers.id_airtable != null) {
                folder = engineers.id_airtable
            }

            //obtener fondo
            let { data: background, error: backgroundError } = await supabase.from('background_catalog')
                .select("*")
                .eq('id', 1).single();

            const backgroundUrl = await StorageService.getSignedUrl('background',background.background);
            //url foto
            const imageUrl = engineers.photo;
            const fileNameWithExtension = path.basename(imageUrl);
            const fileName = path.basename(imageUrl).split('.')[0];
            //buffer de imagenes 
            const personResponse = await axios.get(imageUrl, {
                responseType: "arraybuffer"
            });

            const backgroundResponse = await axios.get(backgroundUrl, {
                responseType: "arraybuffer"
            });

        
            const imageBuffer = await OpenAIService.editImage(personResponse,backgroundResponse)

            const newPhotoUrl = await StorageService.uploadPhoto(imageBuffer,'profile_files',folder,`${fileName}_IA_${Date.now()}.png` );

            const buffer = await BlurService.createFromUrl(newPhotoUrl);
            const publicUrl = await StorageService.uploadBlur(buffer,'profile_files',folder );

            const { error: dbError } = await supabase
                .from('Engineers') // tu tabla
                .update({
                    photo:newPhotoUrl,
                    photo_blur: publicUrl,
                }).eq('id', idUser);

            if (dbError) throw dbError

            return res.json({
                success: true,
                url: publicUrl
            });

        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error procesando imagen' })
        }
    }


    async generateImgIa(req, res){
        return res.json({
            success: true,
            url: ""
        });
    }



}

export default new ImagenController();