const MODE_HELP = {
  point: '地図を1回おして、場所にしるしをつけよう。',
  linestring: '道にそっておし、最後は同じ場所を2回おそう。',
  polygon: '場所をかこみ、最初の場所をもう一度おそう。',
  select: 'かいたものをえらぶと、動かしたり形を直したりできます。',
}
const PANEL_OPEN_EVENT = 'map-panel-open'

export function createDrawingPanel({ state, onMode, onDelete, onClear }) {
  const panel = document.querySelector('#drawing-panel')
  const toggle = document.querySelector('#drawing-panel-toggle')
  const toggleLabel = toggle.querySelector('.drawing-panel-toggle__label')
  const status = document.querySelector('#drawing-status')
  const count = document.querySelector('#drawing-count')

  const setOpen = (willOpen) => {
    panel.hidden = !willOpen
    toggle.setAttribute('aria-expanded', String(willOpen))
    toggle.classList.toggle('is-active', willOpen)
    toggleLabel.textContent = willOpen ? 'とじる' : '地図にかく'
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

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]')
    if (!button) return

    const { action, mode } = button.dataset
    if (action === 'mode') onMode(mode)
    if (action === 'delete') onDelete()
    if (action === 'clear') onClear()
  })

  return state.subscribe(({ mode, selectedFeatureId, count: featureCount }) => {
    panel.querySelectorAll('[data-action="mode"]').forEach((button) => {
      const active = button.dataset.mode === mode
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
    })
    count.textContent = `かいたもの：${featureCount}こ`
    document.querySelector('[data-action="clear"]').disabled = featureCount === 0
    status.textContent = selectedFeatureId
      ? 'えらびました。動かして直すか、「けす」をおせます。'
      : MODE_HELP[mode]
  })
}
