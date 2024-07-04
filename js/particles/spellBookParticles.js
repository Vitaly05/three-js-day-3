import * as THREE from 'three'

export class SpellBookParticles {
  constructor(
    radius,
    particlesCount,
    particlesPosition,
    particleSize,
    particleColor,
    particleTexture
  ) {
    this.particleGeometry = new THREE.BufferGeometry()
    this.particlesPosition = particlesPosition

    this.positions = []
    this.angles = []
    this.radius = radius
    this.particlesCount = particlesCount

    this.color = particleColor
    this.secondaryColor = 0x290050
    this.size = particleSize
    this.texture = particleTexture
  }
  init(scene) {
    const particleBaseMaterial = new THREE.PointsMaterial({
      map: this.texture,
      size: this.size,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })

    const baseColor = new THREE.Color(this.color)
    const secondaryColor = new THREE.Color(this.secondaryColor)
    const colors = []

    for (let i = 0; i < this.particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      const x = this.radius * Math.sin(phi) * Math.cos(theta)
      const y = this.radius * Math.sin(phi) * Math.sin(theta)
      const z = this.radius * Math.cos(phi)

      this.positions.push(x, y, z)
      this.angles.push({ theta: theta, phi: phi })

      if (i === 0) {
        colors.push(secondaryColor.r, secondaryColor.g, secondaryColor.b)
      } else {
        colors.push(baseColor.r, baseColor.g, baseColor.b)
      }
    }

    this.particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.positions, 3)
    )
    this.particleGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    )

    this.particles = new THREE.Points(
      this.particleGeometry,
      particleBaseMaterial
    )
    this.particles.position.copy(this.particlesPosition)

    this.pointLight = new THREE.PointLight(this.secondaryColor, 20)
    this.pointLight.position.set(
      this.particlesPosition.x + this.positions[0],
      this.particlesPosition.y + this.positions[1],
      this.particlesPosition.z + this.positions[2]
    )

    scene.add(this.particles, this.pointLight)
  }
  updateParticles() {
    if (!this.particles) {
      return
    }
    const positions = this.particles.geometry.attributes.position.array
    for (let i = 0; i < this.particlesCount; i++) {
      const index = i * 3

      this.angles[i].theta += 0.01
      this.angles[i].phi += 0.01

      const x =
        this.radius *
        Math.sin(this.angles[i].phi) *
        Math.cos(this.angles[i].theta)
      const y =
        this.radius *
        Math.sin(this.angles[i].phi) *
        Math.sin(this.angles[i].theta)
      const z = this.radius * Math.cos(this.angles[i].phi)

      positions[index] = x
      positions[index + 1] = y
      positions[index + 2] = z
    }

    this.particles.geometry.attributes.position.needsUpdate = true

    this.pointLight.position.set(
      this.particlesPosition.x + positions[0],
      this.particlesPosition.y + positions[1],
      this.particlesPosition.z + positions[2]
    )
  }
}
