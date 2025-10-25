import React from 'react'

const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}

const CitasList = ({ citas = [], onEdit, onDelete }) => {
  if (!citas || citas.length === 0) return <p>No hay citas.</p>

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {citas.map((c) => (
        <div key={c.id} style={{ border: '1px solid #ddd', padding: 10, borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{c.service}</strong>
              <div style={{ color: '#666' }}>{formatDate(c.start_at)} — {formatDate(c.end_at)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(c)}>Editar</button>
              <button onClick={() => onDelete(c.id)}>Eliminar</button>
            </div>
          </div>
          {c.notes ? <p style={{ marginTop: 8 }}>{c.notes}</p> : null}
        </div>
      ))}
    </div>
  )
}

export default CitasList
