// src/pages/api/store_data.tsx
import Cors from 'cors';

import db from '../../lib/ds';
//import { createImg } from '../../lib/puppeteer';

import type { NextApiRequest, NextApiResponse } from 'next';

// CORSミドルウェアの初期化
const cors = Cors({
    methods: ['POST'], // POSTメソッドのみを許可
    optionsSuccessStatus: 200, // レガシーブラウザ対応
    origin: '*', // すべてのオリジンを許可
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CORSを有効にする
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { userId, nodes } = req.body;

    if (!userId || !nodes) {
        return res.status(400).json({ message: 'userId and nodes are required' });
    }

    try {
        const values = Object.entries(nodes).map(([nodeId, node]: [string, any]) => [
            userId,
            nodeId,
            node.height,
            `${userId}_${nodeId}.png`,
            false, // imgcreateの初期値はfalse
            node.parent,
            node.title,
            node.url,
            node.width,
            Date.now(), // created_atには現在のタイムスタンプをセット
            node.firstvisit,
            node.lastvisit,
            node.x,
            node.y
        ]);

        const sql = `
            INSERT IGNORE INTO history (
                userId, nodeid, height, img, imgcreate, parent, 
                title, url, width, created_at, firstvisit, lastvisit, x, y
            ) VALUES ?
        `;

        await db.query(sql, [values]);
        console.log("done");

        //await createImg(userId);

        res.status(200).json({ message: 'Nodes added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
