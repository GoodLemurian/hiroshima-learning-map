const DATA_URL = `${import.meta.env.BASE_URL}data/opendata_110/D_20240324_224453_7856009C.geojson`

export async function loadSchoolDistricts(url = DATA_URL) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`小学校区データの取得に失敗しました（HTTP ${response.status}）。`)
  const featureCollection = await response.json()
  if (featureCollection?.type !== 'FeatureCollection' || !Array.isArray(featureCollection.features)) {
    throw new Error('小学校区データがFeatureCollection形式ではありません。')
  }
  return featureCollection
}

export function findNumericPropertyDefinitions(featureCollection) {
  const definitions = {}
  const propertyNames = new Set(featureCollection.features.flatMap((feature) => Object.keys(feature.properties || {})))
  propertyNames.forEach((property) => {
    const values = featureCollection.features
      .map((feature) => feature.properties?.[property])
      .filter((value) => value !== null && value !== undefined && value !== '')
    if (values.length && values.every((value) => typeof value === 'number' && Number.isFinite(value))) {
      definitions[property] = {
        label: property,
        unit: '',
        property,
        maximumFractionDigits: values.some((value) => !Number.isInteger(value)) ? 2 : 0,
      }
    }
  })
  return definitions
}
