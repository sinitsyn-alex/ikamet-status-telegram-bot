import TelegramBot, { Message } from 'node-telegram-bot-api';
import { COMMAND } from './app.const';
import { getStatus } from './puppeteer';
import { sendPhoto } from './utils';
require('dotenv').config();

export const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN!, { polling: true });

telegramBot.onText(COMMAND.START, async ({ chat }: Message) => {
    const { id: chatId } = chat;

    try {
        const image = await getStatus();
        sendPhoto(chatId, image);
    } catch (error: unknown) {
        const message = (error as Error)?.message || 'Неизвестная ошибка';
        telegramBot.sendMessage(chatId, `Ошибка: ${message}`);
    }
});
