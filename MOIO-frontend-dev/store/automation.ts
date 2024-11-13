import { defineStore } from 'pinia'
import type { IAutomationCreateProps } from "~/api/automations/create"
import apiAutomationsCreate from "~/api/automations/create"
import apiAutomationsGetAll from "~/api/automations/getAll"
import apiAutomationsGetById from "~/api/automations/getById"
import apiAutomationsRemove from "~/api/automations/remove"
import apiAutomationsEnable, { type IAutomationEnable } from "~/api/automations/enable"
import apiAutomationsUpdate, { type IAutomationUpdateProps } from "~/api/automations/update"

export const useAutomationStore = defineStore('automation', {
  state: () => (
    {
      step: 0,
    }),
  getters: {

  },
  actions: {
    async create (props:IAutomationCreateProps) {
      return await apiAutomationsCreate(props)
    },
    async getAll (homeId:string) {
      return await apiAutomationsGetAll(homeId)
    },
    async getById (id:string) {
      return await apiAutomationsGetById(id)
    },
    async deleteAutomation (automationId:string) {
      return await apiAutomationsRemove(automationId)
    },
    async update (props:IAutomationUpdateProps) {
      return await apiAutomationsUpdate(props)
    },
    async enable (props:IAutomationEnable) {
      return await apiAutomationsEnable(props)
    },
  },
})
