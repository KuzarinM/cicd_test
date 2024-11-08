import { type ServiceProps } from "~/components/Service/TheService.vue"
import { type IGroupResponseItem } from "~/api/group/getById"
import useScenarioToggleSelected from "~/composables/useScenarioToggleSelectedState"


export default function useScenarioSelectDevice (service:ServiceProps,
  selectedDevice: {[p: string]: ServiceProps[]},
  capabilities: {[k: string]: ServiceProps[]},
  data:IGroupResponseItem) {
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
    capabilities[service.id] = service.capabilities?.map((el) => {
      return { value: el.value, type: el.type, hsv: el.hsv }
    })
  }
  useScenarioToggleSelected(service.id, data)
}
