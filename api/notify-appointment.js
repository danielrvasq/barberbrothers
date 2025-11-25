// Vercel Serverless Function - Email de confirmación de cita
// Env vars requeridas: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Body: { appointment: { id, customer_id, service, start_at, end_at? } }

import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(payload))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return sendJson(res, 500, { error: 'Missing env vars' })
  }
  try {
    const appointment = req.body?.appointment
    if (!appointment?.customer_id || !appointment?.service || !appointment?.start_at) {
      return sendJson(res, 400, { error: 'Invalid appointment payload' })
    }

    // Obtener email del usuario: intentar profiles, y si falta, usar Admin API (auth.users)
    let email = null
    let full_name = ''

    // 1) Intentar profiles vía REST
    try {
      const profileResp = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(appointment.customer_id)}&select=email,full_name`,
        {
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
        }
      )
      if (profileResp.ok) {
        const profiles = await profileResp.json()
        const p = profiles?.[0]
        email = p?.email || null
        full_name = p?.full_name || ''
      }
    } catch (_) {}

    // 2) Si no hay email en profiles, usar Admin API para leer auth.users
    if (!email) {
      const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(appointment.customer_id)
      if (userErr || !userData?.user) {
        return sendJson(res, 404, { error: 'User not found in auth.users' })
      }
      email = userData.user.email
      full_name = userData.user.user_metadata?.name || userData.user.user_metadata?.full_name || ''
    }

    const fechaLocal = new Date(appointment.start_at).toLocaleString()
    const html = `
      <p>Hola ${full_name || ''},</p>
      <p>Tu cita para <strong>${appointment.service}</strong> fue agendada.</p>
      <p>Fecha/hora: ${fechaLocal}</p>
      ${appointment.end_at ? `<p>Fin estimado: ${new Date(appointment.end_at).toLocaleString()}</p>` : ''}
      <p>Gracias por reservar.</p>
    `

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

    await transporter.sendMail({
      from: `"Barbería Citas" <${SMTP_USER}>`,
      to: email,
      subject: `Confirmación cita: ${appointment.service}`,
      html,
    })

    return sendJson(res, 200, { ok: true })
  } catch (err) {
    console.error('notify-appointment error:', err)
    return sendJson(res, 500, { error: 'Internal error', detail: String(err?.message || err) })
  }
}
