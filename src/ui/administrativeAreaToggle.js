export function createAdministrativeAreaToggle(onChange) {
  const toggles = document.querySelectorAll('input[name="geojson-layer"]')
  toggles.forEach((toggle) => {
    toggle.addEventListener('change', () => {
      if (toggle.checked) onChange(toggle.value)
    })
  })
}
