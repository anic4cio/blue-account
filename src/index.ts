import puppeteer, { Browser, Page } from 'puppeteer'
import envs from './envs.js'
import fs from 'fs'
import folderCompresser from './dirCompresser.js'

const delay = async (milliseconds: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}

const field = {
  login: '[class="ds-input ds-form-control"]',
  email: '[type="email"]',
  password: '[type="password"]',
  previousMonthButton: '[class="ds-button ds-button-default ds-button-lg ds-button--is-square ds-date-filter__button ds-date-filter__button--prev"]',
  pagination: '[class="ds-pagination-navigation-label"]',
  paginationButtonNextPage: '[class="ds-pagination-item ds-pagination-item-nav ds-pagination-item-nav--next"]',
  paginationButtonNextPageDesable: '[class="ds-pagination-item is-disabled ds-pagination-item-nav ds-pagination-item-nav--next"]',
  downloadButtonsInDropdown: '[class="ds-dropdown-item-label"]'
}

const setNewBrowser = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await setDownloadDirectory(page)
  return { browser, page }
}

const downloadPath = './invoices'

const setDownloadDirectory = async (page: Page) => {
  const _client = await page.target().createCDPSession()
  await _client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  })
}

const browseAndDownload = async () => {
  const { browser, page } = await setNewBrowser()
  await page.goto(envs.loginUrl)
  await page.waitForNetworkIdle()
  await page.waitForSelector(field.login)
  await page.type(field.email, envs.username, { delay: 50 })
  await page.type(field.password, envs.password, { delay: 50 })
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'load' })
  await page.goto(envs.serviceUrl)
  await page.waitForSelector(field.previousMonthButton)
  await page.click(field.previousMonthButton)
  await page.waitForSelector(field.pagination)
  await iterateAtDownloadPages(browser, page)
  folderCompresser(downloadPath)
}

const iterateAtDownloadPages = async (browser: Browser, page: Page) => {
  const { roundedPageNumber } = await getPagesNumber(page)
  for (let i = 0; i < roundedPageNumber; i++) {
    if (await page.$(field.paginationButtonNextPageDesable)) {
      await downloadFiles(page)
      await delay(3500)
      await downloadFiles(page)
      await delay(3500)
      await checkFiles(page)
    } else {
      await downloadFiles(page)
      await page.click(field.paginationButtonNextPage)
    }
  }
  return await browser.close()
}

const getPagesNumber = async (page: Page) => {
  const paginationElement = await page.$(field.pagination)
  const paginationText = await page.evaluate(item => item.textContent, paginationElement)
  const regex = /(?<=de )([\d]*)(?<![ a-zA-Z])/g
  const totalInvoices = Number(paginationText.match(regex))
  const roundedPageNumber = roundPageNumber(totalInvoices)
  return { totalInvoices, roundedPageNumber }
}

const roundPageNumber = (value: number) => {
  if (value % 10 === 0) return value / 10
  return Math.ceil((value / 10))
}

const downloadFiles = async (page: Page) => {
  await page.waitForSelector(field.downloadButtonsInDropdown)
  await page.$$eval(field.downloadButtonsInDropdown, buttons => {
    buttons.forEach(button => {
      const buttonText = ' Fazer download do XML '
      if (button.textContent === buttonText) button.click()
    })
  })
  await delay(2000)
}

const checkFiles = async (page: Page) => {
  const { totalInvoices } = await getPagesNumber(page)
  fs.readdir(downloadPath, (_err, files) => {
    console.log(`Total invoices at page: ${totalInvoices}`)
    console.log(`Total files at /download: ${files.length}`)
  })
}

browseAndDownload()
