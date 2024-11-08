import type { TUiIconNames } from "#build/types/ui-icon"

export default function useIcoByDeviceType (type:string):{name:TUiIconNames, code?:string} {
  if (!type) { return { name: 'service/other/help', code: '\\F02D6' } }
  switch (type) {
    case 'devices.types.socket':
      return { name: 'service/devices/power-socket-eu', code: '\\F07E7' }
    case 'devices.types.sensor.button':
      return { name: 'service/sensor/gesture-tap', code: '\\F07E7' }
    case 'devices.types.switch':
      return { name: 'service/devices/power', code: '\\F0425' }
    case 'devices.types.openable.lock':
      return { name: 'service/devices/lock-outline', code: '\\F0341' }
    case 'devices.types.light':
      return { name: 'service/devices/lightbulb-variant-outline', code: '\\F1803' }
    case 'devices.types.thermostat':
      return { name: 'service/devices/thermometer', code: '\\F050F' }
    case 'devices.types.openable.valve':
      return { name: 'service/devices/water-outline', code: '\\F0E0A' }
    case 'devices.types.openable.garage':
      return { name: 'service/devices/garage-variant', code: '\\F12D3' }
    default:
      if (type.includes('devices.types.sensor')) {
        return { name: 'service/sensor/access-point', code: "\\F0003" }
      }
      return { name: 'service/other/help', code: '\\F02D6' }
  }
}
