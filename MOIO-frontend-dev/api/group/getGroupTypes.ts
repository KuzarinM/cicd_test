import useAsyncQuery from '~/composables/useAsyncQuery'

export interface IGroupTypeResponseItem {
  id: number
  code: string
}

export default async function apiGetGroupTypes(): Promise<IGroupTypeResponseItem[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    const response = await axios.get(path + '/v1/grouptypes')
    if (response.status === 200) {
      return response
    }
  })
}
