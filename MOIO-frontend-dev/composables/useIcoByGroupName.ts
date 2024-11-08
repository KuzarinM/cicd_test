import type { TUiIconNames } from "#build/types/ui-icon"

export default function useIcoByGroupName (name:string):{name:TUiIconNames, code?:string} {
  if (!name) { return { name: 'service/other/help', code: '\\F02D6' } }
  switch (name.toLowerCase()) {
    case 'доступ':
      return { name: 'aside/secure', code: '\\' }
    case 'свет':
      return { name: 'aside/light', code: '\\' }
    case 'вода':
      return { name: 'aside/water', code: '\\' }
    case 'кнопки':
      return { name: 'service/sensor/gesture-tap', code: '\\' }
    case 'климат':
      return { name: 'aside/climate', code: '\\' }
    case 'датчики':
      return { name: 'service/sensor/leak', code: '\\' }
    case 'шторы':
      return { name: 'aside/window', code: '\\' }
    case 'розетки':
      return { name: 'aside/socket', code: '\\' }
    case '3':
    case 'комната':
      return { name: 'aside/room', code: '\\' }
    case '2':
    case 'этаж':
      return { name: 'aside/floor', code: '\\' }
    case '1':
    case 'дом':
      return { name: 'aside/home', code: '\\' }
    default:
      return { name: 'service/other/help', code: '\\F02D6' }
  }
}

