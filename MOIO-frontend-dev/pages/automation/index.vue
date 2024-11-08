<template>
  <div class="scenarios">
    <loader-screen :is-loading="automationFetch.pending.value" />
    <h1 class="scenarios__header">
      Автоматизации
    </h1>
    <div class="scenarios-available">
      <h2 class="scenarios-available__header">
        Список доступных автоматизаций
      </h2>
      <div class="scenarios-available__list">
        <nuxt-link
          v-for="automation in automationFetch.data.value"
          :key="automation.id"
          :to="`/automation/edit/${automation.id}`"
          class="scenarios-available__list-item"
        >
          <div class="scenarios-available__list-item-name">
            {{ automation.name }}
          </div>
          <div class="scenarios-available__list-item-edit">
            <ui-icon
              name="pencil"
            />
          </div>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import { useAutomationStore } from "~/store/automation"
import UiIcon from "~/components/ui/UiIcon.vue"
import { useGroupsStore } from "~/store/groups"

const groupStore = useGroupsStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}

const automationStore = useAutomationStore()
const automationFetch = useLazyAsyncData(
  'automations',
  async () => await automationStore.getAll(groupStore.currentHome),
)



</script>

<style lang="scss">
@import "assets/styles/page/scenarios";
</style>
