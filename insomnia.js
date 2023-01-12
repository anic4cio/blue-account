const puppeteer = require('puppeteer')
const archiver = require('archiver')
const fs = require('fs')

const delay = async milliseconds => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}

const urls = [
  'https://unsplash.com/photos/i8z9Clwc9IE',
  'https://unsplash.com/photos/c_1QCzVNkS0',
  'https://unsplash.com/photos/op5AI9uL_yE',
  'https://unsplash.com/photos/X341uDCs5NQ',
  'https://unsplash.com/photos/PzNe0UJuYvI'
]

const downloadFile = async urls => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  const _client = await page.target().createCDPSession()
  await _client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: './downloads'
  })
  for (let url of urls) {
    await page.goto(url)
    await page.waitForSelector('.wl5gA')
    await page.click('.wl5gA')
    await delay(3000)
  }
  return await browser.close()
}

const zipFile = () => {
  const output = fs.createWriteStream('./downloads.zip')
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
  })

  archive.on('error', err => { throw err })
  archive.pipe(output)
  archive.directory('./downloads', false)
  archive.directory('subdir', 'new-subdir')
  archive.finalize()
}

zipFile()
