import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  ReceiptText,
  ShoppingBag,
  Truck,
  Utensils,
  Users,
} from 'lucide-react'

import { getOrders, getReservations, updateOrderStatus } from './supabaseApi'

const adminPasscodeHash = import.meta.env.VITE_ADMIN_PASSCODE_HASH

function formatPrice(value) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return '$0.00'
  }

  return `$${numericValue.toFixed(2)}`
}

function getDatabaseErrorMessage(error) {
  if (!error?.message) {
    return 'Database error. Please check your Supabase table and policies.'
  }

  try {
    const details = JSON.parse(error.message)
    return details.message || details.hint || error.message
  } catch {
    return error.message
  }
}

function formatDate(value) {
  if (!value) {
    return 'Not available'
  }

  return new Date(value).toLocaleString()
}

function formatOrderItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'No items'
  }

  return items.map((item) => `${item.quantity} x ${item.name}`).join(', ')
}

async function hashPasscode(passcode) {
  if (!crypto?.subtle) {
    throw new Error('Secure browser crypto is not available. Please use HTTPS or a modern browser.')
  }

  const encoded = new TextEncoder().encode(passcode)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState('')
  const [message, setMessage] = useState('')

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0)

    return {
      totalSales,
      deliveryOrders: orders.filter((order) => order.type === 'Delivery').length,
      pickupOrders: orders.filter((order) => order.type === 'Pickup').length,
    }
  }, [orders])

  async function loadDashboardData({ forceRefresh = false } = {}) {
    setIsLoading(true)
    setMessage('')

    try {
      const [latestOrders, latestReservations] = await Promise.all([
        getOrders({ forceRefresh }),
        getReservations({ forceRefresh }),
      ])
      setOrders(Array.isArray(latestOrders) ? latestOrders : [])
      setReservations(Array.isArray(latestReservations) ? latestReservations : [])
      setMessage('Latest Supabase data loaded.')
    } catch (error) {
      setMessage(`Unable to load dashboard data: ${getDatabaseErrorMessage(error)}`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function unlockDashboard(event) {
    event.preventDefault()

    if (!adminPasscodeHash) {
      setMessage('Admin passcode is not configured. Add VITE_ADMIN_PASSCODE_HASH in your environment variables.')
      return
    }

    let enteredPasscodeHash = ''

    try {
      enteredPasscodeHash = await hashPasscode(passcode)
    } catch (error) {
      setMessage(error.message)
      return
    }

    if (enteredPasscodeHash !== adminPasscodeHash?.toLowerCase()) {
      setMessage('Wrong passcode. Please try again.')
      return
    }

    setIsUnlocked(true)
    setMessage('')
  }

  async function toggleOrderStatus(order) {
    const nextStatus = order.status === 'Done' ? 'Pending' : 'Done'
    setUpdatingOrderId(order.id)
    setMessage('')

    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus)
      setOrders((current) =>
        current.map((currentOrder) =>
          currentOrder.id === order.id ? updatedOrder || { ...currentOrder, status: nextStatus } : currentOrder,
        ),
      )
      setMessage(`Order ${order.id} marked as ${nextStatus}.`)
    } catch (error) {
      setMessage(`Unable to update order status: ${getDatabaseErrorMessage(error)}`)
      console.error(error)
    } finally {
      setUpdatingOrderId('')
    }
  }

  useEffect(() => {
    if (isUnlocked) {
      loadDashboardData()
    }
  }, [isUnlocked])

  if (!isUnlocked) {
    return (
      <div className="admin-shell">
        <form className="admin-login" onSubmit={unlockDashboard}>
          <a className="logo" href="/" aria-label="Burger Rush home">
            <span>
              <Utensils size={22} />
            </span>
            <strong>Burger Rush</strong>
          </a>
          <div>
            <span className="eyebrow">Private owner area</span>
            <h1>Admin dashboard</h1>
            <p>Enter your passcode to view live orders and table bookings from Supabase.</p>
          </div>
          <label>
            <span>Passcode</span>
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit">
            <LockKeyhole size={18} />
            Open dashboard
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="logo" href="/" aria-label="Burger Rush home">
          <span>
            <Utensils size={22} />
          </span>
          <strong>Burger Rush</strong>
        </a>
        <div className="admin-actions">
          <button type="button" onClick={() => loadDashboardData({ forceRefresh: true })} disabled={isLoading}>
            <RefreshCw size={17} />
            {isLoading ? 'Loading' : 'Refresh'}
          </button>
          <a href="/">View website</a>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-title">
          <span className="eyebrow">Supabase live data</span>
          <h1>Orders dashboard</h1>
          <p>Customer orders and reservations appear here after they are saved in Supabase.</p>
        </section>

        <section className="admin-stats" aria-label="Dashboard summary">
          <article>
            <ReceiptText size={22} />
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </article>
          <article>
            <Truck size={22} />
            <span>Delivery</span>
            <strong>{stats.deliveryOrders}</strong>
          </article>
          <article>
            <ShoppingBag size={22} />
            <span>Pickup</span>
            <strong>{stats.pickupOrders}</strong>
          </article>
          <article>
            <Users size={22} />
            <span>Reservations</span>
            <strong>{reservations.length}</strong>
          </article>
          <article>
            <CheckCircle2 size={22} />
            <span>Total sales</span>
            <strong>{formatPrice(stats.totalSales)}</strong>
          </article>
        </section>

        {message && <p className="admin-message">{message}</p>}

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Latest orders</h2>
            <span>{orders.length} records</span>
          </div>

          <div className="admin-orders-table">
            {orders.length === 0 ? (
              <p className="empty-cart">No orders found yet.</p>
            ) : (
              <>
                <div className="admin-table-header">
                  <span>Customer</span>
                  <span>Phone</span>
                  <span>Items</span>
                  <span>Total</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                {orders.map((order) => (
                  <article className="admin-table-row" key={order.id}>
                    <div>
                      <strong>{order.customer_name}</strong>
                      <small>{order.id} - {order.type}</small>
                      <small>{order.delivery_address || 'Pickup order'}</small>
                    </div>
                    <span>{order.customer_phone}</span>
                    <span>{formatOrderItems(order.order_items)}</span>
                    <strong>{formatPrice(order.total_price)}</strong>
                    <span className={order.status === 'Done' ? 'status-pill done' : 'status-pill'}>
                      {order.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleOrderStatus(order)}
                      disabled={updatingOrderId === order.id}
                    >
                      {updatingOrderId === order.id
                        ? 'Saving'
                        : order.status === 'Done'
                          ? 'Mark pending'
                          : 'Mark done'}
                    </button>
                  </article>
                ))}
              </>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Table bookings</h2>
            <span>{reservations.length} records</span>
          </div>

          <div className="reservation-table">
            {reservations.length === 0 ? (
              <p className="empty-cart">No reservations found yet.</p>
            ) : (
              reservations.map((booking) => (
                <article className="reservation-row" key={booking.id}>
                  <strong>{booking.name}</strong>
                  <span>{booking.date}</span>
                  <span>{booking.time}</span>
                  <span>{booking.guests} guests</span>
                  <span>{formatDate(booking.created_at)}</span>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
