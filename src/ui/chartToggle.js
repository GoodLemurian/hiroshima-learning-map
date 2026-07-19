export function createChartToggle() {
  const button = document.querySelector('#chart-toggle')
  const chart = document.querySelector('#chart-panel')

  const setOpen = (open) => {
    chart.hidden = !open
    button.setAttribute('aria-expanded', String(open))
    button.textContent = open ? 'グラフをかくす' : 'グラフを表示する'
  }

  button.addEventListener('click', () => setOpen(chart.hidden))
  setOpen(false)

  return {
    setVisible(visible) {
      button.hidden = !visible
      if (!visible) setOpen(false)
    },
  }
}
