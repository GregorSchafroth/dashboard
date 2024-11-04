import Header from '@/components/Header'

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <>
      <Header />
      <main className="m-8">{children}</main>
    </>
  )
}

export default Layout