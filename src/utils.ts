import { Frame, Page } from 'puppeteer';
import { telegramBot } from './app';

/** Получить ресурс из chrome dev tools */
export async function getResourceContent(page: Page, url: string): Promise<string> {
    const client = await page.target().createCDPSession();
    await client.send('Page.enable');

    const { content } = await client.send('Page.getResourceContent', {
        frameId: (page.mainFrame() as Frame & { _id: string })._id,
        url
    });

    return content;
}

/** Отправить фотографию в чат */
export function sendPhoto(chatId: number, photo: string | Buffer) {
    const caption = 'Статус заявки';
    // @ts-ignore
    void telegramBot.sendPhoto(chatId, photo, { caption }, { filename: caption, contentType: 'image/png' });
}
