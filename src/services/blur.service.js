import sharp from 'sharp';
import axios from 'axios';

class BlurService {
     constructor() { }

    async createFromUrl(imageUrl) {

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data);

        return await this.createFromBuffer(buffer);
    }

    async createFromBuffer(buffer) {

        return await sharp(buffer)
            .blur(30)
            .toBuffer();
    }

    async createBase64FromUrl(imageUrl) {

        const blurBuffer = await this.createFromUrl(imageUrl);

        return `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
    }


}

export default new BlurService();