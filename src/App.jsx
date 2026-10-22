import './App.css'
import Login from './Login'
import PricingModal from './components/PricingModal'
import AIChat from './components/AIChat'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getProducts, getProduct, toggleWatchlist, getMe, hasToken, setToken } from './api'

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN')

const VERDICT_LABEL = {
  BUY_NOW: '✅ BUY NOW',
  WAIT: '⏳ WAIT',
  OK: '👍 FAIR PRICE',
  NO_DATA: 'ℹ️ NO DATA',
}

function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [showPricing, setShowPricing] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (!hasToken()) {
      setAuthChecked(true)
      return
    }
    getMe()
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setAuthChecked(true))
  }, [])

  const loadProducts = async () => {
    const list = await getProducts()
    setProducts(list)
    return list
  }

  const selectProduct = async (id) => {
    const detail = await getProduct(id)
    setSelected(detail)
  }

  useEffect(() => {
    if (!user) return
    loadProducts()
      .then((list) => (list.length ? selectProduct(list[0]._id) : null))
      .catch(() => setError('Backend se connect nahi ho paya. Server chal raha hai?'))
  }, [user?.id])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setError('')
      const results = await getProducts({ q: query.trim() })
      if (results.length) await selectProduct(results[0]._id)
      else setError(`"${query}" ke liye kuch nahi mila`)
    } catch {
      setError('Search fail ho gaya')
    }
  }

  const searchFor = async (name) => {
    setQuery(name)
    const results = await getProducts({ q: name })
    if (results.length) await selectProduct(results[0]._id)
  }

  const handleWatchlist = async () => {
    await toggleWatchlist(selected._id)
    await loadProducts()
    await selectProduct(selected._id)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setSelected(null)
    setProducts([])
  }

  if (!authChecked) return null
  if (!user) return <Login onLogin={setUser} />

  const watchlist = products.filter((p) => p.inWatchlist)
  const rec = selected?.recommendation

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <h2>⚡ PriceIntel</h2>
          <p>Smart Buy. Save More.</p>
        </div>

        <nav className="sidebar-nav">
          <a className="active" href="#home">🏠 Home</a>
          <a href="#dashboard">📊 Dashboard</a>
          <a href="#watchlist">♥ Watchlist</a>
          <a href="#alerts">🔔 Price Alerts</a>
          <a href="#compare">⚖ Compare Stores</a>
          <a href="#analytics">📈 Analytics</a>
          <a href="#settings">⚙ Settings</a>
        </nav>

        <div className="pro-card">
          {user.plan === 'pro' ? (
            <>
              <h3>👑 You're Pro</h3>
              <p>Unlimited AI, alerts and tracking unlocked.</p>
            </>
          ) : (
            <>
              <h3>👑 Go Pro</h3>
              <p>Unlock AI predictions, advanced analytics and unlimited tracking.</p>
              <button onClick={() => setShowPricing(true)}>Upgrade to Pro</button>
            </>
          )}
        </div>

        <div className="profile">
          <div className="avatar">{user.name[0].toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <p>{user.plan === 'pro' ? 'Pro Plan 👑' : 'Free Plan'}</p>
            {user.lastRecommendation?.text && (
              <p className="last-rec" title={user.lastRecommendation.text}>
                💡 {user.lastRecommendation.product}: {user.lastRecommendation.text}
              </p>
            )}
            <button className="link-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <form className="navbar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products (e.g. iPhone 16, Samsung S24)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">⌕</button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <section className="stats-grid" id="dashboard">
          <div className="stat-card blue">
            <h2>{products.length}</h2>
            <p>Products Tracked</p>
            <small>Live from database</small>
          </div>
          <div className="stat-card orange">
            <h2>3</h2>
            <p>Price Alerts Active</p>
            <small>↑ 1 new today</small>
          </div>
          <div className="stat-card green">
            <h2>₹2,749</h2>
            <p>Total Savings</p>
            <small>↑ 12% more savings</small>
          </div>
          <div className="stat-card purple">
            <h2>{watchlist.length}</h2>
            <p>In Watchlist</p>
            <small>Live from database</small>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel track-panel">
            <h3>Track a Product</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Enter product name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Search Product</button>
            </form>
            <p>Popular Searches:</p>
            <div className="tags">
              {['iPhone 16', 'OnePlus 13R', 'Sony WH-1000XM5'].map((n) => (
                <span key={n} className="clickable" onClick={() => searchFor(n)}>{n}</span>
              ))}
            </div>
          </div>

          <div className="panel product-panel">
            {selected ? (
              <>
                {selected.discountPercent > 0 && <span className="deal">🔥 {selected.discountPercent}% off MRP</span>}
                <h3>{selected.name}</h3>
                <p>{selected.tagline}</p>
                <h2>{inr(selected.currentPrice)}</h2>
                <p className="discount">MRP {inr(selected.mrp)} · Best at {selected.bestStore}</p>

                <div className={`buy-box ${rec.verdict.toLowerCase()}`}>
                  <h3>{VERDICT_LABEL[rec.verdict]}</h3>
                  <p>{rec.message}</p>
                </div>

                <button style={{ marginTop: 12 }} onClick={handleWatchlist}>
                  {selected.inWatchlist ? '♥ Remove from Watchlist' : '♡ Add to Watchlist'}
                </button>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          <div className="panel watchlist" id="watchlist">
            <h3>My Watchlist</h3>
            {watchlist.length === 0 && <p>Watchlist khaali hai.</p>}
            {watchlist.map((p) => (
              <div key={p._id} className="watch-item clickable" onClick={() => selectProduct(p._id)}>
                <span>{p.emoji}</span>
                <div>
                  <strong>{p.name}</strong>
                  <p>{inr(p.currentPrice)} · ↓ {p.discountPercent}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" id="analytics">
            <h3>📈 Price History</h3>
            {selected && selected.history.length > 0 ? (
              <>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selected.history}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { month: 'short' })}
                        minTickGap={40}
                        fontSize={11}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                        fontSize={11}
                        width={50}
                      />
                      <Tooltip
                        formatter={(v) => inr(v)}
                        labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN')}
                      />
                      <Area type="monotone" dataKey="price" stroke="#5725df" fill="#eee5ff" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p style={{ fontSize: 12, marginTop: 8 }}>
                  Low {inr(rec.min)} · Avg {inr(rec.avg)} · High {inr(rec.max)}
                </p>
              </>
            ) : (
              <p>No history yet.</p>
            )}
          </div>

          <div className="panel" id="compare">
            <h3>⚖ Store Comparison</h3>
            <div className="store-row store-header">
              <span>Store</span>
              <span>Price</span>
              <span>Effective</span>
            </div>
            {selected?.stores.map((s) => (
              <div className="store-row" key={s.name}>
                <span>{s.name}</span>
                <span>{inr(s.price)}</span>
                <span>{inr(s.effectivePrice)}</span>
              </div>
            ))}
          </div>

          <div className="panel ai-panel">
            <h3>🤖 Your AI Shopping Assistant</h3>
            <p>Ask anything about products, prices, or recommendations!</p>
            <button onClick={() => setShowChat(true)}>Chat with AI →</button>
          </div>
        </section>
      </main>

      {showPricing && (
        <PricingModal user={user} onClose={() => setShowPricing(false)} onUpgraded={setUser} />
      )}
      {showChat && (
        <AIChat
          product={selected}
          onClose={() => setShowChat(false)}
          onRecommendation={(r) => setUser((u) => ({ ...u, lastRecommendation: r }))}
        />
      )}
    </div>
  )
}

export default App