import { NextApiHandler } from 'next'

import chrome from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'

const api: NextApiHandler = async (req, res) => {
    const url = `https://${process.env.VERCEL_URL}/_generators/shield-image?field=${req.query.field}&colors=${req.query.colors}&hardware=${req.query.hardware}&frame=${req.query.frame}`
    const image = await getScreenshotOfURL(url)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-max-age=31536000')
    return res.send(image)
}

export default api

const getScreenshotOfURL = async (url: string) => {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
        defaultViewport: {
            width: 1100,
            height: 1320,
            deviceScaleFactor: 2,
        },
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.evaluate(() => (document.body.style.background = 'transparent'))
    const file = await page.screenshot({ type: 'png', omitBackground: true })
    await browser.close()
    return file
}
