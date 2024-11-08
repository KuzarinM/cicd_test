<template>
  <div class="smart-meter">
    <div class="smart-meter__header">
      <p class="smart-meter__title">
        Счетчики
      </p>
      <div class="smart-meter__divider" />
      <div class="smart-meter__date">
        {{ getTodayDate() }}
      </div>
    </div>
    <div class="smart-meter__body">
      <div v-show="meterElectricity.tariffs.length !== 0" class="smart-meter__electricity">
        <div class="smart-meter__electricity-header">
          <ui-icon name="service/other/lightning" size="20" />
          <p class="smart-meter__title-meter">
            Электроэнергия
          </p>
        </div>
        <div
          class="smart-meter__electricity-meter"
        >
          <div class="smart-meter__electricity-sum">
            <p class="smart-meter__info">
              {{ meterElectricity.sum }} кВт
            </p>
            <p class="smart-meter__help-info-electricity">
              кВт⋅ч
            </p>
          </div>
          <div class="smart-meter__electricity-tariffs">
            <div
              v-for="(tariff, index) in meterElectricity.tariffs"
              :key="index"
              class="smart-meter__electricity-tariff"
            >
              <p class="smart-meter__help-info">
                Т{{ index + 1 }}
              </p>
              <p class="smart-meter__info">
                {{ tariff }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-show="metersWater.length !== 0" class="smart-meter__water">
        <div class="smart-meter__header-water">
          <ui-icon name="service/devices/water-outline" size="20" />
          <p class="smart-meter__title-meter">
            Водоснабжение
          </p>
        </div>
        <div class="smart-meter__water-meters">
          <div
            v-for="meterWater in metersWater"
            :key="meterWater.id"
            class="smart-meter__water-meter"
          >
            <p class="smart-meter__help-info">
              {{ metersWater[0].name }}
            </p>
            <p class="smart-meter__info">
              {{ metersWater[0].value }} м<sup>3</sup>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ServiceProps } from "~/components/Service/TheService.vue"

interface ISmartMeterProps {
	meters: ServiceProps[]
}

interface IMeterElectricity {
    sum: number
    tariffs: number[]
}

interface IWaterElectricity {
	id: string
	name: string
    value: number
}

const { meters } = defineProps<ISmartMeterProps>()

const meterElectricity = reactive<IMeterElectricity>({
  sum: -1,
  tariffs: [],
})
const metersWater = reactive<IWaterElectricity[]>([])

onBeforeMount(() => {
  getMetersData()
})

function getMetersData () {
  meters.forEach((meter) => {
    if (meter.type.includes('smart_meter.electricity')) {
      meterElectricity.tariffs = meter.capabilities![0].value.toString().split(' ').map(Number) as number[]
      meterElectricity.sum = calculateSum(meterElectricity.tariffs)
      return
    }
    metersWater.push({
      id: meter.id,
      name: meter.name,
      value: meter.capabilities![0].value,
    })
  })
}

function calculateSum (values: number[]) {
  return values.reduce((accumulation, current) => {
    return accumulation + current
  }, 0)
}

function getTodayDate () {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  const formattedDate = today.toLocaleDateString('ru-RU', options)

  const [day, month] = formattedDate.split(' ')
  return `${day} ${month}, ${today.getFullYear()}`
}
</script>

<style lang="scss">
@import "assets/styles/components/smart-meter";
</style>
