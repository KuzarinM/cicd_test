import { defineStore } from 'pinia'

import { useUserStore } from "~/store/user"
import type { IGroupResponseItem } from "~/api/group/getAll"
import apiGroupGetAll from "~/api/group/getAll"
import apiGroupAddGroup from '~/api/group/addGroup'
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
import { type IAddUserToGroupProps } from "~/api/usersPending/create"
import type { IDevicesInCategory } from "~/api/category/getDevicesByCategoryId"
import type { IAsideCategoryItem } from "~/components/Aside/AsideCategory.vue"
import apiUsersPendingCreate from "~/api/usersPending/create"
import apiGetGroupTypes, { type IGroupTypeResponseItem } from '~/api/group/getGroupTypes'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    isEdit: false,
    showRoom: ref(''),
    showFloor: ref(''),
    groups: [] as IGroupResponseItem[],
    devices: {} as IDevicesInCategory,
    upperGroups: [] as IGroupResponseItem[],
    currentHome: '',
    clientId: '',
    isAddRoommates: false,
    currentGroup: {} as IGroupResponseItem,
    groupType: [] as IGroupTypeResponseItem[],
  }),
  getters: {
    getShowRoom: state => state.showRoom,
    getShowFloor: state => state.showFloor,
    home: state => state.currentHome,
    allGroups: state => state.groups,
    groupById: state => (id: string) => state.groups.find(el => el.id === id),
    group: state => state.currentGroup,
    canEdit: (state) => {
      const userStore = useUserStore()
      const userId = userStore.userInfo.id
      if (state.currentGroup?.groupCreatorId) {
        return state.currentGroup?.groupCreatorId === userId
      } else {
        return state.groups?.[0]?.groupCreatorId === userId
      }
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

    getGroupTypeId: (state) => {
      return (code: string): number => {
        return state.groupType.find(elem => elem.code === code)?.id ?? 1
      }
    },

    formattedGroup (state) {
      return (typeId: number, groupName?: string) => {
        const { id } = useUserStore()
        return state[typeId === this.getGroupTypeId('House') ? 'upperGroups' : 'groups']
          .reduce((acc: IAsideCategoryItem[], curr) => {
            if (curr?.typeId === typeId) {
              acc.push(
                {
                  name: curr.name ?? '',
                  url: `/user/group/${curr.id}`,
                  icon: useIcoByGroupName(groupName ?? 'комната')?.name,
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
      return this.formattedGroup(this.getGroupTypeId('Floor'), 'этаж') as unknown as IAsideCategoryItem[]
    },

    rooms () {
      return this.formattedGroup(this.getGroupTypeId('Room'), 'комната') as unknown as IAsideCategoryItem[]
    },

    houses () {
      return this.formattedGroup(this.getGroupTypeId('House'), 'дом') as unknown as IAsideCategoryItem[]
    },

    upGroups: state => state.upperGroups,
    groupTypes: state => state.groupType,
  },
  actions: {
    setShowRoom (id: string) {
      this.showRoom = id
    },

    setShowFloor (id: string) {
      this.showFloor = id
      this.setShowRoom('')
    },

    setCurrentGroup (group: IGroupResponseItem) {
      this.currentGroup = group
    },

    async getAll (groupId?: string) {
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

    async setCurrentHome (id: string) {
      localStorage.setItem('moio-current-home', id)
      this.currentHome = id
      this.setShowFloor('')
      this.setShowRoom('')
      await this.getAll()
    },

    async addGroup (name: string, typeId: number, parentId?: string, devicesIds?: string[], groupIds?: string[]) {
      const { response } = await apiGroupAddGroup({ name, typeId, parentId, devicesIds, groupIds })
      if (!response?.status) {
        useNotification('info', 'Группа успешно добавлена')
        setTimeout(() => {
          window.location.href = useRuntimeConfig().app.baseURL || '/'
        }, 1000)
        await this.getAll()
      }
    },

    async getDevicesByGroupId (id: string) {
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

    async getGroupById (id: string) {
      const data = await apiGroupGetById(id)
      this.currentGroup = data
      return data
    },

    async getSubgroups (id: string) {
      return await apiGroupsGetSubgroups(id)
    },

    async getGroupTypes () {
      const data = await apiGetGroupTypes() ?? [{ id: 1, code: 'House' }, { id: 2, code: 'Floor' }, { id: 3, code: 'Room' }]
      this.groupType = data
      return data
    },

    async changeName (id: string, name: string) {
      await apiGroupChangeName(id, name)
      await this.getAll()
    },

    async changeDevices (id: string, devices: string[]) {
      await apiDevicesChangeDevices(id, devices)
    },

    removeDeviceFromCurrentGroup (id: string) {
      const deviceIndex = this.currentGroup.devices.findIndex(el => el.id === id)
      if (deviceIndex !== -1) {
        this.currentGroup.devices.splice(deviceIndex, 1)
      }
    },

    async deleteGroup (id: string, isHouse?: boolean) {
      await apiGroupDelete(id)
      useNotification('info', 'Группа успешно удалена')
      if (isHouse) {
        localStorage.setItem('moio-current-home', '')
        await this.getHouses()
      }
      setTimeout(() => {
        window.location.href = useRuntimeConfig().app.baseURL || '/'
      }, 1000)
      await this.getAll()
    },

    async addUserToGroup (data: IAddUserToGroupProps) {
      return await apiUsersPendingCreate(data)
    },

    async removeUsersFromGroup (groupIds: string[], logins: string[], ids: number[]) {
      return await apiGroupRemoveUsers(groupIds, logins, ids)
    },

    async getUsersByGroupId (id: string) {
      return await apiGroupGetUserByGroupId(id)
    },

    async checkCode (code: string) {
      return await apiGroupCheckCode(code)
    },
  },
})
