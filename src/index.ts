import puppeteer, { Browser, Page } from 'puppeteer'
import { Request, Response } from 'firebase-functions'
import requestValidator from './requestValidator.js'
import { sendReportToSlack } from './reportSender.js'
import folderCompresser from './dirCompresser.js'
import { readFile } from 'fs/promises'
import auth from './auth.js'
import envs from './envs.js'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const start = async (req: Request, res: Response) => {
  const authentication = auth(req)
  if(!authentication.success)
    res.status(authentication.status).json(authentication)
  const validation = requestValidator(req)
  if (!validation.success) 
    res.status(validation.code).json(validation)
  await browseAndDownload()
  const file = 'invoices.zip'
  try {
    const filepath = path.join(os.tmpdir(), file)
    await delay(1000)
    const zipBuffer = await readFile(filepath)
    await sendReportToSlack(zipBuffer)
  } catch (error) {
    console.log('Error on START()')
    console.log(error)
    return res.status(500).send('function failed')
  }
  return res.status(200).send('sucess')
}

const field = {
  loginUrl: 'https://login.contaazul.com/#/',
  login: '[class="ds-input ds-form-control"]',
  email: '[type="email"]',
  password: '[type="password"]',
  serviceUrl: 'https://app.contaazul.com/#/ca/notas-fiscais/notas-fiscais-de-servico',
  previousMonthButton: '[class="ds-button ds-button-default ds-button-lg ds-button--is-square ds-date-filter__button ds-date-filter__button--prev"]',
  pagination: '[class="ds-pagination-navigation-label"]',
  paginationButtonNextPage: '[class="ds-pagination-item ds-pagination-item-nav ds-pagination-item-nav--next"]',
  paginationButtonNextPageDesable: '[class="ds-pagination-item is-disabled ds-pagination-item-nav ds-pagination-item-nav--next"]',
  downloadButtonsInDropdown: '[class="ds-dropdown-item-label"]'
}

const delay = async (milliseconds: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}

const browseAndDownload = async () => {
  const { browser, page } = await setNewBrowser()
  await page.goto(field.loginUrl)
  await page.waitForNetworkIdle()
  await page.waitForSelector(field.login)
  await page.type(field.email, envs.username, { delay: 50 })
  await page.type(field.password, envs.password, { delay: 50 })
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'load' })
  await page.goto(field.serviceUrl)
  await page.waitForSelector(field.previousMonthButton)
  await page.click(field.previousMonthButton)
  await delay(1500)
  await page.waitForSelector(field.pagination)
  await iterateAtDownloadPages(browser, page)
  await folderCompresser(downloadPath)
  return
}

const setNewBrowser = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await setDownloadDirectory(page)
  return { browser, page }
}

const downloadPath = path.join(os.tmpdir(), 'invoices')

const setDownloadDirectory = async (page: Page) => {
  const _client = await page.target().createCDPSession()
  await _client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  })
}

const iterateAtDownloadPages = async (browser: Browser, page: Page) => {
  const { roundedPageNumber } = await getPagesNumber(page)
  for (let i = 0; i < roundedPageNumber; i++) {
    if (await page.$(field.paginationButtonNextPageDesable)) {
      await downloadFiles(page)
      await delay(4000)
      await downloadFiles(page)
      await delay(4000)
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
  await delay(2500)
}

const checkFiles = async (page: Page) => {
  const { totalInvoices } = await getPagesNumber(page)
  fs.readdir(downloadPath, (_err, files) => {
    console.log(`Total invoices at page: ${totalInvoices}`)
    console.log(`Total files at /invoices: ${files.length}`)
  })
}

// const start = async () => {
//   await browseAndDownload()
//   const file = 'invoices.zip'
//   try {
//     const filepath = path.join(__dirname, file)
//     await delay(1000)
//     const zipBuffer = await readFile(filepath)
//     await sendReportToSlack(zipBuffer)
//   } catch (error) {
//     console.log('Error on START()')
//     console.log(error)
//   }
// }
// start()