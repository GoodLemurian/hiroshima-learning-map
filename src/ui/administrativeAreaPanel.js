export function createAdministrativeAreaPanel() {
  const panel = document.querySelector('#administrative-area-info')

  let selectedWard = null
  let definition = null
  let recordByCode = new Map()

  const render = () => {
    panel.classList.remove('is-error')
    if (!selectedWard) {
      panel.innerHTML = '<p>地図の区をえらんでください</p>'
      return
    }
    const value = recordByCode.get(selectedWard.wardCode)?.[definition?.key]
    const valueText = typeof value === 'number'
      ? `${new Intl.NumberFormat('ja-JP', { maximumFractionDigits: definition.maximumFractionDigits }).format(value)} ${definition.unit}`
      : 'この地域のデータはありません'
    panel.innerHTML = `
      <p class="ward-info__label">選んだ地域</p>
      <p class="ward-info__name"></p>
      <p class="ward-info__code"></p>
      <p class="ward-info__stat-label"></p>
      <p class="ward-info__stat-value"></p>
    `
    panel.querySelector('.ward-info__name').textContent = selectedWard.wardName
    panel.querySelector('.ward-info__code').textContent = `地域コード：${selectedWard.wardCode}`
    panel.querySelector('.ward-info__stat-label').textContent = definition.label
    panel.querySelector('.ward-info__stat-value').textContent = valueText
  }

  return {
    showSelection(ward) {
      selectedWard = ward
      render()
    },
    setStatistics(nextDefinition, nextRecordByCode) {
      definition = nextDefinition
      recordByCode = nextRecordByCode
      render()
    },
    showError() {
      panel.classList.add('is-error')
      panel.innerHTML = '<p>区や統計のデータを読み込めませんでした</p>'
    },
  }
}
