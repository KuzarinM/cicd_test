import { type IGroupResponseItem } from "~/api/group/getAll"
import type { ServiceProps } from "~/components/Service/TheService.vue"

export default function useSelectOnlySmartMeters (group: IGroupResponseItem, arr: ServiceProps[] = []) {
  const meters = group.devices.filter(el => el.type.includes('smart_meter'))
  arr.push(...meters)
  group.inverseParent?.forEach(el => useSelectOnlySmartMeters(el, arr))
  return arr
}
