import type { IAllDevicesResponse } from '~/api/device/getAll'
import type { GroupList } from '~/components/Group/GroupList.vue'

// фильтруем массив устройств на соответсвие определенной роли
export default function useFilteredByRoleDevices(devices: GroupList["devices"], role: IAllDevicesResponse['deviceRole']) {
    return devices?.filter(device => device.deviceRole.includes(role)) ?? []
}