'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Calendar, Plus, Save, ArrowLeft, Clock, Activity, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SessionsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id

  const [patient, setPatient] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Formulário de Nova Sessão
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('50')
  const [engagement, setEngagement] = useState('Alto')
  const [activities, setActivities] = useState('')
  const [evolutionNotes, setEvolutionNotes] = useState('')
  const [nextSteps, setNextSteps] = useState('')

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

    // Busca sessões anteriores
    const { data: sData } = await supabase
      .from('session_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })

    if (sData) setSessions(sData)
    setLoading(false)
  }

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      patient_id: patientId,
      session_date: sessionDate,
      duration_minutes: parseInt(duration),
      engagement_level: engagement,
      activities_performed: activities,
      evolution_notes: evolutionNotes,
      next_steps: nextSteps,
    }

    const { error } = await supabase.from('session_records').insert([payload])

    if (error) {
      alert(`Erro ao salvar sessão: ${error.message}`)
    } else {
      alert('Registro de evolução salvo com sucesso!')
      // Limpa formulário
      setActivities('')
      setEvolutionNotes('')
      setNextSteps('')
      setShowForm(false)
      fetchData() // Recarrega lista
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 font-medium">Carregando histórico de sessões...</p>
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
              <Calendar className="text-indigo-600" /> Registros de Evolução: {patient?.name || 'Paciente'}
            </h1>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer self-start sm:self-center"
          >
            <Plus size={18} /> {showForm ? 'Fechar Formulário' : 'Nova Evolução'}
          </button>
        </header>

        {/* Formulário de Registro de Nova Sessão */}
        {showForm && (
          <form onSubmit={handleSaveSession} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Registrar Atendimento</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Data do Atendimento</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Duração (minutos)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Engajamento do Paciente</label>
                <select
                  value={engagement}
                  onChange={(e) => setEngagement(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
                >
                  <option value="Alto">Alto - Muito participativo</option>
                  <option value="Médio">Médio - Necessitou de suporte/estímulo</option>
                  <option value="Baixo">Baixo - Desregulou / Pouca adesão</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Atividades Desenvolvidas</label>
              <textarea
                rows={2}
                placeholder="Ex: Treino de AVD (vestuário), uso da prancha CAA, circuito motor..."
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Evolução Clínica / Desempenho Obseravdo</label>
              <textarea
                rows={3}
                placeholder="Descreva o progresso, autorregulação, respostas aos estímulos e estratégias utilizadas..."
                value={evolutionNotes}
                onChange={(e) => setEvolutionNotes(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Próximos Passos / Orientação para a Família</label>
              <textarea
                rows={2}
                placeholder="Ex: Dar continuidade ao treino de botões em casa..."
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

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
                <Save size={16} /> {saving ? 'Salvar...' : 'Salvar Registro'}
              </button>
            </div>
          </form>
        )}

        {/* Histórico de Sessões */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Histórico de Atendimentos</h2>

          {sessions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-2">
              <Activity className="mx-auto text-slate-400" size={36} />
              <p className="text-slate-600 font-medium">Nenhum registro de sessão encontrado.</p>
              <p className="text-xs text-slate-400">Clique no botão "Nova Evolução" para registrar o atendimento de hoje.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                        <Calendar size={15} className="text-indigo-600" />
                        {new Date(session.session_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock size={13} /> {session.duration_minutes} min
                      </span>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        session.engagement_level === 'Alto'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : session.engagement_level === 'Médio'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      Engajamento: {session.engagement_level}
                    </span>
                  </div>

                  {session.activities_performed && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Atividades</span>
                      <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {session.activities_performed}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Evolução Clínica</span>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{session.evolution_notes}</p>
                  </div>

                  {session.next_steps && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Orientações / Próximos Passos</span>
                      <p className="text-xs text-slate-600 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                        {session.next_steps}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}