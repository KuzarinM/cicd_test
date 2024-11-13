import type { ICapability } from "~/api/automations/getById"

export const useDeviceCapabilitiesValues = (capabilities?: ICapability[]) => {
  const values = capabilities?.filter(el => el.instance != 'open' && el.instance !== 'temperature' && !el.type.includes("on_off"))
  return values?.map((el: ICapability) => {
    if (el.value) {
      return { value: `${el.value}${el.instance == 'brightness' ? '%' : '°C'}` }
    }
    if (el.hsv) {
      return useHSVToRGB(el.hsv.h, el.hsv.s, el.hsv.v)
    }
  })
}
