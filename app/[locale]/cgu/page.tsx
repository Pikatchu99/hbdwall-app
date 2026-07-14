import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Terms of Service / CGU',
  robots: { index: false },
}

const CONTENT = {
  fr: {
    back: '← Retour',
    title: "Conditions générales d'utilisation",
    updated: 'Dernière mise à jour : 12 mai 2026',
    sections: [
      {
        heading: '1. Présentation du service',
        body: [
          'HBDWall.xyz est un service en ligne permettant de créer une page de messages collectifs (un "wall") à l\'occasion d\'un anniversaire ou d\'un événement de vie. Les proches du créateur peuvent y déposer un message, une photo ou les deux. Le créateur peut ensuite générer un collage souvenir.',
          'Le service est édité par Yémalin Modeste (yemalin.me). Contact : support@hbdwall.xyz',
        ],
      },
      {
        heading: '2. Acceptation des conditions',
        body: [
          "L'utilisation du service vaut acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.",
        ],
      },
      {
        heading: '3. Accès au service',
        body: [
          "Le service est accessible à toute personne disposant d'une connexion Internet. La création d'un compte est nécessaire pour créer un wall. Le dépôt de message ne requiert pas de compte.",
          "Vous êtes responsable de la confidentialité de votre code d'accès. En cas de perte, contactez le support.",
        ],
      },
      {
        heading: '4. Contenu publié',
        subsections: [
          {
            heading: '4.1 Propriété',
            body: "Vous conservez la propriété intellectuelle des contenus que vous publiez (messages, photos). En les publiant sur HBDWall.xyz, vous accordez au service une licence limitée, non exclusive et gratuite pour les afficher et les stocker dans le seul cadre du fonctionnement du service.",
          },
          {
            heading: '4.2 Contenus interdits',
            intro: 'Il est strictement interdit de publier des contenus :',
            items: [
              'À caractère haineux, discriminatoire ou violent',
              'À caractère pornographique ou sexuellement explicite',
              'Constituant du harcèlement envers une personne',
              "Portant atteinte aux droits d'auteur ou à la vie privée d'un tiers",
              'Constituant de la publicité non sollicitée (spam)',
              'Contraires aux lois françaises et européennes en vigueur',
            ],
          },
        ],
      },
      {
        heading: '5. Responsabilités',
        paragraphs: [
          { strong: 'Le créateur du wall', rest: " est responsable de l'usage qu'il fait du service et du lien de partage qu'il diffuse. Il s'engage à ne pas partager le lien de son wall dans un contexte malveillant." },
          { strong: 'Les contributeurs', rest: ' sont seuls responsables des messages et photos qu\'ils déposent.' },
          { strong: 'HBDWall.xyz', rest: " ne peut être tenu responsable des contenus publiés par les utilisateurs. Tout contenu signalé comme abusif sera examiné et supprimé si nécessaire." },
        ],
      },
      {
        heading: '6. Signalement',
        body: ['Pour signaler un contenu inapproprié, contactez support@hbdwall.xyz en indiquant l\'URL du wall concerné. Toute demande sera traitée dans les meilleurs délais.'],
      },
      {
        heading: '7. Suppression de compte et de données',
        body: ["Vous pouvez demander la suppression de votre compte et de l'ensemble de vos données à tout moment en contactant support@hbdwall.xyz. La suppression est effective sous 30 jours et entraîne la disparition de tous vos walls et messages associés."],
      },
      {
        heading: '8. Disponibilité du service',
        body: ['HBDWall.xyz s\'efforce de maintenir le service accessible en permanence mais ne garantit aucune disponibilité sans interruption. Des maintenances peuvent être effectuées sans préavis. Le service est fourni "en l\'état", sans garantie d\'aucune sorte.'],
      },
      {
        heading: '9. Modification des CGU',
        body: ["Ces CGU peuvent être modifiées à tout moment. En cas de modification substantielle, les utilisateurs disposant d'un email enregistré seront notifiés. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions."],
      },
      {
        heading: '10. Droit applicable',
        body: ['Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français sont compétents.'],
      },
    ],
  },
  en: {
    back: '← Back',
    title: 'Terms of Service',
    updated: 'Last updated: May 12, 2026',
    sections: [
      {
        heading: '1. About the service',
        body: [
          'HBDWall.xyz is an online service for creating a collective message board (a "wall") for a birthday or life event. Friends and family of the creator can leave a message, a photo, or both. The creator can then generate a souvenir collage.',
          'The service is operated by Yémalin Modeste (yemalin.me). Contact: support@hbdwall.xyz',
        ],
      },
      {
        heading: '2. Acceptance of terms',
        body: [
          'By using the service you fully accept these Terms of Service. If you do not accept these terms, you must not use the service.',
        ],
      },
      {
        heading: '3. Access to the service',
        body: [
          'The service is accessible to anyone with an internet connection. Creating an account is required to create a wall. Leaving a message does not require an account.',
          'You are responsible for keeping your access code confidential. If lost, contact support.',
        ],
      },
      {
        heading: '4. Published content',
        subsections: [
          {
            heading: '4.1 Ownership',
            body: 'You retain intellectual property rights over the content you publish (messages, photos). By publishing on HBDWall.xyz, you grant the service a limited, non-exclusive, royalty-free licence to display and store it solely for the purpose of operating the service.',
          },
          {
            heading: '4.2 Prohibited content',
            intro: 'It is strictly forbidden to publish content that is:',
            items: [
              'Hateful, discriminatory, or violent',
              'Pornographic or sexually explicit',
              'Constituting harassment of any person',
              "Infringing a third party's copyright or privacy",
              'Unsolicited advertising (spam)',
              'In violation of applicable laws',
            ],
          },
        ],
      },
      {
        heading: '5. Liability',
        paragraphs: [
          { strong: 'The wall creator', rest: ' is responsible for how they use the service and how they distribute the sharing link. They agree not to share the link in a malicious context.' },
          { strong: 'Contributors', rest: ' are solely responsible for the messages and photos they submit.' },
          { strong: 'HBDWall.xyz', rest: ' is not liable for content published by users. Any content reported as abusive will be reviewed and removed if necessary.' },
        ],
      },
      {
        heading: '6. Reporting',
        body: ['To report inappropriate content, contact support@hbdwall.xyz with the URL of the wall in question. All requests will be handled promptly.'],
      },
      {
        heading: '7. Account and data deletion',
        body: ['You may request deletion of your account and all associated data at any time by contacting support@hbdwall.xyz. Deletion is effective within 30 days and results in the removal of all your walls and associated messages.'],
      },
      {
        heading: '8. Service availability',
        body: ['HBDWall.xyz strives to keep the service available at all times but does not guarantee uninterrupted availability. Maintenance may be carried out without notice. The service is provided "as is", without warranty of any kind.'],
      },
      {
        heading: '9. Changes to these terms',
        body: ['These terms may be modified at any time. In the event of a material change, users with a registered email will be notified. Continued use of the service after a change constitutes acceptance of the new terms.'],
      },
      {
        heading: '10. Governing law',
        body: ['These terms are governed by French law. In the event of a dispute, French courts have jurisdiction.'],
      },
    ],
  },
}

export default async function CGUPage() {
  const locale = await getLocale()
  const c = locale === 'fr' ? CONTENT.fr : CONTENT.en

  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--s-16) var(--s-6)' }}>
      <Link href="/" className="t-caption t-muted link" style={{ display: 'inline-block', marginBottom: 'var(--s-8)' }}>
        {c.back}
      </Link>

      <h1 className="t-h1" style={{ marginBottom: 'var(--s-2)' }}>{c.title}</h1>
      <p className="t-caption t-muted" style={{ marginBottom: 'var(--s-12)' }}>{c.updated}</p>

      {c.sections.map((section, i) => (
        <section key={i} style={{ marginBottom: 'var(--s-10)' }}>
          <h2 className="t-label" style={{ marginBottom: 'var(--s-4)' }}>{section.heading}</h2>

          {'body' in section && section.body?.map((p, j) => (
            <p key={j} className="t-body t-muted" style={{ marginBottom: 'var(--s-3)' }}>
              {p.includes('support@hbdwall.xyz') ? (
                <>
                  {p.split('support@hbdwall.xyz')[0]}
                  <a href="mailto:support@hbdwall.xyz" className="link">support@hbdwall.xyz</a>
                  {p.split('support@hbdwall.xyz')[1]}
                </>
              ) : p.includes('yemalin.me') ? (
                <>
                  {p.split('yemalin.me')[0]}
                  <a href="https://yemalin.me" className="link" target="_blank" rel="noopener noreferrer">yemalin.me</a>
                  {p.split('yemalin.me')[1]}
                </>
              ) : p}
            </p>
          ))}

          {'paragraphs' in section && section.paragraphs?.map((p, j) => (
            <p key={j} className="t-body t-muted" style={{ marginBottom: 'var(--s-3)' }}>
              <strong style={{ color: 'var(--fg)' }}>{p.strong}</strong>{p.rest}
            </p>
          ))}

          {'subsections' in section && section.subsections?.map((sub, j) => (
            <div key={j} style={{ marginBottom: 'var(--s-6)' }}>
              <p className="t-small" style={{ fontWeight: 700, marginBottom: 'var(--s-2)' }}>{sub.heading}</p>
              {'body' in sub && <p className="t-body t-muted">{sub.body}</p>}
              {'items' in sub && sub.items && (
                <>
                  <p className="t-body t-muted" style={{ marginBottom: 'var(--s-2)' }}>{sub.intro}</p>
                  <ul style={{ listStyle: 'disc', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
                    {sub.items.map((item, k) => (
                      <li key={k} className="t-body t-muted">{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </section>
      ))}
    </main>
  )
}
