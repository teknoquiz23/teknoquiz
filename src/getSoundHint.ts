export function getSoundHint(roundInfo: { [key: string]: string }): string {
  const sound = roundInfo['Sound system']
  if (sound && sound.length > 0) {
    return `💡 The Sound system starts with "${sound[0].toUpperCase()}".`
  }
  return ''
}
