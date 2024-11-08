import { type IGroupResponseItem } from "~/api/group/getAll"
import type { ServiceProps } from "~/components/Service/TheService.vue"

export default function useSelectOnlySensors (group: IGroupResponseItem, arr: ServiceProps[] = []) {
  const sensors = group.devices.filter((el) => el.type.includes('sensor') || el.type.includes('thermostat'))
  arr.push(...sensors)
  group.inverseParent?.forEach(el => useSelectOnlySensors(el, arr))
  return arr
}
