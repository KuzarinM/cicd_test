import { defineStore } from 'pinia'
import type { IGetAllResponseItem } from "~/api/category/getAll"
import apiCategoryGetAll from "~/api/category/getAll"
import apiCategoryGetDevicesById, { type IDevicesInCategory } from "~/api/category/getDevicesByCategoryId"
import useIcoByGroupName from "~/composables/useIcoByGroupName"
import type { IAsideCategory } from "~/components/Aside/AsideCategory.vue"

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as IGetAllResponseItem[],
    currentCategory: null as null | IGetAllResponseItem,
    devicesInCategory: {} as IDevicesInCategory,
  }),
  getters: {
    allCategories: state => (array = state.categories) => {
      return array.reduce((
        acc: IAsideCategory['categoryItems'],
        curr) => {
        acc.push(
          {
            name: curr.name ?? '',
            url: `/user/category/${curr.id}`,
            icon: useIcoByGroupName(curr.name)?.name,
            id: curr.id,
          })
        return acc
      }, [])
    },
    devices: state => state.devicesInCategory,
    categoryById: state => (id: string | number) => state.categories.find(e => String(e.id) === String(id)),
  },
  actions: {
    async getAll () {
      const data = await apiCategoryGetAll()
      if (data?.length) {
        this.categories = data
      }
    },
    async getDevicesByCategoryId (id: number, homeId: string) {
      const data = await apiCategoryGetDevicesById(id, homeId)
      this.devicesInCategory = data
      this.currentCategory = this.categories.find(category => category.id === id) ?? null

      return this.devicesInCategory
    },

    async leaveCategory () {
      this.devicesInCategory = {}
      this.currentCategory = null
    },
  },
})
