import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const projectId = process.env.SUPABASE_ID;
const serviceRole = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(
    `https://${projectId}.supabase.co`,
    serviceRole
);

class StorageService {

    /**
     * Sube o reemplaza un archivo PDF en Supabase Storage.
     * @param {Buffer} buffer Contenido del archivo PDF.
     * @param {string} bucket Nombre del bucket.
     * @param {string} filePath Ruta completa dentro del bucket.
     * @returns {Promise<string>} URL pública del archivo.
     */
    async uploadPdf(buffer, bucket, filePath) {
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (error) {
            throw error;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async uploadBlur(buffer, bucket, folder) {

        const fileName = `blur-${Date.now()}.jpg`;

        const path = `${folder}/${fileName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: 'image/jpeg'
            });

        if (error) {
            throw error;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }
    async uploadPhoto(buffer, bucket, folder,fileName) {

        const path = `${folder}/${fileName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: 'image/png'
            });

        if (error) {
            throw error;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }


    async getSignedUrl(bucket, path) {

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 300);     

        return data.signedUrl;
    }


    async deletedFile(bucket, path) {

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            throw error;
        }
    }


}

export default new StorageService();
