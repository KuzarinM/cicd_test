export default async function apiGroupsGetSubgroups (id:string):Promise<{id:string, name:string}[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + `/v1/groups/${id}/subgroups`)
  })
}
