#!/usr/bin/env node
import 'dotenv/config'

const PRODUCT_EVENTS = [
  'signup_started',
  'signup_success',
  'onboarding_step_completed',
  'wall_created',
  'wall_viewed',
  'wall_link_copied',
  'share_link_copied',
  'wall_shared_whatsapp',
  'message_submitted',
  'collage_generated',
  'collage_downloaded',
  'visitor_clicked_create_wall_cta',
  'guest_to_creator_converted',
  'push_subscribed',
  'nouveautes_cta_settings',
  'nouveautes_cta_dashboard',
]

const DEFAULT_DAYS = 30

function parseArgs(argv) {
  const args = {
    days: Number(process.env.UMAMI_DAYS || DEFAULT_DAYS),
    baseUrl: process.env.UMAMI_BASE_URL,
    username: process.env.UMAMI_USERNAME,
    password: process.env.UMAMI_PASSWORD,
    token: process.env.UMAMI_TOKEN,
    apiKey: process.env.UMAMI_API_KEY,
    websiteId: process.env.UMAMI_WEBSITE_ID,
    domain: process.env.UMAMI_DOMAIN || 'hbdwall.xyz',
    json: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]
    if (arg === '--days' && next) {
      args.days = Number(next)
      i += 1
    } else if (arg === '--base-url' && next) {
      args.baseUrl = next
      i += 1
    } else if (arg === '--website-id' && next) {
      args.websiteId = next
      i += 1
    } else if (arg === '--domain' && next) {
      args.domain = next
      i += 1
    } else if (arg === '--json') {
      args.json = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  if (!Number.isFinite(args.days) || args.days < 1) {
    throw new Error('Invalid --days value. Use a positive number, for example --days 30.')
  }

  if (!args.baseUrl) {
    throw new Error('Missing UMAMI_BASE_URL. Example: UMAMI_BASE_URL=https://analytics.example.com')
  }

  args.baseUrl = args.baseUrl.replace(/\/$/, '')
  return args
}

function printHelp() {
  console.log(`Usage: pnpm umami:report [options]

Options:
  --days <n>          Reporting window in days. Default: ${DEFAULT_DAYS}
  --website-id <id>   Override UMAMI_WEBSITE_ID
  --domain <domain>   Domain used to auto-pick a website if no ID is set
  --base-url <url>    Override UMAMI_BASE_URL
  --json              Print raw JSON report

Required env for self-hosted Umami:
  UMAMI_BASE_URL=https://analytics.example.com
  UMAMI_USERNAME=...
  UMAMI_PASSWORD=...

Optional:
  UMAMI_WEBSITE_ID=...
  UMAMI_DOMAIN=hbdwall.xyz
  UMAMI_DAYS=30
`)
}

async function requestJson(url, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    body,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const detail = data?.message || data?.error || text || res.statusText
    throw new Error(`${method} ${url} failed (${res.status}): ${detail}`)
  }

  return data
}

async function getAuthHeaders(args) {
  if (args.apiKey) {
    return { 'x-umami-api-key': args.apiKey }
  }
  if (args.token) {
    return { Authorization: `Bearer ${args.token}` }
  }
  if (!args.username || !args.password) {
    throw new Error('Missing Umami credentials. Set UMAMI_USERNAME/UMAMI_PASSWORD, UMAMI_TOKEN, or UMAMI_API_KEY.')
  }

  const data = await requestJson(`${args.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: args.username, password: args.password }),
  })

  if (!data?.token) {
    throw new Error('Umami login did not return a token.')
  }

  return { Authorization: `Bearer ${data.token}` }
}

async function resolveWebsite(args, headers) {
  if (args.websiteId) {
    const website = await requestJson(`${args.baseUrl}/api/websites/${args.websiteId}`, { headers })
    return website
  }

  const websites = await requestJson(`${args.baseUrl}/api/websites?pageSize=100`, { headers })
  const rows = websites?.data || []
  const match = rows.find((site) => site.domain === args.domain || site.name?.toLowerCase().includes(args.domain.toLowerCase()))

  if (!match) {
    const available = rows.map((site) => `${site.name} (${site.domain}) id=${site.id}`).join('\n')
    throw new Error(`Could not find a website for domain "${args.domain}". Set UMAMI_WEBSITE_ID.\n\nAvailable websites:\n${available || '(none)'}`)
  }

  return match
}

function buildUrl(baseUrl, path, params) {
  const url = new URL(`${baseUrl}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

function sumSeriesByEvent(series) {
  const totals = new Map()
  for (const row of series || []) {
    totals.set(row.x, (totals.get(row.x) || 0) + Number(row.y || 0))
  }
  return [...totals.entries()]
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count || a.event.localeCompare(b.event))
}

async function getDetailedEvents(args, headers, websiteId, common) {
  const rows = []
  let page = 1
  const pageSize = 500
  const maxRows = 5000

  while (rows.length < maxRows) {
    const data = await requestJson(buildUrl(args.baseUrl, `/api/websites/${websiteId}/events`, {
      ...common,
      page,
      pageSize,
    }), { headers })

    rows.push(...(data.data || []))

    if (rows.length >= Number(data.count || 0) || !(data.data || []).length) break
    page += 1
  }

  const customEvents = rows.filter((row) => row.eventName)
  const eventPaths = new Map()
  const countries = new Map()

  for (const row of rows) {
    const country = row.country || '??'
    countries.set(country, (countries.get(country) || 0) + 1)
  }

  for (const row of customEvents) {
    const key = `${row.eventName} | ${row.urlPath}`
    eventPaths.set(key, (eventPaths.get(key) || 0) + 1)
  }

  return {
    totalEvents: rows.length,
    customEvents: customEvents.length,
    topEventPaths: [...eventPaths.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
      .slice(0, 20),
    countries: [...countries.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))
      .slice(0, 10),
  }
}

async function getReport(args, headers, website) {
  const endAt = Date.now()
  const startAt = endAt - args.days * 24 * 60 * 60 * 1000
  const common = { startAt, endAt }
  const websitePath = `/api/websites/${website.id}`

  const [stats, pageviews, eventsSeries, topPages, referrers, devices, detailedEvents] = await Promise.all([
    requestJson(buildUrl(args.baseUrl, `${websitePath}/stats`, common), { headers }),
    requestJson(buildUrl(args.baseUrl, `${websitePath}/pageviews`, { ...common, unit: args.days <= 2 ? 'hour' : 'day', timezone: 'Africa/Abidjan' }), { headers }),
    requestJson(buildUrl(args.baseUrl, `${websitePath}/events/series`, { ...common, unit: args.days <= 2 ? 'hour' : 'day', timezone: 'Africa/Abidjan' }), { headers }),
    requestJson(buildUrl(args.baseUrl, `${websitePath}/metrics`, { ...common, type: 'path', limit: 50 }), { headers }),
    requestJson(buildUrl(args.baseUrl, `${websitePath}/metrics`, { ...common, type: 'referrer', limit: 10 }), { headers }),
    requestJson(buildUrl(args.baseUrl, `${websitePath}/metrics`, { ...common, type: 'device', limit: 10 }), { headers }),
    getDetailedEvents(args, headers, website.id, common),
  ])

  const eventTotals = sumSeriesByEvent(eventsSeries)
  const productEvents = PRODUCT_EVENTS.map((event) => ({
    event,
    count: eventTotals.find((row) => row.event === event)?.count || 0,
  }))

  return {
    website,
    window: {
      days: args.days,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
    },
    stats,
    pageviews,
    topPages,
    referrers,
    devices,
    detailedEvents,
    events: {
      product: productEvents,
      all: eventTotals,
    },
  }
}

function fmt(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0))
}

function pct(part, total) {
  if (!total) return 'n/a'
  return `${Math.round((Number(part || 0) / Number(total)) * 100)}%`
}

function trend(current, previous) {
  if (!previous) return 'n/a'
  const delta = ((Number(current || 0) - Number(previous || 0)) / Number(previous)) * 100
  const sign = delta > 0 ? '+' : ''
  return `${sign}${Math.round(delta)}%`
}

function eventCount(events, name) {
  return events.product.find((row) => row.event === name)?.count || 0
}

function printTable(rows, columns) {
  if (!rows.length) {
    console.log('  (aucune donnée)')
    return
  }

  const widths = columns.map((column) => {
    const values = rows.map((row) => String(row[column.key] ?? ''))
    return Math.max(column.label.length, ...values.map((value) => value.length))
  })

  console.log(`  ${columns.map((column, i) => column.label.padEnd(widths[i])).join('  ')}`)
  console.log(`  ${widths.map((width) => '-'.repeat(width)).join('  ')}`)
  for (const row of rows) {
    console.log(`  ${columns.map((column, i) => String(row[column.key] ?? '').padEnd(widths[i])).join('  ')}`)
  }
}

function printReport(report) {
  const { website, window, stats, pageviews, topPages, referrers, devices, detailedEvents, events } = report
  const bounceRate = stats.visits ? `${Math.round((stats.bounces / stats.visits) * 100)}%` : '0%'
  const comparison = stats.comparison || {}
  const wallPages = topPages.filter((row) => row.x?.includes('/wall/'))
  const landingVisitors = topPages
    .filter((row) => row.x === '/fr' || row.x === '/en')
    .reduce((sum, row) => sum + Number(row.y || 0), 0)
  const registerVisitors = topPages
    .filter((row) => row.x === '/fr/register' || row.x === '/en/register')
    .reduce((sum, row) => sum + Number(row.y || 0), 0)
  const wallVisitors = wallPages.reduce((sum, row) => sum + Number(row.y || 0), 0)
  const peakDays = [...(pageviews.pageviews || [])]
    .sort((a, b) => Number(b.y || 0) - Number(a.y || 0))
    .slice(0, 5)

  console.log(`\nUmami report: ${website.name} (${website.domain})`)
  console.log(`Window: ${window.days} jours, ${window.startAt.slice(0, 10)} -> ${window.endAt.slice(0, 10)}\n`)

  console.log('Résumé')
  printTable([
    { metric: 'Pages vues', value: fmt(stats.pageviews) },
    { metric: 'Visiteurs', value: fmt(stats.visitors) },
    { metric: 'Visites', value: fmt(stats.visits) },
    { metric: 'Rebonds', value: fmt(stats.bounces) },
    { metric: 'Taux rebond', value: bounceRate },
    { metric: 'Visiteurs vs période précédente', value: trend(stats.visitors, comparison.visitors) },
    { metric: 'Pages vues vs période précédente', value: trend(stats.pageviews, comparison.pageviews) },
  ], [
    { key: 'metric', label: 'Métrique' },
    { key: 'value', label: 'Valeur' },
  ])

  console.log('\nDiagnostic trafic')
  printTable([
    { segment: 'Landing /fr + /en', visitors: fmt(landingVisitors), weight: pct(landingVisitors, stats.visitors) },
    { segment: 'Pages wall', visitors: fmt(wallVisitors), weight: pct(wallVisitors, stats.visitors) },
    { segment: 'Register', visitors: fmt(registerVisitors), weight: pct(registerVisitors, stats.visitors) },
  ], [
    { key: 'segment', label: 'Segment' },
    { key: 'visitors', label: 'Visiteurs page' },
    { key: 'weight', label: 'Poids vs uniques' },
  ])

  console.log('\nEvents produit')
  printTable(events.product.map((row) => ({ event: row.event, count: fmt(row.count) })), [
    { key: 'event', label: 'Event' },
    { key: 'count', label: 'Count' },
  ])

  const signupStarted = eventCount(events, 'signup_started')
  const signupSuccess = eventCount(events, 'signup_success')
  const created = eventCount(events, 'wall_created')
  const messages = eventCount(events, 'message_submitted')
  const copied = eventCount(events, 'wall_link_copied')
  const whatsappShared = eventCount(events, 'wall_shared_whatsapp')
  const collageGenerated = eventCount(events, 'collage_generated')
  const collageDownloaded = eventCount(events, 'collage_downloaded')
  const visitorCta = eventCount(events, 'visitor_clicked_create_wall_cta')
  const guestConverted = eventCount(events, 'guest_to_creator_converted')

  console.log('\nFunnel et ratios')
  printTable([
    { metric: 'signup_success / signup_started', value: pct(signupSuccess, signupStarted) },
    { metric: 'wall_created / signup_started', value: pct(created, signupStarted) },
    { metric: 'messages / wall_created', value: created ? (messages / created).toFixed(1) : 'n/a' },
    { metric: 'wall_link_copied / wall_created', value: created ? `${Math.round((copied / created) * 100)}%` : 'n/a' },
    { metric: 'whatsapp_share / wall_created', value: pct(whatsappShared, created) },
    { metric: 'collage_downloaded / collage_generated', value: pct(collageDownloaded, collageGenerated) },
    { metric: 'visitor CTA / message_submitted', value: messages ? `${Math.round((visitorCta / messages) * 100)}%` : 'n/a' },
    { metric: 'guest converted / message_submitted', value: pct(guestConverted, messages) },
  ], [
    { key: 'metric', label: 'Ratio' },
    { key: 'value', label: 'Valeur' },
  ])

  console.log('\nPics de trafic')
  printTable(peakDays.map((row) => ({ date: row.x.slice(0, 10), pageviews: fmt(row.y) })), [
    { key: 'date', label: 'Date' },
    { key: 'pageviews', label: 'Pages vues' },
  ])

  console.log('\nTop walls')
  printTable(wallPages.slice(0, 10).map((row) => ({ path: row.x, visitors: fmt(row.y) })), [
    { key: 'path', label: 'Wall' },
    { key: 'visitors', label: 'Visiteurs' },
  ])

  console.log('\nActions par page')
  printTable(detailedEvents.topEventPaths.map((row) => ({ key: row.key, count: fmt(row.count) })), [
    { key: 'key', label: 'Action | page' },
    { key: 'count', label: 'Count' },
  ])

  console.log('\nTop pages')
  printTable(topPages.map((row) => ({ path: row.x || '(direct)', visitors: fmt(row.y) })), [
    { key: 'path', label: 'Page' },
    { key: 'visitors', label: 'Visiteurs' },
  ])

  console.log('\nReferrers')
  printTable(referrers.map((row) => ({ referrer: row.x || '(direct)', visitors: fmt(row.y) })), [
    { key: 'referrer', label: 'Source' },
    { key: 'visitors', label: 'Visiteurs' },
  ])

  console.log('\nDevices')
  printTable(devices.map((row) => ({ device: row.x || '(inconnu)', visitors: fmt(row.y) })), [
    { key: 'device', label: 'Device' },
    { key: 'visitors', label: 'Visiteurs' },
  ])

  console.log('\nPays')
  printTable(detailedEvents.countries.map((row) => ({ country: row.country, events: fmt(row.count) })), [
    { key: 'country', label: 'Pays' },
    { key: 'events', label: 'Events' },
  ])

  const otherEvents = events.all
    .filter((row) => !PRODUCT_EVENTS.includes(row.event))
    .slice(0, 10)

  if (otherEvents.length) {
    console.log('\nAutres events')
    printTable(otherEvents.map((row) => ({ event: row.event, count: fmt(row.count) })), [
      { key: 'event', label: 'Event' },
      { key: 'count', label: 'Count' },
    ])
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const headers = await getAuthHeaders(args)
  const website = await resolveWebsite(args, headers)
  const report = await getReport(args, headers, website)

  if (args.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    printReport(report)
  }
}

main().catch((error) => {
  console.error(`\nUmami report failed: ${error.message}\n`)
  process.exit(1)
})
