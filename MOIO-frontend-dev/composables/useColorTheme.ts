export default function useColorTheme () {
  enum ThemeNames {
    light = 'theme-light',
    dark = 'theme-dark'
  }

  const name = useCookie<string>('theme-color', {
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
    watch: true,
    default: () => ThemeNames.dark,
  })

  const toggle = () => {
    name.value = name.value === ThemeNames.light ? ThemeNames.dark : ThemeNames.light
  }

  const bind = computed(() => {
    return {
      'data-theme': name.value,
    }
  })

  const setDefault = () => {
    name.value = ThemeNames.dark
  }

  if (!name.value) {
    setDefault()
  }

  return {
    names: ThemeNames,
    name,
    bind,
    toggle,
  }
}
