import { useState } from 'react'
import { ArrowRight, BookOpen, Eye, EyeOff, FlaskConical, LockKeyhole, Mail, Moon, Sparkles, Sun } from 'lucide-react'
import { supabase } from './lib/supabase'
import './auth.css'

function readableAuthError(error) {
  const message = String(error?.message || '').toLowerCase()
  const code = String(error?.code || '').toLowerCase()
  if (message.includes('rate limit') && message.includes('email') || code === 'over_email_send_rate_limit') {
    return 'Supabase has temporarily limited signup emails for this project. Its built-in sender allows about 2 emails per hour. Wait before trying again, or configure custom SMTP in Supabase → Authentication → Emails → SMTP Settings.'
  }
  if (code === 'email_address_not_authorized' || message.includes('email address not authorized')) {
    return 'Supabase’s built-in email sender only sends to project team members. Configure custom SMTP under Supabase → Authentication → Emails → SMTP Settings to send signup emails to other addresses.'
  }
  return error?.message || 'Something went wrong. Please try again.'
}

export default function Auth({ error: sessionError = '', recovery = false }) {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('paperpilot-theme') || 'light' } catch { return 'light' } })
  const [mode, setMode] = useState(recovery ? 'recovery' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const switchMode = next => { setMode(next); setError(''); setNotice('') }
  const submit = async event => {
    event.preventDefault(); setError(''); setNotice('')
    if (mode === 'signup' && name.trim().length < 2) { setError('Please enter your name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return }
    if (mode !== 'reset' && password.length < 8) { setError('Use at least 8 characters for your password.'); return }
    if (mode !== 'reset' && !password) { setError('Please enter your password.'); return }
    setBusy(true)
    try {
      if (mode === 'recovery') {
        const { error: cause } = await supabase.auth.updateUser({ password })
        if (cause) throw cause
        setNotice('Your password has been updated.')
      } else if (mode === 'signup') {
        const { data, error: cause } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin } })
        if (cause) throw cause
        if (data.session) setNotice('Your account is ready. Welcome to PaperPilot!')
        else setNotice('Check your email to confirm your account, then log in here.')
        setMode('login')
      } else if (mode === 'login') {
        const { error: cause } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (cause) throw cause
      } else {
        const { error: cause } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` })
        if (cause) throw cause
        setNotice('If an account exists for that email, you’ll receive a password reset link shortly.')
      }
    } catch (cause) { setError(readableAuthError(cause)) }
    finally { setBusy(false) }
  }
  const title = mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : mode === 'recovery' ? 'Choose a new password' : 'Welcome back'
  return <main className="auth-shell" data-theme={theme}><button className="auth-theme-toggle" type="button" onClick={() => { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); try { localStorage.setItem('paperpilot-theme', next) } catch {} }} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button><section className="auth-story"><div className="auth-brand"><span className="auth-brand-mark"><FlaskConical size={21}/></span><span>paper<span>pilot</span></span></div><div className="auth-story-copy"><span className="auth-kicker"><Sparkles size={14}/> YOUR RESEARCH, IN ONE PLACE</span><h1>Make room for<br/><em>big ideas.</em></h1><p>Find the papers that move your thinking forward. Keep your reading, notes, and discoveries together.</p><div className="auth-feature"><span><BookOpen size={17}/></span><div><strong>A calmer research workflow</strong><small>Discover, save, and pick up where you left off.</small></div></div><div className="auth-quote">“The beautiful thing about learning is that nobody can take it away from you.”<span>— B.B. King</span></div></div><div className="auth-story-footer">Independent research, made a little easier.</div></section>
    <section className="auth-form-side"><div className="auth-form-wrap"><div className="auth-mobile-brand"><span className="auth-brand-mark"><FlaskConical size={19}/></span> paper<span>pilot</span></div><div className="auth-form-heading"><span className="auth-form-icon"><LockKeyhole size={17}/></span><h2>{title}</h2><p>{mode === 'signup' ? 'Start building your personal research library.' : mode === 'reset' ? 'We’ll email you a secure reset link.' : 'Log in to continue your research.'}</p></div>
    {mode !== 'reset' && mode !== 'recovery' && <div className="auth-tabs"><button className={mode === 'signup' ? 'selected' : ''} onClick={() => switchMode('signup')} type="button">Sign up</button><button className={mode === 'login' ? 'selected' : ''} onClick={() => switchMode('login')} type="button">Log in</button></div>}
    <form className="auth-form" onSubmit={submit} noValidate>
      {mode === 'signup' && <label className="auth-field"><span>Your name</span><input autoComplete="name" placeholder="e.g. Alex Morgan" value={name} onChange={event => setName(event.target.value)}/></label>}
      <label className="auth-field"><span>Email address</span><span className="auth-input"><Mail size={16}/><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)}/></span></label>
      {mode !== 'reset' && <label className="auth-field"><span>{mode === 'recovery' ? 'New password' : 'Password'}</span><span className="auth-input"><LockKeyhole size={16}/><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'} value={password} onChange={event => setPassword(event.target.value)}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></span></label>}
      {mode === 'login' && <button className="auth-forgot" type="button" onClick={() => switchMode('reset')}>Forgot password?</button>}
      {(error || sessionError) && <div className="auth-error" role="alert">{error || sessionError}</div>}{notice && <div className="auth-notice" role="status">{notice}</div>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : mode === 'recovery' ? 'Save new password' : 'Log in'}{!busy && <ArrowRight size={16}/>}</button>
    </form>{mode === 'reset' && <button className="auth-back" onClick={() => switchMode('login')}>Back to log in</button>}<p className="auth-local-note">Your account and research library are securely managed by Supabase and sync across your devices.</p><p className="auth-terms">By continuing, you agree to use PaperPilot as your research workspace.</p></div></section></main>
}
