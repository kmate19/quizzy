<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  const canvas = ref<HTMLCanvasElement | null>(null)
  let ctx: CanvasRenderingContext2D | null = null
  let animationFrameId: number | null = null
  let particles: Particle[] = []

  let time = 0


  const PARTICLE_COUNT = 80
  const PARTICLE_BASE_RADIUS = 80
  const PARTICLE_VARIANCE = 40
  const PARTICLE_SPEED = 0.3

  const COLORS: [number, number, number][] = [
    [220, 20, 60],
    [65, 105, 225],
    [255, 215, 0],
    [0, 200, 80]
  ]

  function getColorForPosition(x: number, y: number): [number, number, number] {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    
    if (x <= screenWidth / 2 && y <= screenHeight / 2) {
      return COLORS[0];
    } 
    else if (x > screenWidth / 2 && y <= screenHeight / 2) {
      return COLORS[1];
    } 
    else if (x <= screenWidth / 2 && y > screenHeight / 2) {
      return COLORS[2];
    } 
    else {
      return COLORS[3];
    }
  }

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
    pulseSpeed: number
    pulseSize: number
    initialRadius: number
    
    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.baseX = x
      this.baseY = y
      this.initialRadius = PARTICLE_BASE_RADIUS + Math.random() * PARTICLE_VARIANCE
      this.radius = this.initialRadius
      this.vx = (Math.random() - 0.5) * PARTICLE_SPEED
      this.vy = (Math.random() - 0.5) * PARTICLE_SPEED
      this.alpha = Math.random() * 0.2 + 0.1
      this.color = getColorForPosition(x, y)
      this.pulseSpeed = 0.01 + Math.random() * 0.02
      this.pulseSize = Math.random() * 0.2 + 0.1
    }

    update() {
      this.x += this.vx
      this.y += this.vy

      this.radius = this.initialRadius + Math.sin(time * this.pulseSpeed) * (this.initialRadius * this.pulseSize)

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
      this.alpha = Math.max(0.1, Math.min(0.3, this.alpha))
      
      this.color = getColorForPosition(this.x, this.y)
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
  function drawQuizzyText() {
    if (!ctx || !canvas.value) return
    
    const text = "Quizzy"
    const fontSize = "10vw"
    ctx.font = `bold ${fontSize} Montserrat, Arial, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    const centerX = canvas.value.width * 0.1
    const startY = canvas.value.height * 0.2
    const letterSpacing = canvas.value.height * 0.12
    
    const glowColor = `rgba(148, 0, 211, ${0.3 + Math.sin(time * 0.05) * 0.1})`
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 20 + Math.sin(time * 0.1) * 5
    ctx.fillStyle = "rgba(148, 0, 211, 0.8)"
    
    for (let i = 0; i < text.length; i++) {
      const y = startY + i * letterSpacing
      ctx.fillText(text[i], centerX, y)
    }
    
    ctx.shadowBlur = 0
  }

  function animate() {
    if (!ctx || !canvas.value) return
    
    time += 0.01
    
    ctx.fillStyle = 'rgba(15, 15, 30, 0.15)'
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

    particles.forEach(particle => {
      particle.update()
      particle.draw()
    })
    
    drawQuizzyText()

    animationFrameId = requestAnimationFrame(animate)
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
      window.addEventListener('resize', handleResize)

      animate()
    }
  })

  onUnmounted(() => {
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
      <slot></slot>
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
  background-color: #0f0f1e;
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