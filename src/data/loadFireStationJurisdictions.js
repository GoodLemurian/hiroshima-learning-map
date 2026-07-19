const DATA_URL = `${import.meta.env.BASE_URL}data/P17-12_34_GML/P17-12_34_FireStationJurisdiction.geojson`

export async function loadFireStationJurisdictions(url = DATA_URL) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`消防署管轄区域データの取得に失敗しました（HTTP ${response.status}）。`)
  const featureCollection = await response.json()
  if (featureCollection?.type !== 'FeatureCollection' || !Array.isArray(featureCollection.features)) {
    throw new Error('消防署管轄区域データがFeatureCollection形式ではありません。')
  }
  return featureCollection
}
