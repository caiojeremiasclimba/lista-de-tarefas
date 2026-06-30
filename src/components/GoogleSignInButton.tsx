import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthAlert, GoogleIcon } from './AuthUi'

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? 'Redirecionando...' : 'Continuar com Google'}
      </button>

      {error && <AuthAlert type="error">{error}</AuthAlert>}
    </div>
  )
}
