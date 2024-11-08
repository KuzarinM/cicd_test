<template>
  <div class="add-group">
    <loader-screen :is-loading="isLoading" />
    <h1 class="add-group__header">
      Добавить дом
    </h1>
    <form method="post" class="add-group__form" @submit.prevent="addGroup()">
      <div class="add-group__input-group">
        <label for="group" class="add-group__label">Введите название дома</label>
        <input id="group" v-model="name" type="text" name="group" class="add-group__input" required placeholder="Название дома">
      </div>

      <div class="add-group__submit-wrapper">
        <ui-button type="submit" rounded="16px">
          Добавить
        </ui-button>
      </div>
    </form>
  </div>
</template>


<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"


const groupStore = useGroupsStore()
const isLoading = ref(false)
const name = ref('')
async function addGroup () {
  if (!name.value?.length) {
    useNotification("error", "Введите название группы")
    return
  }
  if (name.value.length > 30) {
    useNotification("error", "Название группы не должно превышать 30 символов")
    return
  }
  isLoading.value = true
  await groupStore.addRoom(name.value, 1)
  isLoading.value = false
}
</script>
<style lang="scss">
@import "assets/styles/page/_user-add-room";
</style>
