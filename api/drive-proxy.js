// api/drive-proxy.js
// Zylox Protocol: Authenticated Image Stream v4.0 (Final)

import { google } from 'googleapis';

export const config = {
    runtime: 'nodejs', // Asegura entorno Node estable
};

export default async function handler(req, res) {
    // 1. Configuración de Cabeceras (Permite que tu frontend lea la imagen)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { id } = req.query;

    // Validación rápida
    if (!id) return res.status(400).json({ error: 'Falta ID' });
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        return res.status(500).json({ error: 'Error de Servidor: Faltan credenciales' });
    }

    try {
        // 2. Autenticación con Google (Usando tus Keys del .env.local)
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                // Corrige los saltos de línea en la llave privada si se rompieron al copiar
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // 3. Obtener metadatos (Para saber si es jpg, png, etc.)
        const fileMetadata = await drive.files.get({
            fileId: id,
            fields: 'mimeType, size'
        });

        // 4. Descargar y Servir (Streaming directo al navegador)
        const response = await drive.files.get(
            { fileId: id, alt: 'media' },
            { responseType: 'stream' }
        );

        // Avisar al navegador que esto es una imagen, no texto
        res.setHeader('Content-Type', fileMetadata.data.mimeType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache de 1 año

        // Conectar la tubería
        response.data.pipe(res);

    } catch (error) {
        console.error('Drive API Error:', error.message);
        // Si falla, devolvemos un error 404 limpio
        res.status(404).send('Not Found');
    }
}