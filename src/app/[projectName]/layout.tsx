import Header from '@/components/Header'

const page = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <>
      <Header />
      <main className='m-4'>{children}</main>
    </>
  )
}
export default page
