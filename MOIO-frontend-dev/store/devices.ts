import { defineStore } from 'pinia'

import apiDeviceGetAll, { type IAllDevicesResponse } from "~/api/device/getAll"
import type { IDeviceChangeBrightness } from "~/api/device/changeBrightness"
import apiDeviceChangeBrightness from "~/api/device/changeBrightness"
import type { IDeviceChangeRGBPayload } from "~/api/device/changeRGB"
import apiDeviceChangeRGB from "~/api/device/changeRGB"
import type { IDeviceChangeStatusOnOff } from "~/api/device/changeStatusOnOff"
import apiDeviceChangeOnOf from "~/api/device/changeStatusOnOff"
import type { IDeviceChangeStatusOpenClose } from "~/api/device/changeStatusOpenClose"
import apiDeviceChangeOpenClose from "~/api/device/changeStatusOpenClose"
import type { IDeviceChangeStatusTemperature } from "~/api/device/changeStatusTemperature"
import apiDeviceChangeTemperature from "~/api/device/changeStatusTemperature"
import apiDeviceChangeName from "~/api/device/changeName"
import apiDeviceDelete from "~/api/device/delete"
import apiDeviceGetConfig from "~/api/device/getConfig"
import apiDeviceChangeIcon from "~/api/device/changeIcon"
import apiColorGetAll from '~/api/device/getColor'
import type { IColorResponse } from '~/api/device/getColor'
import apiSaveColor from '~/api/device/saveColor'
import type { ISaveColor } from '~/api/device/saveColor'
import type { IDeviceChangeGroup } from '~/api/device/changeGroup'
import apiDevicesChangeGroup from '~/api/device/changeGroupDevices'
import type { IDeviceChangeSpeed } from "~/api/device/changeSpeed"
import apiDeviceChangeSpeed from "~/api/device/changeSpeed"
import type { IDeviceChangeOpenness } from '~/api/device/changeOpenness'
import apiDeviceChangeOpenness from '~/api/device/changeOpenness'
import apiDeviceGetById from '~/api/device/getById'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    devices: [] as IAllDevicesResponse[],
    color: [] as IColorResponse [],
    status: 0,
  }),
  getters: {
    // getGroupByDeviceId: state => (deviceId: string) => state.devices.find(device => device.id === deviceId).
    getStatus: state => state.status,
    allColor: state => state.color,
    allDevices: state => state.devices,
    capabilityById: state => (id:string, capability:string) => state.devices.find(el => el.id === id)?.capabilities.find(el => el.type.includes(capability)),
  },
  actions: {
    async getAllDevices () {
      console.warn('using deprecated method from devices store')
      const data = await apiDeviceGetAll()
      if (data?.length) {
        this.devices = data
      }
    },
    async changeBrightness (props:IDeviceChangeBrightness) {
      await apiDeviceChangeBrightness(props)
    },
    async changeRGB (props: IDeviceChangeRGBPayload) {
      await apiDeviceChangeRGB(props)
    },
    async changeOnOf (props:IDeviceChangeStatusOnOff) {
      await apiDeviceChangeOnOf(props)
    },
    async changeSpeed (props: IDeviceChangeSpeed) {
      await apiDeviceChangeSpeed(props)
    },
    async changeOpenClose (props:IDeviceChangeStatusOpenClose) {
      await apiDeviceChangeOpenClose(props)
    },
    async changeGroup (props:IDeviceChangeGroup) {
      await apiDevicesChangeGroup(props)
    },
    async changeOpenness (props:IDeviceChangeOpenness) {
      await apiDeviceChangeOpenness(props)
    },
    async getColor () {
      const data = await apiColorGetAll()
      if (data?.length) {
        this.color = data
      }
    },
    async changeTemperature (props:IDeviceChangeStatusTemperature) {
      await apiDeviceChangeTemperature(props)
    },
    async changeName (id:string, name:string) {
      const response = await apiDeviceChangeName(id, name)
      if (response) {
        useNotification('info', 'Имя устройства успешно изменено')
      }
    },
    async deleteDevice (id:string) {
      return await apiDeviceDelete(id)
    },
    async saveColor (props:ISaveColor) {
      return await apiSaveColor(props)
    },
    async getConfig () {
      return await apiDeviceGetConfig()
    },
    async changeIcon (deviceIdChanel:string, iconName:string) {
      return await apiDeviceChangeIcon(deviceIdChanel, iconName)
    },

    async getById (deviceId: string) {
      return await apiDeviceGetById(deviceId)
    },
  },
})
