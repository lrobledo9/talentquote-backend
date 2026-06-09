import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const projectId = process.env.SUPABASE_ID;
const serviceRole = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(
    `https://${projectId}.supabase.co`,
    serviceRole
);

class StorageService {

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