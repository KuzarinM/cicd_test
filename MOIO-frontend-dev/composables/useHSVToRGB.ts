export default function useHSVToRGB (hue:number, saturation:number, value:number) {
  const d = 0.0166666666666666 * hue
  let c = value * saturation
  let x = c - c * Math.abs(d % 2.0 - 1.0)
  const m = value - c
  c += m
  x += m
  switch (d >>> 0) {
    case 0: return { red: c, green: x, blue: m }
    case 1: return { red: x, green: c, blue: m }
    case 2: return { red: m, green: c, blue: x }
    case 3: return { red: m, green: x, blue: c }
    case 4: return { red: x, green: m, blue: c }
  }
  return { red: c, green: m, blue: x }
}
