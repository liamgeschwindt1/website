import Sidebar from '@/components/Sidebar'
import GithubWidget from '@/components/GithubWidget'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[220px] min-w-0">
        {children}
      </div>
      <GithubWidget />
    </div>
  )
}
