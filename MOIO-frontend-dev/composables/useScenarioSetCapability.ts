import type { ICapability, ServiceProps } from "~/components/Service/TheService.vue"


export default function useScenarioSetCapability (data:ICapability, capabilities:{[p: string]: ServiceProps[]}) {
  const capabilityIdx = capabilities[data.deviceId + '_ch' + data.chanel].findIndex(el => el.type === data.type)
  capabilities[data.deviceId + '_ch' + data.chanel][capabilityIdx] = {
    ...capabilities[data.deviceId + '_ch' + data.chanel][capabilityIdx],
    value: data.value,
    hsv: data.hsv,
    range: data.range,
  }
  if (data.instance?.includes('bright')) {
    const colorCapabilityIdx = capabilities[data.deviceId + '_ch' + data.chanel]
      ?.findIndex(el => el.type.includes('color'))
    if (colorCapabilityIdx > -1) {
      capabilities[data.deviceId + '_ch' + data.chanel][colorCapabilityIdx] = {
        ...capabilities[data.deviceId + '_ch' + data.chanel][colorCapabilityIdx],
        hsv: {
          ...capabilities[data.deviceId + '_ch' + data.chanel][colorCapabilityIdx].hsv,
          v: Number(data.value),
        },
      }
    }
  }
}
