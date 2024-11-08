import { type IGroupResponseItem } from "~/api/group/getById"

export default function useScenarioExpandGroups (groups:IGroupResponseItem, initialGroups:IGroupResponseItem[] = []):IGroupResponseItem[] {
  if (groups?.devices?.length) {
    initialGroups.push({ ...groups, inverseParent: [] })
  }
  if (groups?.inverseParent?.length) {
    for (const group of groups?.inverseParent) {
      if (group?.id) {
        useScenarioExpandGroups(group, initialGroups)
      }
    }
  }
  return initialGroups
}
