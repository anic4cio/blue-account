import archiver from 'archiver'
import { createWriteStream } from 'fs'

export default (path: string) => {
  const output = createWriteStream(`${path}.zip`)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
  })

  archive.on('error', (err) => { throw err })
  archive.pipe(output)
  archive.directory(path, false)
  archive.directory('subdir', 'new-subdir')
  archive.finalize()
}
