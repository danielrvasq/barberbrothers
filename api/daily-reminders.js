// Vercel Serverless Function - Recordatorios diarios de citas
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TZ_OFFSET (opcional)
// Cron configurado en vercel.json

import nodemailer from 'nodemailer'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TZ_OFFSET } = process.env
const offset = Number(TZ_OFFSET || 0) // Ej: -5 para UTC-5

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(payload))
}

function getLocalDayRange() {
  const nowUTC = new Date()
  const localMs = nowUTC.getTime() + offset * 3600 * 1000
  const localDate = new Date(localMs)
  const startLocal = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0,0,0,0)
  const endLocal = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23,59,59,999)
  const startUTC = new Date(startLocal.getTime() - offset * 3600 * 1000).toISOString()
  const endUTC = new Date(endLocal.getTime() - offset * 3600 * 1000).toISOString()
  return { startUTC, endUTC }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return sendJson(res, 500, { error: 'Missing env vars' })
  }
  try {
    const { startUTC, endUTC } = getLocalDayRange()
    const apptsUrl = `${SUPABASE_URL}/rest/v1/appointments?select=id,customer_id,service,start_at&start_at=gte.${encodeURIComponent(startUTC)}&start_at=lte.${encodeURIComponent(endUTC)}`
    const apptsResp = await fetch(apptsUrl, { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } })
    if (!apptsResp.ok) {
      return sendJson(res, 500, { error: 'Appointments fetch failed', detail: await apptsResp.text() })
    }
    const appointments = await apptsResp.json()
    if (!appointments.length) return sendJson(res, 200, { ok: true, message: 'No appointments today' })

    const groups = {}
    for (const a of appointments) {
      groups[a.customer_id] = groups[a.customer_id] || []
      groups[a.customer_id].push(a)
    }
    const ids = Object.keys(groups)
    const inList = ids.map(id => `"${id}"`).join(',')
    const profilesUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id,email,full_name&id=in.(${inList})`
    const profilesResp = await fetch(profilesUrl, { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } })
    if (!profilesResp.ok) {
      return sendJson(res, 500, { error: 'Profiles fetch failed', detail: await profilesResp.text() })
    }
    const profiles = await profilesResp.json()
    const profileMap = new Map(profiles.map(p => [p.id, p]))

    // Configurar transporter SMTP
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    let sent = 0
    for (const cid of ids) {
      const p = profileMap.get(cid)
      if (!p?.email) continue
      const itemsHtml = groups[cid]
        .map(ap => `<li>${new Date(ap.start_at).toLocaleString()} - ${ap.service}</li>`)
        .join('')
      const html = `
        <p>Hola ${p.full_name || ''},</p>
        <p>Estas son tus citas de hoy:</p>
        <ul>${itemsHtml}</ul>
        <p>¡Te esperamos!</p>
      `
      try {
        await transporter.sendMail({
          from: `"Barbería Citas" <${SMTP_USER}>`,
          to: p.email,
          subject: 'Recordatorio de tus citas de hoy',
          html,
        })
        sent++
      } catch (err) {
        console.error('Error sending email to', p.email, err)
      }
    }
    return sendJson(res, 200, { ok: true, sent })
  } catch (err) {
    console.error('daily-reminders error:', err)
    return sendJson(res, 500, { error: 'Internal error', detail: String(err?.message || err) })
  }
}
