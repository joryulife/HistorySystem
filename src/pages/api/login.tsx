import bcrypt from 'bcrypt';
import Cors from 'cors';

import db from '../../lib/ds';

import type { RowDataPacket } from 'mysql2';
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

interface LoginRequest {
    password: string;
    username: string;
}

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    // CORSを有効にする
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [results] = await db.query<RowDataPacket[]>(query, [username]);

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({ message: 'Username or password is incorrect' });
        }

        const user = { id: results[0].id, username: results[0].username };
        res.json({ message: 'Logged in successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
