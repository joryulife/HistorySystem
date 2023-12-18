// pages/api/createImg.js

import { createImg } from '../../lib/puppeteer'; // 正しいパスに修正してください

export default async function handler(req:any, res:any) {
    if (req.method === 'POST') {
        try {
            const userId = req.body.userId;
            await createImg(userId);
            res.status(200).json({ message: 'Image creation started' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
