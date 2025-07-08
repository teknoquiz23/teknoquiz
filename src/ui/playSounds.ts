export function playErrorSound(triesUsed: number, maxTries: number) {
  if (triesUsed < maxTries) {
    const soundIndex = triesUsed > 12 ? 12 : triesUsed; // Use 12 if triesUsed > 12
    const audio = new Audio(`/sounds/error-sound-${soundIndex}.mp3`);
    audio.play();
  }
}

export function playWinnerSound() {
  const audio = new Audio(`/sounds/winner-sound.mp3`);
  audio.play();
}

export function playCorrectSound() {
  const audio = new Audio(`/sounds/correct-sound.mp3`);
  audio.play();
}

export function playHintSound() {
  // const audio = new Audio(`/sounds/hint-sound.mp3`);
  // audio.play();
}
