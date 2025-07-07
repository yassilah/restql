import { resolve } from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
   entries: [
      './src/index',
      './src/utils/helpers',
      './src/utils/statements',
      './src/drivers/sqlite/index',
      './src/drivers/postgres/index',
      './src/drivers/mysql/index',
   ],
   alias: {
      '@': resolve('src'),
      '@@': resolve(''),
   },
   declaration: true,
})
