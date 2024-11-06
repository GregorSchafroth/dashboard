import Header from '@/components/Header'

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}

export default Layout