import { useState } from 'react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import { ClipboardIcon, UserIcon, UserPlusIcon } from './AuthUi'

type AuthMode = 'login' | 'signup'

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-8 grid grid-cols-3 gap-1.5 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-8 grid grid-cols-3 gap-1.5 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        ))}
      </div>

      <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-10 shadow-xl shadow-blue-900/10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
          <ClipboardIcon />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800">Lista de Tarefas</h1>
        <p className="mb-8 mt-2 text-center text-sm text-slate-500">
          Organize suas tarefas e aumente sua produtividade.
        </p>

        <div className="mb-8 flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
              mode === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserIcon />
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
              mode === 'signup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlusIcon />
            Cadastro
          </button>
        </div>

        {mode === 'login' ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  )
}
