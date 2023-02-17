import archiver from 'archiver'
import { createWriteStream } from 'fs'
import os from 'os'
import path from 'path'

const delay = async (milliseconds: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}

const streamPath = path.join(os.tmpdir(), 'invoices.zip')

export default async (path: string) => {
  const output = createWriteStream(streamPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`Total .zip file size: ${Math.round(archive.pointer() / 1024)}KB`)
    console.log('archiver has been finalized and the output file instance has closed.')
  })
  
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.log(`Directory not found: ${err}`)
    } else {
      throw err;
    }
  })
  
  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)
  archive.directory(path, false)
  archive.finalize()
  await delay(3000)
  return
}
