<template>
  <NuxtLayout v-bind="colorMode.bind.value">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">

import { useUserStore } from '~/store/user'
import useColorTheme from "~/composables/useColorTheme"

const user = useUserStore()
const colorMode = useColorTheme()

if (user.accessToken) {
  await user.init()
}
</script>
