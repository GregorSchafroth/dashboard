export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center p-4 bg-background '>
      {children}
    </div>
  );
}
