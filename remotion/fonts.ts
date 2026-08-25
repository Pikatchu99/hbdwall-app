import { loadFont as loadBaloo2, fontFamily as balooFamily } from '@remotion/google-fonts/Baloo2'
import { loadFont as loadSpaceMono, fontFamily as spaceMonoFamily } from '@remotion/google-fonts/SpaceMono'
import { loadFont as loadInter, fontFamily as interFamily } from '@remotion/google-fonts/Inter'

loadBaloo2('normal', { weights: ['500', '700', '800'] })
loadSpaceMono('normal', { weights: ['400', '700'] })
loadInter('normal', { weights: ['900'] })

export const round = balooFamily
export const mono = spaceMonoFamily
export const display = interFamily
