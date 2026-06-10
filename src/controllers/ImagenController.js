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
            const { idUser } = req.body

            let { data: engineers, error: engineersError } = await supabase.from('Engineers')
                .select("*")
                .eq('id', idUser).single();

            if (engineersError) {
                res.status(400).json({ error: engineersError.message })
            }

            let folder = idUser
            if (engineers.id_airtable != null) {
                folder = engineers.id_airtable
            }

            const imageUrl = engineers.photo;

            const bufferPhotoBlur = await BlurService.createFromUrl(imageUrl);
            const publicUrl = await StorageService.uploadBlur(bufferPhotoBlur,'profile_files',folder);

            const { error: dbError } = await supabase.from('Engineers') // tu tabla
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

    async background(req, res) {

        try {
            const { idUser } = req.body

            let { data: engineers, error: engineersError } = await supabase.from('Engineers')
                .select("*")
                .eq('id', idUser).single();

            if (engineersError) {
                res.status(400).json({ error: engineersError.message })
            }

            let folder = idUser
            if (engineers.id_airtable != null) {
                folder = engineers.id_airtable
            }

            let { data: background, error: backgroundError } = await supabase.from('background_catalog')
                .select("*")
                .eq('id', 1).single();

            const backgroundUrl = await StorageService.getSignedUrl('background', background.background);
            //url foto
            const imageUrl = engineers.original_photo;
            const fileNameWithExtension = path.basename(imageUrl);
            const fileName = path.basename(imageUrl).split('.')[0];
            //buffer de imagenes 
            const personResponse = await axios.get(imageUrl, {
                responseType: "arraybuffer"
            });

            const backgroundResponse = await axios.get(backgroundUrl, {
                responseType: "arraybuffer"
            });


            const promptBackground = `
               Expand this portrait into a horizontal professional banner.

                Keep the person's face, body, clothing, and identity exactly the same.

                Do not modify the subject.

                Extend the existing background naturally on both sides.

                Maintain the same environment, lighting, colors, and perspective.

                Create a realistic professional horizontal image suitable for a website profile banner.

                Aspect ratio 16:9.
            `;
            const imageBackgroundBuffer = await OpenAIService.editImage(personResponse, backgroundResponse, promptBackground)
            const newBackgroundUrl = await StorageService.uploadPhoto(imageBackgroundBuffer, 'profile_files', folder, `${fileName}_background_IA_${Date.now()}.png`);

            const { error: dbError } = await supabase
                .from('Engineers') // tu tabla
                .update({
                    background: newBackgroundUrl
                }).eq('id', idUser);

            if (dbError) throw dbError

            return res.json({
                success: true,
                url: newBackgroundUrl
            });

        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error procesando imagen' })
        }



    }

    async photoEdit(req, res) {
        try {
            
            const { file } = req;
            if (!file) {
                return res.status(400).json({
                    msj: 'Archivo requerido',
                    data: 'Debes enviar un archivo en el campo file.'
                });
            }

            const photoBuffer = file;
            const fileName = file.originalname.split('.')[0];

            let { data: background, error: backgroundError } = await supabase.from('background_catalog')
                .select("*")
                .eq('id', 1).single();

            const backgroundUrl = await StorageService.getSignedUrl('background', background.background);
            const backgroundResponse = await axios.get(backgroundUrl, {
                responseType: "arraybuffer"
            });
             console.log("buffer",backgroundResponse);

            const promptProfile = `
                Use the second image as the exact background.
                DO NOT modify the person in any way.
                Keep the following exactly as they are:
                - The face
                - The hair
                - The eyes
                - The skin tone
                - The clothing
                - The pose
                - The body proportions
                - The facial features

                The person must remain identical to the one in the first image.

                Replace ONLY the background.

                Do not alter the composition of the background image.
                Do not move the furniture.
                Do not change the colors.
                Do not change the perspective.
                Do not change the background lighting.

                Maintain the same dimensions and aspect ratio as the first image.

                Photorealistic result.
            `;

             const imageBuffer = await OpenAIService.editImage(photoBuffer, backgroundResponse, promptProfile)
             
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}.png"`);
            res.send(imageBuffer);
        

        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error procesando imagen', data:error })
        }
    }



}

export default new ImagenController();