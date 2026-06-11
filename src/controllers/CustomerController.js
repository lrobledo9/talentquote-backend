import 'dotenv/config';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { cvDefinition } from '../templates/pdfs/CvPdfTemplate.js';
import OpenAIService from '../services/openai.service.js';
import StorageService from '../services/storage.service.js';

const projectId = process.env.SUPABASE_ID;
const serviceRole = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(
    `https://${projectId}.supabase.co`,
    serviceRole
);

/**
 * Devuelve el primer valor no vacío de una lista.
 * @param {...unknown} values Valores candidatos.
 * @returns {unknown} Primer valor disponible.
 */
function getFirstValue(...values) {
    return values.find((value) => value !== null && value !== undefined && value !== '') ?? '';
}

/**
 * Formatea la tarifa del candidato para mostrarla en el CV.
 * @param {unknown} rate Tarifa almacenada en Supabase.
 * @returns {string} Tarifa lista para mostrar.
 */
function formatHourlyRate(rate) {
    if (rate === null || rate === undefined || rate === '') {
        return 'Rate to be defined';
    }

    if (typeof rate === 'number') {
        return `$${rate} USD / hr`;
    }

    return String(rate);
}

/**
 * Traduce los niveles de inglés más comunes almacenados en español.
 * @param {unknown} level Nivel de inglés almacenado.
 * @returns {string} Nivel normalizado en inglés.
 */
function formatEnglishLevel(level) {
    const normalizedLevel = String(level ?? '').trim();
    const levelTranslations = {
        básico: 'Basic',
        basico: 'Basic',
        principiante: 'Beginner',
        intermedio: 'Intermediate',
        avanzado: 'Advanced',
        bilingüe: 'Bilingual',
        bilingue: 'Bilingual',
        nativo: 'Native'
    };

    return levelTranslations[normalizedLevel.toLowerCase()] ?? normalizedLevel;
}

/**
 * Recorta texto largo sin cortar palabras cuando es posible.
 * @param {unknown} value Texto original.
 * @param {number} maxLength Longitud máxima permitida.
 * @returns {string} Texto ajustado para la plantilla.
 */
function truncateText(value, maxLength) {
    const text = String(value ?? '').trim();

    if (text.length <= maxLength) {
        return text;
    }

    const shortenedText = text.slice(0, maxLength);
    const lastSpace = shortenedText.lastIndexOf(' ');

    return `${shortenedText.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}...`;
}

/**
 * Obtiene el bucket y la ruta de un archivo desde una URL de Supabase Storage.
 * @param {string} fileUrl URL pública o firmada del archivo.
 * @returns {{bucket: string, filePath: string}} Ubicación del archivo en Storage.
 */
function parseSupabaseStorageUrl(fileUrl) {
    const url = new URL(fileUrl);
    const storageMarker = '/storage/v1/object/';
    const markerIndex = url.pathname.indexOf(storageMarker);

    if (markerIndex === -1) {
        throw new Error('La URL del CV no pertenece a Supabase Storage.');
    }

    const storagePath = url.pathname.slice(markerIndex + storageMarker.length);
    const pathParts = storagePath.split('/').filter(Boolean);

    if (['public', 'sign', 'authenticated'].includes(pathParts[0])) {
        pathParts.shift();
    }

    const bucket = decodeURIComponent(pathParts.shift() ?? '');
    const filePath = pathParts.map((part) => decodeURIComponent(part)).join('/');

    if (!bucket || !filePath) {
        throw new Error('No fue posible identificar la ubicación del CV original.');
    }

    return { bucket, filePath };
}

/**
 * Construye la ruta del CV TalentQuote junto al archivo original.
 * @param {string} originalPath Ruta del CV original.
 * @returns {string} Ruta destinada al nuevo PDF.
 */
function buildTalentQuoteCvPath(originalPath) {
    const pathParts = originalPath.split('/');
    const originalFileName = pathParts.pop() ?? 'candidate-cv.pdf';
    const fileNameWithoutExtension = originalFileName.replace(/\.[^.]+$/, '');
    const newFileName = `${fileNameWithoutExtension}-tq.pdf`;

    return [...pathParts, newFileName].join('/');
}

/**
 * Combina los datos del ingeniero con la información extraída del PDF.
 * @param {object} engineer Registro obtenido desde Supabase.
 * @param {object} extractedCv Datos estructurados extraídos del CV.
 * @returns {object} Datos compatibles con CvPdfTemplate.
 */
function mapCandidateCv(engineer, extractedCv) {
    const languages = [...(extractedCv.languages ?? [])];

    if (engineer.english_level) {
        const englishLevel = `English - ${formatEnglishLevel(engineer.english_level)}`;
        const hasEnglish = languages.some((language) => /ingl[eé]s|english/i.test(language));

        if (!hasEnglish) {
            languages.push(englishLevel);
        }
    }

    return {
        name: getFirstValue(engineer.name, 'Candidate'),
        role: getFirstValue(extractedCv.role, engineer.position, engineer.seniority, 'Software Engineer'),
        location: getFirstValue(engineer.location, engineer.address, 'Remote'),
        hourlyRate: formatHourlyRate(getFirstValue(engineer.hourly_rate, engineer.expected_rate)),
        photo: getFirstValue(engineer.photo, engineer.original_photo),
        about: truncateText(extractedCv.about, 500),
        techStack: (extractedCv.techStack ?? []).slice(0, 12),
        languages: languages.slice(0, 4),
        experience: (extractedCv.experience ?? []).slice(0, 3).map((item) => ({
            ...item,
            responsibilities: (item.responsibilities ?? []).slice(0, 4)
        })),
        education: (extractedCv.education ?? []).slice(0, 3)
    };
}

class CustomerController {
    constructor() { }

    /**
     * Obtiene el CV almacenado, extrae sus datos y genera un PDF con formato TalentQuote.
     * @param {import('express').Request} req Petición HTTP.
     * @param {import('express').Response} res Respuesta HTTP.
     * @returns {Promise<import('express').Response>} PDF o respuesta de error.
     */
    async cvCandidate(req, res) {
        let browser;

        try {
            const { idCandidate } = req.body;

            if (!idCandidate) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo idCandidate es requerido.'
                });
            }

            const { data: engineer, error: engineerError } = await supabase
                .from('Engineers')
                .select('*')
                .eq('id', idCandidate)
                .single();

            if (engineerError || !engineer) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró el candidato solicitado.'
                });
            }

            if (engineer.cv_tq) {
                return res.json({
                    success: true,
                    url: engineer.cv_tq,
                    generated: false
                });
            }

            if (!engineer.CV) {
                return res.status(422).json({
                    success: false,
                    message: 'El candidato no tiene un CV cargado.'
                });
            }

            const extractedCv = await OpenAIService.extractCvData(engineer.CV);
            const candidate = mapCandidateCv(engineer, extractedCv);
            const html = cvDefinition(candidate);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setContent(html, {
                waitUntil: ['load', 'networkidle0'],
                timeout: 30000
            });

            const pdfData = await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true
            });
            const pdf = Buffer.from(pdfData);
            const { bucket, filePath } = parseSupabaseStorageUrl(engineer.CV);
            const talentQuoteCvPath = buildTalentQuoteCvPath(filePath);
            const talentQuoteCvUrl = await StorageService.uploadPdf(
                pdf,
                bucket,
                talentQuoteCvPath
            );

            const { error: updateError } = await supabase
                .from('Engineers')
                .update({ cv_tq: talentQuoteCvUrl })
                .eq('id', idCandidate);

            if (updateError) {
                throw updateError;
            }

            return res.json({
                success: true,
                url: talentQuoteCvUrl,
                generated: true
            });
        } catch (error) {
            console.error('Error generating candidate CV:', error);

            return res.status(500).json({
                success: false,
                message: 'No fue posible generar el CV en PDF.'
            });
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

export default new CustomerController();
