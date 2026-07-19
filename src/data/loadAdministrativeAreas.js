const DATA_URL = `${import.meta.env.BASE_URL}data/N03-20260101_34.geojson`
const EXPECTED_WARD_COUNT = 8
const SUPPORTED_GEOMETRIES = new Set(['Polygon', 'MultiPolygon'])

export async function loadAdministrativeAreas(url = DATA_URL) {
  let response
  try {
    response = await fetch(url)
  } catch (error) {
    throw new Error('行政区データの取得に失敗しました。', { cause: error })
  }

  if (!response.ok) {
    throw new Error(`行政区データの取得に失敗しました（HTTP ${response.status}）。`)
  }

  let geojson
  try {
    geojson = await response.json()
  } catch (error) {
    throw new Error('行政区データをJSONとして解析できませんでした。', {
      cause: error,
    })
  }

  if (geojson?.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error('行政区データがFeatureCollection形式ではありません。')
  }

  const cityFeatures = geojson.features.filter(
    (feature) => feature?.properties?.N03_004 === '広島市',
  )
  if (cityFeatures.length === 0) {
    throw new Error('行政区データに広島市のFeatureがありません。')
  }

  const usableFeatures = cityFeatures.filter((feature, index) => {
    const properties = feature?.properties
    const valid =
      properties?.N03_005 &&
      properties?.N03_007 &&
      feature.geometry &&
      SUPPORTED_GEOMETRIES.has(feature.geometry.type)
    if (!valid) {
      console.warn(`広島市Feature ${index} は必須属性またはGeometryが不完全なため除外します。`)
    }
    return valid
  })

  if (usableFeatures.length === 0) {
    throw new Error('表示できる広島市の行政区Featureがありません。')
  }

  const wardCodes = [...new Set(usableFeatures.map(({ properties }) => properties.N03_007))].sort()
  if (wardCodes.length !== EXPECTED_WARD_COUNT) {
    console.warn(`広島市の区コード数が想定と異なります（想定: ${EXPECTED_WARD_COUNT}、実際: ${wardCodes.length}）。`)
  }
  if (usableFeatures.length !== cityFeatures.length) {
    console.warn(`広島市Feature ${cityFeatures.length}件のうち${usableFeatures.length}件を表示します。`)
  }

  return {
    featureCollection: { type: 'FeatureCollection', features: usableFeatures },
    wardCodes,
    sourceFeatureCount: geojson.features.length,
    cityFeatureCount: cityFeatures.length,
  }
}

