import { useGroupsStore } from "~/store/groups"
import type { IUsersByGroupResponse } from "~/api/group/getUsersByGroupId"


async function getDevicesByGroupId (id:string) {
  const groupStore = useGroupsStore()
  const result:{id:string, name:string}[] = []
  const devices = await groupStore.getDevicesByGroupId(id)
  if (devices) {
    for (const val of Object.values(devices)) {
      result.push(...val.map((el) => {
        return { id: el.id, name: el.name }
      }))
    }
  }
  return result
}
export default async function useDataForGroupEdit (id:string) {
  const groupStore = useGroupsStore()
  const data = await groupStore.getGroupById(id)
  let inGroupUsers:IUsersByGroupResponse[] = []
  let groupHouse = ''
  let groupName = ''
  inGroupUsers = await groupStore.getUsersByGroupId(id)
  groupHouse = groupStore.currentHome
  groupName = data.name ?? ''
  inGroupUsers = inGroupUsers?.filter(el => el.id !== groupStore.group.groupCreatorId)

  const inGroupDevices = await getDevicesByGroupId(id)
  const inHouseDevices = await getDevicesByGroupId(groupHouse)
  return {
    groupName,
    groupHouse,
    inGroupUsers,
    inGroupDevices,
    inHouseDevices,
  }
}
