import type { Metadata } from 'next'
import '@/styles/main.scss'

export const metadata: Metadata = {
  title: 'NextPress CMS',
  description: 'A modern CMS powered by Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
