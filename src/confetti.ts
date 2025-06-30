export function loadAndTriggerConfetti() {
  function randomConfetti() {
    if ((window as any).confetti) {
      // Randomize confetti parameters
      (window as any).confetti({
        particleCount: Math.floor(Math.random() * 100) + 50, // 50-150 particles
        spread: Math.floor(Math.random() * 120) + 60, // 60-180 degrees
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5 // top half of the screen
        },
        angle: Math.floor(Math.random() * 90) + 45, // 45-135 degrees
        scalar: Math.random() * 0.6 + 0.7 // 0.7-1.3 size
      });
    }
  }
  function loopConfetti() {
    randomConfetti();
    const nextDelay = Math.random() * 2000 + 1000; // 1000-3000 ms
    setTimeout(loopConfetti, nextDelay);
  }
  if (!(window as any).confetti) {
    const script = document.createElement('script');
    script.src = '/canvas-confetti/dist/confetti.browser.js';
    script.onload = () => {
      loopConfetti();
    };
    document.body.appendChild(script);
  } else {
    loopConfetti();
  }
}
