import { type IGroupResponseItem } from "~/api/group/getAll"
import type { ServiceProps } from "~/components/Service/TheService.vue"

export default function useSelectOnlySensors (group:IGroupResponseItem, arr:ServiceProps[] = []) {
  arr.push(...group.devices.filter(el => el.id.includes('_sen') || el.type.includes('temp') || el.type.includes('therm')))
  group.inverseParent?.forEach(el => useSelectOnlySensors(el, arr))
  return arr
}
