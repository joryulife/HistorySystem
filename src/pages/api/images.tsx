import fs from 'fs';
import path from 'path';

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const imagesDirectory = path.join(process.cwd(), 'public/images');

    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error reading image directory.',success: false });
        }

        // フィルタリングして画像ファイルだけを返す
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        res.status(200).json({ images: imageFiles,success: true });
    });
}
