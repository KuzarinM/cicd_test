export default function useHSVToRGB (hue:number, saturation:number, value:number, def?:boolean) {
  const f = def
  const d = 0.0166666666666666 * hue
  let c = value / 100 * saturation / 100
  let x = c - c * Math.abs(d % 2.0 - 1.0)
  const m = value / 100 - c
  c += m
  x += m
  switch (d >>> 0) {
    case 0: return { red: c, green: x, blue: m, def: f, h: hue, s: saturation, v: value }
    case 1: return { red: x, green: c, blue: m, def: f, h: hue, s: saturation, v: value }
    case 2: return { red: m, green: c, blue: x, def: f, h: hue, s: saturation, v: value }
    case 3: return { red: m, green: x, blue: c, def: f, h: hue, s: saturation, v: value }
    case 4: return { red: x, green: m, blue: c, def: f, h: hue, s: saturation, v: value }
  }
  return { red: c, green: m, blue: x, def: f, h: hue, s: saturation, v: value }
}
