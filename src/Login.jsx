import { useState } from 'react'
import './Login.css'
import { login, signup, setToken } from './api'

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data =
        mode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await signup(form)
      setToken(data.token)
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>PriceIntel</h1>
        <p>Smart buying starts here</p>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>Full name</label>
              <input name="name" value={form.name} onChange={change} placeholder="Enter your name" required />
            </>
          )}
          <label>Email address</label>
          <input type="email" name="email" value={form.email} onChange={change} placeholder="Enter your email" required />
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={change} placeholder="Min 6 characters" required />

          {error && <p style={{ color: '#f87171' }}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create account'}
          </button>

          <p>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode(mode === 'login' ? 'signup' : 'login') }}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login