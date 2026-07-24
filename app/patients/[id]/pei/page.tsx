'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Target, Plus, Save, ArrowLeft, CheckCircle2, Clock, PauseCircle, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PEIPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id

  const [patient, setPatient] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Campos do Formulário de Meta
  const [area, setArea] = useState('AVDs')
  const [goalDescription, setGoalDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [status, setStatus] = useState('Em Andamento')
  const [progress, setProgress] = useState(0)
  const [notes, setNotes] = useState('')

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

    // Busca metas do PEI
    const { data: gData } = await supabase
      .from('pei_goals')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (gData) setGoals(gData)
    setLoading(false)
  }

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      patient_id: patientId,
      area,
      goal_description: goalDescription,
      target_date: targetDate || null,
      status,
      progress_percentage: Number(progress),
      notes,
    }

    const { error } = await supabase.from('pei_goals').insert([payload])

    if (error) {
      alert(`Erro ao salvar meta: ${error.message}`)
    } else {
      alert('Meta terapêutica cadastrada com sucesso!')
      setGoalDescription('')
      setTargetDate('')
      setNotes('')
      setProgress(0)
      setShowForm(false)
      fetchData()
    }
    setSaving(false)
  }

  const handleUpdateStatus = async (goalId: string, newStatus: string, newProgress: number) => {
    const { error } = await supabase
      .from('pei_goals')
      .update({ status: newStatus, progress_percentage: newProgress })
      .eq('id', goalId)

    if (error) {
      alert('Erro ao atualizar meta.')
    } else {
      fetchData()
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Deseja realmente remover esta meta?')) return

    const { error } = await supabase.from('pei_goals').delete().eq('id', goalId)

    if (error) {
      alert('Erro ao excluir meta.')
    } else {
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 font-medium">Carregando Plano de Intervenção (PEI)...</p>
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
              <Target className="text-indigo-600" /> Plano de Intervenção (PEI): {patient?.name || 'Paciente'}
            </h1>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer self-start sm:self-center"
          >
            <Plus size={18} /> {showForm ? 'Fechar Formulário' : 'Nova Meta'}
          </button>
        </header>

        {/* Formulário de Nova Meta */}
        {showForm && (
          <form onSubmit={handleSaveGoal} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Cadastrar Meta Terapêutica</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Área do Desenvolvimento</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
                >
                  <option value="AVDs">AVDs (Autocuidado / Vida Diária)</option>
                  <option value="AVDIs">AVDIs (Instrumentais / Autonomia)</option>
                  <option value="Comunicação">Comunicação / Linguagem / CAA</option>
                  <option value="Socialização">Interação Social & Brincar</option>
                  <option value="Motor/Sensorial">Desenvolvimento Motor & Sensorial</option>
                  <option value="Comportamental">Comportamento & Autorregulação</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Previsão / Prazo (Opcional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Status Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Pausado">Pausado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Descrição do Objetivo Terapêutico</label>
              <textarea
                rows={3}
                placeholder="Ex: Realizar o desabotoamento de camisas com auxílio leve em 8 de 10 oportunidades."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Progresso Estimado Inicial (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Estratégias / Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Dicas visuais, treino encadeado de trás pra frente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
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
                <Save size={16} /> {saving ? 'Salvar...' : 'Salvar Meta'}
              </button>
            </div>
          </form>
        )}

        {/* Lista de Metas Cadastradas */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Metas Cadastradas</h2>

          {goals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-2">
              <Target className="mx-auto text-slate-400" size={36} />
              <p className="text-slate-600 font-medium">Nenhuma meta cadastrada no PEI.</p>
              <p className="text-xs text-slate-400">Clique em "Nova Meta" para adicionar objetivos ao plano do paciente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                        {goal.area}
                      </span>
                      {goal.target_date && (
                        <span className="text-xs text-slate-400">
                          Meta para: {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                          goal.status === 'Concluído'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : goal.status === 'Pausado'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {goal.status === 'Concluído' && <CheckCircle2 size={12} />}
                        {goal.status === 'Em Andamento' && <Clock size={12} />}
                        {goal.status === 'Pausado' && <PauseCircle size={12} />}
                        {goal.status}
                      </span>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Excluir meta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-800">{goal.goal_description}</p>

                  {/* Barra de Progresso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Progresso da Meta</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          goal.progress_percentage === 100
                            ? 'bg-emerald-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${goal.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Estratégia:</strong> {goal.notes}
                    </p>
                  )}

                  {/* Ações Rápidas de Atualização */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
                    <span className="text-slate-400">Atualizar Progresso:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'Em Andamento', 25)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'Em Andamento', 50)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'Em Andamento', 75)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition"
                      >
                        75%
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'Concluído', 100)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition border border-emerald-200"
                      >
                        100% (Concluir)
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}