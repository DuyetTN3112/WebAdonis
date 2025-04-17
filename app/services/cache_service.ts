import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'redis',

  stores: {
    /**
     * Cache data only on DynamoDB
     */
    dynamodb: store().useL2Layer(
      drivers.dynamodb({
        table: { name: 'cache' },
        region: { region: 'us-east-1' },
        endpoint: { endpoint: 'http://localhost:8000' },
      })
    ),

    /**
     * Cache data using your Lucid-configured database
     */
    database: store().useL2Layer(drivers.database({ connectionName: 'default' })),

    /**
     * Cache data in-memory as the primary store and Redis as the secondary store.
     * If your application is running on multiple servers, then in-memory caches
     * need to be synchronized using a bus.
     */
    redis: store()
      .useL1Layer(drivers.memory({ maxSize: '100mb' }))
      .useL2Layer(drivers.redis({}))
      .useBus(drivers.redisBus({})),
  },
})

export default cacheConfig
