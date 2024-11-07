// src/app/[projectName]/layout.tsx
import Header from '@/components/Header'

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <main className='flex-1'>{children}</main>
    </div>
  )
}

export default Layout
