import PageTracker from '@/components/ui/PageTracker'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTracker />
      {children}
    </>
  )
}
