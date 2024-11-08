<template>
  <div class="automation-select-range">
    <div class="automation-select-range__header">
      <div class="automation-select-range__header-text">
        Состояние устройства
      </div>
      <ui-button
        class-name="blank"
        margin-inline="0"
        padding="0"
        @click="saveChanges()"
      >
        <ui-icon :name="'close'" />
      </ui-button>
    </div>
    <div class="automation-select-range__info">
      <div class="automation-select-range__info-item">
        <label class="automation-select-range__info-item-label" for="name">
          Название:
        </label>
        <div class="automation-select-range__info-item-value">
          {{ name }}
        </div>
      </div>
    </div>
    <div class="automation-select-range__nav">
      <div class="automation-select-range__nav-header">
        Укажите значение устройства:
      </div>
      <div class="automation-select-range__nav-items">
        <div
          :class="`automation-select-range__nav-item ${currentNav === 1 ? '--active':''}`"
          @click="currentNav = 1"
        >
          Диапазон
        </div>
        <div
          :class="`automation-select-range__nav-item ${currentNav === 0 ? '--active':''}`"
          @click="currentNav = 0"
        >
          Одно значение
        </div>
      </div>
    </div>
    <div class="automation-select-range__tabs">
      <div class="automation-select-range__tabs-header">
        Укажите значение:
      </div>
      <transition name="fade">
        <div v-show="currentNav === 1" class="automation-select-range__tab">
          <div class="automation-select-range__tab-value">
            <label for="from">От</label>
            <span class="input-wrapper">
              <input
                id="from"
                v-model.number="startValue"
                type="number"
                :min="range?.min ?? 0"
                :max="(endValue ?? 100) - 1"
                @focusout="startValue = validateInputNumber(startValue, range?.min ?? 0,endValue ?? 100)"
              >
            </span>
            <label for="to">До</label>
            <span class="input-wrapper">
              <input
                id="to"
                v-model.number="endValue"
                type="number"
                :min="(startValue ?? 0) + 1"
                :max="range?.max ?? 100"
                @focusout="endValue = validateInputNumber(endValue, startValue,range?.max ?? 100)"
              >
            </span>
          </div>
        </div>
      </transition>
      <transition name="fade">
        <div v-show="currentNav === 0" class="automation-select-range__tab">
          <div class="automation-select-range__tab-value">
            <span class="input-wrapper">
              <input
                id="value"
                v-model.number="singleValueCondition.value"
                type="number"
                @focusout="singleValueCondition.value = validateInputNumber(singleValueCondition.value, (range?.min ?? 0) + 1,range?.max ?? 100)"
              >
            </span>
          </div>
          <div class="automation-select-range__tab-value-condition">
            <div class="automation-select-range__tab-value-condition-header">
              Условие срабатывает, если:
            </div>
            <div class="automation-select-range__tab-value-condition-list">
              <div
                :class="`automation-select-range__tab-value-condition-item ${singleValueCondition.condition === 1 ? '--active' : ''}`"
                @click="singleValueCondition.condition = 1"
              >
                Устройство приняло значение больше установленного
              </div>
              <div
                :class="`automation-select-range__tab-value-condition-item ${singleValueCondition.condition === 0 ? '--active' : ''}`"
                @click="singleValueCondition.condition = 0"
              >
                Устройство приняло значение меньше установленного
              </div>
              <div
                :class="`automation-select-range__tab-value-condition-item ${singleValueCondition.condition === 2 ? '--active' : ''}`"
                @click="singleValueCondition.condition = 2"
              >
                Устройство приняло установленное значение
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <ui-button
      rounded="16px"
      padding="8px"
      @click="saveChanges()"
    >
      Сохранить состояние
    </ui-button>
  </div>
</template>

<script setup lang="ts">
import type { ICapability } from "~/components/Service/TheService.vue"
import type { IAutomationValue } from "~/api/automations/create"

export interface IAutomationSelectRangeProps {
  name:string
  range?:ICapability['range']
}

const props = defineProps<IAutomationSelectRangeProps>()
const emit = defineEmits<{
  saveAutomationCondition:[
      value:Exclude<IAutomationValue["automationCondition"], undefined>
  ],
  saveTemperatureRange:[
      value:Exclude<IAutomationValue["temperatureRange"], undefined>
  ]
}>()
const currentNav = ref(0)
const startValue = ref<number>(props.range?.min)
const endValue = ref<number>(props.range?.max)
const singleValueCondition = ref<Exclude<IAutomationValue["automationCondition"], undefined>>({
  value: 0, condition: 0,
})

function validateInputNumber (value:number, min:number, max:number) {
  if (value < min || value > max) {
    useNotification('info', 'Уведомляю что поменял значение')
    return min
  }
  return value
}
function saveChanges () {
  if (currentNav.value === 0) {
    emit('saveAutomationCondition', { ...singleValueCondition.value })
  }
  if (currentNav.value === 1) {
    emit('saveTemperatureRange', { min: startValue.value ?? 0, max: endValue.value ?? 100 })
  }
}

watch(props, () => {
  singleValueCondition.value.value = props.range?.min
  startValue.value = props.range?.min
  endValue.value = props.range?.max
}, { deep: true })
</script>

<style lang="scss">
.automation-select-range{
  @include device-item;
  width: 100%;
  max-height: 85dvh;
  overflow-y: auto;
  overflow-x: clip;
  &__header{
    width: 100%;
    text-align: center;
    position: relative;
    @include action-item;
    &-text{
      width: calc(100% - 18px);
      text-align: center;
    }
    .ui-button{
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  &__info{
    margin-top: 32px;
  }
  &__info-item{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    &-value{
      @include tool-item;
      background: $settings-color;
      border-radius: 16px;
      max-height: calc(16px + 24px);
      padding: 6px 4px;
      text-align: center;
      width: min(200px, 95%);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }
  }
  &__nav{
    margin-top: 24px;
    text-align: center;
    &-items{
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 24px;
    }
    &-item{
      @include device-item;
      background: $settings-color;
      box-shadow: 0 0 4px $color-active;
      padding: 24px 12px;
      min-width: min(172px, 100%);
      text-align: center;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &.--active{
        background: $color-active;
        color: $bg-primary;
      }
    }
  }
  &__tabs{
    margin-top: 20px;
  }
  &__tab{
    margin-top: 24px;
    padding-inline: 8px;
    &-value{
      display: flex;
      justify-content: center;
      align-items: center;
      gap:12px;
      .input-wrapper{
        position: relative;
        //&:before{
        //  display: block;
        //  position: absolute;
        //  content: '°C';
        //  color: $bg-primary;
        //  font-weight: 600;
        //  font-size: 20px;
        //  z-index: 1;
        //}
        input[type=number]{
          color: $bg-primary;
          font-weight: 600;
          font-size: 20px;
          background: $color-active;
          outline: 0;
          border: 0;
          width: 80px;
          padding: 12px 8px;
          text-align: center;
          border-radius: 16px;
          -moz-appearance: textfield;
          position: relative;
          @media screen and (max-width: 768px) {
            font-size: 16px;
          }

          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button{
            -webkit-appearance: none;
            margin: 0;
          }
        }
      }
      &-condition-header{
        text-align: center;
        margin-top: 32px;
      }

      &-condition-item{
        margin-top: 20px;
        padding: 12px;
        @include device-item;
        background: $settings-color;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 0 4px $color-active;
        &.--active{
          background: $color-active;
          color: $bg-primary;
        }
      }
    }
  }
  &>.ui-button{
    margin-top: 40px;
  }
}
</style>
