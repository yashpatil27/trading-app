const { createClient } = require('redis')

async function monitorRedis() {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  })

  await client.connect()

  console.log('🔍 Redis Cache Monitor')
  console.log('======================')

  try {
    // Get all balance keys
    const balanceKeys = await client.keys('balance:*')
    
    console.log(`📊 Total cached balances: ${balanceKeys.length}`)
    
    if (balanceKeys.length > 0) {
      console.log('\n💰 Current Cached Balances:')
      
      for (const key of balanceKeys) {
        const value = await client.get(key)
        const ttl = await client.ttl(key)
        console.log(`  ${key}: ${value} (TTL: ${ttl > 0 ? ttl + 's' : 'no expiry'})`)
      }
    }

    // Test cache performance
    console.log('\n⚡ Cache Performance Test:')
    
    const testKey = 'performance:test'
    const iterations = 100
    
    // Test SET performance
    const startSet = Date.now()
    for (let i = 0; i < iterations; i++) {
      await client.set(`${testKey}:${i}`, `value${i}`)
    }
    const setTime = Date.now() - startSet
    
    // Test GET performance  
    const startGet = Date.now()
    for (let i = 0; i < iterations; i++) {
      await client.get(`${testKey}:${i}`)
    }
    const getTime = Date.now() - startGet
    
    // Cleanup test keys
    const testKeys = await client.keys(`${testKey}:*`)
    if (testKeys.length > 0) {
      await client.del(testKeys)
    }
    
    console.log(`  SET ${iterations} keys: ${setTime}ms (${(setTime/iterations).toFixed(2)}ms per key)`)
    console.log(`  GET ${iterations} keys: ${getTime}ms (${(getTime/iterations).toFixed(2)}ms per key)`)

  } catch (error) {
    console.error('❌ Redis error:', error)
  } finally {
    await client.disconnect()
  }
}

monitorRedis()
