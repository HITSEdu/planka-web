import { LoginForm } from './_ui'


export default async function Login() {

  return (
    <div className="flex flex-col items-center tablet:flex-row gap-5 tablet:mt-4 laptop:mt-12 desktop:mt-15">
      <LoginForm />
    </div>
  )
}
