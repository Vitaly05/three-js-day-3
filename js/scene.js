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
    this.initShaderCube()
    this.initParticleCube()

    this.addCameraMoveEffect()
    this.addResizeEventListener()
  }
  initScene() {
    this.scene = new THREE.Scene()
    this.rgbeLoader.load(environmentUrl, (texture) => {
      const skyGeometry = new THREE.SphereGeometry(500, 60, 40)
      const skyMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      })
      const sky = new THREE.Mesh(skyGeometry, skyMaterial)
      this.scene.add(sky)
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
      if (this.cubeWithShader) {
        const time = performance.now()
        this.cubeWithShader.material.uniforms.time.value = time * 0.005
      }

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
  initShaderCube() {
    const vertexCount = 100 * 3
    const positions = []
    const colors = []

    for (let i = 0; i < vertexCount; i++) {
      positions.push(Math.random() - 0.5)
      positions.push(Math.random() - 0.5)
      positions.push(Math.random() - 0.5)

      colors.push(Math.random() * 255)
      colors.push(Math.random() * 255)
      colors.push(Math.random() * 255)
      colors.push(Math.random() * 255)
    }

    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3)
    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 4)

    colorAttribute.normalized = true // this will map the buffer values to 0.0f - +1.0f in the shader

    const cubeGeometry = new THREE.BufferGeometry()
    cubeGeometry.setAttribute('position', positionAttribute)
    cubeGeometry.setAttribute('color', colorAttribute)

    const cubeMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
      },
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      transparent: true,
    })

    this.cubeWithShader = new THREE.Mesh(cubeGeometry, cubeMaterial)
    this.cubeWithShader.position.set(-2, 5, 5)
    this.scene.add(this.cubeWithShader)
  }
  initParticleCube() {
    const particleBaseMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x0000ff,
    })

    const particleGeometry = new THREE.BufferGeometry()
    const cubeSize = 10
    const particlesCount = 100
    const step = (cubeSize * 3) / particlesCount
    const positions = []
    for (let x = 0; x <= cubeSize; x += step) {
      for (let y = 0; y <= cubeSize; y += step) {
        for (let z = 0; z <= cubeSize; z += step) {
          positions.push(x, y, z)
        }
      }
    }
    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    const particles = new THREE.Points(particleGeometry, particleBaseMaterial)
    particles.position.set(0, 10, 0)
    this.scene.add(particles)
  }
  addCameraMoveEffect() {
    this.cameraMoveEffect = new CameraMoveEffect(this.camera, 0.2, 0.1)
    this.cameraMoveEffect.enable()
  }
  async loadGltfAsync(url) {
    const data = await this.gltfLoader.loadAsync(url)
    return data.scene
  }
  addResizeEventListener() {
    addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight

      this.aspectRatio = this.width / this.height
      this.camera.aspect = this.aspectRatio
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
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
