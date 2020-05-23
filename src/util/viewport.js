export function isMobile () {
  return window.matchMedia('(max-width: 768px)').matches
}

export function isMobileLandscape () {
  return window.matchMedia('(min-width: 320px) and (max-width: 900px) and (orientation: landscape)').matches
}