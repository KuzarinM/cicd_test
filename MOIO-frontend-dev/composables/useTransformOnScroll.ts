import { type Ref } from "vue"
import { throttle } from "@antfu/utils"

export default function useTransformOnScroll (scrollTarget:Ref<HTMLDivElement>,
  hideTarget:Ref<HTMLDivElement>[],
  showValue:string,
  hideValue:string,
  vector?:'top'|'bottom'|'left'|'right') {
  const prevScroll = ref(scrollTarget.value?.scrollTop ?? 0)
  function transform () {
    const currentScrollPos = scrollTarget.value.scrollTop
    const delta = currentScrollPos - prevScroll.value
    if (delta <= 0 || currentScrollPos <= 100) {
      hideTarget.forEach((el) => {
        el.value.style[vector ?? "top"] = showValue
      })
    } else {
      hideTarget.forEach((el) => {
        el.value.style[vector ?? "top"] = hideValue
      })
    }
    prevScroll.value = currentScrollPos
  }
  onMounted(() => {
    const runTransform = throttle(500, transform)
    scrollTarget.value.addEventListener('scroll', function () {
      runTransform()
    }, { passive: true })
  })
}
