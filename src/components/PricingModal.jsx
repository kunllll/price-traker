import { useState } from 'react'
import { upgradePlan } from '../api'

export default function PricingModal({ user, onClose, onUpgraded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await upgradePlan()
      onUpgraded(data.user)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>👑 Choose your plan</h2>
        <p>Smart buying ke liye jo suit kare wo chuno.</p>

        <div className="plans">
          <div className="plan">
            <h4>Free</h4>
            <div className="price">₹0</div>
            <ul>
              <li>✓ Price tracking &amp; store comparison</li>
              <li>✓ 6 months price history</li>
              <li>✓ Buy / Wait recommendation</li>
              <li>✓ 5 AI questions per day</li>
            </ul>
            <button disabled>{user.plan === 'free' ? 'Current plan' : 'Free'}</button>
          </div>

          <div className="plan featured">
            <h4>Pro</h4>
            <div className="price">₹99<small>/month</small></div>
            <p style={{ fontSize: 12 }}>or ₹799/year (save ~33%)</p>
            <ul>
              <li>✓ Everything in Free</li>
              <li>✓ Unlimited AI shopping assistant</li>
              <li>✓ Price drop email alerts</li>
              <li>✓ Unlimited product tracking</li>
              <li>✓ 2 years price history</li>
            </ul>
            <button onClick={upgrade} disabled={loading || user.plan === 'pro'}>
              {user.plan === 'pro' ? "You're on Pro 👑" : loading ? 'Upgrading...' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}
        <p style={{ fontSize: 11, color: '#777', marginTop: 12 }}>
          Demo mode: abhi payment simulated hai (koi paisa nahi katega).
        </p>
      </div>
    </div>
  )
}