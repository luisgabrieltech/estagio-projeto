import { redirect } from 'next/navigation'
import { routes } from '@/lib/config/routes'

export default function LegacySignInPage() {
  redirect(routes.auth.login)
}
