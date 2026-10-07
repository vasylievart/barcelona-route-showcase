import { redirect }     from 'next/navigation'
import { isAdmin }      from '@/lib/auth'
import { CreatePost }   from '@/components/blog/CreatePost'
import { AdminLogout }  from '@/components/admin/AdminLogout'

export default async function CreatePostPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/')


  return (
    <>
      <div className="cms__topbar">
        <span className="cms__topbar-label">Admin</span>
        <AdminLogout />
      </div>
      <CreatePost />
    </>
  )
}