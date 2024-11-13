<template>
  <div
    v-if="title?.length && url?.length"
    :class="`aside-item ${router.currentRoute.value.path === props.url?'--active':''}`"
  >
    <nuxt-link class="aside-item__link" :to="url" @click.prevent="handleClick">
      <ui-icon :name="icon" size="20" />
      <h2 class="aside-item__title">
        {{ title }}
      </h2>
      <nuxt-link v-if="router.currentRoute.value.path === props.url && isEditable" :to="`/user/group/edit/${editPostfix+id}`" class="aside-item__edit-btn">
        <ui-icon name="pencil" color="inherit" />
      </nuxt-link>
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon.vue"
import type { TUiIconNames } from "#build/types/ui-icon"
import { useGroupsStore } from "~/store/groups"

export interface AsideItem {
  icon: TUiIconNames,
  url: string,
  title: string,
  isEditable?: boolean,
  id?: number | string,
  typeId?: number
}

const props = defineProps<AsideItem>()
const router = useRouter()
const groupStore = useGroupsStore()

const roomTypeId = groupStore.getGroupTypeId('Room')
const floorTypeId = groupStore.getGroupTypeId('Floor')
const houseTypeId = groupStore.getGroupTypeId('House')


const editPostfix = computed(() => {
  switch (props.typeId) {
    case floorTypeId:
      return 'floor/'
    case houseTypeId:
      return 'house/'
    case roomTypeId:
      return 'room/'
    default:
      return 'room/'
  }
})

// Обработка клика
const handleClick = () => {
  // Проверяем, если id не определен, то не устанавливаем помещение
  if (props.id === undefined) {
    return
  }

  if (props.typeId === roomTypeId) {
    groupStore.setShowRoom(props.id as string)
  } else if (props.typeId === floorTypeId) {
    groupStore.setShowFloor(props.id as string)
  }
}

</script>
<style lang="scss">
</style>
