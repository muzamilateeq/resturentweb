import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Star,
  Truck,
  Utensils,
  X,
} from 'lucide-react'

const categories = ['All', 'Burgers', 'Chicken', 'Pizza', 'Sides', 'Dessert', 'Drinks']

const menuItems = [
  {
    id: 1,
    name: 'Signature Flame Burger',
    category: 'Burgers',
    price: 12.99,
    rating: 4.9,
    time: '18 min',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    description: 'Double beef patty, cheddar, charred onion, house sauce, toasted brioche.',
  },
  {
    id: 2,
    name: 'Crispy Chicken Stack',
    category: 'Chicken',
    price: 10.99,
    rating: 4.8,
    time: '24 min',
    image:
      'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
    description: 'Crunchy chicken fillet, lettuce, spicy mayo, cheese, and toasted bun.',
  },
  {
    id: 3,
    name: 'Wood Fired Margherita',
    category: 'Pizza',
    price: 14.25,
    rating: 4.7,
    time: '20 min',
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    description: 'Fresh mozzarella, basil, San Marzano tomato, extra virgin olive oil.',
  },
  {
    id: 4,
    name: 'Loaded Cheesy Fries',
    category: 'Sides',
    price: 8.75,
    rating: 4.9,
    time: '22 min',
    image:
      'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80',
    description: 'Crispy fries, melted cheese, jalapenos, grilled chicken, and house sauce.',
  },
  {
    id: 5,
    name: 'Molten Chocolate Cake',
    category: 'Dessert',
    price: 7.5,
    rating: 4.8,
    time: '12 min',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
    description: 'Warm chocolate center, vanilla cream, roasted nuts, berry dust.',
  },
  {
    id: 6,
    name: 'Mint Citrus Cooler',
    category: 'Drinks',
    price: 4.5,
    rating: 4.6,
    time: '5 min',
    image:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80',
    description: 'Fresh mint, lemon, sparkling water, crushed ice, light cane syrup.',
  },
]

const reviews = [
  {
    name: 'Sara Malik',
    text: 'The burger arrived hot, the fries were crispy, and checkout was super quick.',
  },
  {
    name: 'Ahmed Raza',
    text: 'Easy online ordering and the double smash combo was excellent. This is our new snack spot.',
  },
  {
    name: 'Nadia Khan',
    text: 'Booked a table from the website and the staff had everything ready when we arrived.',
  },
]

function formatPrice(value) {
  return `$${value.toFixed(2)}`
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const isOwnerPage = window.location.pathname === '/owner'
  const cartIconRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState('Delivery')
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [reservation, setReservation] = useState({ name: '', date: '', time: '', guests: '2' })
  const [confirmation, setConfirmation] = useState('')
  const [reservationMessage, setReservationMessage] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [ownerPasscode, setOwnerPasscode] = useState('')
  const [ownerError, setOwnerError] = useState('')
  const [isOwner, setIsOwner] = useState(() => localStorage.getItem('burgerRushOwner') === 'true')
  const [flyingItem, setFlyingItem] = useState(null)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [editOrderDraft, setEditOrderDraft] = useState(null)
  const [savedOrders, setSavedOrders] = useState(() => {
    const stored = localStorage.getItem('burgerRushOrders') || localStorage.getItem('flameForkOrders')
    return stored ? JSON.parse(stored) : []
  })
  const [savedReservations, setSavedReservations] = useState(() => {
    const stored = localStorage.getItem('burgerRushReservations') || localStorage.getItem('flameForkReservations')
    return stored ? JSON.parse(stored) : []
  })

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch = activeCategory === 'All' || item.category === activeCategory
      const searchMatch = `${item.name} ${item.description} ${item.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      return categoryMatch && searchMatch
    })
  }, [activeCategory, searchTerm])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = orderType === 'Delivery' && cart.length ? 2.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + deliveryFee + tax
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const activeOrders = savedOrders.filter((order) => order.status !== 'Complete')
  const completedOrders = savedOrders.filter((order) => order.status === 'Complete')
  const ownerRevenue = savedOrders.reduce((sum, order) => sum + order.total, 0)

  useEffect(() => {
    localStorage.setItem('burgerRushOrders', JSON.stringify(savedOrders))
  }, [savedOrders])

  useEffect(() => {
    localStorage.setItem('burgerRushReservations', JSON.stringify(savedReservations))
  }, [savedReservations])

  function ownerLogin(event) {
    event.preventDefault()

    if (ownerPasscode === '1234') {
      setIsOwner(true)
      localStorage.setItem('burgerRushOwner', 'true')
      setOwnerPasscode('')
      setOwnerError('')
    } else {
      setOwnerError('Wrong passcode. Please try again.')
    }
  }

  function ownerLogout() {
    setIsOwner(false)
    localStorage.removeItem('burgerRushOwner')
  }

  function exportOrders() {
    const header = ['Order ID', 'Date', 'Name', 'Phone', 'Type', 'Location', 'Food Selected', 'Total']
    const rows = savedOrders.map((order) => [
      order.id,
      order.date,
      order.customer.name,
      order.customer.phone,
      order.type,
      order.customer.address || 'Pickup from restaurant',
      order.items.map((item) => `${item.quantity}x ${item.name}`).join(' | '),
      formatPrice(order.total),
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    downloadFile('restaurant-orders.csv', csv)
  }

  function deleteOrder(orderId) {
    setSavedOrders((current) => current.filter((order) => order.id !== orderId))
    if (editingOrderId === orderId) {
      setEditingOrderId(null)
      setEditOrderDraft(null)
    }
  }

  function markOrderComplete(orderId) {
    setSavedOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: 'Complete' } : order)),
    )
  }

  function deleteReservation(bookingId) {
    setSavedReservations((current) => current.filter((booking) => booking.id !== bookingId))
  }

  function startEditOrder(order) {
    setEditingOrderId(order.id)
    setEditOrderDraft({
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
      type: order.type,
      food: order.items.map((item) => `${item.quantity}x ${item.name}`).join(', '),
      total: order.total.toFixed(2),
    })
  }

  function saveEditedOrder(orderId) {
    const editedItems = editOrderDraft.food
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ name: item, quantity: 1, price: 0 }))

    setSavedOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              type: editOrderDraft.type,
              customer: {
                name: editOrderDraft.name,
                phone: editOrderDraft.phone,
                address: editOrderDraft.address,
              },
              items: editedItems.length ? editedItems : order.items,
              total: Number(editOrderDraft.total) || order.total,
            }
          : order,
      ),
    )
    setEditingOrderId(null)
    setEditOrderDraft(null)
  }

  function addToCart(item, event) {
    const image = event.currentTarget.closest('.food-card')?.querySelector('img')
    const cartIcon = cartIconRef.current

    if (image && cartIcon) {
      const imageRect = image.getBoundingClientRect()
      const cartRect = cartIcon.getBoundingClientRect()

      setFlyingItem({
        id: `${item.id}-${Date.now()}`,
        image: item.image,
        name: item.name,
        startX: imageRect.left + imageRect.width / 2,
        startY: imageRect.top + imageRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      })
    }

    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }

      return [...current, { ...item, quantity: 1 }]
    })
    setConfirmation('')
  }

  function updateQuantity(id, change) {
    setCart((current) =>
      current
        .map((item) => ({ ...item, quantity: item.id === id ? item.quantity + change : item.quantity }))
        .filter((item) => item.quantity > 0),
    )
  }

  function placeOrder(event) {
    event.preventDefault()

    if (!cart.length) {
      setConfirmation('Add food to your cart before placing an order.')
      return
    }

    if (!customer.name || !customer.phone || (orderType === 'Delivery' && !customer.address)) {
      setConfirmation('Please add your name, phone, and delivery address before checkout.')
      return
    }

    const orderId = `FL-${Math.floor(1000 + Math.random() * 9000)}`
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleString(),
      type: orderType,
      customer: { ...customer },
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      status: 'New',
    }

    setSavedOrders((current) => [newOrder, ...current])
    setConfirmation(`Order ${orderId} confirmed. Estimated ${orderType.toLowerCase()} time is 30 minutes.`)
    setCart([])
    setCustomer({ name: '', phone: '', address: '' })
  }

  function reserveTable(event) {
    event.preventDefault()

    if (!reservation.name || !reservation.date || !reservation.time) {
      setReservationMessage('Please complete your reservation details.')
      return
    }

    const newReservation = {
      id: `RS-${Math.floor(1000 + Math.random() * 9000)}`,
      dateCreated: new Date().toLocaleString(),
      ...reservation,
    }

    setSavedReservations((current) => [newReservation, ...current])
    setReservationMessage(
      `Table reserved for ${reservation.guests} guests on ${reservation.date} at ${reservation.time}.`,
    )
    setReservation({ name: '', date: '', time: '', guests: '2' })
  }

  function finishFlyAnimation() {
    setFlyingItem(null)
  }

  if (isOwnerPage) {
    return (
      <main className="owner-page">
        <section className="admin-section">
          <div className="section-heading">
            <span className="eyebrow">Owner only</span>
            <h1>Restaurant orders</h1>
            <p>
              This page is separate from the public website. Enter your passcode to view customer
              orders, selected food, phone numbers, totals, and delivery locations.
            </p>
          </div>

          {!isOwner ? (
            <form className="owner-login" onSubmit={ownerLogin}>
              <ReceiptText size={24} />
              <h3>Owner login</h3>
              <input
                type="password"
                placeholder="Enter owner passcode"
                value={ownerPasscode}
                onChange={(event) => setOwnerPasscode(event.target.value)}
              />
              <button className="primary-button" type="submit">
                View orders
              </button>
              {ownerError && <p className="form-message">{ownerError}</p>}
            </form>
          ) : (
            <>
              <div className="owner-stats">
                <article>
                  <span>Active orders</span>
                  <strong>{activeOrders.length}</strong>
                </article>
                <article>
                  <span>Completed</span>
                  <strong>{completedOrders.length}</strong>
                </article>
                <article>
                  <span>Bookings</span>
                  <strong>{savedReservations.length}</strong>
                </article>
                <article>
                  <span>Total sales</span>
                  <strong>{formatPrice(ownerRevenue)}</strong>
                </article>
              </div>

              <div className="admin-card orders-only">
                <div className="admin-card-header">
                  <h3>Saved order forms</h3>
                  <span>{savedOrders.length}</span>
                  <button className="logout-button" type="button" onClick={exportOrders}>
                    Download
                  </button>
                  <button className="logout-button" type="button" onClick={ownerLogout}>
                    Lock
                  </button>
                </div>
                <div className="admin-list">
                  {savedOrders.length === 0 ? (
                    <p className="empty-cart">No orders yet. Place a test order from the customer website.</p>
                  ) : (
                    savedOrders.map((order) => (
                      <article
                        className={order.status === 'Complete' ? 'admin-row complete' : 'admin-row'}
                        key={order.id}
                      >
                      <div className="admin-row-top">
                        <strong>Order form {order.id}</strong>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                      <p>{order.date}</p>
                      {editingOrderId === order.id && editOrderDraft ? (
                        <div className="edit-order">
                          <input
                            value={editOrderDraft.name}
                            placeholder="Customer name"
                            onChange={(event) =>
                              setEditOrderDraft({ ...editOrderDraft, name: event.target.value })
                            }
                          />
                          <input
                            value={editOrderDraft.phone}
                            placeholder="Phone"
                            onChange={(event) =>
                              setEditOrderDraft({ ...editOrderDraft, phone: event.target.value })
                            }
                          />
                          <select
                            value={editOrderDraft.type}
                            onChange={(event) =>
                              setEditOrderDraft({ ...editOrderDraft, type: event.target.value })
                            }
                          >
                            <option>Delivery</option>
                            <option>Pickup</option>
                          </select>
                          <input
                            value={editOrderDraft.address}
                            placeholder="Location/address"
                            onChange={(event) =>
                              setEditOrderDraft({ ...editOrderDraft, address: event.target.value })
                            }
                          />
                          <input
                            value={editOrderDraft.food}
                            placeholder="Food selected"
                            onChange={(event) =>
                              setEditOrderDraft({ ...editOrderDraft, food: event.target.value })
                            }
                          />
                          <input
                            value={editOrderDraft.total}
                            placeholder="Total"
                            onChange={(event) =>
                              setEditOrderDraft({ ...editOrderDraft, total: event.target.value })
                            }
                          />
                          <div className="order-actions">
                            <button type="button" onClick={() => saveEditedOrder(order.id)}>
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOrderId(null)
                                setEditOrderDraft(null)
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="admin-detail">
                            <span>Name</span>
                            <strong>{order.customer.name}</strong>
                          </div>
                          <div className="admin-detail">
                            <span>Phone</span>
                            <strong>{order.customer.phone}</strong>
                          </div>
                          <div className="admin-detail">
                            <span>Type</span>
                            <strong>{order.type}</strong>
                          </div>
                          <div className="admin-detail">
                            <span>Location</span>
                            <strong>{order.customer.address || 'Pickup from restaurant'}</strong>
                          </div>
                          <div className="admin-detail">
                            <span>Food</span>
                            <strong>
                              {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                            </strong>
                          </div>
                          <div className="admin-detail">
                            <span>Status</span>
                            <strong className={order.status === 'Complete' ? 'complete-label' : ''}>
                              {order.status === 'Complete' ? (
                                <>
                                  <CheckCircle2 size={16} />
                                  Order complete
                                </>
                              ) : (
                                order.status
                              )}
                            </strong>
                          </div>
                          {order.status !== 'Complete' && (
                            <div className="order-actions">
                              <button type="button" onClick={() => startEditOrder(order)}>
                                Edit
                              </button>
                              <button type="button" onClick={() => markOrderComplete(order.id)}>
                                Complete
                              </button>
                              <button className="danger" type="button" onClick={() => deleteOrder(order.id)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div className="admin-card reservations-only">
                <div className="admin-card-header">
                  <h3>Table bookings</h3>
                  <span>{savedReservations.length}</span>
                </div>
                <div className="admin-list reservation-list">
                  {savedReservations.length === 0 ? (
                    <p className="empty-cart">No table bookings yet.</p>
                  ) : (
                    savedReservations.map((booking) => (
                      <article className="admin-row booking-row" key={booking.id}>
                        <div className="admin-row-top">
                          <strong>Booking form {booking.id}</strong>
                          <ReceiptText size={18} />
                        </div>
                        <p>{booking.dateCreated}</p>
                        <div className="admin-detail">
                          <span>Name</span>
                          <strong>{booking.name}</strong>
                        </div>
                        <div className="admin-detail">
                          <span>Date</span>
                          <strong>{booking.date}</strong>
                        </div>
                        <div className="admin-detail">
                          <span>Time</span>
                          <strong>{booking.time}</strong>
                        </div>
                        <div className="admin-detail">
                          <span>Guests</span>
                          <strong>{booking.guests}</strong>
                        </div>
                        <div className="order-actions">
                          <button className="danger" type="button" onClick={() => deleteReservation(booking.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    )
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="logo" href="#home" aria-label="Burger Rush home">
          <span>
            <Utensils size={22} />
          </span>
          <strong>Burger Rush</strong>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={mobileNavOpen ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
          <a href="#menu">Menu</a>
          <a href="#order">Order Online</a>
          <a href="#reserve">Reserve</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="header-cart" href="#order" aria-label={`${cartCount} items in cart`} ref={cartIconRef}>
          <ShoppingBag size={19} />
          <span>{cartCount}</span>
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <span className="eyebrow">Open daily 11 AM to 11 PM</span>
            <h1>Hot burgers, crispy sides, fast delivery.</h1>
            <p>
              Order juicy burgers, loaded fries, pizza, and cool drinks from a clean fast-food
              website built for quick online orders.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#menu">
                Order now
                <ChevronRight size={18} />
              </a>
              <a className="secondary-button" href="#reserve">
                Book a table
              </a>
            </div>
          </div>

          <div className="hero-card" aria-label="Featured dish">
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1100&q=80"
              alt="Gourmet burger with fries"
            />
            <div>
              <span>Best seller</span>
              <strong>Double Smash Combo</strong>
              <p>Burger, crispy fries, house sauce, and an ice-cold drink.</p>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Restaurant highlights">
          <div>
            <Clock3 size={21} />
            <strong>30 min</strong>
            <span>average delivery</span>
          </div>
          <div>
            <Star size={21} />
            <strong>4.9 rating</strong>
            <span>from happy customers</span>
          </div>
          <div>
            <Truck size={21} />
            <strong>Live orders</strong>
            <span>pickup and delivery</span>
          </div>
        </section>

        <section className="section" id="menu">
          <div className="section-heading">
            <span className="eyebrow">Step 1</span>
            <h2>Pick your cravings</h2>
          </div>

          <div className="menu-tools">
            <label className="search-box">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search burgers, chicken, drinks"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="category-list" aria-label="Menu categories">
              {categories.map((category) => (
                <button
                  className={activeCategory === category ? 'selected' : ''}
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="food-grid">
            {filteredItems.length === 0 ? (
              <p className="empty-cart">No items found. Try another search or category.</p>
            ) : (
              filteredItems.map((item) => (
              <article className="food-card" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="food-card-body">
                  <div className="food-meta">
                    <span>
                      <Star size={15} />
                      {item.rating}
                    </span>
                    <span>{item.time}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="food-card-footer">
                    <strong>{formatPrice(item.price)}</strong>
                    <button type="button" onClick={(event) => addToCart(item, event)}>
                      <Plus size={17} />
                      Add
                    </button>
                  </div>
                </div>
              </article>
              ))
            )}
          </div>
        </section>

        <section className="order-section" id="order">
          <div className="order-copy">
            <span className="eyebrow">Step 2</span>
            <h2>Checkout fast</h2>
            <p>
              Add your details, choose delivery or pickup, and confirm your order in a clear
              checkout form.
            </p>
          </div>

          <form className="checkout-card" onSubmit={placeOrder}>
            <div className="order-type">
              {['Delivery', 'Pickup'].map((type) => (
                <button
                  className={orderType === type ? 'selected' : ''}
                  type="button"
                  key={type}
                  onClick={() => setOrderType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty. Add something delicious from the menu.</p>
              ) : (
                cart.map((item) => (
                  <div className="cart-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                    <div className="stepper">
                      <button type="button" aria-label={`Decrease ${item.name}`} onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.name}`} onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="customer-fields">
              <label>
                <span>Customer name</span>
                <input
                  placeholder="Enter full name"
                  value={customer.name}
                  onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                />
              </label>
              <label>
                <span>Phone number</span>
                <input
                  placeholder="Enter phone number"
                  value={customer.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                />
              </label>
              {orderType === 'Delivery' && (
                <label>
                  <span>Delivery address</span>
                  <input
                    placeholder="House, street, area"
                    value={customer.address}
                    onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
                  />
                </label>
              )}
            </div>

            <div className="summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>{orderType} fee</span>
                <strong>{formatPrice(deliveryFee)}</strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>{formatPrice(tax)}</strong>
              </div>
              <div className="total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <button className="checkout-button" type="submit">
              Place order
            </button>
            {confirmation && <p className="form-message">{confirmation}</p>}
          </form>
        </section>

        <section className="reservation-section" id="reserve">
          <form className="reservation-card" onSubmit={reserveTable}>
            <span className="eyebrow">Step 3</span>
            <h2>Reserve a table</h2>
            <div className="reservation-grid">
              <label>
                <span>Name</span>
                <input
                  placeholder="Your name"
                  value={reservation.name}
                  onChange={(event) => setReservation({ ...reservation, name: event.target.value })}
                />
              </label>
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={reservation.date}
                  onChange={(event) => setReservation({ ...reservation, date: event.target.value })}
                />
              </label>
              <label>
                <span>Time</span>
                <input
                  type="time"
                  value={reservation.time}
                  onChange={(event) => setReservation({ ...reservation, time: event.target.value })}
                />
              </label>
              <label>
                <span>Guests</span>
                <select
                  value={reservation.guests}
                  onChange={(event) => setReservation({ ...reservation, guests: event.target.value })}
                >
                  <option value="1">1 guest</option>
                  <option value="2">2 guests</option>
                  <option value="4">4 guests</option>
                  <option value="6">6 guests</option>
                  <option value="8">8 guests</option>
                </select>
              </label>
            </div>
            <button className="primary-button" type="submit">
              <CalendarCheck size={18} />
              Reserve now
            </button>
            {reservationMessage && <p className="form-message">{reservationMessage}</p>}
          </form>
        </section>

        <section className="section" id="reviews">
          <div className="section-heading">
            <span className="eyebrow">Guest trust</span>
            <h2>Fast food customers love</h2>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="stars" aria-label="5 star review">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star size={16} fill="currentColor" key={star} />
                  ))}
                </div>
                <p>{review.text}</p>
                <strong>{review.name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div>
            <span className="eyebrow">Visit us</span>
            <h2>Burger Rush Restaurant</h2>
            <p>123 Food Street, Gulberg, Lahore</p>
          </div>
          <div className="contact-actions">
            <a href="tel:+923001234567">
              <Phone size={18} />
              +92 300 1234567
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer">
              <MapPin size={18} />
              Open map
            </a>
            <span>
              <CheckCircle2 size={18} />
              Cash, card, and online payment
            </span>
          </div>
        </section>
      </main>

      {flyingItem && (
        <div
          className="fly-to-cart"
          style={{
            '--start-x': `${flyingItem.startX}px`,
            '--start-y': `${flyingItem.startY}px`,
            '--end-x': `${flyingItem.endX}px`,
            '--end-y': `${flyingItem.endY}px`,
          }}
          onAnimationEnd={finishFlyAnimation}
          aria-hidden="true"
        >
          <img src={flyingItem.image} alt="" />
        </div>
      )}
    </div>
  )
}
