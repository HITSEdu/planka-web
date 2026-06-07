import { RegisterForm } from './_ui'
import { AuthPageShell } from '../_ui'

export default async function Register() {
  return (
    <AuthPageShell variant="register">
      <RegisterForm />
    </AuthPageShell>
  )
}
