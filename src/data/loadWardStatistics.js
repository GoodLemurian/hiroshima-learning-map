const DATA_URL = `${import.meta.env.BASE_URL}data/hiroshima-ward-statistics.csv`
const REQUIRED_COLUMNS = ['ward_code', 'ward_name']
const MISSING_VALUES = new Set(['', 'null', '-', 'n/a'])

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') quoted = false
      else field += character
    } else if (character === '"') quoted = true
    else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else if (character !== '\r') field += character
  }
  if (quoted) throw new Error('統計CSVの引用符が閉じられていません。')
  row.push(field)
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  return rows
}

function toNumber(value) {
  const normalized = value.trim()
  if (MISSING_VALUES.has(normalized.toLowerCase())) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

export async function loadWardStatistics({ url = DATA_URL, numericColumns = [] } = {}) {
  let response
  try {
    response = await fetch(url)
  } catch (error) {
    throw new Error('統計データの取得に失敗しました。', { cause: error })
  }
  if (!response.ok) {
    throw new Error(`統計データの取得に失敗しました（HTTP ${response.status}）。`)
  }

  let rows
  try {
    rows = parseCsv((await response.text()).replace(/^\uFEFF/, ''))
  } catch (error) {
    throw new Error('統計CSVを解析できませんでした。', { cause: error })
  }
  if (rows.length < 2) throw new Error('統計CSVにデータ行がありません。')

  const headers = rows[0].map((header) => header.trim())
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))
  if (missingColumns.length) {
    throw new Error(`統計CSVに必須列がありません：${missingColumns.join('、')}`)
  }
  const records = rows.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new Error(`統計CSVの${rowIndex + 2}行目の列数が正しくありません。`)
    }
    return Object.fromEntries(headers.map((header, index) => [
      header,
      numericColumns.includes(header) ? toNumber(values[index]) : values[index].trim(),
    ]))
  })

  const duplicateCodes = records
    .map(({ ward_code: code }) => code)
    .filter((code, index, codes) => code && codes.indexOf(code) !== index)
  if (duplicateCodes.length) {
    throw new Error(`統計CSVの地域コードが重複しています：${[...new Set(duplicateCodes)].join('、')}`)
  }
  if (records.some(({ ward_code: code }) => !/^\d{5}$/.test(code))) {
    throw new Error('統計CSVの地域コードは5桁の文字列で指定してください。')
  }
  if (!numericColumns.some((column) => records.some((record) => record[column] !== null))) {
    throw new Error('統計CSVに利用できる数値がありません。')
  }
  if (records.length !== 8) console.warn(`統計CSVは8区分を想定しています（実際：${records.length}行）。`)

  return { records, headers }
}
