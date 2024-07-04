import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
  vaseUrl,
  teaTableUrl,
  classicConsoleUrl,
  woodenCrateUrl,
  spellBookUrl,
  environmentUrl,
  particle1Url,
  dragonModelUrl,
} from '../data/urls'
import { getRadFromAngle } from './helpers/angle'
import { SpellBookParticles } from './particles/spellBookParticles'
import { CameraMoveEffect } from './cameraMoveEffect'

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
    await this.initDragonModelAsync()

    this.addCameraMoveEffect()
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
  async initDragonModelAsync() {
    this.dragonGroup = new THREE.Group()
    const dragonModel = await this.loadGltfAsync(dragonModelUrl)
    dragonModel.traverse((object) => {
      if (object.isMesh) {
        if (object.name === 'Dragon') {
          object.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            attenuationColor: 0xe3b716,
            attenuationDistance: 0.4,
            transmission: 1,
            thickness: 3,
            roughness: 0,
            specularIntensity: 1,
          })
        }
      }
    })
    this.dragonGroup.position.set(0, 1, 10)

    const dragonLightTarget = new THREE.Object3D()
    dragonLightTarget.position.set(0, 1, 11)

    const dragonLight = new THREE.DirectionalLight(0x6fa8dc, 2)
    dragonLight.position.set(1, 1.3, 12)
    dragonLight.target = dragonLightTarget

    const dragonLight2 = new THREE.DirectionalLight(0xffff00, 1)
    dragonLight2.position.set(-2, 3, 12)
    dragonLight2.target = dragonLightTarget

    const dragonLight3 = new THREE.DirectionalLight(0xf44336, 1)
    dragonLight3.position.set(0, 3, 10.2)
    dragonLight3.target = dragonLightTarget

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target = this.dragonGroup.position
    this.controls.enabled = false

    this.dragonGroup.add(
      dragonModel,
      dragonLight,
      dragonLight2,
      dragonLight3,
      dragonLightTarget
    )
  }
  addCameraMoveEffect() {
    this.cameraMoveEffect = new CameraMoveEffect(this.camera, 0.2, 0.1)
    this.cameraMoveEffect.enable()
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
  debugToggleDragon() {
    return (isShown) => {
      if (isShown) {
        this.scene.add(this.dragonGroup)
        this.controls.enabled = true
        this.camera.position.set(0, 2.5, 13)
        this.cameraMoveEffect.disable()
      } else {
        this.scene.remove(this.dragonGroup)
        this.controls.enabled = false
        this.camera.position.set(0, 3, 10)
        this.camera.lookAt(0, 0, 0)
        this.cameraMoveEffect.enable()
      }
    }
  }
}
