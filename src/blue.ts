import puppeteer, { Mouse } from 'puppeteer'
import envs from './envs.js'
const { installMouseHelper } = require('./install-mouse-helper');

const delay = async (milliseconds: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}

// const count4 = await page.$$eval('[class="ds-loader-button__button ds-button ds-button-default ds-button-sm"]', divs => divs.length)
const downloadFile = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await installMouseHelper(page);
  await page.setViewport({ width: 1920, height: 1080 })

  const _client = await page.target().createCDPSession()
  await _client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: './downloads'
  })

  await page.goto(envs.loginUrl)
  await page.waitForNetworkIdle()
  await page.waitForSelector('[class="ds-input ds-form-control"]')
  await page.type('[type="email"]', envs.username, { delay: 60 })
  await page.type('[type="password"]', envs.password, { delay: 60 })
  await page.keyboard.press('Enter')
  await delay(5000)
  await page.goto(envs.serviceUrl)
  await page.waitForSelector('[class="ds-data-grid-actions__dropdown-container"]')

  const divs = await page.$$('[class="ds-data-grid-actions__dropdown-container"]')

  for (let i = 0; i < 4; i++) {
    let down = 600
    await divs[i].click()
    await delay(3000)
    await page.mouse.move(1700, down)
    await delay(3000)
    await page.mouse.wheel({ deltaY: 100 })
    down += 150
  }

  // return await browser.close()
}

downloadFile()
