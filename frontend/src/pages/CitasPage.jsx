import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCitas, createCita, updateCita, deleteCita } from '../lib/citasService'
import CitaForm from '../components/citas/CitaForm'
import CitasList from '../components/citas/CitasList'

const CitasPage = () => {
  const { user } = useAuth()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState(null)
  const [showAll, setShowAll] = useState(false) // admin: ver todas las citas

  const { profile } = useAuth()

  const load = async () => {
    setLoading(true)
    // If admin and wants to see all, same getCitas call will return all due to RLS
    const { data, error } = await getCitas()
    if (error) {
      console.error('Error cargando citas:', error)
    } else {
      setCitas(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        customer_id: user.id,
        created_by: user.id,
      }
      const { data, error } = await createCita(payload)
      if (error) throw error
      setCitas((prev) => [data, ...prev])
      setMessage('Cita creada correctamente')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error creando cita:', err)
      setMessage('Error creando cita: ' + (err?.message || String(err)))
    }
  }

  const handleUpdate = async (id, values) => {
    try {
      const { data, error } = await updateCita(id, values)
      if (error) throw error
      setCitas((prev) => prev.map((c) => (c.id === id ? data : c)))
      setEditing(null)
      setMessage('Cita actualizada')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error actualizando cita:', err)
      setMessage('Error actualizando cita: ' + (err?.message || String(err)))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return
    try {
      const { error } = await deleteCita(id)
      if (error) throw error
      setCitas((prev) => prev.filter((c) => c.id !== id))
      setMessage('Cita eliminada')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error eliminando cita:', err)
      setMessage('Error eliminando cita: ' + (err?.message || String(err)))
    }
  }

  return (
    <div className="container">
      <h2>Mis Citas</h2>

      {profile?.role === 'admin' ? (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={showAll} onChange={(e) => { setShowAll(e.target.checked); load(); }} />
            <span>Ver todas las citas (admin)</span>
          </label>
        </div>
      ) : null}

      {message ? <div style={{ padding: 8, background: '#eef', borderRadius: 6 }}>{message}</div> : null}

      <div style={{ marginBottom: 20 }}>
        <h3>{editing ? 'Editar cita' : 'Crear nueva cita'}</h3>
        <CitaForm
          initialData={editing}
          onSave={(values) => (editing ? handleUpdate(editing.id, values) : handleCreate(values))}
          onCancel={() => setEditing(null)}
        />
      </div>

      <div>
        <h3>Lista de citas</h3>
        {loading ? (
          <p>Cargando citas...</p>
        ) : (
          <CitasList
            citas={citas}
            onEdit={(c) => setEditing(c)}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}

export default CitasPage
