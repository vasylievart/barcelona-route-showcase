import { supabaseAdmin } from '@/lib/supabase/admin'
import { PostCard }      from './PostCard'
import type { PostPreview } from '@/types/post'

export async function NewestPosts() {
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('id, slug, title, excerpt, cover_image, tags, published_at, read_time')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)

  if (!posts || posts.length === 0) return null

  const [featured, ...rest] = posts

  return (
    <section className="newest-posts">
      <div className="newest-posts__header">
        <h2 className="newest-posts__title">Barcelona guides</h2>
        <a href="/blog" className="newest-posts__see-all">
          All articles →
        </a>
      </div>

      {/* Featured post — larger card */}
      <PostCard post={featured} featured={true} />

      {/* Rest — smaller grid */}
      {rest.length > 0 && (
        <div className="newest-posts__grid">
          {rest.map((post: PostPreview) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}