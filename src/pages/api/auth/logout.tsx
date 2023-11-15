import { signOut } from 'next-auth/react';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function logout(req: NextApiRequest, res: NextApiResponse) {
    // POSTリクエストのみ許可
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // セッションを破棄し、ユーザーをログアウト
        await signOut({ callbackUrl: '/login' ,redirect: false});
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
