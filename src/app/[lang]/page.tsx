import Link from 'next/link'

export default async function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <Link href="/profile">test profile</Link>
      <Link href="/login">test login</Link>
    </div>
  )
}
