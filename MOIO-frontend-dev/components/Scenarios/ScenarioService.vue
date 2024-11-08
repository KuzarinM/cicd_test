<template>
  <div
    ref="service"
    :class="`service --scenario ${selected&&'--active'}`"
    role="button"
  >
    <div ref="info" class="service-info" @mousedown.left.stop="handleLeftMouse()">
      <div class="service-ico-wrapper">
        <ui-icon :name="ico" size="30" />
      </div>
      <div class="service-name">
        <span>
          {{ name }}
        </span>
      </div>
    </div>
    <div
      v-if="isMounted && capabilities?.length && capabilities.length >= 1 && !isPreview"
      class="service-capabilities-list-wrapper"
    >
      <ui-modal
        v-if="isMounted"
        :is-shown="isCapabilitiesShow"
        transition-fade-name="fade"
        transition-content-name="translate"
        bg-color=""
        backdrop-filter="blur(5px)"
      >
        <template #inner>
          <div ref="target" class="service-capabilities-modal" role="dialog">
            <div class="service-capabilities-modal__header">
              <span>
                {{ name }}
              </span>
            </div>
            <div class="service-capabilities-modal__body">
              <service-capabilities-structure>
                <template
                  v-for="item in capabilities"
                  :key="item.type"
                  #[item.type]
                >
                  <scenario-service-capability
                    :device-id="id.replace(/_ch[0-9]*/gm,'')"
                    :chanel="id.replace(/^[a-zA-Z0-9_.-]*_ch/gm,'')"
                    :instance="item.instance"
                    :range="item.range"
                    :reportable="item.reportable"
                    :retrievable="item.retrievable"
                    :type="item.type"
                    :device-type="type"
                    :hsv="item.hsv"
                    :value="item.value"
                    :icon="ico"
                    @update-bool-val="e=>{emit('updateCapability',e)}"
                  />
                </template>
              </service-capabilities-structure>
            </div>
          </div>
        </template>
      </ui-modal>
    </div>
    <ui-icon
      v-if="!isPreview"
      name="delete"
      color="#D15151"
      size="20"
      class="--delete"
      @click.prevent="emit('leftMouseClick',props)"
    />
  </div>
</template>

<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import ScenarioServiceCapability from './ScenarioServiceCapability.vue'
import UiModal from "~/components/ui/UiModal.vue"
import useIcoByDeviceType from "~/composables/useIcoByDeviceType"
import { useGroupsStore } from "~/store/groups"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { ServiceProps } from "~/components/Service/TheService.vue"

export interface IScenarioService {
  isPreview?:boolean
  selected?:boolean
}

const props = defineProps<IScenarioService & ServiceProps>()
const emit = defineEmits<{
	leftMouseClick:[IScenarioService & ServiceProps],
	updateCapability:[any],
}>()
const isMounted = ref(false)
const service = ref<HTMLDivElement | null>(null)
const isCapabilitiesShow = ref(false)
const target = ref(null)
const ico = props.deviceIcon?.name ?? useIcoByDeviceType(props.type).name
const groupStore = useGroupsStore()
const info = ref()

onClickOutside(target, () => {
  isCapabilitiesShow.value = false
}, { ignore: [info] })

function handleLeftMouse () {
  if (props.isPreview) {
    emit('leftMouseClick', props)
  }
  if (!props.isPreview) {
    isCapabilitiesShow.value = true
  }
}

onLongPress(service, () => {
  isCapabilitiesShow.value = true
}, { delay: 400 })



onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }, 100)
})
onUnmounted(() => {
  window.removeEventListener('contextmenu', () => {})
})
</script>

<style lang="scss">
@import "assets/styles/components/service-capabilities-modal";
@import "assets/styles/components/scenario-service";
</style>
