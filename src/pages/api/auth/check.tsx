import { getSession } from 'next-auth/react';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function check(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (session) {
        res.json({ isLoggedIn: true, user: session.user });
    } else {
        res.json({ isLoggedIn: false });
    }
}
