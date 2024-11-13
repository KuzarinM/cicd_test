import type { ICapability } from "~/api/automations/getById"
import type { ServiceProps } from "~/components/Service/TheService.vue"

export default function useScenarioSetCapability (data: ICapability & {deviceId: string}, capabilities: { [p: string]: ServiceProps[] }) {
    // Находим capability, нужную для изменения
  const capabilityId = capabilities[data.deviceId]?.findIndex(el => el.type === data.type)

  if (capabilityId > -1) {
    // Обновляем capability
    capabilities[data.deviceId][capabilityId] = {
      ...capabilities[data.deviceId][capabilityId],
      value: data.value,
      hsv: data.hsv,
      range: data.range,
      instance: data.instance,
    }
  }

  // Если изменение яркости, то ищем нужную capability
  if (data.instance === 'brightness') {
    const colorId = capabilities[data.deviceId]?.findIndex(el => el.type === 'devices.capabilities.color_setting')

    // Если нашли такой capability, то обновляем HSV
    if (colorId > -1) {
      capabilities[data.deviceId][colorId] = {
        ...capabilities[data.deviceId][colorId],
        hsv: {
          ...capabilities[data.deviceId][colorId].hsv,
          v: Number(data.value),
        },
      }
    }
  }
}
