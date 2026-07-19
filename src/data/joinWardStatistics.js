export function joinWardStatistics(featureCollection, records, definitions) {
  const recordByCode = new Map(records.map((record) => [String(record.ward_code), record]))
  const geoCodes = new Set(featureCollection.features.map(({ properties }) => String(properties.N03_007)))
  const csvCodes = new Set(recordByCode.keys())
  const missingInCsv = [...geoCodes].filter((code) => !csvCodes.has(code)).sort()
  const missingInGeoJson = [...csvCodes].filter((code) => !geoCodes.has(code)).sort()
  if (missingInCsv.length) console.warn(`GeoJSONにはあるが統計CSVにないコード：${missingInCsv.join('、')}`)
  if (missingInGeoJson.length) console.warn(`統計CSVにはあるがGeoJSONにないコード：${missingInGeoJson.join('、')}`)

  const features = featureCollection.features.map((feature) => {
    const record = recordByCode.get(String(feature.properties.N03_007))
    const statistics = Object.fromEntries(Object.entries(definitions).map(([key, definition]) => [
      definition.property,
      typeof record?.[key] === 'number' && Number.isFinite(record[key]) ? record[key] : null,
    ]))
    return { ...feature, properties: { ...feature.properties, ...statistics } }
  })
  return {
    featureCollection: { ...featureCollection, features },
    recordByCode,
    missingInCsv,
    missingInGeoJson,
  }
}
