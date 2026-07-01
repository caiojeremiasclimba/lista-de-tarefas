import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import {
  clearPendingPasswordReset,
  clearRecoveryCallbackFromUrl,
  hasPendingPasswordReset,
  isRecoveryCallback,
  markPendingPasswordReset,
} from './lib/authPreferences'
import AuthScreen from './components/AuthScreen'
import ResetPasswordForm from './components/ResetPasswordForm'
import TodosScreen from './components/TodosScreen'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsPasswordReset, setNeedsPasswordReset] = useState(
    () => isRecoveryCallback() || hasPendingPasswordReset()
  )

  useEffect(() => {
    if (isRecoveryCallback()) {
      markPendingPasswordReset()
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      if (currentSession && hasPendingPasswordReset()) {
        setNeedsPasswordReset(true)
      }
      clearRecoveryCallbackFromUrl()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          markPendingPasswordReset()
          setNeedsPasswordReset(true)
          clearRecoveryCallbackFromUrl()
        }
        setSession(newSession)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    clearPendingPasswordReset()
    await supabase.auth.signOut()
  }

  function handlePasswordResetSuccess() {
    clearPendingPasswordReset()
    clearRecoveryCallbackFromUrl()
    setNeedsPasswordReset(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  if (needsPasswordReset) {
    return <ResetPasswordForm onSuccess={handlePasswordResetSuccess} />
  }

  return (
    <TodosScreen
      user={session.user}
      onLogout={handleLogout}
    />
  )
}

export default App
