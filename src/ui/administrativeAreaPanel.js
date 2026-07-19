export function createAdministrativeAreaPanel() {
  const panel = document.querySelector('#administrative-area-info')

  return {
    showSelection(ward) {
      panel.classList.remove('is-error')
      if (!ward) {
        panel.innerHTML = '<p>地図の区をえらんでください</p>'
        return
      }
      panel.replaceChildren()
      const label = document.createElement('p')
      label.className = 'ward-info__label'
      label.textContent = '選んだ地域'
      const name = document.createElement('p')
      name.className = 'ward-info__name'
      name.textContent = ward.wardName
      const code = document.createElement('p')
      code.className = 'ward-info__code'
      code.textContent = `地域コード：${ward.wardCode}`
      panel.append(label, name, code)
    },
    showError() {
      panel.classList.add('is-error')
      panel.innerHTML = '<p>広島市の区データを読み込めませんでした</p>'
    },
  }
}
