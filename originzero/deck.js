const slides = Array.from(document.querySelectorAll('.slide'))
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Progress dots, one per slide.
const dots = document.querySelector('.dots')
slides.forEach((s, i) => {
  const li = document.createElement('li')
  const a = document.createElement('a')
  a.href = `#${s.id}`
  a.setAttribute('aria-label', `Slide ${i + 1}`)
  li.appendChild(a)
  dots.appendChild(li)
})
const dotLinks = Array.from(dots.querySelectorAll('a'))

const spy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const i = slides.indexOf(e.target)
      dotLinks.forEach((a, n) => a.setAttribute('aria-current', String(n === i)))
    }
  },
  { threshold: 0.5 },
)
slides.forEach((s) => spy.observe(s))

// Reveal on entry, staggered between siblings the way the reference does it.
if (!reduced) {
  const revealer = new IntersectionObserver(
    (entries, obs) => {
      const shown = entries.filter((e) => e.isIntersecting)
      shown.forEach((e, i) => {
        setTimeout(() => e.target.classList.add('in'), i * 80)
        obs.unobserve(e.target)
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  )
  document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el))
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
}

// Count up to the number already in the markup, so it reads correctly without JS.
const counters = new IntersectionObserver(
  (entries, obs) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const el = e.target
      obs.unobserve(el)
      const target = Number(el.textContent.trim())
      if (reduced || !Number.isFinite(target)) continue
      const started = performance.now()
      const tick = (now) => {
        const p = Math.min((now - started) / 1100, 1)
        // Same deceleration as the reference's reveal curve.
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = String(Math.round(target * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  },
  { threshold: 0.6 },
)
document.querySelectorAll('[data-count]').forEach((el) => counters.observe(el))

// Arrow and page keys move between slides.
function current() {
  const mid = window.innerHeight / 2
  return slides.findIndex((s) => {
    const r = s.getBoundingClientRect()
    return r.top <= mid && r.bottom > mid
  })
}
document.addEventListener('keydown', (e) => {
  const keysNext = ['ArrowDown', 'ArrowRight', 'PageDown']
  const keysPrev = ['ArrowUp', 'ArrowLeft', 'PageUp']
  if (![...keysNext, ...keysPrev].includes(e.key)) return
  const i = current()
  if (i < 0) return
  const next = keysNext.includes(e.key) ? i + 1 : i - 1
  if (next < 0 || next >= slides.length) return
  e.preventDefault()
  slides[next].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
})
