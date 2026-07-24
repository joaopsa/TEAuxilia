'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ClipboardList, ArrowLeft, CheckCircle2, User, Heart, Target, AlertCircle, Edit3 } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ViewAnamnesisPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id

  const [anamnesis, setAnamnesis] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!patientId) return

      // Busca os dados do paciente
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (patientData) setPatient(patientData)

      // Busca a última anamnese registrada para este paciente
      const { data: anamnesisData, error } = await supabase
        .from('anamneses')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (anamnesisData) {
        setAnamnesis(anamnesisData)
      }
      setLoading(false)
    }

    fetchData()
  }, [patientId])

  // Função auxiliar para renderizar itens de listas/checkboxes
  const renderList = (data: Record<string, boolean> | null) => {
    if (!data) return <p className="text-slate-400 italic text-sm">Nenhum item marcado.</p>
    const activeItems = Object.keys(data).filter((key) => data[key])

    if (activeItems.length === 0) {
      return <p className="text-slate-400 italic text-sm">Nenhum item marcado.</p>
    }

    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {activeItems.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100"
          >
            <CheckCircle2 size={13} className="text-indigo-600" />
            {item}
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 font-medium">Carregando ficha de anamnese...</p>
      </div>
    )
  }

  if (!anamnesis) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">Nenhuma Anamnese Encontrada</h2>
          <p className="text-slate-600">Ainda não há nenhuma ficha de anamnese registrada para este paciente.</p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
            >
              <ArrowLeft size={16} /> Voltar para Pacientes
            </Link>
            <Link
              href={`/patients/${patientId}/anamnesis`}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Edit3 size={16} /> Preencher Anamnese
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabeçalho de Navegação */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition"
            >
              <ArrowLeft size={16} /> Voltar para Lista de Pacientes
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-indigo-600" /> Ficha de Anamnese: {patient?.name || 'Paciente'}
            </h1>
            {anamnesis.created_at && (
              <p className="text-xs text-slate-400 mt-1">
                Registrada em: {new Date(anamnesis.created_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <Link
            href={`/patients/${patientId}/anamnesis`}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-medium transition self-start sm:self-center"
          >
            <Edit3 size={16} /> Editar / Nova Anamnese
          </Link>
        </header>

        {/* Informações Gerais */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <User size={18} className="text-indigo-600" /> Contexto do Paciente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Escola / Série</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{anamnesis.school_grade || 'Não informado'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Medicamentos em uso</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{anamnesis.medications || 'Nenhum medicamento informado'}</p>
            </div>
          </div>
        </section>

        {/* Áreas do Desenvolvimento */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
          <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Habilidades e Comportamentos</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Comunicação</h3>
              {renderList(anamnesis.communication)}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Interação Social</h3>
              {renderList(anamnesis.social_interaction)}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Habilidades Acadêmicas</h3>
              {renderList(anamnesis.academic_skills)}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Comportamentos e Estereotipias</h3>
              {renderList(anamnesis.behaviors)}
              {anamnesis.stereotypies_details && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                  <strong className="text-slate-700">Detalhes das estereotipias:</strong> {anamnesis.stereotypies_details}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* AVDs */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 border-b pb-2">AVDs (Atividades de Vida Diária)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Alimentação</h3>
              {renderList(anamnesis.avd_feeding)}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Higiene Pessoal</h3>
              {renderList(anamnesis.avd_hygiene)}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Uso do Banheiro</h3>
              {renderList(anamnesis.avd_bathroom)}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Vestuário</h3>
              {renderList(anamnesis.avd_dressing)}
            </div>
          </div>
        </section>

        {/* AVDIs */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 border-b pb-2">AVDIs (Atividades Instrumentais de Vida Diária)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Pertences & Organização</h3>
              {renderList(anamnesis.avdi_belongings)}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Rotina & Autonomia</h3>
              {renderList(anamnesis.avdi_routines)}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Tecnologia & CAA</h3>
              {renderList(anamnesis.avdi_tech_comm)}
            </div>
          </div>
        </section>

        {/* Análise Sensorial */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3">
          <h2 className="text-base font-semibold text-slate-700">Análise Sensorial</h2>
          {renderList(anamnesis.sensory_profile)}
        </section>

        {/* Interesses e Reforçadores */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
            <Heart size={18} className="text-rose-500" /> Interesses e Reforçadores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-slate-400">Brinquedos Favoritos</span>
              <p className="text-sm font-medium text-slate-800">{anamnesis.favorite_toys || '-'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400">Desenhos / Personagens</span>
              <p className="text-sm font-medium text-slate-800">{anamnesis.favorite_cartoons || '-'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400">Alimentos Preferidos</span>
              <p className="text-sm font-medium text-slate-800">{anamnesis.favorite_foods || '-'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400">Principais Motivadores</span>
              <p className="text-sm font-medium text-slate-800">{anamnesis.child_motivators || '-'}</p>
            </div>
            <div className="md:col-span-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              <span className="text-xs font-medium text-rose-500">Aversões / O que NÃO gosta</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{anamnesis.dislikes || '-'}</p>
            </div>
          </div>
        </section>

        {/* Objetivos da Família */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
            <Target size={18} className="text-indigo-600" /> Objetivos da Família
          </h2>
          <div className="space-y-2">
            {anamnesis.main_difficulty_1 && (
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-indigo-600">Dificuldade 1:</strong> {anamnesis.main_difficulty_1}
              </p>
            )}
            {anamnesis.main_difficulty_2 && (
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-indigo-600">Dificuldade 2:</strong> {anamnesis.main_difficulty_2}
              </p>
            )}
            {anamnesis.main_difficulty_3 && (
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-indigo-600">Dificuldade 3:</strong> {anamnesis.main_difficulty_3}
              </p>
            )}
            {anamnesis.urgent_development_goal && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/60 mt-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Meta Urgente</span>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{anamnesis.urgent_development_goal}</p>
              </div>
            )}
          </div>
        </section>

        {/* Observações do Terapeuta */}
        {(anamnesis.therapist_observations || anamnesis.notes) && (
          <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Observações Terapêuticas</h2>
            {anamnesis.therapist_observations && (
              <div>
                <span className="text-xs font-medium text-slate-400">Observações Clínicas</span>
                <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{anamnesis.therapist_observations}</p>
              </div>
            )}
            {anamnesis.notes && (
              <div>
                <span className="text-xs font-medium text-slate-400">Anotações Gerais</span>
                <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{anamnesis.notes}</p>
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  )
}