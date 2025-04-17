import { defineConfig, store, drivers } from '@adonisjs/cache'
import type { InferStores } from '@adonisjs/cache/types'

const cacheConfig = defineConfig({
  default: 'default',

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    default: store()
      .useL1Layer(drivers.memory())
      .useL2Layer(drivers.redis({ connectionName: undefined })),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
