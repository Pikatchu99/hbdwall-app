import { getTranslations } from 'next-intl/server'

// FAQ visible (les mêmes Q/R que le FAQPage JSON-LD). Sert le SEO (rich results,
// honore le schema) et le GEO (les IA liftent les réponses concises). Sur les 2 landings.
type Faq = { q: string; a: string }

export default async function FaqSection() {
  const t = await getTranslations('seo')
  const faq = (t.raw('faq') as Faq[]) ?? []
  if (!faq.length) return null
  const ui = await getTranslations('faqSection')

  return (
    <section className="faq-sec" aria-labelledby="faq-title">
      <p className="faq-kicker">{ui('kicker')}</p>
      <h2 id="faq-title" className="faq-title">{ui('title')}</h2>
      <div className="faq-list">
        {faq.map((f, i) => (
          <details key={i} className="faq-item card" open={i === 0}>
            <summary className="faq-q">{f.q}</summary>
            <p className="faq-a">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
