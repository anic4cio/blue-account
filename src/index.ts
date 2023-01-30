import puppeteer, { Browser, Page } from 'puppeteer'
import envs from './envs.js'
import fs from 'fs'
import dirCompresser from './dirCompresser.js'
const { installMouseHelper } = require('./install-mouse-helper')

const delay = async (milliseconds: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}

const downloadPath = './downloads'

const setNewBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false }) // You can see the browser
  // const browser = await puppeteer.launch({ headless: true }) // You can't see the browser
  const page = await browser.newPage()
  await installMouseHelper(page)
  await setDownloadDirectory(page)
  await page.setViewport({ width: 900, height: 900 })
  return { browser, page }
}

const setDownloadDirectory = async (page: Page) => {
  const _client = await page.target().createCDPSession()
  await _client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath
  })
}

const navigate = async () => {
  const { browser, page } = await setNewBrowser()
  await page.goto(envs.loginUrl)
  await page.waitForNetworkIdle()
  await page.waitForSelector('[class="ds-input ds-form-control"]')
  await page.type('[type="email"]', envs.username, { delay: 50 })
  await page.type('[type="password"]', envs.password, { delay: 50 })
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'load' })
  await page.goto(envs.serviceUrl)
  await page.waitForSelector('[class="ds-button ds-button-default ds-button-lg ds-button--is-square ds-date-filter__button ds-date-filter__button--prev"]')
  await page.click('[class="ds-button ds-button-default ds-button-lg ds-button--is-square ds-date-filter__button ds-date-filter__button--prev"]')
  await page.waitForSelector('[class="ds-pagination-navigation-label"]')
  await iterateAtDownloadPages(browser, page)
  dirCompresser(downloadPath)
}

const iterateAtDownloadPages = async (browser: Browser, page: Page) => {
  const pages = await getPagesNumber(page)
  for (let i = 0; i < pages; i++) {
    if (await page.$('[class="ds-pagination-item ds-pagination-item-nav ds-pagination-item-nav--next"]')) {
      await downloadFiles(page)
      await page.click('[class="ds-pagination-item ds-pagination-item-nav ds-pagination-item-nav--next"]')
    } else {
      await downloadFiles(page)
      await browser.close()
      break
    }
  }
  return checkFiles()
}

const getPagesNumber = async (page: Page) => {
  const element = await page.$('[class="ds-pagination-navigation-label"]')
  const elementText = await page.evaluate(el => el.textContent, element)
  const regex = /(?<=de )([\d]*)(?<![ a-zA-Z])/g
  const value = Number(elementText.match(regex))
  return getNumber(value)
}

const getNumber = (value: number) => {
  if (value % 10 === 0) return value / 10
  return Math.round((value / 10) + 1)
}

const downloadFiles = async (page: Page) => {
  await page.waitForSelector('[class="ds-data-grid-actions__dropdown-container"]')
  await page.mouse.wheel({ deltaY: 1000 })
  await delay(2000)

  let moveDown = 215
  let downloadClick = 320
  for (let i = 0; i < 9; i++) {
    await page.mouse.click(800, moveDown)
    await delay(500)
    await page.mouse.click(800, downloadClick)
    await delay(1000)
    moveDown += 60
    downloadClick += 60
  }

  await page.mouse.click(800, 755)
  await delay(500)
  await page.mouse.click(800, 680)
  await delay(1000)
}


const checkFiles = () => {
  const path = './downloads'
  fs.readdir(path, (err, files) => {
    console.log(`Total files at /download: ${files.length}`)
  })
}

navigate()
