const PANEL_OPEN_EVENT = 'map-panel-open'

export function createWardPanelToggle() {
  const panel = document.querySelector('#ward-panel')
  const toggle = document.querySelector('#ward-panel-toggle')
  const label = toggle.querySelector('.ward-panel-toggle__label')

  const setOpen = (open) => {
    panel.hidden = !open
    toggle.setAttribute('aria-expanded', String(open))
    toggle.classList.toggle('is-active', open)
    label.textContent = open ? 'とじる' : 'データをえらぶ'
  }

  const open = () => {
    setOpen(true)
    document.dispatchEvent(new CustomEvent(PANEL_OPEN_EVENT, {
      detail: { panelId: panel.id },
    }))
  }

  toggle.addEventListener('click', () => {
    if (panel.hidden) {
      open()
    } else {
      setOpen(false)
    }
  })
  document.addEventListener(PANEL_OPEN_EVENT, (event) => {
    if (event.detail.panelId !== panel.id) setOpen(false)
  })

  return {
    open,
    close: () => setOpen(false),
  }
}
