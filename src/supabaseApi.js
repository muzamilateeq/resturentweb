const SUPABASE_REST_URL = 'https://ngqsbmwqagkjdawqhrgk.supabase.co/rest/v1'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNibXdxYWdramRhd3FocmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Nzk5NjksImV4cCI6MjA5MzQ1NTk2OX0.6-Na4NCehpui1D-D6y_xpS1luay3E6rELzR7-CcnSGU'

const baseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
}

async function request(table, options = {}) {
  const response = await fetch(`${SUPABASE_REST_URL}/${table}${options.query || ''}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Supabase request failed with ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function getOrders() {
  return request('orders', {
    query: '?select=*&order=created_at.desc',
  })
}

export async function createOrder(order) {
  const rows = await request('orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(order),
  })

  return rows[0]
}

export async function updateOrder(orderId, updates) {
  const rows = await request('orders', {
    method: 'PATCH',
    query: `?id=eq.${encodeURIComponent(orderId)}`,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(updates),
  })

  return rows[0]
}

export async function deleteOrderRow(orderId) {
  return request('orders', {
    method: 'DELETE',
    query: `?id=eq.${encodeURIComponent(orderId)}`,
  })
}

export async function getReservations() {
  return request('reservations', {
    query: '?select=*&order=created_at.desc',
  })
}

export async function createReservation(reservation) {
  const rows = await request('reservations', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(reservation),
  })

  return rows[0]
}

export async function deleteReservationRow(bookingId) {
  return request('reservations', {
    method: 'DELETE',
    query: `?id=eq.${encodeURIComponent(bookingId)}`,
  })
}
