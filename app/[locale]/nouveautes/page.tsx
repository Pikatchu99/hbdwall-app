import Link from 'next/link'
import Nav from '@/components/Nav'
import { Gift, History, Smartphone, Link2, Bell, FileText, Settings, UserCircle } from 'lucide-react'
import { getLocale } from 'next-intl/server'

function ImageSlot({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="nv-img"
        style={{ width: '100%', display: 'block', border: '1px solid var(--border)', marginTop: 'var(--s-4)' }}
      />
    )
  }
  return (
    <div className="nv-placeholder" style={{
      width: '100%',
      border: '1px dashed var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      marginTop: 'var(--s-4)',
      padding: 'var(--s-8) 0',
    }}>
      <p className="t-caption t-muted">{alt}</p>
    </div>
  )
}

function Collapse({ label, showLabel, children }: { label: string; showLabel: string; children: React.ReactNode }) {
  return (
    <details style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--s-4)' }}>
      <summary style={{
        padding: 'var(--s-3) 0',
        cursor: 'pointer',
        listStyle: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span className="t-label">{label}</span>
        <span className="t-caption t-muted">{showLabel} ▾</span>
      </summary>
      <div style={{ paddingBottom: 'var(--s-4)' }}>
        {children}
      </div>
    </details>
  )
}

function SectionTag({ icon: Icon, label, accent }: { icon: React.ElementType; label: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>
      <Icon size={14} color={accent ? 'var(--accent)' : 'var(--fg-muted)'} />
      <p className="t-label" style={{ color: accent ? 'var(--accent)' : 'var(--fg-muted)' }}>{label}</p>
    </div>
  )
}

// Full release checklist → see lib/whats-new.ts
const CONTENT = {
  fr: {
    back: '← Dashboard',
    badge: 'MISE À JOUR · JUIN 2026',
    wishlist: {
      tag: 'NOUVEAUTÉ PRINCIPALE',
      title: 'Votre liste d\'envies',
      body: 'Créez votre liste d\'envies depuis votre dashboard. Elle apparaît comme un bouton sur votre mur — vos invités cliquent pour la découvrir et savent enfin quoi vous offrir. Fini les cadeaux en double.',
      img1: 'Le bouton Wishlist sur le mur',
      img2: 'La wishlist que voient vos invités',
      img3: 'Gérer votre wishlist depuis le dashboard',
    },
    years: {
      tag: 'NOUVEAUTÉ',
      title: 'Vos anniversaires, année après année',
      body: 'Désormais, chaque année garde son propre mur, ses messages et son collage. Revenez sur n\'importe quelle édition passée depuis votre dashboard — vos souvenirs ne s\'effacent plus.',
      img1: 'La page de vos éditions, année par année',
      img2: 'Revoir une édition passée',
    },
    avatar: {
      tag: 'PROFIL',
      title: 'Photo de profil',
      body: "Définissez votre photo de profil depuis n'importe où — elle s'affiche sur votre mur d'anniversaire. Cliquez sur votre avatar en haut à droite pour choisir une photo ou en supprimer une.",
      img: 'Avatar cliquable — changer la photo de profil',
    },
    title: 'Quoi de neuf ?',
    intro: 'Voici les nouveautés de cette mise à jour de hbdwall.',
    show: 'Afficher',
    social: {
      tag: 'NOUVEAUTÉ PRINCIPALE',
      title: 'Mis en avant sur Instagram & TikTok',
      body: "Vos murs peuvent maintenant être partagés sur nos réseaux sociaux. Si vous souhaitez être mis en avant, renseignez votre @ Instagram et/ou TikTok dans vos paramètres — c'est tout.",
      img1: 'Post Instagram HBDWall — mise en avant du jour',
      img2: 'Post Instagram HBDWall — profil mis en avant',
    },
    settings: {
      tag: 'PARAMÈTRES',
      title: 'Renseignez vos réseaux',
      body: 'Rendez-vous dans',
      link: 'Paramètres → Réseaux sociaux',
      body2: 'pour entrer votre @ Instagram et TikTok. Les utilisateurs existants doivent le faire manuellement — les nouveaux le font à l\'inscription.',
      img: 'Capture des paramètres sociaux',
    },
    google: {
      tag: 'CONNEXION',
      title: 'Connexion Google',
      body: "Vous pouvez désormais lier votre compte Google à votre profil pour vous connecter sans avoir à saisir votre PIN à chaque fois.",
      img: 'Bouton Connexion avec Google',
    },
    push: {
      tag: 'NOTIFICATIONS',
      title: 'Notifications push',
      body: "Activez les notifications pour être averti dès qu'un ami laisse un message sur votre mur d'anniversaire. Disponible sur mobile et desktop.",
      collapseLabel: 'Instructions pour iPhone (iOS)',
      collapseIntro: "Sur iPhone, les notifications web ne fonctionnent qu'en ajoutant hbdwall à votre écran d'accueil. Voici comment faire :",
      step1: '1. Bouton Partager dans Safari',
      step2: "2. Sur l'écran d'accueil",
      step3: '3. Appuyez sur Ajouter',
      step4: "4. Ouvrez l'app depuis l'icône",
      img: 'Activation des notifications push',
    },
    legal: {
      tag: 'LÉGAL',
      title: 'CGU & Politique de confidentialité',
      body: 'Nos conditions générales et notre politique de confidentialité sont désormais disponibles. Vous pouvez les consulter à tout moment.',
      cgu: 'Conditions générales →',
      privacy: 'Confidentialité →',
    },
    btnSettings: 'Paramètres',
    btnDashboard: 'Retour au dashboard',
  },
  en: {
    back: '← Dashboard',
    badge: 'UPDATE · JUNE 2026',
    wishlist: {
      tag: 'MAIN FEATURE',
      title: 'Your wishlist',
      body: 'Create your wishlist from your dashboard. It shows up as a button on your wall — your guests click to reveal it and finally know what to give you. No more duplicate gifts.',
      img1: 'The Wishlist button on the wall',
      img2: 'The wishlist your guests see',
      img3: 'Manage your wishlist from your dashboard',
    },
    years: {
      tag: 'NEW',
      title: 'Your birthdays, year after year',
      body: 'Each year now keeps its own wall, messages and collage. Revisit any past edition from your dashboard — your memories no longer disappear.',
      img1: 'Your editions, year by year',
      img2: 'Revisiting a past edition',
    },
    avatar: {
      tag: 'PROFILE',
      title: 'Profile photo',
      body: 'Set your profile photo from anywhere — it appears on your birthday wall. Click your avatar in the top right to choose a photo or remove it.',
      img: 'Clickable avatar — change profile photo',
    },
    title: "What's new?",
    intro: "Here's what's new in this hbdwall update.",
    show: 'Show',
    social: {
      tag: 'MAIN FEATURE',
      title: 'Featured on Instagram & TikTok',
      body: 'Your walls can now be shared on our social media. If you want to be featured, add your @ Instagram and/or TikTok in your settings — that\'s it.',
      img1: 'HBDWall Instagram post — featured today',
      img2: 'HBDWall Instagram post — featured profile',
    },
    settings: {
      tag: 'SETTINGS',
      title: 'Add your social handles',
      body: 'Go to',
      link: 'Settings → Social networks',
      body2: 'to add your @ Instagram and TikTok. Existing users need to do it manually — new users set it at sign-up.',
      img: 'Social settings screenshot',
    },
    google: {
      tag: 'LOGIN',
      title: 'Google login',
      body: "You can now link your Google account to your profile to sign in without entering your PIN every time.",
      img: 'Sign in with Google button',
    },
    push: {
      tag: 'NOTIFICATIONS',
      title: 'Push notifications',
      body: "Enable notifications to get alerted as soon as a friend leaves a message on your birthday wall. Available on mobile and desktop.",
      collapseLabel: 'Instructions for iPhone (iOS)',
      collapseIntro: "On iPhone, web notifications only work by adding hbdwall to your home screen. Here's how:",
      step1: '1. Share button in Safari',
      step2: '2. Add to Home Screen',
      step3: '3. Tap Add',
      step4: '4. Open the app from the icon',
      img: 'Enabling push notifications',
    },
    legal: {
      tag: 'LEGAL',
      title: 'Terms & Privacy policy',
      body: 'Our terms of service and privacy policy are now available. You can read them at any time.',
      cgu: 'Terms of service →',
      privacy: 'Privacy policy →',
    },
    btnSettings: 'Settings',
    btnDashboard: 'Back to dashboard',
  },
}

export default async function NouveautesPage() {
  const locale = await getLocale()
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.fr

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />

      <style>{`
        .nv-wrap { max-width: 960px; margin: 0 auto; padding: var(--s-12) var(--s-4); }
        .nv-section { display: flex; flex-direction: column; gap: var(--s-6); padding-bottom: var(--s-10); border-bottom: 1px solid var(--border); }
        .nv-images { display: flex; flex-direction: column; gap: var(--s-4); }
        .nv-img { max-height: 320px; object-fit: contain; object-position: top; }
        .nv-ios-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); margin-top: var(--s-4); }
        .nv-ios-grid .nv-img { max-height: 240px; margin-top: 0; }
        @media (min-width: 720px) {
          .nv-section { flex-direction: row; align-items: flex-start; gap: var(--s-10); }
          .nv-text { flex: 1; min-width: 0; }
          .nv-images { flex: 1; min-width: 0; flex-direction: row; flex-wrap: wrap; }
          .nv-images .nv-img { flex: 1; min-width: 0; max-height: 400px; margin-top: 0; }
          .nv-images .nv-placeholder { flex: 1; margin-top: 0; }
          .nv-single .nv-images { flex-direction: column; }
          .nv-single .nv-images .nv-img { max-height: 360px; }
        }
      `}</style>

      <div className="nv-wrap">

        <div style={{ marginBottom: 'var(--s-10)', paddingBottom: 'var(--s-8)', borderBottom: '1px solid var(--border)' }}>
          <Link href="/dashboard" className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-3)' }}>
            {c.back}
          </Link>
          <p className="t-label" style={{ color: 'var(--accent)', marginBottom: 'var(--s-2)' }}>{c.badge}</p>
          <h1 className="t-h1">{c.title}</h1>
          <p className="t-body t-muted" style={{ marginTop: 'var(--s-3)' }}>{c.intro}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-12)' }}>

          {/* Wishlist */}
          <section className="nv-section nv-single">
            <div className="nv-text">
              <SectionTag icon={Gift} label={c.wishlist.tag} accent />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.wishlist.title}</h2>
              <p className="t-body">{c.wishlist.body}</p>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/wishlist-wall.png" alt={c.wishlist.img1} />
              <ImageSlot src="/nouveautes/wishlist-modal.png" alt={c.wishlist.img2} />
              <ImageSlot src="/nouveautes/wishlist-manage.png" alt={c.wishlist.img3} />
            </div>
          </section>

          {/* Années / éditions */}
          <section className="nv-section">
            <div className="nv-text">
              <SectionTag icon={History} label={c.years.tag} accent />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.years.title}</h2>
              <p className="t-body">{c.years.body}</p>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/years-page.png" alt={c.years.img1} />
              <ImageSlot src="/nouveautes/years-archive.png" alt={c.years.img2} />
            </div>
          </section>

          {/* Photo de profil */}
          <section className="nv-section nv-single">
            <div className="nv-text">
              <SectionTag icon={UserCircle} label={c.avatar.tag} accent />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.avatar.title}</h2>
              <p className="t-body">{c.avatar.body}</p>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/avatar-upload-1.png" alt={c.avatar.img} />
              <ImageSlot src="/nouveautes/avatar-upload-2.png" alt={c.avatar.img} />
            </div>
          </section>

          {/* Instagram & TikTok */}
          <section className="nv-section">
            <div className="nv-text">
              <SectionTag icon={Smartphone} label={c.social.tag} accent />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.social.title}</h2>
              <p className="t-body">{c.social.body}</p>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/instagram-highlight.jpg" alt={c.social.img1} />
              <ImageSlot src="/nouveautes/instagram-highlight-2.jpg" alt={c.social.img2} />
            </div>
          </section>

          {/* Settings social */}
          <section className="nv-section nv-single">
            <div className="nv-text">
              <SectionTag icon={Settings} label={c.settings.tag} />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.settings.title}</h2>
              <p className="t-body">
                {c.settings.body}{' '}
                <Link href="/settings#reseaux-sociaux" style={{ color: 'var(--accent)' }}>{c.settings.link}</Link>
                {' '}{c.settings.body2}
              </p>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/settings-social.png" alt={c.settings.img} />
            </div>
          </section>

          {/* Google login */}
          <section className="nv-section nv-single">
            <div className="nv-text">
              <SectionTag icon={Link2} label={c.google.tag} />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.google.title}</h2>
              <p className="t-body">{c.google.body}</p>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/login-google.png" alt={c.google.img} />
            </div>
          </section>

          {/* Push notifications */}
          <section className="nv-section nv-single">
            <div className="nv-text">
              <SectionTag icon={Bell} label={c.push.tag} />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.push.title}</h2>
              <p className="t-body">{c.push.body}</p>
              <Collapse label={c.push.collapseLabel} showLabel={c.show}>
                <p className="t-body" style={{ marginTop: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
                  {c.push.collapseIntro}
                </p>
                <div className="nv-ios-grid">
                  <div>
                    <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>{c.push.step1}</p>
                    <ImageSlot src="/nouveautes/ios-step1.jpg" alt={c.push.step1} />
                  </div>
                  <div>
                    <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>{c.push.step2}</p>
                    <ImageSlot src="/nouveautes/ios-step2.jpg" alt={c.push.step2} />
                  </div>
                  <div>
                    <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>{c.push.step3}</p>
                    <ImageSlot src="/nouveautes/ios-step3.jpg" alt={c.push.step3} />
                  </div>
                  <div>
                    <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>{c.push.step4}</p>
                    <ImageSlot src="/nouveautes/ios-step4.jpg" alt={c.push.step4} />
                  </div>
                </div>
              </Collapse>
            </div>
            <div className="nv-images">
              <ImageSlot src="/nouveautes/push-notif.png" alt={c.push.img} />
            </div>
          </section>

          {/* CGU & Privacy */}
          <section className="nv-section">
            <div className="nv-text">
              <SectionTag icon={FileText} label={c.legal.tag} />
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>{c.legal.title}</h2>
              <p className="t-body" style={{ marginBottom: 'var(--s-5)' }}>{c.legal.body}</p>
              <div style={{ display: 'flex', gap: 'var(--s-6)' }}>
                <Link href="/cgu" className="t-body link" style={{ color: 'var(--accent)' }}>{c.legal.cgu}</Link>
                <Link href="/privacy" className="t-body link" style={{ color: 'var(--accent)' }}>{c.legal.privacy}</Link>
              </div>
            </div>
          </section>

        </div>

        <div style={{ marginTop: 'var(--s-10)', display: 'flex', gap: 'var(--s-4)' }}>
          <Link href="/settings" className="btn btn--ghost" data-umami-event="nouveautes_cta_settings">{c.btnSettings}</Link>
          <Link href="/dashboard" className="btn btn--solid" data-umami-event="nouveautes_cta_dashboard">{c.btnDashboard}</Link>
        </div>

      </div>
    </main>
  )
}
