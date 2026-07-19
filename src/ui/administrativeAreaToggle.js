export function createAdministrativeAreaToggle(onChange) {
  const toggle = document.querySelector('#wards-toggle')
  toggle.addEventListener('change', () => onChange(toggle.checked))
}

