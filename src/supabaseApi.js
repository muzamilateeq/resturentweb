const SUPABASE_REST_URL = import.meta.env.VITE_SUPABASE_REST_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const CACHE_TTL_MS = 30_000

const ordersSelect =
  'id,date,type,customer_name,customer_phone,delivery_address,order_items,total_price,status,created_at'
const reservationsSelect = 'id,date_created,name,date,time,guests,created_at'

const responseCache = new Map()

function assertSupabaseConfig() {
  if (!SUPABASE_REST_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_REST_URL and VITE_SUPABASE_ANON_KEY.')
  }
}

const baseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
}

function getCacheKey(table, query) {
  return `${table}:${query || ''}`
}

async function request(table, options = {}) {
  assertSupabaseConfig()

  const { query = '', forceRefresh = false, useMemoryCache = false, ...fetchOptions } = options
  const cacheKey = getCacheKey(table, query)
  const shouldUseCache = useMemoryCache && fetchOptions.method !== 'POST' && fetchOptions.method !== 'PATCH'
  const cached = responseCache.get(cacheKey)

  if (shouldUseCache && cached && Date.now() - cached.createdAt < CACHE_TTL_MS && !forceRefresh) {
    return cached.data
  }

  const response = await fetch(`${SUPABASE_REST_URL}/${table}${query}`, {
    ...fetchOptions,
    headers: {
      ...baseHeaders,
      ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Supabase request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (shouldUseCache) {
    responseCache.set(cacheKey, { data, createdAt: Date.now() })
  }

  return data
}

function clearDashboardCache() {
  responseCache.delete(getCacheKey('orders', `?select=${ordersSelect}&order=created_at.desc&limit=50`))
  responseCache.delete(getCacheKey('reservations', `?select=${reservationsSelect}&order=created_at.desc&limit=50`))
}

export async function createOrder(order) {
  const rows = await request('orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(order),
  })

  clearDashboardCache()
  return rows[0]
}

export async function getOrders({ limit = 50, forceRefresh = false } = {}) {
  return request('orders', {
    query: `?select=${ordersSelect}&order=created_at.desc&limit=${limit}`,
    useMemoryCache: true,
    forceRefresh,
  })
}

export async function updateOrderStatus(orderId, status) {
  const rows = await request('orders', {
    method: 'PATCH',
    query: `?id=eq.${encodeURIComponent(orderId)}&select=${ordersSelect}`,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ status }),
  })

  clearDashboardCache()
  return rows[0]
}

export async function createReservation(reservation) {
  const rows = await request('reservations', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(reservation),
  })

  clearDashboardCache()
  return rows[0]
}

export async function getReservations({ limit = 50, forceRefresh = false } = {}) {
  return request('reservations', {
    query: `?select=${reservationsSelect}&order=created_at.desc&limit=${limit}`,
    useMemoryCache: true,
    forceRefresh,
  })
}
