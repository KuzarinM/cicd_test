import useAsyncQuery from '~/composables/useAsyncQuery'

export default async function apiUserLogout () {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.post(path + '/v1/users/LogOut')
  })
}
