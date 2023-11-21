import path from 'path';

import puppeteer from 'puppeteer';

import db from './ds';

import type { RowDataPacket } from 'mysql2';
import type { Browser } from 'puppeteer';

interface HistoryRow extends RowDataPacket {
    created_at: bigint;
    firstVisit: Date;
    height: number;
    id: number;
    img: string;
    imgcreate: boolean;
    lastVisit: Date;
    nodeid: string;
    parent: string;
    title: string;
    url: string;
    userId: number;
    width: number;
    x: number;
    y: number;
}

let browser: Browser;

export async function initPuppeteer() {
    if (!browser) {
        browser = await puppeteer.launch({
            args: ['--lang=ja'],
            headless: true,
        });
    }
}

export async function createImg(userId: number) {
    const sql = 'SELECT * FROM history WHERE userId = ? AND imgcreate = false';

    try {
        const [rows] = await db.query<RowDataPacket[] | RowDataPacket[][]>(sql, [userId]);

        for (const row of rows as HistoryRow[]) {
            try {
                await ss(row.height, row.nodeid, row.userId, row.url, row.width, row.x, row.y);
                
                const updateSql = 'UPDATE history SET imgcreate = true WHERE id = ?';
                await db.query(updateSql, [row.id]);
            } catch (error) {
                console.error(error);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function ss(height: number, id: string, userId: number, url: string, width: number, x: number, y: number) {
    if (!browser) {
        await initPuppeteer();
    }

    if (url.startsWith('chrome://')) {
        console.error(`Invalid URL for Puppeteer: ${url}`);
        return; // このURLはスキップ
    }

    try {
        const page = await browser.newPage();
        await page.setViewport({  height,width });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.evaluate((x, y) => {
            window.scrollTo(x, y);
        }, x, y);
    
        const imageName = `${userId}_${id}.png`;
        const imagePath = path.join(__dirname, '../public/images', imageName);
    
        await page.screenshot({ fullPage: false,path: imagePath });
        await page.close();

        console.log(`Screenshot saved: ${imageName}`);
    } catch (error) {
        console.error(error);
    }
}