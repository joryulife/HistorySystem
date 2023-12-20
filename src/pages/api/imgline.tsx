import { getSession } from 'next-auth/react';

import db from '../../lib/ds';

import type { RowDataPacket } from 'mysql2';
import type { NextApiRequest, NextApiResponse } from 'next';

interface HistoryRow extends RowDataPacket {
    firstVisit: Date;
    height: number;
    img: string;
    nodeid: string;
    parent: string;
    title: string;
    url: string;
    width: number;
}

interface ImglineResponse {
    [key: string]: {
        date: number;
        height: number;
        img: string;
        parent: string;
        title: string;
        url: string;
        width: number;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ImglineResponse | { message: string }>) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const session = await getSession({ req });
    console.log(session);

    if (!session || !session.user || !session.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;

    try {
        const sql = 'SELECT * FROM history WHERE userId = ? ORDER BY firstVisit ASC';
        const [results] = await db.query<HistoryRow[]>(sql, [userId]);

        const historyData = results.reduce((acc, cur) => {
            acc[cur.nodeid] = {
                date: convertToJST(new Date(cur.firstVisit)).getTime(),
                height: cur.height,
                img: `/images/${cur.img}`,
                parent: cur.parent,
                title: cur.title,
                url: cur.url,
                width: cur.width,
            };
            return acc;
        }, {} as ImglineResponse);
        console.log(historyData);
        res.json(historyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

function convertToJST(date:Date):Date {
    return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}
