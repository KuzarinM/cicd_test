import { defineStore } from 'pinia'

import { useUserStore } from "~/store/user"
import type { IGroupResponseItem } from "~/api/group/getAll"
import apiGroupGetAll from "~/api/group/getAll"
import apiGroupAddRoom from "~/api/group/addRoom"
import apiGroupGetDevicesById from "~/api/group/getDevicesByGroupId"
import apiGroupsGetUpperGroups from "~/api/group/getUpperGroups"
import apiGroupGetById from "~/api/group/getById"
import apiGroupChangeName from "~/api/group/changeName"
import apiDevicesChangeDevices from "~/api/device/changeGroup"
import apiGroupDelete from "~/api/group/delete"
import apiGroupGetUserByGroupId from "~/api/group/getUsersByGroupId"
import apiGroupRemoveUsers from "~/api/group/removeUsers"
import apiGroupsGetSubgroups from "~/api/group/getSubgroups"
import apiGroupCheckCode from "~/api/group/checkCode"
import useIcoByGroupName from "~/composables/useIcoByGroupName"
import { type IAddUserToGroupProps } from "~/api/group/addUser"
import type { IDevicesInCategory } from "~/api/category/getDevicesByCategoryId"
import type { IAsideCategoryItem } from "~/components/Aside/AsideCategory.vue"
import apiUsersPendingCreate from "~/api/usersPending/create"

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: [] as IGroupResponseItem[],
    devices: {} as IDevicesInCategory,
    upperGroups: [] as IGroupResponseItem[],
    currentHome: '',
    clientId: '',
    currentGroup: {} as IGroupResponseItem,
  }),
  getters: {
    home: state => state.currentHome,
    allGroups: state => state.groups,
    groupById: state => (id:string) => state.groups.find(el => el.id === id),
    group: state => state.currentGroup,
    canEdit: (state) => {
      const userStore = useUserStore()
      return state.currentGroup.groupCreatorId === userStore.userInfo.id
    },
    canAutomate: (state) => {
      const userStore = useUserStore()
      const userId = userStore.userInfo.id
      if (state.currentGroup?.canAutomate || state.currentGroup?.groupCreatorId === userId) {
        return true
      }
      if (!state.currentGroup?.groupId) {
        return state.upperGroups.find(el => el.id === state.currentHome)?.groupCreatorId === userId
      }
    },
    formattedGroup: (state) => {
      return (typeId:number) => {
        const { id } = useUserStore()
        return state[typeId === 1 ? 'upperGroups' : 'groups']
          .reduce((acc:IAsideCategoryItem[], curr) => {
            if (curr?.typeId === typeId) {
              acc.push(
                {
                  name: curr.name ?? '',
                  url: `/user/group/${curr.id}`,
                  icon: useIcoByGroupName(String(typeId))?.name,
                  id: curr.id,
                  isEditable: curr.groupCreatorId === id,
                  typeId: curr.typeId,
                  isActive: curr.id === state.currentHome,
                  isPending: curr?.isPending,
                },
              )
            }
            return acc
          }, [])
      }
    },
    floors () {
      return this.formattedGroup(2)
    },
    rooms () {
      return this.formattedGroup(3)
    },
    houses () {
      return this.formattedGroup(1)
    },
    upGroups: state => state.upperGroups,
  },
  actions: {
    setCurrentGroup (group:IGroupResponseItem) {
      this.currentGroup = group
    },
    async getAll (groupId?:string) {
      const id = groupId ?? unref(this.currentHome)
      if (id?.length > 0) {
        const data = await apiGroupGetAll(id)
        if (data?.length) {
          this.groups = data
          return data
        }
      }
    },
    async getHouses () {
      const response = await apiGroupsGetUpperGroups()
      const user = useUserStore()
      if (!Number.isInteger(user.id)) {
        await user.init()
      }
      this.upperGroups = response
      if (localStorage.getItem('moio-current-home')?.length) {
        this.currentHome = localStorage.getItem('moio-current-home') as string
      } else {
        this.currentHome = response.find(el => el.groupCreatorId === user.userInfo.id)?.id ?? this.upperGroups[0]?.id
        localStorage.setItem('moio-current-home', this.currentHome)
      }
      this.clientId = this.upperGroups.find(el => el.id === this.currentHome)?.clientId ?? ''
    },
    async setCurrentHome (id:string) {
      localStorage.setItem('moio-current-home', id)
      this.currentHome = id
      await this.getAll()
    },
    async addRoom (name:string, typeId = 3, parentId?:string, devicesIds?:string[], groupIds?:string[]) {
      const { response } = await apiGroupAddRoom({ name, typeId, parentId, devicesIds, groupIds })
      if (!response?.status) {
        useNotification('info', 'Группа успешно добавлена')
        setTimeout(() => {
          window.location.href = useRuntimeConfig().app.baseURL || '/'
        }, 1000)
        await this.getAll()
      }
    },
    async getDevicesByGroupId (id:string) {
      this.devices = {}
      const data = await apiGroupGetDevicesById(id)
      if (data) {
        Object.keys(data).forEach((el) => {
          if (data[el].length > 0) {
            this.devices[el] = data[el]
          }
        })
        return this.devices
      }
    },
    async getGroupById (id:string) {
      const data = await apiGroupGetById(id)
      this.currentGroup = data
      return data
    },
    async getSubgroups (id:string) {
      return await apiGroupsGetSubgroups(id)
    },
    async changeName (id:string, name:string) {
      await apiGroupChangeName(id, name)
      await this.getAll()
    },
    async changeDevices (id:string, devices:string[]) {
      await apiDevicesChangeDevices(id, devices)
    },
    async deleteGroup (id:string) {
      await apiGroupDelete(id)
      useNotification('info', 'Группа успешно удалена')
      setTimeout(() => {
        window.location.href = useRuntimeConfig().app.baseURL || '/'
      }, 1000)
      await this.getAll()
    },
    async addUserToGroup (data:IAddUserToGroupProps) {
      return await apiUsersPendingCreate(data)
    },
    async removeUsersFromGroup (groupIds:string[], logins:string[], ids:number[]) {
      return await apiGroupRemoveUsers(groupIds, logins, ids)
    },
    async getUsersByGroupId (id:string) {
      return await apiGroupGetUserByGroupId(id)
    },
    async checkCode (code:string) {
      return await apiGroupCheckCode(code)
    },
  },
})
