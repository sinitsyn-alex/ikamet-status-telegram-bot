import puppeteer from 'puppeteer';
import {
    APPLICATION_NUMBER_SELECTOR,
    CAPTCHA_IMAGE_SELECTOR,
    CAPTCHA_INPUT_SELECTOR,
    PASSPORT_SELECTOR,
    PHONE_SELECTOR,
    SUBMIT_BUTTON_SELECTOR,
    URL
} from './app.const';
import { getResourceContent } from './utils';
import * as Captcha from '2captcha';
require('dotenv').config();

const solver = new Captcha.Solver(process.env.CAPTCHA_TOKEN!);

/** Получить статус заявки Икамета картинкой */
export async function getStatus(): Promise<string | Buffer> {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(URL);

    await page.type(APPLICATION_NUMBER_SELECTOR, ' ');
    await page.type(APPLICATION_NUMBER_SELECTOR, process.env.APPLICATION_NUMBER!, { delay: 50 });

    await page.type(PHONE_SELECTOR, ' ');
    await page.type(PHONE_SELECTOR, process.env.PHONE!, { delay: 50 });

    await page.type(PASSPORT_SELECTOR, process.env.PASSPORT!, { delay: 50 });

    const src = await page.$eval(CAPTCHA_IMAGE_SELECTOR, (img: Element) => (img as HTMLImageElement).src);
    const resourceContent = await getResourceContent(page, src);

    const captchaAnswer = await solver.imageCaptcha(resourceContent);

    await page.type(CAPTCHA_INPUT_SELECTOR, captchaAnswer.data, { delay: 100 });
    await page.click(SUBMIT_BUTTON_SELECTOR);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    const resultImage = await page.screenshot({ fullPage: true, encoding: 'binary' });
    await browser.close();

    return resultImage;
}
