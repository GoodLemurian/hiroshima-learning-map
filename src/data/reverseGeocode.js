const API_URL = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress'

export async function reverseGeocode(lng, lat) {
  const url = new URL(API_URL)
  url.searchParams.set('lon', lng)
  url.searchParams.set('lat', lat)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`住所の取得に失敗しました（HTTP ${response.status}）。`)
  const data = await response.json()
  if (!data?.results) throw new Error('住所を取得できませんでした。')
  return data.results
}
