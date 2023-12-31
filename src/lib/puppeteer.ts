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
            headless: "new",
        });
    }
}

export async function createImg(userId: number) {
    const sql = 'SELECT * FROM history WHERE userId = ? AND imgcreate = false';
    try {
        const [rows] = await db.query<RowDataPacket[] | RowDataPacket[][]>(sql, [userId]);
        for (const row of rows as HistoryRow[]) {
            try {
                await ss(row.height, row.nodeid, row.userId, row.url, row.width, row.x, row.y, row.id);
            } catch (error) {
                console.log(error);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

const rootDir = path.resolve(__dirname, '../../../..');

async function ss(height: number, id: string, userId: number, url: string, width: number, x: number, y: number,ID:number) {
    console.log("rootDir",rootDir);
    if (!browser) {
        await initPuppeteer();
    }
    try {
        console.log("IN puppeteer.ts :",url);
        if (url.startsWith('chrome://')) {
            console.error(`Invalid URL for Puppeteer: ${url}`);
            const updateSql = 'UPDATE history SET imgcreate = true WHERE id = ?';
            await db.query(updateSql, [ID]);
        }else{
            console.log("IN puppeteer.ts ");
            const page = await browser.newPage();
            await page.setViewport({  height,width });
            await page.goto(url, { waitUntil: 'networkidle2' });
            await page.evaluate((x, y) => {
                window.scrollTo(x, y);
            }, x, y);
        
            const imageName = `${userId}_${id}.png`;
            const imagePath = path.join(rootDir,'public/images', imageName);
            console.log("image path",imagePath);
        
            await page.screenshot({ fullPage: false,path: imagePath });
            await page.close();
            const updateSql = 'UPDATE history SET imgcreate = true WHERE id = ?';
            await db.query(updateSql, [ID]);
            console.log(`Screenshot saved: ${imageName}`); 
        }
    } catch (error) {
        console.error(`Error in ss function for URL ${url}: ${error}`);
        // エラーを再スローせず、処理を続行
        const updateSql = 'UPDATE history SET imgcreate = true WHERE id = ?';
        await db.query(updateSql, [ID]);
    }
}