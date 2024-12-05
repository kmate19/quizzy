<template>
  <div class="mist-background-container">
    <canvas ref="canvas" class="mist-canvas"></canvas>
    <div class="mist-content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animationFrameId = null
let particles = []
let mouseX = 0
let mouseY = 0

const PARTICLE_COUNT = 20
const PARTICLE_BASE_RADIUS = 150
const PARTICLE_VARIANCE = 100
const PARTICLE_SPEED = 0.1
const MOUSE_INFLUENCE_DISTANCE = 300
const MOUSE_REPEL_SPEED = 0.5

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.baseX = x
    this.baseY = y
    this.radius = PARTICLE_BASE_RADIUS + Math.random() * PARTICLE_VARIANCE
    this.vx = (Math.random() - 0.5) * PARTICLE_SPEED
    this.vy = (Math.random() - 0.5) * PARTICLE_SPEED
    this.alpha = Math.random() * 0.3 + 0.1
    this.angle = Math.random() * Math.PI * 2
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.angle += 0.01

    const dx = mouseX - this.x
    const dy = mouseY - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < MOUSE_INFLUENCE_DISTANCE) {
      const angle = Math.atan2(dy, dx)
      const force = (MOUSE_INFLUENCE_DISTANCE - distance) / MOUSE_INFLUENCE_DISTANCE
      this.vx -= Math.cos(angle) * force * MOUSE_REPEL_SPEED
      this.vy -= Math.sin(angle) * force * MOUSE_REPEL_SPEED
    }

    const homeX = this.baseX - this.x
    const homeY = this.baseY - this.y
    this.vx += homeX * 0.003
    this.vy += homeY * 0.003

    this.vx *= 0.99
    this.vy *= 0.99

    if (this.x < -this.radius) this.x = window.innerWidth + this.radius
    if (this.x > window.innerWidth + this.radius) this.x = -this.radius
    if (this.y < -this.radius) this.y = window.innerHeight + this.radius
    if (this.y > window.innerHeight + this.radius) this.y = -this.radius

    this.alpha += (Math.random() - 0.5) * 0.005
    this.alpha = Math.max(0.1, Math.min(0.4, this.alpha))
  }

  draw() {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius)
    gradient.addColorStop(0, `rgba(147, 112, 219, ${this.alpha})`)
    gradient.addColorStop(0.5, `rgba(147, 112, 219, ${this.alpha * 0.5})`)//EGESZ ELTUNIK HA NULLOZOD
    gradient.addColorStop(1, 'rgba(147, 112, 219, 0)')

    ctx.beginPath()
    ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.restore()
  }
}

function createParticles() {
  particles = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(
      new Particle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight
      )
    )
  }
}

function animate() {
  ctx.fillStyle = 'rgba(25, 10, 41, 0.03)'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  particles.forEach(particle => {
    particle.update()
    particle.draw()
  })

  animationFrameId = requestAnimationFrame(animate)
}

function handleMouseMove(event) {
  mouseX = event.clientX
  mouseY = event.clientY
}

function handleResize() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    createParticles()
  }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  handleResize()
  
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
  
  animate()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.mist-background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.mist-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.mist-content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  pointer-events: auto;
}
</style>