// Returns a random party image filename from the provided array
export function getRandomPartyImage(arr: string | any[]) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length)
  return arr[idx]
}
