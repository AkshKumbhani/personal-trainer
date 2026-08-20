const path = require('path');

const safeFileName = (name) => name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-]/g, '');

async function storeImage(file, folder) {
    if (!file) return null;

    if (!process.env.VERCEL) {
        return `/uploads/${file.filename}`;
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        const error = new Error('Vercel Blob is not configured. Create a Blob store for this project first.');
        error.statusCode = 503;
        throw error;
    }

    const { put } = require('@vercel/blob');
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${folder}/${Date.now()}-${safeFileName(path.basename(file.originalname, extension))}${extension}`;
    const blob = await put(fileName, file.buffer, {
        access: 'public',
        contentType: file.mimetype
    });
    return blob.url;
}

module.exports = { storeImage };
