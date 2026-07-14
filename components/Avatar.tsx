'use client'
import BoringAvatar from 'boring-avatars'
import Image from 'next/image'

const PALETTE = ['#EAEAEA', '#111111', '#7B61FF', '#CCCCCC', '#555555']

// Avatars Google : servis en =s96 par défaut (basse résolution → flou une fois agrandis).
// On demande 2× la taille d'affichage pour rester net (y compris sur écran retina).
function hires(src: string, size: number): string {
  if (!src.includes('googleusercontent.com')) return src
  const px = Math.round(size * 2)
  return /=s\d+(-c)?$/.test(src) ? src.replace(/=s\d+(-c)?$/, `=s${px}-c`) : `${src}=s${px}-c`
}

export default function Avatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      <Image
        src={hires(src, size)}
        alt={name}
        width={size}
        height={size}
        style={{ borderRadius: 4, objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return (
    <BoringAvatar
      size={size}
      name={name}
      variant="beam"
      colors={PALETTE}
      square
    />
  )
}
