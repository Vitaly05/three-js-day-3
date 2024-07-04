import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import {
  vaseUrl,
  teaTableUrl,
  classicConsoleUrl,
  woodenCrateUrl,
  spellBookUrl,
  pureSkyUrl,
} from '../data/urls'
import { getRadFromAngle } from './helpers/angle'

export class Scene3D {
  init() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.aspectRatio = this.width / this.height

    this.gltfLoader = new GLTFLoader()
    this.rgbeLoader = new RGBELoader()

    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initLight()
    this.initFloor()
    this.initModels()
  }
  initScene() {
    this.scene = new THREE.Scene()
    this.rgbeLoader.load(pureSkyUrl, (texture) => {
      this.scene.background = texture
      this.scene.environment = texture
    })
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(90, this.aspectRatio, 0.1, 1000)
    this.camera.position.set(0, 3, 10)
    this.camera.lookAt(0, 0, 0)
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
    this.light.position.set(5, 10, 2)
    this.scene.add(this.light)
  }
  initFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x741a1a })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = getRadFromAngle(-90)
    floor.position.z = 5
    this.scene.add(floor)
  }
  initModels() {
    this.loadGltf(vaseUrl, (model) => {
      model.scale.multiplyScalar(5)
      model.position.set(3, 1.5, 5)
    })
    this.loadGltf(teaTableUrl, (model) => {
      model.scale.multiplyScalar(3)
      model.position.set(3, 0, 5)
    })
    this.loadGltf(classicConsoleUrl, (model) => {
      model.scale.multiplyScalar(1.5)
      model.position.set(-3, 0, 5)
      model.rotation.y = getRadFromAngle(45)
    })
    this.loadGltf(woodenCrateUrl, (model) => {
      model.scale.multiplyScalar(1.5)
      model.position.set(0, 0, 6)
      model.rotation.y = getRadFromAngle(-10)
    })
    this.loadGltf(spellBookUrl, (model) => {
      model.scale.multiplyScalar(2)
      model.position.set(0, 2, 7)
    })
  }
  loadGltf(url, modifier) {
    this.gltfLoader.load(url, (data) => {
      const model = data.scene
      if (modifier) {
        modifier(model)
      }
      this.scene.add(model)
    })
  }
}
