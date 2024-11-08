import fs from 'fs'
import path from 'path'
import { addTypeTemplate, createResolver, defineNuxtModule } from 'nuxt/kit'
import { consola } from 'consola'

export default defineNuxtModule({
  meta: {
    name: 'ui-icon',
  },

  setup () {
    function* readAllFiles (dir: string): Generator<string> {
      const files = fs.readdirSync(dir, { withFileTypes: true })
      for (const file of files) {
        if (file.isDirectory()) {
          yield * readAllFiles(path.join(dir, file.name))
        } else {
          yield path.join(dir, file.name)
        }
      }
    }

    const resolver = createResolver(import.meta.url)
    const iconsDir = resolver.resolve('../../assets/icons')
    const filenames = readAllFiles(iconsDir)

    const iconKeys = Array.from(filenames)
      .filter(filePath => filePath.endsWith('.svg'))
      .map((filePath) => {
        const path = filePath
          .replace(/\\/g, '/')
          .replace('.svg', '')

        const sourceToIcon = 'assets/icons'
        const match = path.match(sourceToIcon)
        if (match?.index) {
          return path.slice(match.index + sourceToIcon.length + 1)
        } else {
          throw `Icon error, icon not found: ${filePath}`
        }
      })
    addTypeTemplate({
      filename: 'types/ui-icon.d.ts',
      getContents: () => {
        return /* ts */`export type TUiIconNames = ${iconKeys.map(i => `'${i}'`).join('|')}`
      },
    })
    const iconNames = iconKeys.reduce((acc:{[key:string]:string[]}, curr) => {
      const matcher = curr.match(/\w*[/]/gm)
      if (!acc) {
        acc = {}
      }
      if (matcher?.length) {
        matcher.forEach((el) => {
          if (acc[el.slice(0, -1)]?.length) {
            acc[el.slice(0, -1)] = [...acc[el.slice(0, -1)], curr]
          } else {
            acc[el.slice(0, -1)] = [curr]
          }
        })
      } else if (acc.other?.length) {
        acc.other = [...acc.other, curr]
      } else {
        acc.other = [curr]
      }
      return acc
    }, {})
    const writeableStream = fs.createWriteStream('utils/ui-icon.ts')
    writeableStream.write(`\nimport type { TUiIconNames } from "#build/types/ui-icon";\nexport const uiIconNames:{ [key:string]: TUiIconNames[] } = ${JSON.stringify(iconNames, null, 2)}`)
    consola.info('[$uiIcon] icon types successful generated!')
  },
})
