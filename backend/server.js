import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const TZ_OFFSET = Number(process.env.TZ_OFFSET || 0)

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function dayRangeUTCFromLocalOffset() {
  const nowUTC = new Date()
  const localMs = nowUTC.getTime() + TZ_OFFSET * 3600 * 1000
  const local = new Date(localMs)
  const startLocal = new Date(local.getFullYear(), local.getMonth(), local.getDate(), 0,0,0,0)
  const endLocal = new Date(local.getFullYear(), local.getMonth(), local.getDate(), 23,59,59,999)
  const startUTC = new Date(startLocal.getTime() - TZ_OFFSET * 3600 * 1000)
  const endUTC = new Date(endLocal.getTime() - TZ_OFFSET * 3600 * 1000)
  return { startUTC: startUTC.toISOString(), endUTC: endUTC.toISOString() }
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

app.post('/notify-appointment', async (req, res) => {
  try {
    const appointment = req.body?.appointment
    if (!appointment?.customer_id || !appointment?.service || !appointment?.start_at) {
      return res.status(400).json({ error: 'Invalid appointment payload' })
    }

    // Try profiles first
    let email = null
    let full_name = ''
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', appointment.customer_id)
      .limit(1)
    if (profiles && profiles.length) {
      email = profiles[0].email
      full_name = profiles[0].full_name || ''
    }
    // Fallback to auth.users
    if (!email) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(appointment.customer_id)
      if (userErr || !userData?.user) return res.status(404).json({ error: 'User not found' })
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

    const transporter = makeTransporter()
    await transporter.sendMail({
      from: `"Barbería Citas" <${SMTP_USER}>`,
      to: email,
      subject: `Confirmación cita: ${appointment.service}`,
      html,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('notify-appointment error', err)
    res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) })
  }
})

app.get('/daily-reminders', async (req, res) => {
  try {
    const { startUTC, endUTC } = dayRangeUTCFromLocalOffset()
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select('id, customer_id, service, start_at')
      .gte('start_at', startUTC)
      .lte('start_at', endUTC)
      .order('start_at', { ascending: true })
    if (error) throw error
    if (!appointments?.length) return res.json({ ok: true, message: 'No appointments today' })

    const groups = {}
    for (const a of appointments) {
      groups[a.customer_id] = groups[a.customer_id] || []
      groups[a.customer_id].push(a)
    }
    const ids = Object.keys(groups)
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', ids)
    if (pErr) throw pErr
    const profileMap = new Map(profiles.map(p => [p.id, p]))

    const transporter = makeTransporter()
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
        console.error('daily email error', err)
      }
    }
    res.json({ ok: true, sent })
  } catch (err) {
    console.error('daily-reminders error', err)
    res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
