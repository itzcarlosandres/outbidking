import confetti from "canvas-confetti"

export function firePodiumConfetti() {
  const count = 180
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 9999,
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ["#FF4A1C", "#FFD700", "#FF6B00", "#FF3366", "#10B981", "#3B82F6"],
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export function fireSideCannons() {
  const end = Date.now() + 1.5 * 1000
  const colors = ["#FF4A1C", "#FFD700", "#FFA500", "#FF3366"]

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      zIndex: 9999,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      zIndex: 9999,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

export function fireStarsExplosion() {
  confetti({
    particleCount: 40,
    spread: 360,
    ticks: 60,
    origin: { y: 0.6 },
    shapes: ["star"],
    colors: ["#FFE600", "#FF4A1C", "#FFAA00", "#FFFFFF"],
    zIndex: 9999,
  })
}
