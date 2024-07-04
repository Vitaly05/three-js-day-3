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
    this.size = particleSize
    this.texture = particleTexture
  }
  async initAsync(scene) {
    const particleMaterial = new THREE.PointsMaterial({
      map: this.texture,
      size: this.size,
      color: this.color,
      blending: THREE.AdditiveBlending,
    })

    for (let i = 0; i < this.particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      const x = this.radius * Math.sin(phi) * Math.cos(theta)
      const y = this.radius * Math.sin(phi) * Math.sin(theta)
      const z = this.radius * Math.cos(phi)

      this.positions.push(x, y, z)
      this.angles.push({ theta: theta, phi: phi })
    }

    this.particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.positions, 3)
    )

    this.particles = new THREE.Points(this.particleGeometry, particleMaterial)
    this.particles.position.copy(this.particlesPosition)
    scene.add(this.particles)
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
  }
}
