const months = new Map([
  [0, 'janeiro'],
  [1, 'fevereiro'],
  [2, 'marco'],
  [3, 'abril'],
  [4, 'maio'],
  [5, 'junho'],
  [6, 'julho'],
  [7, 'agosto'],
  [8, 'setembro'],
  [9, 'outubro'],
  [10, 'novembro'],
  [11, 'dezembro']
])

const getDateToFilename = () => {
  const date = new Date()
  const monthNumber = date.getMonth()
  let year: number, month: string
  if (monthNumber === 0) {
    year = date.getFullYear() - 1
    month = 'dezembro'
    return { month, year }
  }
  year = date.getFullYear()
  month = months.get(monthNumber - 1)!
  return { month, year }
}

export default () => {
  const { month, year } = getDateToFilename()
  return `notas-${month}-${year}.zip`
}
