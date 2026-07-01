import { useState, useEffect, useRef } from 'react'
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
  const recoveryFlowRef = useRef(isRecoveryCallback())
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsPasswordReset, setNeedsPasswordReset] = useState(() => isRecoveryCallback())

  useEffect(() => {
    if (isRecoveryCallback()) {
      recoveryFlowRef.current = true
      markPendingPasswordReset()
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (isRecoveryCallback()) {
        recoveryFlowRef.current = true
        markPendingPasswordReset()
      } else if (hasPendingPasswordReset()) {
        if (currentSession) {
          recoveryFlowRef.current = true
        } else {
          clearPendingPasswordReset()
        }
      }

      setSession(currentSession)
      setNeedsPasswordReset(recoveryFlowRef.current && Boolean(currentSession))
      clearRecoveryCallbackFromUrl()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          recoveryFlowRef.current = true
          markPendingPasswordReset()
          setNeedsPasswordReset(true)
          clearRecoveryCallbackFromUrl()
        } else if (event === 'SIGNED_IN' && !recoveryFlowRef.current) {
          clearPendingPasswordReset()
          setNeedsPasswordReset(false)
        } else if (event === 'SIGNED_OUT') {
          recoveryFlowRef.current = false
          clearPendingPasswordReset()
          setNeedsPasswordReset(false)
        }

        setSession(newSession)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    recoveryFlowRef.current = false
    clearPendingPasswordReset()
    await supabase.auth.signOut()
  }

  function handlePasswordResetSuccess() {
    recoveryFlowRef.current = false
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
