import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import {
  vaseUrl,
  teaTableUrl,
  classicConsoleUrl,
  woodenCrateUrl,
  spellBookUrl,
  environmentUrl,
  particle1Url,
} from '../data/urls'
import { getRadFromAngle } from './helpers/angle'
import { SpellBookParticles } from './particles/spellBookParticles'

export class Scene3D {
  async initAsync() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.aspectRatio = this.width / this.height

    this.gltfLoader = new GLTFLoader()
    this.rgbeLoader = new RGBELoader()
    this.textureLoader = new THREE.TextureLoader()

    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initLight()
    this.initFloor()
    await this.initModelsAsync()
    await this.initBookParticlesAsync()
  }
  initScene() {
    this.scene = new THREE.Scene()
    this.rgbeLoader.load(environmentUrl, (texture) => {
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
      this.spellBookParticles?.updateParticles()

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
  async initModelsAsync() {
    const vase = await this.loadGltfAsync(vaseUrl)
    vase.scale.multiplyScalar(5)
    vase.position.set(3, 1.5, 5)

    const teaTable = await this.loadGltfAsync(teaTableUrl)
    teaTable.scale.multiplyScalar(3)
    teaTable.position.set(3, 0, 5)

    const classicConsole = await this.loadGltfAsync(classicConsoleUrl)
    classicConsole.scale.multiplyScalar(1.5)
    classicConsole.position.set(-3, 0, 5)
    classicConsole.rotation.y = getRadFromAngle(45)

    const woodenCrate = await this.loadGltfAsync(woodenCrateUrl)
    woodenCrate.scale.multiplyScalar(1.5)
    woodenCrate.position.set(0, 0, 6)
    woodenCrate.rotation.y = getRadFromAngle(-10)

    this.spellBook = await this.loadGltfAsync(spellBookUrl)
    this.spellBook.scale.multiplyScalar(2)
    this.spellBook.position.set(0, 2, 7)

    this.scene.add(vase, teaTable, classicConsole, woodenCrate, this.spellBook)
  }
  async initBookParticlesAsync() {
    const particlesPosition = this.spellBook.position.clone()
    particlesPosition.y += 0.5
    const particleTexture = await this.textureLoader.loadAsync(particle1Url)
    this.spellBookParticles = new SpellBookParticles(
      1.2,
      30,
      particlesPosition,
      0.1,
      0xffff00,
      particleTexture
    )
    this.spellBookParticles.init(this.scene)
  }
  async loadGltfAsync(url) {
    const data = await this.gltfLoader.loadAsync(url)
    return data.scene
  }
  debugToggleGlobalLight() {
    return (isShown) => {
      if (isShown) {
        this.scene.add(this.light)
      } else {
        this.scene.remove(this.light)
      }
    }
  }
}
