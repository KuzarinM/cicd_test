import { useGroupsStore } from "~/store/groups"

export default async function useEditGroup (id:string, name:string, oldName:string, usersForRemove:{id:number, name:string}[], existingDevices?:{id: string, name: string}[], devices?:{id: string, name: string}[]) {
  if (!name?.length || !oldName?.length) {
    useNotification('error', 'Введите название группы')
    return false
  }
  if (name?.length > 30 || oldName?.length > 30) {
    useNotification('error', 'Название группы не должно превышать 30 символов')
    return false
  }

  const groupStore = useGroupsStore()
  if (name !== oldName) {
    await groupStore.changeName(id, name)
  }
  if (existingDevices?.length) {
    await groupStore.changeDevices(groupStore.currentHome, existingDevices.map(el => el.id))
  }
  if (devices?.length) {
    await groupStore.changeDevices(id, devices.map(el => el.id))
  }
  if (usersForRemove?.length > 0) {
    await groupStore.removeUsersFromGroup([id], [], usersForRemove?.map(el => el.id))
  }
  return true
}
