import type { ServiceProps } from "~/components/Service/TheService.vue"
import type { IGroupResponseItem } from "~/api/group/getAll"
import useScenarioToggleSelected from "~/composables/useScenarioToggleSelectedState"
import type { ICapability } from "~/api/automations/getById"


export default function useScenarioSelectDevice (service:ServiceProps,
  selectedDevice: {[p: string]: ServiceProps[]},
  capabilities: {[k: string]: ICapability[]},
  data:IGroupResponseItem) {
  if (service.groupId) {
    const isDeviceExist = (selectedDevice && service.groupId in selectedDevice)
      ? selectedDevice[service.groupId]?.findIndex(el => el.id === service.id)
      : -1
    if (isDeviceExist > -1) {
      selectedDevice[service.groupId].splice(isDeviceExist, 1)
      delete capabilities[service.id]
    } else {
      if (selectedDevice && service.groupId in selectedDevice && selectedDevice[service.groupId]?.length > 0) {
        selectedDevice[service.groupId].push(service)
      } else {
        selectedDevice[service.groupId] = [service]
      }
      capabilities[service.id] = service.capabilities
    }
  }
  useScenarioToggleSelected(service.id, data)
}
