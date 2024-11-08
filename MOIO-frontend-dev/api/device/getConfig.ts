export default async function apiDeviceGetConfig () {
  return await useAsyncQuery(async ({ axios, path }) => {
    const response = await axios.post(path + '/v1/devices/config')
    // console.log(response)
    return response
  })
}
