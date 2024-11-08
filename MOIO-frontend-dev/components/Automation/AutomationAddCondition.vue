<template>
  <div class="automation-add-condition">
    <div class="automation-add-condition__header">
      <div class="automation-add-condition__header-text">
        Добавить условие
      </div>
      <ui-button
        class-name="blank"
        padding="0"
        margin-inline="0"
      >
        <ui-icon
          name="close"
          role="button"
          color="#fff"
          @click="emit('hideModal')"
        />
      </ui-button>
    </div>
    <form class="automation-add-condition__form" @submit.prevent="emit('addCondition', condition)">
      <div class="automation-add-condition__conditions">
        <div :class="`automation-add-condition__condition ${condition==='time'&&'--active'}`" @click="condition='time'">
          <ui-icon name="service/devices/clock-time-three-outline" size="100" />
          <div class="automation-add-condition__condition-name">
            Время
          </div>
        </div>
        <div :class="`automation-add-condition__condition ${condition==='sensor'&&'--active'}`" @click="condition='sensor'">
          <ui-icon name="service/sensor/leak" size="100" />
          <div class="automation-add-condition__condition-name">
            Датчик
          </div>
        </div>
      </div>
      <ui-button
        type="submit"
        rounded="16px"
        padding="8px 12px"
        class="automation-add-condition__submit"
      >
        Добавить
      </ui-button>
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
