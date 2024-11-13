<template>
  <div class="automation-add-condition">
    <form class="automation-add-condition__form" @submit.prevent="emit('addCondition', condition)">
      <div class="automation-add-condition__conditions">
        <div :class="`automation-add-condition__condition ${condition==='time'&&'--active'}`" @click="condition='time'">
          <div class="automation-add-condition__condition-name">
            <ui-icon name="service/devices/clock-time-three-outline" size="20" />
            Время суток события
          </div>
          <p>Например, "08:00" или "В момент захода солнца"</p>
          <ui-button
            type="submit"
            rounded="12px"
            padding="8px 12px"
            class="automation-add-condition__submit"
          >
            <ui-icon
              name="arrow-down" size="20" :filled="true"
            />
          </ui-button>
        </div>
        <div :class="`automation-add-condition__condition ${condition==='sensor'&&'--active'}`" @click="condition='sensor'">
          <div class="automation-add-condition__condition-name">
            <ui-icon name="service/sensor/leak" size="20" />
            Сработал датчик
          </div>
          <p>Например, "Есть движение"</p>
          <ui-button
            type="submit"
            rounded="12px"
            padding="8px 12px"
            class="automation-add-condition__submit"
          >
            <ui-icon
              name="arrow-down" size="20" :filled="true"
            />
          </ui-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon.vue"

const emit = defineEmits<{
    addCondition:['sensor'|'time']
    hideModal:[void]
}>()
const condition = ref<'sensor'|'time'>('time')
</script>

<style lang="scss">
@import "assets/styles/components/automation-add-condition-modal";
</style>
