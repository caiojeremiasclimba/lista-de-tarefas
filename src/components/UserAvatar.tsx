import type { User } from '@supabase/supabase-js'
import { getUserAvatarUrl, getUserInitial } from '../utils/userDisplay'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'lg'
  previewUrl?: string | null
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  lg: 'h-20 w-20 text-2xl',
} as const

export default function UserAvatar({ user, size = 'sm', previewUrl }: UserAvatarProps) {
  const avatarUrl = previewUrl ?? getUserAvatarUrl(user)
  const sizeClass = sizeClasses[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 ${sizeClass}`}
      aria-hidden
    >
      {getUserInitial(user)}
    </div>
  )
}
