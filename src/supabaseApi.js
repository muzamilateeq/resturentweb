const SUPABASE_REST_URL = normalizeSupabaseRestUrl(import.meta.env.VITE_SUPABASE_REST_URL)
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const CACHE_TTL_MS = 30_000

const ordersSelect =
  'id,date,type,customer_name,customer_phone,delivery_address,order_items,total_price,status,created_at'
const reservationsSelect = 'id,date_created,name,date,time,guests,created_at'

const responseCache = new Map()

function normalizeSupabaseRestUrl(value = '') {
  const cleanedValue = value.trim().replace(/^\[|\]$/g, '').replace(/^['"]|['"]$/g, '')

  if (!cleanedValue) {
    return ''
  }

  try {
    const url = new URL(cleanedValue)
    const restIndex = url.pathname.indexOf('/rest/v1')

    url.pathname = restIndex >= 0 ? url.pathname.slice(0, restIndex + '/rest/v1'.length) : '/rest/v1'
    url.search = ''
    url.hash = ''

    return url.toString().replace(/\/$/, '')
  } catch {
    return cleanedValue.replace(/\/$/, '')
  }
}

function assertSupabaseConfig() {
  if (!SUPABASE_REST_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_REST_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!SUPABASE_REST_URL.includes('.supabase.co/rest/v1')) {
    throw new Error(
      'Invalid Supabase REST URL. Use the format https://your-project.supabase.co/rest/v1 without brackets.',
    )
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
    throw new Error(getSupabaseErrorMessage(message, response.status))
  }

  if (response.status === 204) {
    return null
  }

  const responseText = await response.text()
  const data = responseText ? JSON.parse(responseText) : null

  if (shouldUseCache) {
    responseCache.set(cacheKey, { data, createdAt: Date.now() })
  }

  return data
}

function getSupabaseErrorMessage(message, status) {
  try {
    const details = JSON.parse(message)
    return details.message || details.hint || `Supabase request failed with status ${status}`
  } catch {
    if (status === 404) {
      return 'Supabase table or REST endpoint was not found. Check VITE_SUPABASE_REST_URL and run supabase_schema.sql.'
    }

    return message || `Supabase request failed with status ${status}`
  }
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
  return Array.isArray(rows) ? rows[0] : null
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
  return Array.isArray(rows) ? rows[0] : null
}

export async function createReservation(reservation) {
  const rows = await request('reservations', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(reservation),
  })

  clearDashboardCache()
  return Array.isArray(rows) ? rows[0] : null
}

export async function getReservations({ limit = 50, forceRefresh = false } = {}) {
  return request('reservations', {
    query: `?select=${reservationsSelect}&order=created_at.desc&limit=${limit}`,
    useMemoryCache: true,
    forceRefresh,
  })
}
