import Link from 'next/link'
import Image from 'next/image'

// Grille éditoriale "bento" festive des articles : 1 vedette (grande, titre surligné)
// + 3 cartes-image. Toutes ont une image. data-theme="joyful" → îlot festif partout.
const CAT: Record<string, string> = {
  distance: 'À distance', collegues: 'Collègues', surprises: 'Surprises',
  messages: 'Messages', milestones: 'Milestones', souvenirs: 'Souvenirs',
}

export type BentoPost = { slug: string; title: string; excerpt: string; category: string }

function Cat({ c }: { c: string }) {
  return <span className="bento-cat">{CAT[c] ?? 'Idées'}</span>
}

function ImgCard({ post, cls }: { post: BentoPost; cls: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`bento-cell ${cls}`}>
      <Image src={`/blog-images/${post.slug}.jpg`} alt="" fill sizes="(max-width:760px) 100vw, 25vw" className="bento-img" />
      <span className="bento-shade" />
      <div className="bento-overlay">
        <Cat c={post.category} />
        <h3 className="bento-title bento-title--sm">{post.title}</h3>
      </div>
    </Link>
  )
}

export default function BlogBento({ posts, priority = false }: { posts: BentoPost[]; priority?: boolean }) {
  const [a, b, c, d] = posts
  return (
    <div className="blog-bento" data-theme="joyful">
      {a && (
        <Link href={`/blog/${a.slug}`} className="bento-cell bento-feat">
          <Image src={`/blog-images/${a.slug}.jpg`} alt="" fill sizes="(max-width:760px) 100vw, 50vw" className="bento-img" priority={priority} />
          <div className="bento-overlay bento-overlay--mark">
            <Cat c={a.category} />
            <h3 className="bento-title bento-title--mark">{a.title}</h3>
          </div>
        </Link>
      )}
      {b && <ImgCard post={b} cls="bento-b" />}
      {c && <ImgCard post={c} cls="bento-c" />}
      {d && <ImgCard post={d} cls="bento-d" />}
    </div>
  )
}
