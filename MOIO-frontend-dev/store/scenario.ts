import { defineStore } from 'pinia'
import type { IAddScenario } from "~/api/scenarios/add"
import apiScenariosAdd from "~/api/scenarios/add"
import apiScenariosGetAll from "~/api/scenarios/getAll"
import apiScenariosGetById from "~/api/scenarios/getById"
import type { IScenarioUpdateProps } from "~/api/scenarios/update"
import apiScenariosUpdate from "~/api/scenarios/update"
import apiScenariosExecute from "~/api/scenarios/execute"
import apiScenariosDelete from "~/api/scenarios/delete"

export const useScenarioStore = defineStore('scenario', {
  state: () => (
    {
    }),
  getters: {

  },
  actions: {
    async createScenario (props:IAddScenario) {
      return await apiScenariosAdd(props)
    },
    async getAll (homeId:string) {
      return await apiScenariosGetAll(homeId)
    },
    async getById (id:string) {
      return await apiScenariosGetById(id)
    },
    async executeScenario (id:string) {
      if (id.length > 0) {
        return await apiScenariosExecute(id)
      }
    },
    async updateScenario (data:IScenarioUpdateProps) {
      return await apiScenariosUpdate(data)
    },
    async deleteScenario (id:string) {
      await apiScenariosDelete(id)
    },
  },
})
