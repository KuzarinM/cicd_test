<template>
  <div class="setting-group">
    <button class="setting-group__item blank" @click="colorMode.toggle()">
      <ui-icon name="aside/theme" size="20" color="#00C4F1" />
      {{ colorMode?.name.value === colorMode?.names.dark ? "Светлая тема" : "Темная тема" }}
    </button>
    <button class="setting-group__item blank" @click="logout()">
      <ui-icon name="aside/logout" size="20" color="#00C4F1" />
      Выйти
    </button>
  </div>
</template>

<script setup lang="ts">
import useColorTheme from "~/composables/useColorTheme"
import { useUserStore } from "~/store/user"

const colorMode = useColorTheme()

function logout () {
  const userStore = useUserStore()
  userStore.logout()
}
</script>

<style lang="scss">
@import "assets/styles/components/setting-group";
</style>
