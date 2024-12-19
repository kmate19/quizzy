<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  const canvas = ref<HTMLCanvasElement | null>(null)
  let ctx: CanvasRenderingContext2D | null = null
  let animationFrameId: number | null = null
  let particles: Particle[] = []
  let mouseX = 0
  let mouseY = 0

  const props = defineProps({
    particleCount: {
      type: Number,
      default: 50
    }
  })
  const PARTICLE_COUNT = props.particleCount
  const PARTICLE_BASE_RADIUS = 100
  const PARTICLE_VARIANCE = 50
  const PARTICLE_SPEED = 0.2
  const MOUSE_INFLUENCE_DISTANCE = 200
  const MOUSE_REPEL_SPEED = 0.3

  const COLORS: [number, number, number][] = [
    [0, 100, 0],    // Dark Green
    [0, 0, 100],    // Dark Blue
    [100, 0, 0],    // Dark Red
    [100, 100, 0]   // Dark Yellow
  ]

  class Particle {
    x: number
    y: number
    baseX: number
    baseY: number
    radius: number
    vx: number
    vy: number
    alpha: number
    color: [number, number, number]

    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.baseX = x
      this.baseY = y
      this.radius = PARTICLE_BASE_RADIUS + Math.random() * PARTICLE_VARIANCE
      this.vx = (Math.random() - 0.5) * PARTICLE_SPEED
      this.vy = (Math.random() - 0.5) * PARTICLE_SPEED
      this.alpha = Math.random() * 0.15 + 0.05
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    update() {
      this.x += this.vx
      this.y += this.vy

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

      this.alpha += (Math.random() - 0.5) * 0.01
      this.alpha = Math.max(0.05, Math.min(0.2, this.alpha))
    }

    draw() {
      if (!ctx) return

      ctx.beginPath()
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
      gradient.addColorStop(0, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`)
      gradient.addColorStop(1, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0)`)
      ctx.fillStyle = gradient
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
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
    if (!ctx || !canvas.value) return

    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

    particles.forEach(particle => {
      particle.update()
      particle.draw()
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  function handleMouseMove(event: MouseEvent) {
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
    if (canvas.value) {
      ctx = canvas.value.getContext('2d')
      handleResize()

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('resize', handleResize)

      animate()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', handleResize)
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })
</script>

<template>
  <div class="mist-background-container">
    <canvas ref="canvas" class="mist-canvas"></canvas>
    <div class="mist-content-wrapper">
    </div>
  </div>
</template>
<style scoped>
.mist-background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  background-color: #0a0a0a;
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