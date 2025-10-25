import React, { useEffect, useState } from 'react'

const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  // build yyyy-mm-ddThh:mm for input
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const CitaForm = ({ initialData = null, onSave, onCancel }) => {
  const [service, setService] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setService(initialData.service || '')
      setStartAt(toLocalInput(initialData.start_at))
      setEndAt(toLocalInput(initialData.end_at))
      setNotes(initialData.notes || '')
    } else {
      setService('')
      setStartAt('')
      setEndAt('')
      setNotes('')
    }
    setError(null)
    setSubmitting(false)
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    // Basic validation: start required, if end provided it must be after start
    if (!startAt) {
      setError('La fecha/hora de inicio es requerida')
      return
    }

    const start = new Date(startAt)
    const end = endAt ? new Date(endAt) : null
    if (end && end <= start) {
      setError('La fecha/hora de fin debe ser posterior a la de inicio')
      return
    }

    const payload = {
      service: service || 'Servicio',
      start_at: start.toISOString(),
      end_at: end ? end.toISOString() : null,
      notes: notes || null,
    }

    setSubmitting(true)
    Promise.resolve(onSave(payload)).catch((err) => {
      console.error('Error en onSave:', err)
      setError(err?.message || String(err))
    }).finally(() => setSubmitting(false))
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
      <label>
        Servicio
        <input value={service} onChange={(e) => setService(e.target.value)} required />
      </label>

      <label>
        Fecha y hora inicio
        <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
      </label>

      <label>
        Fecha y hora fin (opcional)
        <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
      </label>

      <label>
        Notas
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" onClick={onCancel} disabled={submitting}>Cancelar</button>
      </div>

      {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
    </form>
  )
}

export default CitaForm
