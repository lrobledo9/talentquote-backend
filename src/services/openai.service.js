import 'dotenv/config';
import axios from "axios";
import OpenAI from "openai";
import { toFile } from "openai/uploads";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const cvSchema = {
    type: 'object',
    properties: {
        role: { type: 'string' },
        about: { type: 'string' },
        techStack: {
            type: 'array',
            items: { type: 'string' }
        },
        languages: {
            type: 'array',
            items: { type: 'string' }
        },
        experience: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    position: { type: 'string' },
                    company: { type: 'string' },
                    period: { type: 'string' },
                    responsibilities: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                },
                required: ['position', 'company', 'period', 'responsibilities'],
                additionalProperties: false
            }
        },
        education: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    institution: { type: 'string' },
                    period: { type: 'string' }
                },
                required: ['title', 'institution', 'period'],
                additionalProperties: false
            }
        }
    },
    required: ['role', 'about', 'techStack', 'languages', 'experience', 'education'],
    additionalProperties: false
};

class OpenAIService {
    constructor() { }

    /**
     * Extrae y estructura la información profesional de un CV en PDF.
     * @param {string} cvUrl URL pública o firmada del archivo PDF.
     * @returns {Promise<object>} Información del CV lista para la plantilla.
     */
    async extractCvData(cvUrl) {
        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'input_text',
                            text: [
                                'Extrae información profesional de currículums.',
                                'Devuelve todo el contenido exclusivamente en inglés, aunque el documento original esté en otro idioma.',
                                'Traduce cargos, perfil profesional, tecnologías cuando corresponda, idiomas, fechas, responsabilidades y formación académica.',
                                'No traduzcas nombres propios de personas, empresas, productos, certificaciones o instituciones.',
                                'No inventes información ausente; usa cadenas vacías o arreglos vacíos.',
                                'Resume el perfil profesional en inglés en máximo 70 palabras.',
                                'Limita techStack a 12 elementos relevantes.',
                                'Limita cada experiencia a 5 responsabilidades breves.',
                                'Ordena experiencia y educación de la más reciente a la más antigua.'
                            ].join(' ')
                        }
                    ]
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_file',
                            file_url: cvUrl
                        },
                        {
                            type: 'input_text',
                            text: 'Extrae los datos de este CV y devuelve únicamente la estructura solicitada.'
                        }
                    ]
                }
            ],
            text: {
                format: {
                    type: 'json_schema',
                    name: 'candidate_cv',
                    strict: true,
                    schema: cvSchema
                }
            }
        });

        if (!response.output_text) {
            throw new Error('OpenAI no devolvió información extraída del CV.');
        }

        return JSON.parse(response.output_text);
    }

    /**
     * Edita una imagen usando una persona y un fondo como referencias.
     * @param {object} personResponse Archivo o respuesta con la imagen de la persona.
     * @param {object} backgroundResponse Respuesta con la imagen de fondo.
     * @param {string} prompt Instrucciones para la edición.
     * @returns {Promise<Buffer>} Imagen editada.
     */
    async editImage(personResponse, backgroundResponse, prompt) {     

        const personBuffer = Buffer.from(personResponse.buffer);     
        const backgroundBuffer = Buffer.from(backgroundResponse.data);

        const personFile = await toFile(
            personBuffer,
            "person",
            {
                type: personResponse.mimetype
            }
        );

        const backgroundFile = await toFile(
            backgroundBuffer,
            "background",
            {
                type: backgroundResponse.headers["content-type"]
            }
        );
        try {
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
        } catch (error) {
           throw error;
        }
        

       
    }
}

export default new OpenAIService();
