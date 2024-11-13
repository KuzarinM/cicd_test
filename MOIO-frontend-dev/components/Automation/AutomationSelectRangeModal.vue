<template>
  <div v-if="isShown" class="automation-select-range">
    <div class="scrollable-content">
      <div class="automation-select-range__header">
        <div class="automation-select-range__header-text">
          Условия
        </div>
        <ui-button
          class-name="blank"
          class="back"
          margin-inline="0"
          padding="0"
          @click="emit('prevStep',{step: 1})"
        >
          <ui-icon :name="'close'" />
        </ui-button>
        <ui-button
          class-name="blank"
          margin-inline="0"
          padding="0"
          rounded="12px"
          class="next"
          @click="emit('nextStep',{step: 3}),saveChanges()"
        >
          Далее
        </ui-button>
      </div>
      <div class="automation-select-range__info">
        <div class="automation-select-range__info-item">
          <label class="automation-select-range__info-item-label" for="name">
            Когда
          </label>
          <div class="automation-select-range__info-item-value">
            {{ name }}
          </div>
        </div>
      </div>
      <div class="automation-select-range__tabs">
        <div class="automation-select-range__tabs-header">
          Температура
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
            <div class="automation-select-range__tab-value-condition">
              <div class="automation-select-range__tab-value-condition-list">
                <div
                  :class="`automation-select-range__tab-value-condition-item`"
                  @click="singleValueCondition.condition = 1"
                >
                  <ui-checkbox
                    :initial-bg="'var(--settings-color)'"
                    :checked="singleValueCondition.condition === 1"
                    @check="singleValueCondition.condition = 1"
                  />
                  Поднимается выше
                </div>

                <div
                  :class="`automation-select-range__tab-value-condition-item`"
                  @click="singleValueCondition.condition = 0"
                >
                  <ui-checkbox
                    :initial-bg="'var(--settings-color)'"
                    :checked="singleValueCondition.condition === 0"
                    @check="singleValueCondition.condition = 0"
                  />
                  Опускается ниже
                </div>

                <div
                  :class="`automation-select-range__tab-value-condition-item`"
                  @click="singleValueCondition.condition = 2"
                >
                  <ui-checkbox
                    :initial-bg="'var(--settings-color)'"
                    :checked="singleValueCondition.condition === 2"
                    @check="singleValueCondition.condition = 2"
                  />
                  Равна
                </div>
              </div>
              <div class="automation-select-range__tab-value">
                <span class="input-wrapper">
                  <input
                    id="value"
                    v-model.number="scrollPickerModal"
                    type="number"
                    @focusout="singleValueCondition.value = validateInputNumber(singleValueCondition.value, (range?.min ?? 0) + 1,range?.max ?? 100)"
                  >°C
                </span>
                <ScrollPicker
                  v-model="scrollPickerModal"
                  :options="options"
                />
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICapability } from '~/api/automations/getById';
import type { IAutomationValue } from "~/api/automations/create"
import 'vue-drumroll-datetime-picker/dist/style.css'
import ScrollPicker from "vue3-scroll-picker"
import "vue-scroll-picker/lib/style.css"

export interface IAutomationSelectRangeProps {
  name:string
  range?:ICapability['range']
  isShown?:boolean
}
const props = defineProps<IAutomationSelectRangeProps>()
const emit = defineEmits<{
  saveAutomationCondition:[
      value:Exclude<IAutomationValue["automationCondition"], undefined>
  ],
  saveTemperatureRange:[
      value:Exclude<IAutomationValue["temperatureRange"], undefined>
  ],
  nextStep:[{step:number}]
  prevStep:[{step:number}]
}>()

const currentNav = ref(0)
const startValue = computed(() => props.range?.min ?? 0)
const endValue = computed(() => props.range?.max ?? 100)
const scrollPickerModal = ref([startValue.value])
const options = computed(() => {
  const arra:[{value:number, label:number}[]] = [[]]
  for (let i = startValue.value; i <= endValue.value; i++) {
    arra[0].push({ value: i, label: i })
  }
  return arra
})

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
  singleValueCondition.value.value = scrollPickerModal.value[0]
  if (currentNav.value === 0) {
    emit('saveAutomationCondition', { ...singleValueCondition.value })
  }
  if (currentNav.value === 1) {
    emit('saveTemperatureRange', { min: startValue.value ?? 0, max: endValue.value ?? 100 })
  }
}

watch(startValue, (newValue) => {
  scrollPickerModal.value = [newValue ?? 0]
}, { deep: true, immediate: true })
</script>

<style lang="scss">
.add-menu-enter-active,
.add-menu-leave-active {
  transition: all 0.5s ease;
}

.add-menu-enter-from,
.add-menu-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.add-menu-enter-to,
.add-menu-leave-from {
  transition: 0.5s ease;
  opacity: 1;
  transform: translateY(0);
}
.timePicker-enter-active,
.timePicker-leave-active {
  transition: all 0.5s ease;
}

.timePicker-enter-from,
.timePicker-leave-to {
  opacity: 0;
}
.timePicker-enter-to,
.timePicker-leave-from {
  transition: 0.5s ease;
  opacity: 1;
}
.automation-select-range{
  @include device-item;
  overflow-y: auto;
  overflow-x: clip;
  position: absolute;
  z-index: 11;
  padding: 20px;
  background-color: $bg-primary;
  inset: 0;
  overflow: hidden;
  @media (max-width: 1200px) {
      padding-right: 0;
    }
  &__header{
    width: 100%;
    padding-top: 40px;
    position: relative;
    @include action-item;
    &-text{
      width: 80%;
      font-size: 44px;
      font-weight: 600;
    }
    .ui-button{
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  &__info{
    margin-top: 20px;
  }
  &__info-item{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 20px;
    label{
      font-size: 24px;
      font-weight: 600;
    }
    &-value{
      @include tool-item;
      border-radius: 12px;
      padding: 6px 4px;
      display: --box;
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
    &-header{
      border-top: 1px solid $color-border;
      padding-top: 40px;
      font-size: 24px;
      font-weight: 600;
    }
  }
  &__tab{
    margin-top: 24px;
    padding-inline: 8px;
    &-value{
      display: flex;
      align-items: center;
      gap:12px;
      .input-wrapper{
        position: relative;
        border: 1px solid $color-border ;
        border-radius: 12px;
        input[type=number]{
          color: $color-primary;
        font-weight: 600;
          font-size: 20px;
          background: $bg-primary;
          outline: 0;
          border: 0;
          width: 80px;
          padding: 12px 8px;
          text-align: center;
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
      &-condition-list{
        margin-bottom: 40px;
      }
      &-condition-item{
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 20px;
        @include device-item;
        cursor: pointer;
        &.--active{
          background: $color-active;
          color: $bg-primary;
        }
      }
    }
  }
  .save{
    .back{
      margin-top: 40px;
      display: flex;
      width: 20%;
      z-index: 2;
    }
  }
  .next{ 
    position: absolute;
    left: calc(100% - 20px);
    transform: translateX(-100%);
    width: fit-content;
    z-index: 1;
    color: $color-active;
    cursor: pointer;
  }
}
</style>
