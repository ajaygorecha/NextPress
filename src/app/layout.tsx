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
      <body>
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  )
}
