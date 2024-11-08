import useAsyncQuery from '~/composables/useAsyncQuery'
import type { TUiIconNames } from "#build/types/ui-icon"

export interface IAllDevicesResponse {
    id: string
    name: string
    type: string
    deviceIcon: { name:TUiIconNames }|null
    capabilities: {
        type: string
        retrievable: boolean
        reportable: boolean
        value: any
        instance: string
        range: {
            min: number
            max: number
            precision: number
        }
        hsv: {
            h: number
            s: number
            v: number
        }
    }[]
    properties: Array<{
        type: string
        retrievable: boolean
        reportable: boolean
        parameters: {
            type: string
            value: number
            instance: string
            events: Array<{
                value: string
                name: string
            }>
        }
    }>
    device_info: {
        manufacturer: string
        model: string
        hwVersion: string
        swVersion: string
    }
}
export default async function apiDeviceGetAll ():Promise<IAllDevicesResponse[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/device/getAllDevices')
  })
}
