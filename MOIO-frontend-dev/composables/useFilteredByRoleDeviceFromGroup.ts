import type { IAllDevicesResponse } from "~/api/device/getAll"
import { type IGroupResponseItem } from "~/api/group/getAll"
import type { ServiceProps } from "~/components/Service/TheService.vue"

export default function useFilteredByRoleDeviceFromGroup(group: IGroupResponseItem, role: IAllDevicesResponse['deviceRole'], arr: ServiceProps[] = []) {
    const filteredDevices = useFilteredByRoleDevices(group.devices, role)
    arr.push(...filteredDevices)
    group.inverseParent?.forEach(el => useFilteredByRoleDeviceFromGroup(el, role, arr))
    return arr
}