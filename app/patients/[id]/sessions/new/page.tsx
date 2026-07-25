'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')

  // Habilidades monitoradas para avaliação (0% a 100%)
  const [skills, setSkills] = useState([
    { name: 'Comunicação Funcional', score: 50 },
    { name: 'Interação Social', score: 50 },
    { name: 'Atenção Compartilhada', score: 50 },
    { name: 'Tolerância à Frustração', score: 50 },
  ])

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...skills]
    updated[index].score = newScore
    setSkills(updated)
  }

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Insere as avaliações de habilidades na tabela do Supabase
    const evaluationsToInsert = skills.map((skill) => ({
      patient_id: patientId,
      skill_name: skill.name,
      score: skill.score,
      created_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('session_skill_evaluations')
      .insert(evaluationsToInsert)

    if (error) {
      console.error('Erro ao salvar avaliações:', error)
      alert('Ocorreu um erro ao salvar os dados da sessão.')
      setLoading(false)
      return
    }

    alert('Sessão e evolução de habilidades salvas com sucesso!')
    router.push(`/patients/${patientId}/report`)
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/patients/${patientId}/sessions`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} /> Voltar
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Registrar Nova Sessão</h1>
              <p className="text-xs text-slate-500">Avalie o desempenho do paciente nas habilidades para atualizar o gráfico do relatório.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSession} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Metas e Nível de Independência (%)</h3>
              
              {skills.map((skill, index) => (
                <div key={skill.name} className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {skill.score}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.score}
                    onChange={(e) => handleScoreChange(index, Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>0% (Ajuda total)</span>
                    <span>50% (Parcial)</span>
                    <span>100% (Independente)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Observações da Sessão</label>
              <textarea
                rows={4}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Descreva brevemente como foi o engajamento..."
                className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Sessão e Atualizar Gráfico'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}