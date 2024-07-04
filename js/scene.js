import * as THREE from 'three'

export class Scene3D {
  init() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.aspectRatio = this.width / this.height

    this.scene = new THREE.Scene()

    this.initCamera()
    this.initRenderer()
    this.initLight()
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(90, this.aspectRatio, 0.1, 1000)
    this.camera.position.set(0, 2, 10)
  }
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setAnimationLoop(this.rendererAnimationCallback())
    document.body.appendChild(this.renderer.domElement)
  }
  rendererAnimationCallback() {
    return () => {
      this.renderer.render(this.scene, this.camera)
    }
  }
  initLight() {
    this.light = new THREE.DirectionalLight(0xffffff, 2)
    this.light.position.set(2, 2, 2)
    this.scene.add(this.light)
  }
}
