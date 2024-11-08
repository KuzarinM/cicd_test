import useAsyncQuery from "~/composables/useAsyncQuery"

export default async function apiDeviceChangeName (deviceId:string, deviceName:string) {
  if (deviceName.includes(`'`) || deviceName.includes(`"`)) {
    useNotification('error', 'Недопустимый символ в названии группы')
    return false
  }
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.put(path + '/v1/devices/update/name', { deviceId, deviceName })
  })
}
