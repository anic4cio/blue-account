import fs from 'fs'

const file = 'invoices.zip'

const buffer = fs.readFileSync(`./${file}`)

fs.writeFile('./frombuff.zip', buffer, () => {})

