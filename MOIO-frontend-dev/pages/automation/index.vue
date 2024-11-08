<template>
  <div class="scenarios">
    <loader-screen :is-loading="isLoading" />
    <h1 class="scenarios__header">
      Автоматизации
    </h1>
    <div class="scenarios-available">
      <div class="scenarios-available__list">
        <div v-for="automation in automationFetch.data.value" class="scenarios-available__list-item">
          <div class="scenarios-available__list-item-name">
            {{ automation.name }}
          </div> 
          
          <div class="scenarios-available__list-item-edit">
            <ui-toggle
              class="scenarios-available__list-item-edit__toggle"
              role="button"
              :checked="automation.isEnable"
              vertical-large
              @check="sendAutomation(automation.id, !automation.isEnable)"
            />
            <nuxt-link
              :key="automation.id"
              :to="`/automation/edit/${automation.id}`"
            >
                <ui-icon
                  name="pencil"
                />
            </nuxt-link>   
                  
          </div>
        </div>
      </div>
    </div> 
    <div v-if="isChanged" class="scenarios__save">
      <ui-button variant="secondary"
      @click="()=>$router.go(0)">
        Отмена
      </ui-button>
      <ui-button variant="primary"
      @click="automationStore.enable({automations:[{automationId: automationPost.id, enable: automationPost.enable}]}),isChanged = false">
        Сохранить
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import { useAutomationStore } from "~/store/automation"
import UiIcon from "~/components/ui/UiIcon.vue"
import UiToggle from "~/components/ui/UiToggle.vue"
import { useGroupsStore } from "~/store/groups"
import type {IAutomationEnable} from "~/api/automations/enable"

const props = defineProps<IAutomationEnable>()
interface IAutomationPost{
    id:string,
    enable:any
}
const groupStore = useGroupsStore()
const isLoading = ref(false)
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const isChanged = ref(false)
const automationStore = useAutomationStore()
const automationFetch = useLazyAsyncData(
  'automations',
  async () => await automationStore.getAll(groupStore.currentHome),
)
const automationPost = <IAutomationPost>{}
async function sendAutomation(id:any,enable:any){
  isLoading.value = true
  await automationStore.enable({ automations: [{ automationId: id, enable: enable }] })
  isLoading.value = false
}

</script>

<style lang="scss">
@import "assets/styles/page/scenarios";
</style>
