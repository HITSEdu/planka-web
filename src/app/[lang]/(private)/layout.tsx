import { Header, NavbarWrapper } from '../_ui'

export default async function Layout({ children }: LayoutProps<'/[lang]'>) {
  return (
    <>
      <NavbarWrapper />
      <div className="flex flex-col w-full h-full">
        <Header />
        <main className="flex flex-col flex-1">{children}</main>
      </div>
    </>
  )
}
