<template>
  <div class="scenarios">
    <loader-screen :is-loading="scenariosFetch.pending.value || isLoading" />
    <h1 class="scenarios__header">
      Сценарии
    </h1>
    <div class="scenarios-available">
      <h2 class="scenarios-available__header">
        Список доступных сценариев
      </h2>
      <div class="scenarios-available__list">
        <div
          v-for="scenario in scenariosFetch.data.value"
          :key="scenario.id"
          class="scenarios-available__list-item" @click="executeScenario(scenario.id)"
        >
          <div class="scenarios-available__list-item-name">
            {{ scenario.name }}
          </div>
          <nuxt-link :to="`/scenarios/edit/${scenario.id}`" class="scenarios-available__list-item-edit" @click.stop="false">
            <ui-icon name="pencil" role="link" />
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useScenarioStore } from "~/store/scenario"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import { useGroupsStore } from "~/store/groups"

const groupStore = useGroupsStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const scenarioStore = useScenarioStore()
const scenariosFetch = useLazyAsyncData('scenarios-all', async () => await scenarioStore.getAll(groupStore.currentHome))
const executeScenarioFetch = useLazyAsyncData(
  'scenarios-exec',
  () => scenarioStore.executeScenario(executedScenario.value),
  { immediate: false })
executeScenarioFetch.pending.value = false

const executedScenario = ref('')
const isLoading = computed(() => (executeScenarioFetch.pending.value && executeScenarioFetch.status.value !== 'idle') || scenariosFetch.pending.value)

async function executeScenario (id:string) {
  executedScenario.value = id
  await executeScenarioFetch.execute()
  await nextTick(() => {
    executedScenario.value = ''
  })
}
</script>

<style lang="scss">
@import "assets/styles/page/scenarios";
</style>
