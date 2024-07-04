import { getMouseX, getMouseY } from './helpers/mouse'

export class CameraMoveEffect {
  constructor(camera, moveMultiple, rotateMultiple) {
    this.camera = camera
    this.initialCameraHeight = camera.position.y
    this.moveMultiple = moveMultiple
    this.maxRotateOffset = rotateMultiple
    this.onMouseMove = this.getOnMouseMoveHandler()
  }
  enable() {
    document.addEventListener('mousemove', this.onMouseMove)
  }
  disable() {
    document.removeEventListener('mousemove', this.onMouseMove)
  }
  getOnMouseMoveHandler() {
    return (e) => {
      const mouseX = getMouseX(e)
      const mouseY = getMouseY(e)
      const offsetMultiple = 0.5

      this.camera.position.x +=
        (mouseX * offsetMultiple - this.camera.position.x) * this.moveMultiple
      this.camera.position.y +=
        (mouseY * offsetMultiple +
          this.initialCameraHeight -
          this.camera.position.y) *
        this.moveMultiple

      this.camera.rotation.x = -mouseY * this.maxRotateOffset
      this.camera.rotation.y = mouseX * this.maxRotateOffset
    }
  }
}
