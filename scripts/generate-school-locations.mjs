import { readFile, writeFile } from 'node:fs/promises'

const inputPaths = [
  'public/data/opendata_46.csv',
  'public/data/opendata_54.csv',
  'public/data/opendata_56.csv',
]
const outputPath = 'public/data/school-locations.geojson'

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted && character === '"' && text[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function toFeatures(text, inputPath) {
  const [headers, ...rows] = parseCsv(text.replace(/^\uFEFF/, ''))
  const longitudeIndex = headers.indexOf('経度')
  const latitudeIndex = headers.indexOf('緯度')
  if (longitudeIndex < 0 || latitudeIndex < 0) {
    throw new Error(`${inputPath} に経度・緯度列がありません。`)
  }

  return rows.map((values, rowIndex) => {
    const longitude = Number(values[longitudeIndex])
    const latitude = Number(values[latitudeIndex])
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      throw new Error(`${inputPath} の${rowIndex + 2}行目に有効な座標がありません。`)
    }
    const properties = Object.fromEntries(headers
      .map((header, index) => [header, values[index] ?? ''])
      .filter(([header]) => header !== '経度' && header !== '緯度'))
    return {
      type: 'Feature',
      properties,
      geometry: { type: 'Point', coordinates: [longitude, latitude] },
    }
  })
}

const featureGroups = await Promise.all(inputPaths.map(async (inputPath) => {
  const text = await readFile(inputPath, 'utf8')
  return toFeatures(text, inputPath)
}))
const featureCollection = {
  type: 'FeatureCollection',
  features: featureGroups.flat(),
}

await writeFile(outputPath, `${JSON.stringify(featureCollection, null, 2)}\n`)
console.log(`${outputPath} に ${featureCollection.features.length} 件を書き出しました。`)
