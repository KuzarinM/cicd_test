import type { ICapability } from "~/api/automations/getById"

export const useDeviceCapabilityOnOff = (capabilities?: ICapability[]) => {
  const value = capabilities?.find(el => el.instance === 'open' || el.type.includes("on_off"))?.value
  if (typeof value === 'boolean') {
    return value ? 'вкл' : 'выкл'
  } else {
    return value === 'open' ? 'открыто' : 'закрыто'
  }
}
