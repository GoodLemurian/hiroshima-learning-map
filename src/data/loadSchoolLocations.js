const DATA_URL = `${import.meta.env.BASE_URL}data/school-locations.geojson`

export async function loadSchoolLocations(url = DATA_URL) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`学校データの取得に失敗しました（HTTP ${response.status}）。`)
  const featureCollection = await response.json()
  if (featureCollection?.type !== 'FeatureCollection' || !Array.isArray(featureCollection.features)) {
    throw new Error('学校データがFeatureCollection形式ではありません。')
  }
  return featureCollection
}
