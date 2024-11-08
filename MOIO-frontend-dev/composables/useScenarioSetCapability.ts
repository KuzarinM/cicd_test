import type { ICapability, ServiceProps } from "~/components/Service/TheService.vue"

export default function useScenarioSetCapability (data: ICapability, capabilities: { [p: string]: ServiceProps[] }) {
  // TODO: Проверка нужна для разделения монолита и микро-сервисов
  // В дальнейшем от этого необходимо избавиться
  if (data.chanel === data.deviceId) {
    // Находим capability, нужную для изменения
    const capabilityId = capabilities[data.deviceId]
      ?.findIndex(el => el.type === data.type)

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
      const colorId = capabilities[data.deviceId]
        ?.findIndex(el => el.type === 'devices.capabilities.color_setting')

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
  } else {
    const capabilityIdx = capabilities[data.deviceId + '_ch' + data.chanel]
      .findIndex(el => el.type === data.type)
    capabilities[data.deviceId + '_ch' + data.chanel][capabilityIdx] = {
      ...capabilities[data.deviceId + '_ch' + data.chanel][capabilityIdx],
      value: data.value,
      hsv: data.hsv,
      range: data.range,
      instance: data.instance,
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
}
