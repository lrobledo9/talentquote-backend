import 'dotenv/config';
import axios from "axios";
import OpenAI from "openai";
import { toFile } from "openai/uploads";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
    constructor() { }

    async editImage(personResponse, backgroundResponse, prompt) {     

        const personBuffer = Buffer.from(personResponse.data);
        const backgroundBuffer = Buffer.from(backgroundResponse.data);


        const personFile = await toFile(
            personBuffer,
            "person",
            {
                type: personResponse.headers["content-type"]
            }
        );

        const backgroundFile = await toFile(
            backgroundBuffer,
            "background",
            {
                type: backgroundResponse.headers["content-type"]
            }
        );
        const result = await openai.images.edit({
            model: "gpt-image-1",
            image: [personFile, backgroundFile],
            prompt
        });


        const imageBase64 = result.data[0].b64_json;
        const imageBuffer = Buffer.from(
            imageBase64,
            "base64"
        );

        return imageBuffer
    }
}

export default new OpenAIService();