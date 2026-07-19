const PANEL_OPEN_EVENT = 'map-panel-open'

export function createBaseMapPanelToggle() {
  const panel = document.querySelector('#base-map-panel')
  const toggle = document.querySelector('#base-map-panel-toggle')
  const label = toggle.querySelector('.base-map-panel-toggle__label')

  const setOpen = (open) => {
    panel.hidden = !open
    toggle.setAttribute('aria-expanded', String(open))
    toggle.classList.toggle('is-active', open)
    label.textContent = open ? 'とじる' : '地図の種類'
  }

  toggle.addEventListener('click', () => {
    const willOpen = panel.hidden
    setOpen(willOpen)
    if (willOpen) {
      document.dispatchEvent(new CustomEvent(PANEL_OPEN_EVENT, {
        detail: { panelId: panel.id },
      }))
    }
  })
  document.addEventListener(PANEL_OPEN_EVENT, (event) => {
    if (event.detail.panelId !== panel.id) setOpen(false)
  })
}
