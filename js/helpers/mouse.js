export function getMouseX(e) {
  return (e.clientX / window.innerWidth) * 2 - 1
}

export function getMouseY(e) {
  return -(e.clientY / window.innerHeight) * 2 + 1
}
