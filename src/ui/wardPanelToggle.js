export function createWardPanelToggle() {
  const panel = document.querySelector('#ward-panel')
  const toggle = document.querySelector('#ward-panel-toggle')
  const label = toggle.querySelector('.ward-panel-toggle__label')

  const setOpen = (open) => {
    panel.hidden = !open
    toggle.setAttribute('aria-expanded', String(open))
    toggle.classList.toggle('is-active', open)
    label.textContent = open ? 'とじる' : 'GeoJSONをえらぶ'
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden))

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}
