import bcrypt from 'bcrypt';
import Cors from 'cors';

import db from '../../lib/ds';

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

interface SignupRequest {
    password: string;
    username: string;
}

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
    // CORSを有効にする
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { username, password } = req.body as SignupRequest;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const query = 'SELECT id FROM users WHERE username = ?';
        const [results] = await db.query(query, [username]);

        if (Array.isArray(results) && results.length > 0) {
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
        await db.query(insertQuery, [username, hashedPassword]);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}
