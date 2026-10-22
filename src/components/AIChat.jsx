import { useState } from 'react'
import { askAI } from '../api'

const SUGGESTIONS = [
  'Abhi kharidna chahiye ya wait karu?',
  'Isse sasta alternative batao',
  'Kaunsa store sabse best hai?',
]

export default function AIChat({ product, onClose, onRecommendation }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: product
        ? `Hi! Main ${product.name} ke price ke baare mein help kar sakta hu. Kuch bhi puchho.`
        : 'Hi! Pehle koi product select karo, phir puchho.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async (text) => {
    const msg = text.trim()
    if (!msg || loading) return
    setMessages((m) => [...m, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    try {
      const data = await askAI(msg, product?._id)
      setMessages((m) => [...m, { role: 'ai', text: data.reply }])
      if (data.lastRecommendation) onRecommendation(data.lastRecommendation)
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', text: '⚠️ ' + err.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>🤖 AI Shopping Assistant</h3>
        {product && <p style={{ fontSize: 12, color: '#777' }}>Discussing: {product.name}</p>}

        <div className="chat-box">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>{m.text}</div>
          ))}
          {loading && <div className="msg ai">Soch raha hu...</div>}
        </div>

        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <span key={s} className="tags-chip" onClick={() => send(s)}>{s}</span>
          ))}
        </div>

        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about price, deals, alternatives..." />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}