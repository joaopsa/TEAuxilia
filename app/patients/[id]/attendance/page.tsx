'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { UserCheck, UserX, Calendar, Plus, Save, ArrowLeft, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AttendancePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id

  const [patient, setPatient] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Campos do Formulário
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('Presente')
  const [justification, setJustification] = useState('')

  useEffect(() => {
    fetchData()
  }, [patientId])

  async function fetchData() {
    if (!patientId) return
    setLoading(true)

    // Busca paciente
    const { data: pData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()
    if (pData) setPatient(pData)

    // Busca registros de frequência
    const { data: aData } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })

    if (aData) setRecords(aData)
    setLoading(false)
  }

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      patient_id: patientId,
      session_date: sessionDate,
      status,
      justification: status !== 'Presente' ? justification : '',
    }

    const { error } = await supabase.from('attendance_records').insert([payload])

    if (error) {
      alert(`Erro ao registrar frequência: ${error.message}`)
    } else {
      alert('Registro de frequência salvo com sucesso!')
      setJustification('')
      setShowForm(false)
      fetchData()
    }
    setSaving(false)
  }

  // Estatísticas Rápidas
  const totalSessions = records.length
  const totalPresents = records.filter((r) => r.status === 'Presente').length
  const totalAbsences = records.filter((r) => r.status !== 'Presente').length
  const attendanceRate = totalSessions > 0 ? Math.round((totalPresents / totalSessions) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 font-medium">Carregando histórico de frequência...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition"
            >
              <ArrowLeft size={16} /> Voltar para Pacientes
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="text-indigo-600" /> Controle de Frequência: {patient?.name || 'Paciente'}
            </h1>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer self-start sm:self-center"
          >
            <Plus size={18} /> {showForm ? 'Fechar Formulário' : 'Marcar Presença / Falta'}
          </button>
        </header>

        {/* Resumo de Frequência / Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total de Atendimentos</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{totalSessions}</p>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <Calendar size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Presenças</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{totalPresents}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Taxa de Assiduidade</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{attendanceRate}%</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Formulário de Registro de Frequência */}
        {showForm && (
          <form onSubmit={handleSaveAttendance} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Registrar Frequência</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Data da Sessão</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Status de Presença</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
                >
                  <option value="Presente">Presente</option>
                  <option value="Falta Justificada">Falta Justificada</option>
                  <option value="Falta Não Justificada">Falta Não Justificada</option>
                </select>
              </div>
            </div>

            {status !== 'Presente' && (
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Motivo / Justificativa</label>
                <input
                  type="text"
                  placeholder="Ex: Atestado médico, indisposição, consulta pediátrica..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-indigo-700 transition"
              >
                <Save size={16} /> {saving ? 'Salvar...' : 'Registrar Frequência'}
              </button>
            </div>
          </form>
        )}

        {/* Histórico de Frequência */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Histórico de Presença</h2>

          {records.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-2">
              <UserX className="mx-auto text-slate-400" size={36} />
              <p className="text-slate-600 font-medium">Nenhum registro de frequência encontrado.</p>
              <p className="text-xs text-slate-400">Clique em "Marcar Presença / Falta" para registrar os atendimentos.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {records.map((record) => (
                  <div key={record.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          record.status === 'Presente'
                            ? 'bg-emerald-50 text-emerald-600'
                            : record.status === 'Falta Justificada'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {record.status === 'Presente' ? <UserCheck size={20} /> : <UserX size={20} />}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {new Date(record.session_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {record.justification && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            <strong>Motivo:</strong> {record.justification}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                        record.status === 'Presente'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : record.status === 'Falta Justificada'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}