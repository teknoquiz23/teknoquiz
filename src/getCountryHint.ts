export function getCountryHint(roundInfo: { [key: string]: string }): string {
  const country = roundInfo['Country']
  if (country && country.length > 0) {
    return `💡 The country starts with "${country[0].toUpperCase()}" and has ${country.length} letters.`
  }
  return ''
}
