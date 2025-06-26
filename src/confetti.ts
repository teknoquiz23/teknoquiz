export function loadAndTriggerConfetti() {
  if (!(window as any).confetti) {
    const script = document.createElement('script')
    script.src = '/canvas-confetti/dist/confetti.browser.js'
    script.onload = () => {
      if ((window as any).confetti) (window as any).confetti()
    }
    document.body.appendChild(script)
  } else {
    (window as any).confetti()
  }
}
