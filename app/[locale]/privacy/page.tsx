import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Privacy Policy / Politique de confidentialité',
  robots: { index: false },
}

const CONTENT = {
  fr: {
    back: '← Retour',
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : 12 mai 2026',
    s1: {
      heading: '1. Responsable du traitement',
      body: 'HBDWall.xyz est édité par Yémalin Modeste (yemalin.me). Contact : support@hbdwall.xyz',
    },
    s2: {
      heading: '2. Données collectées',
      account: 'Lors de la création d\'un compte',
      accountItems: [
        'Pseudo (nom d\'utilisateur)',
        'Nom d\'affichage (optionnel)',
        "Date d'anniversaire",
        'Code PIN à 4 chiffres (stocké sous forme hachée, non lisible)',
        'Adresse email (optionnelle)',
        'Identifiant TikTok (optionnel)',
      ],
      message: 'Lors d\'un dépôt de message sur un wall',
      messageItems: [
        "Nom de l'auteur du message (optionnel)",
        'Texte du message',
        'Photo jointe (optionnelle)',
      ],
      technical: 'Données techniques',
      technicalItems: [
        'Adresse IP (conservée temporairement, uniquement pour prévenir les abus)',
        'Cookie de session chiffré (nécessaire au fonctionnement du service)',
        'Données de navigation anonymisées via Umami Analytics (hébergé sur nos propres serveurs)',
      ],
    },
    s3: {
      heading: '3. Finalités et bases légales',
      items: [
        { strong: 'Exécution du service', rest: ' — Créer et gérer votre compte, afficher votre wall, permettre aux contributeurs de laisser un message.' },
        { strong: 'Intérêt légitime', rest: ' — Prévenir les abus et le spam (limitation du débit par IP).' },
        { strong: 'Consentement', rest: ' — Notifications push (vous pouvez les refuser ou les désactiver à tout moment dans les paramètres).' },
        { strong: 'Mesure d\'audience', rest: " — Statistiques anonymes via Umami. Aucune donnée personnelle n'est transmise à un tiers." },
      ],
    },
    s4: {
      heading: '4. Sous-traitants et transferts hors UE',
      intro: 'Nous faisons appel aux prestataires suivants pour faire fonctionner le service :',
      items: [
        { strong: 'Cloudflare R2', rest: ' (Cloudflare Inc., États-Unis) — Stockage des photos uploadées sur les walls. Cloudflare est soumis aux clauses contractuelles types de la Commission européenne.' },
        { strong: 'Umami Analytics', rest: " — Hébergé en dehors des infrastructures des GAFAM. Aucune donnée ne quitte l'UE." },
      ],
    },
    s5: {
      heading: '5. Durée de conservation',
      items: [
        "Données de compte : conservées jusqu'à la suppression du compte",
        'Messages et photos : conservés tant que le wall existe',
        'Adresse IP (rate limiting) : supprimée après 15 minutes',
        'Cookie de session : supprimé à la déconnexion ou après expiration',
      ],
    },
    s6: {
      heading: '6. Vos droits',
      intro: 'Conformément au RGPD, vous disposez des droits suivants :',
      items: [
        { strong: 'Accès', rest: ' — obtenir une copie de vos données' },
        { strong: 'Rectification', rest: ' — corriger des données inexactes' },
        { strong: 'Suppression', rest: ' — demander la suppression de votre compte et de vos données' },
        { strong: 'Portabilité', rest: ' — recevoir vos données dans un format structuré' },
        { strong: 'Opposition', rest: " — vous opposer à un traitement basé sur l'intérêt légitime" },
      ],
      contact: 'Pour exercer ces droits : support@hbdwall.xyz. Réponse sous 30 jours. En cas de litige, vous pouvez saisir la CNIL.',
    },
    s7: {
      heading: '7. Cookies',
      body: 'HBDWall.xyz utilise un seul cookie technique (bw_session), strictement nécessaire au fonctionnement du service. Il ne contient aucune donnée personnelle lisible et ne peut pas être désactivé sans empêcher la connexion. Aucun cookie publicitaire ou de tracking tiers n\'est déposé.',
    },
    s8: {
      heading: '8. Modifications',
      body: 'En cas de modification substantielle de cette politique, vous serez informé par email (si renseigné) ou via une notification sur le site.',
    },
  },
  en: {
    back: '← Back',
    title: 'Privacy Policy',
    updated: 'Last updated: May 12, 2026',
    s1: {
      heading: '1. Data controller',
      body: 'HBDWall.xyz is operated by Yémalin Modeste (yemalin.me). Contact: support@hbdwall.xyz',
    },
    s2: {
      heading: '2. Data collected',
      account: 'When creating an account',
      accountItems: [
        'Username (pseudo)',
        'Display name (optional)',
        'Birthday',
        '4-digit PIN (stored as a hash, unreadable)',
        'Email address (optional)',
        'TikTok handle (optional)',
      ],
      message: 'When leaving a message on a wall',
      messageItems: [
        "Message author's name (optional)",
        'Message text',
        'Attached photo (optional)',
      ],
      technical: 'Technical data',
      technicalItems: [
        'IP address (kept temporarily, only to prevent abuse)',
        'Encrypted session cookie (required for the service to function)',
        'Anonymised browsing data via Umami Analytics (self-hosted)',
      ],
    },
    s3: {
      heading: '3. Purposes and legal bases',
      items: [
        { strong: 'Service execution', rest: ' — Create and manage your account, display your wall, allow contributors to leave messages.' },
        { strong: 'Legitimate interest', rest: ' — Prevent abuse and spam (IP-based rate limiting).' },
        { strong: 'Consent', rest: ' — Push notifications (you can decline or disable them at any time in settings).' },
        { strong: 'Audience measurement', rest: ' — Anonymous statistics via Umami. No personal data is shared with third parties.' },
      ],
    },
    s4: {
      heading: '4. Sub-processors and non-EU transfers',
      intro: 'We use the following providers to operate the service:',
      items: [
        { strong: 'Cloudflare R2', rest: ' (Cloudflare Inc., United States) — Storage of photos uploaded to walls. Cloudflare is subject to the European Commission\'s standard contractual clauses.' },
        { strong: 'Umami Analytics', rest: ' — Self-hosted outside of GAFAM infrastructure. No data leaves the EU.' },
      ],
    },
    s5: {
      heading: '5. Retention periods',
      items: [
        'Account data: retained until the account is deleted',
        'Messages and photos: retained while the wall exists',
        'IP address (rate limiting): deleted after 15 minutes',
        'Session cookie: deleted on logout or after expiry',
      ],
    },
    s6: {
      heading: '6. Your rights',
      intro: 'Under the GDPR, you have the following rights:',
      items: [
        { strong: 'Access', rest: ' — obtain a copy of your data' },
        { strong: 'Rectification', rest: ' — correct inaccurate data' },
        { strong: 'Erasure', rest: ' — request deletion of your account and data' },
        { strong: 'Portability', rest: ' — receive your data in a structured format' },
        { strong: 'Objection', rest: ' — object to processing based on legitimate interest' },
      ],
      contact: 'To exercise these rights: support@hbdwall.xyz. Response within 30 days. You may also contact the CNIL (French data protection authority).',
    },
    s7: {
      heading: '7. Cookies',
      body: 'HBDWall.xyz uses a single technical cookie (bw_session), strictly necessary for the service to function. It contains no readable personal data and cannot be disabled without preventing login. No advertising or third-party tracking cookies are set.',
    },
    s8: {
      heading: '8. Changes',
      body: 'If this policy is materially updated, you will be notified by email (if provided) or via an on-site notification.',
    },
  },
}

export default async function PrivacyPage() {
  const locale = await getLocale()
  const c = locale === 'fr' ? CONTENT.fr : CONTENT.en

  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--s-16) var(--s-6)' }}>
      <Link href="/" className="t-caption t-muted link" style={{ display: 'inline-block', marginBottom: 'var(--s-8)' }}>
        {c.back}
      </Link>

      <h1 className="t-h1" style={{ marginBottom: 'var(--s-2)' }}>{c.title}</h1>
      <p className="t-caption t-muted" style={{ marginBottom: 'var(--s-12)' }}>{c.updated}</p>

      {/* Section 1 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s1.heading}</h2>
        <p className="t-body t-muted">
          {c.s1.body.split('yemalin.me')[0]}
          <a href="https://yemalin.me" className="link" target="_blank" rel="noopener noreferrer">yemalin.me</a>
          {c.s1.body.split('yemalin.me')[1].split('support@hbdwall.xyz')[0]}
          <a href="mailto:support@hbdwall.xyz" className="link">support@hbdwall.xyz</a>
        </p>
      </section>

      {/* Section 2 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s2.heading}</h2>

        {[
          { label: c.s2.account, items: c.s2.accountItems },
          { label: c.s2.message, items: c.s2.messageItems },
          { label: c.s2.technical, items: c.s2.technicalItems },
        ].map((group, i) => (
          <div key={i} style={{ marginBottom: 'var(--s-5)' }}>
            <p className="t-small" style={{ fontWeight: 700, marginBottom: 'var(--s-2)' }}>{group.label}</p>
            <ul style={{ listStyle: 'disc', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
              {group.items.map((item, j) => (
                <li key={j} className="t-body t-muted">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Section 3 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s3.heading}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {c.s3.items.map((item, i) => (
            <p key={i} className="t-body t-muted">
              <strong style={{ color: 'var(--fg)' }}>{item.strong}</strong>{item.rest}
            </p>
          ))}
        </div>
      </section>

      {/* Section 4 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s4.heading}</h2>
        <p className="t-body t-muted" style={{ marginBottom: 'var(--s-4)' }}>{c.s4.intro}</p>
        <ul style={{ listStyle: 'disc', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {c.s4.items.map((item, i) => (
            <li key={i} className="t-body t-muted">
              <strong style={{ color: 'var(--fg)' }}>{item.strong}</strong>{item.rest}
            </li>
          ))}
        </ul>
      </section>

      {/* Section 5 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s5.heading}</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
          {c.s5.items.map((item, i) => (
            <li key={i} className="t-body t-muted">{item}</li>
          ))}
        </ul>
      </section>

      {/* Section 6 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s6.heading}</h2>
        <p className="t-body t-muted" style={{ marginBottom: 'var(--s-4)' }}>{c.s6.intro}</p>
        <ul style={{ listStyle: 'disc', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-1)', marginBottom: 'var(--s-4)' }}>
          {c.s6.items.map((item, i) => (
            <li key={i} className="t-body t-muted">
              <strong style={{ color: 'var(--fg)' }}>{item.strong}</strong>{item.rest}
            </li>
          ))}
        </ul>
        <p className="t-body t-muted">
          {c.s6.contact.split('support@hbdwall.xyz')[0]}
          <a href="mailto:support@hbdwall.xyz" className="link">support@hbdwall.xyz</a>
          {c.s6.contact.split('support@hbdwall.xyz')[1].split('CNIL')[0]}
          {c.s6.contact.includes('CNIL') && (
            <a href="https://www.cnil.fr" className="link" target="_blank" rel="noopener noreferrer">CNIL</a>
          )}
          {c.s6.contact.split('CNIL')[1]}
        </p>
      </section>

      {/* Section 7 */}
      <section style={{ marginBottom: 'var(--s-10)' }}>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s7.heading}</h2>
        <p className="t-body t-muted">
          {c.s7.body.split('bw_session')[0]}
          <code style={{ background: 'var(--bg-2, var(--border))', padding: '1px 4px', borderRadius: '3px' }}>bw_session</code>
          {c.s7.body.split('bw_session')[1]}
        </p>
      </section>

      {/* Section 8 */}
      <section>
        <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{c.s8.heading}</h2>
        <p className="t-body t-muted">{c.s8.body}</p>
      </section>
    </main>
  )
}
