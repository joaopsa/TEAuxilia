'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ClipboardList, ArrowLeft, CheckSquare, Printer } from 'lucide-react'
import Link from 'next/navigation' // ou de 'next/link' conforme sua estrutura original

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ViewAnamnesisPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [anamnesis, setAnamnesis] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)

  useEffect(() => {
    async function resolve() {
      const p = params instanceof Promise ? await params : params
      setResolvedParams(p)
    }
    resolve()
  }, [params])

  useEffect(() => {
    if (!resolvedParams?.id) return

    async function fetchData() {
      setLoading(true)
      try {
        // Buscar dados do paciente
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', resolvedParams?.id)
          .single()

        if (patientData) setPatient(patientData)

        // Buscar anamnese do paciente
        const { data: anamnesisData, error } = await supabase
          .from('anamneses')
          .select('*')
          .eq('patient_id', resolvedParams?.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Erro ao buscar anamnese:', error)
        } else if (anamnesisData && anamnesisData.length > 0) {
          setAnamnesis(anamnesisData[0])
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Carregando anamnese...</p>
      </div>
    )
  }

  if (!anamnesis) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-12 max-w-4xl mx-auto space-y-6">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 transition uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Voltar
        </a>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-800">Nenhuma Anamnese encontrada</h1>
          <p className="text-slate-600 text-sm">Ainda não foi preenchida nenhuma ficha de anamnese para este paciente.</p>
        </div>
      </main>
    )
  }

  // Função auxiliar para renderizar itens marcados (True) de forma segura em formato de tags
  const renderCheckedItems = (dataObj: any) => {
    if (!dataObj || typeof dataObj !== 'object') return <p className="text-sm text-slate-500 italic">Nenhum registro informado.</p>
    
    // Filtra apenas as chaves que possuem o valor true
    const selectedEntries = Object.entries(dataObj).filter(([key, value]) => value === true)

    if (selectedEntries.length === 0) {
      return <p className="text-sm text-slate-400 italic">Nenhum item marcado nesta seção.</p>
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedEntries.map(([key]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-sm font-medium"
          >
            <CheckSquare size={14} className="text-indigo-600" /> {key}
          </span>
        ))}
      </div>
    )
  }

  const customSectionsData = anamnesis.custom_sections?.customSections || []
  const customSectionValuesData = anamnesis.custom_sections?.customSectionValues || {}

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 print:hidden">
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 transition uppercase tracking-wider"
            >
              <ArrowLeft size={14} /> Voltar para o início
            </a>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-indigo-600" /> Visualização de Anamnese
            </h1>
            {patient && (
              <p className="text-sm text-slate-600 mt-1">Paciente: <strong className="text-slate-800">{patient.name}</strong></p>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer text-sm"
          >
            <Printer size={16} /> Imprimir / Salvar PDF
          </button>
        </header>

        {/* 1. Contexto Escolar e Medicamentos */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">1. Informações de Contexto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Escola / Série:</strong>
              <span className="text-slate-800 font-medium">{anamnesis.school_grade || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Medicamentos em uso:</strong>
              <span className="text-slate-800 font-medium">{anamnesis.medications || 'Não informado'}</span>
            </div>
          </div>
        </section>

        {/* Alergias e Outras Deficiências */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Alergias e Outras Deficiências / Diagnósticos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Alergias:</strong>
              <span className="text-slate-800 font-medium">{anamnesis.allergies || 'Nenhuma informada'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Outras Deficiências / Diagnósticos:</strong>
              <span className="text-slate-800 font-medium">{anamnesis.additional_disabilities || 'Nenhuma informada'}</span>
            </div>
          </div>
        </section>

        {/* 2. Comunicação */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">2. Comunicação</h2>
          {renderCheckedItems(anamnesis.communication)}
        </section>

        {/* 3. Interação Social */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">3. Interação Social</h2>
          {renderCheckedItems(anamnesis.social_interaction)}
        </section>

        {/* 4. Habilidades Acadêmicas */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">4. Habilidades Acadêmicas</h2>
          {renderCheckedItems(anamnesis.academic_skills)}
        </section>

        {/* 5. Comportamentos */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">5. Comportamentos e Estereotipias</h2>
          {renderCheckedItems(anamnesis.behaviors)}
          {anamnesis.stereotypies_details && (
            <div className="mt-3 pt-3 border-t text-sm">
              <strong className="text-slate-500 block text-xs uppercase">Detalhes de Estereotipias:</strong>
              <span className="text-slate-800">{anamnesis.stereotypies_details}</span>
            </div>
          )}
        </section>

        {/* 6. AVDs */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
            <CheckSquare className="text-indigo-600" /> 6. AVDs (Atividades de Vida Diária)
          </h2>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Alimentação</h3>
            {renderCheckedItems(anamnesis.avd_feeding)}
          </div>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Higiene Pessoal</h3>
            {renderCheckedItems(anamnesis.avd_hygiene)}
          </div>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Uso do Banheiro</h3>
            {renderCheckedItems(anamnesis.avd_bathroom)}
          </div>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Vestuário</h3>
            {renderCheckedItems(anamnesis.avd_dressing)}
          </div>
        </section>

        {/* 7. AVDIs */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
            <CheckSquare className="text-indigo-600" /> 7. AVDIs (Atividades Instrumentais de Vida Diária)
          </h2>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Organização e Gestão de Pertences</h3>
            {renderCheckedItems(anamnesis.avdi_belongings)}
          </div>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Rotinas Domésticas e Mobilidade</h3>
            {renderCheckedItems(anamnesis.avdi_routines)}
          </div>
          <div>
            <h3 className="font-medium text-slate-600 text-sm">Comunicação e Tecnologia</h3>
            {renderCheckedItems(anamnesis.avdi_tech_comm)}
            {anamnesis.screen_time && (
              <div className="mt-2 text-sm">
                <strong className="text-slate-500 block text-xs uppercase">Tempo médio diário de tela:</strong>
                <span className="text-slate-800">{anamnesis.screen_time}</span>
              </div>
            )}
          </div>
        </section>

        {/* 8. Análise Sensorial (Corrigido para exibir corretamente o texto das tags selecionadas) */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">8. Análise Sensorial</h2>
          {renderCheckedItems(anamnesis.sensory_profile)}
        </section>

        {/* Seções Customizadas Dinâmicas */}
        {customSectionsData.map((sec: any, index: number) => {
          const sectionNumber = 9 + index
          const sectionVals = customSectionValuesData[sec.id] || {}
          return (
            <section key={sec.id} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
              <h2 className="text-lg font-semibold text-indigo-700 border-b pb-2">
                {sectionNumber}. {sec.title}
              </h2>
              {renderCheckedItems(sectionVals)}
            </section>
          )
        })}

        {/* Interesses e Reforçadores */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Interesses e Reforçadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Brinquedos favoritos:</strong>
              <span className="text-slate-800">{anamnesis.favorite_toys || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Desenhos / Personagens favoritos:</strong>
              <span className="text-slate-800">{anamnesis.favorite_cartoons || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Comidas preferidas:</strong>
              <span className="text-slate-800">{anamnesis.favorite_foods || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">O que mais motiva a criança:</strong>
              <span className="text-slate-800">{anamnesis.child_motivators || 'Não informado'}</span>
            </div>
            <div className="md:col-span-2">
              <strong className="text-slate-500 block text-xs uppercase">O que a criança NÃO gosta:</strong>
              <span className="text-slate-800">{anamnesis.dislikes || 'Não informado'}</span>
            </div>
          </div>
        </section>

        {/* Objetivos da Família */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Objetivos da Família</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Dificuldade 1:</strong>
              <span className="text-slate-800">{anamnesis.main_difficulty_1 || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Dificuldade 2:</strong>
              <span className="text-slate-800">{anamnesis.main_difficulty_2 || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Dificuldade 3:</strong>
              <span className="text-slate-800">{anamnesis.main_difficulty_3 || 'Não informado'}</span>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Mais urgente para ser adquirido no desenvolvimento:</strong>
              <span className="text-slate-800">{anamnesis.urgent_development_goal || 'Não informado'}</span>
            </div>
          </div>
        </section>

        {/* Planejamento Terapêutico e Observações */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Planejamento & Observações</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Observações do Terapeuta:</strong>
              <p className="text-slate-800 mt-1 whitespace-pre-wrap">{anamnesis.therapist_observations || 'Nenhuma observação informada.'}</p>
            </div>
            <div>
              <strong className="text-slate-500 block text-xs uppercase">Anotações Gerais:</strong>
              <p className="text-slate-800 mt-1 whitespace-pre-wrap">{anamnesis.notes || 'Nenhuma anotação informada.'}</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}