'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ClipboardList, Save, CheckSquare, ArrowLeft, X, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AnamnesisPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id

  const [loading, setLoading] = useState(false)

  // Campos de texto
  const [schoolGrade, setSchoolGrade] = useState('')
  const [medications, setMedications] = useState('')
  const [stereotypiesDetails, setStereotypiesDetails] = useState('')
  
  // Campos de alergias e deficiências
  const [allergies, setAllergies] = useState('')
  const [additionalDisabilities, setAdditionalDisabilities] = useState('')

  // Campo de tempo de tela
  const [screenTime, setScreenTime] = useState('')

  // Interesses / Reforçadores
  const [favoriteToys, setFavoriteToys] = useState('')
  const [favoriteCartoons, setFavoriteCartoons] = useState('')
  const [favoriteFoods, setFavoriteFoods] = useState('')
  const [childMotivators, setChildMotivators] = useState('')
  const [dislikes, setDislikes] = useState('')

  // Objetivos da Família
  const [diff1, setDiff1] = useState('')
  const [diff2, setDiff2] = useState('')
  const [diff3, setDiff3] = useState('')
  const [urgentGoal, setUrgentGoal] = useState('')

  // Observações do Terapeuta
  const [therapistObs, setTherapistObs] = useState('')
  const [notes, setNotes] = useState('')

  // Checkboxes originais fixos
  const [communication, setCommunication] = useState<Record<string, boolean>>({})
  const [socialInteraction, setSocialInteraction] = useState<Record<string, boolean>>({})
  const [academicSkills, setAcademicSkills] = useState<Record<string, boolean>>({})
  const [behaviors, setBehaviors] = useState<Record<string, boolean>>({})
  const [sensoryProfile, setSensoryProfile] = useState<Record<string, boolean>>({})
  const [avdFeeding, setAvdFeeding] = useState<Record<string, boolean>>({})
  const [avdHygiene, setAvdHygiene] = useState<Record<string, boolean>>({})
  const [avdBathroom, setAvdBathroom] = useState<Record<string, boolean>>({})
  const [avdDressing, setAvdDressing] = useState<Record<string, boolean>>({})
  const [avdiBelongings, setAvdiBelongings] = useState<Record<string, boolean>>({})
  const [avdiRoutines, setAvdiRoutines] = useState<Record<string, boolean>>({})
  const [avdiTechComm, setAvdiTechComm] = useState<Record<string, boolean>>({})

  // Estados para itens personalizados adicionados pelo usuário em cada seção
  const [customItems, setCustomItems] = useState<Record<string, string[]>>({
    communication: [],
    socialInteraction: [],
    academicSkills: [],
    behaviors: [],
    avdFeeding: [],
    avdHygiene: [],
    avdBathroom: [],
    avdDressing: [],
    avdiBelongings: [],
    avdiRoutines: [],
    avdiTechComm: [],
    sensoryProfile: []
  })
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({})

  // Estado para novos Tópicos/Seções criados pelo usuário dinamicamente
  const [customSections, setCustomSections] = useState<Array<{ id: string; title: string; items: string[] }>>([])
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newSectionItemInputs, setNewSectionItemInputs] = useState<Record<string, string>>({})
  const [customSectionValues, setCustomSectionValues] = useState<Record<string, Record<string, boolean>>>({})

  const handleToggle = (
    state: Record<string, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string
  ) => {
    setState({ ...state, [key]: !state[key] })
  }

  const handleAddCustomItem = (sectionKey: string, setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => {
    const text = (newItemInputs[sectionKey] || '').trim()
    if (!text) return
    if (customItems[sectionKey].includes(text)) {
      alert('Este item já foi adicionado.')
      return
    }
    setCustomItems(prev => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], text]
    }))
    setNewItemInputs(prev => ({ ...prev, [sectionKey]: '' }))
  }

  const handleAddCustomSection = () => {
    if (!newSectionTitle.trim()) return
    const sectionId = 'sec_' + Date.now()
    setCustomSections(prev => [...prev, { id: sectionId, title: newSectionTitle.trim(), items: [] }])
    setNewSectionTitle('')
  }

  const handleRemoveCustomSection = (sectionId: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId))
  }

  const handleAddCustomSectionItem = (sectionId: string) => {
    const text = (newSectionItemInputs[sectionId] || '').trim()
    if (!text) return
    setCustomSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        if (sec.items.includes(text)) return sec
        return { ...sec, items: [...sec.items, text] }
      }
      return sec
    }))
    setNewSectionItemInputs(prev => ({ ...prev, [sectionId]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!patientId || patientId === '123') {
      alert('Atenção: Acesse a anamnese diretamente a partir da lista de pacientes para salvar com um ID de paciente válido!')
      return
    }

    setLoading(true)

    const payload = {
      patient_id: patientId,
      school_grade: schoolGrade,
      medications,
      allergies,
      additional_disabilities: additionalDisabilities,
      communication: { ...communication, ...Object.fromEntries(customItems.communication.map(i => [i, !!communication[i]])) },
      social_interaction: { ...socialInteraction, ...Object.fromEntries(customItems.socialInteraction.map(i => [i, !!socialInteraction[i]])) },
      academic_skills: { ...academicSkills, ...Object.fromEntries(customItems.academicSkills.map(i => [i, !!academicSkills[i]])) },
      behaviors: { ...behaviors, ...Object.fromEntries(customItems.behaviors.map(i => [i, !!behaviors[i]])) },
      stereotypies_details: stereotypiesDetails,
      avd_feeding: { ...avdFeeding, ...Object.fromEntries(customItems.avdFeeding.map(i => [i, !!avdFeeding[i]])) },
      avd_hygiene: { ...avdHygiene, ...Object.fromEntries(customItems.avdHygiene.map(i => [i, !!avdHygiene[i]])) },
      avd_bathroom: { ...avdBathroom, ...Object.fromEntries(customItems.avdBathroom.map(i => [i, !!avdBathroom[i]])) },
      avd_dressing: { ...avdDressing, ...Object.fromEntries(customItems.avdDressing.map(i => [i, !!avdDressing[i]])) },
      avdi_belongings: { ...avdiBelongings, ...Object.fromEntries(customItems.avdiBelongings.map(i => [i, !!avdiBelongings[i]])) },
      avdi_routines: { ...avdiRoutines, ...Object.fromEntries(customItems.avdiRoutines.map(i => [i, !!avdiRoutines[i]])) },
      avdi_tech_comm: { ...avdiTechComm, ...Object.fromEntries(customItems.avdiTechComm.map(i => [i, !!avdiTechComm[i]])) },
      screen_time: screenTime,
      sensory_profile: { ...sensoryProfile, ...Object.fromEntries(customItems.sensoryProfile.map(i => [i, !!sensoryProfile[i]])) },
      favorite_toys: favoriteToys,
      favorite_cartoons: favoriteCartoons,
      favorite_foods: favoriteFoods,
      child_motivators: childMotivators,
      dislikes,
      main_difficulty_1: diff1,
      main_difficulty_2: diff2,
      main_difficulty_3: diff3,
      urgent_development_goal: urgentGoal,
      therapist_observations: therapistObs,
      notes,
      custom_sections: { customSections, customSectionValues }
    }

    const { error } = await supabase.from('anamneses').insert([payload])

    if (error) {
      console.error('Erro detalhado Supabase:', error)
      alert(`Erro ao salvar anamnese: ${error.message}`)
    } else {
      alert('Anamnese salva com sucesso!')
      router.push('/')
    }
    setLoading(false)
  }

  const renderCheckboxes = (
    options: string[],
    state: Record<string, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    sectionKey?: string
  ) => {
    const customList = sectionKey ? customItems[sectionKey] || [] : []
    const allOptions = [...options, ...customList]

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allOptions.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 p-3 border rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 transition"
            >
              <input
                type="checkbox"
                checked={!!state[item]}
                onChange={() => handleToggle(state, setState, item)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              {item}
            </label>
          ))}
        </div>

        {sectionKey && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Adicionar nova pergunta/opção..."
              value={newItemInputs[sectionKey] || ''}
              onChange={(e) => setNewItemInputs({ ...newItemInputs, [sectionKey]: e.target.value })}
              className="flex-1 p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
            />
            <button
              type="button"
              onClick={() => handleAddCustomItem(sectionKey, setState)}
              className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Plus size={16} /> Adicionar Opção
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 transition uppercase tracking-wider"
            >
              <ArrowLeft size={14} /> Voltar para o início
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-indigo-600" /> Ficha de Anamnese Comportamental, AVDs e AVDIs
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition"
            >
              <X size={16} /> Sair / Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer text-sm"
            >
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Anamnese'}
            </button>
          </div>
        </header>

        {/* 1. Contexto Escolar e Medicamentos */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">1. Informações de Contexto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Escola / Série"
              value={schoolGrade}
              onChange={(e) => setSchoolGrade(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <input
              type="text"
              placeholder="Medicamentos em uso"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>
        </section>

        {/* Alergias e Outras Deficiências */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Alergias e Outras Deficiências / Diagnósticos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              placeholder="Alergias do paciente (alimentares, medicamentosas, pele, etc.)"
              rows={3}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 w-full"
            />
            <textarea
              placeholder="Possui outra deficiência ou diagnóstico além do autismo? Especifique:"
              rows={3}
              value={additionalDisabilities}
              onChange={(e) => setAdditionalDisabilities(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 w-full"
            />
          </div>
        </section>

        {/* 2. Comunicação */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">2. Comunicação</h2>
          {renderCheckboxes(
            [
              'Não fala', 'Balbucia', 'Fala palavras', 'Fala frases', 'Fala completa e estruturada',
              'Faz pedidos espontaneamente', 'Responde quando chamado', 'Mantém contato visual',
              'Aponta para pedir', 'Aponta para mostrar interesse', 'Imita sons', 'Faz perguntas',
              'Responde perguntas simples', 'Segue comandos simples', 'Segue comandos de 2 etapas'
            ],
            communication,
            setCommunication,
            'communication'
          )}
        </section>

        {/* 3. Interação Social */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">3. Interação Social</h2>
          {renderCheckboxes(
            [
              'Brinca sozinho', 'Brinca com outras crianças', 'Divide brinquedos',
              'Espera sua vez', 'Demonstra afeto', 'Procura adultos para brincar', 'Imita outras pessoas'
            ],
            socialInteraction,
            setSocialInteraction,
            'socialInteraction'
          )}
        </section>

        {/* 4. Habilidades Acadêmicas */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">4. Habilidades Acadêmicas</h2>
          {renderCheckboxes(
            [
              'Reconhece cores', 'Reconhece números', 'Reconhece letras',
              'Escreve o próprio nome', 'Lê palavras', 'Lê frases', 'Escreve'
            ],
            academicSkills,
            setAcademicSkills,
            'academicSkills'
          )}
        </section>

        {/* 5. Comportamentos */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">5. Comportamentos e Estereotipias</h2>
          {renderCheckboxes(
            [
              'Birras', 'Gritos', 'Choro frequente', 'Agressão (bate)', 'Morde', 'Chuta',
              'Joga objetos', 'Autolesivo', 'Foge', 'Sobe em móveis', 'Comportamentos repetitivos',
              'Alinha objetos', 'Gira objetos', 'Estereotipias'
            ],
            behaviors,
            setBehaviors,
            'behaviors'
          )}
          <input
            type="text"
            placeholder="Se marcou Estereotipias, descreva quais:"
            value={stereotypiesDetails}
            onChange={(e) => setStereotypiesDetails(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 mt-2"
          />
        </section>

        {/* 6. AVDs - Atividades de Vida Diária */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <CheckSquare className="text-indigo-600" /> 6. AVDs (Atividades de Vida Diária)
          </h2>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Alimentação</h3>
            {renderCheckboxes(['Come sozinho', 'Usa talheres', 'Bebe no copo sozinho', 'Aceita diferentes texturas'], avdFeeding, setAvdFeeding, 'avdFeeding')}
          </div>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Higiene Pessoal</h3>
            {renderCheckboxes(['Escova os dentes', 'Toma banho sozinho', 'Lava as mãos'], avdHygiene, setAvdHygiene, 'avdHygiene')}
          </div>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Uso do Banheiro</h3>
            {renderCheckboxes(['Usa banheiro sozinho', 'Pede para ir ao banheiro', 'Desfraldado diurno', 'Desfraldado noturno'], avdBathroom, setAvdBathroom, 'avdBathroom')}
          </div>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Vestuário</h3>
            {renderCheckboxes(['Veste-se sozinho', 'Calça sapatos', 'Abotoa / Fecha zíper'], avdDressing, setAvdDressing, 'avdDressing')}
          </div>
        </section>

        {/* 7. AVDIs - Atividades Instrumentais de Vida Diária */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <CheckSquare className="text-indigo-600" /> 7. AVDIs (Atividades Instrumentais de Vida Diária)
          </h2>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Organização e Gestão de Pertences</h3>
            {renderCheckboxes(['Guarda os próprios brinquedos', 'Organiza mochila/material escolar', 'Identifica e cuida dos seus pertences'], avdiBelongings, setAvdiBelongings, 'avdiBelongings')}
          </div>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Rotinas Domésticas e Mobilidade</h3>
            {renderCheckboxes(['Ajuda em tarefas simples de casa', 'Compreende e segue a rotina da casa', 'Orientação básica em ambientes externos'], avdiRoutines, setAvdiRoutines, 'avdiRoutines')}
          </div>

          <div>
            <h3 className="font-medium text-slate-600 mb-2">Comunicação e Tecnologia</h3>
            {renderCheckboxes(['Utiliza celular/tablet com autonomia', 'Utiliza sistema CAA (Comunicação Alternativa)', 'Atende a chamadas ou interage por videochamada'], avdiTechComm, setAvdiTechComm, 'avdiTechComm')}
            
            <div className="mt-3">
              <input
                type="text"
                placeholder="Tempo médio diário de tela (ex: 2 horas por dia, apenas nos fins de semana, etc.):"
                value={screenTime}
                onChange={(e) => setScreenTime(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 8. Análise Sensorial */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">8. Análise Sensorial</h2>
          {renderCheckboxes(
            [
              'Incômodo com sons', 'Incômodo com luz', 'Incômodo com toque',
              'Coloca objetos na boca', 'Procura girar', 'Procura pular', 'Balança o corpo',
              'Skin Picking'
            ],
            sensoryProfile,
            setSensoryProfile,
            'sensoryProfile'
          )}
        </section>

        {/* SEÇÕES CUSTOMIZADAS ADICIONADAS PELO USUÁRIO (NUMERAÇÃO DINÂMICA) */}
        {customSections.map((sec, index) => {
          const sectionNumber = 9 + index
          return (
            <section key={sec.id} className="bg-white p-6 rounded-2xl border-2 border-indigo-200 space-y-4 relative">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-indigo-700">
                  {sectionNumber}. {sec.title}
                </h2>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomSection(sec.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg flex items-center gap-1 text-xs font-medium"
                >
                  <Trash2 size={16} /> Remover Tópico
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sec.items.map((item) => {
                  const checked = customSectionValues[sec.id]?.[item] || false
                  return (
                    <label
                      key={item}
                      className="flex items-center gap-2 p-3 border rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 transition"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setCustomSectionValues(prev => ({
                            ...prev,
                            [sec.id]: {
                              ...(prev[sec.id] || {}),
                              [item]: !checked
                            }
                          }))
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      {item}
                    </label>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Adicionar opção neste tópico..."
                  value={newSectionItemInputs[sec.id] || ''}
                  onChange={(e) => setNewSectionItemInputs({ ...newSectionItemInputs, [sec.id]: e.target.value })}
                  className="flex-1 p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSectionItem(sec.id)}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium transition border border-indigo-200"
                >
                  <Plus size={16} /> Adicionar Opção
                </button>
              </div>
            </section>
          )
        })}

        {/* BOTÃO PARA CRIAR UM NOVO TÓPICO / SEÇÃO COMPLETA */}
        <section className="bg-indigo-50/60 p-6 rounded-2xl border-2 border-dashed border-indigo-300 space-y-3">
          <h3 className="text-md font-semibold text-indigo-900 flex items-center gap-2">
            <Plus size={18} className="text-indigo-600" /> Criar Novo Tópico / Seção na Anamnese
          </h3>
          <p className="text-xs text-slate-600">
            Se sentiu falta de algum assunto específico (ex: Habilidades Sociais Avançadas, Histórico Clínico, Sono, etc.), crie um novo tópico agora mesmo:
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Nome do novo tópico (ex: Hábitos de Sono)"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="flex-1 w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white text-sm"
            />
            <button
              type="button"
              onClick={handleAddCustomSection}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition cursor-pointer shadow-sm"
            >
              <Plus size={18} /> Criar Novo Tópico
            </button>
          </div>
        </section>

        {/* 9+N. Interesses e Reforçadores */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">{9 + customSections.length}. Interesses e Reforçadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Brinquedos favoritos"
              value={favoriteToys}
              onChange={(e) => setFavoriteToys(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <input
              type="text"
              placeholder="Desenhos / Personagens favoritos"
              value={favoriteCartoons}
              onChange={(e) => setFavoriteCartoons(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <input
              type="text"
              placeholder="Comidas preferidas"
              value={favoriteFoods}
              onChange={(e) => setFavoriteFoods(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <input
              type="text"
              placeholder="O que mais motiva a criança?"
              value={childMotivators}
              onChange={(e) => setChildMotivators(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <input
              type="text"
              placeholder="O que a criança NÃO gosta?"
              value={dislikes}
              onChange={(e) => setDislikes(e.target.value)}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 md:col-span-2"
            />
          </div>
        </section>

        {/* 10+N. Objetivos da Família */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">{10 + customSections.length}. Objetivos da Família</h2>
          <p className="text-sm text-slate-500">Quais são as três maiores dificuldades da criança hoje?</p>
          <input
            type="text"
            placeholder="Dificuldade 1"
            value={diff1}
            onChange={(e) => setDiff1(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <input
            type="text"
            placeholder="Dificuldade 2"
            value={diff2}
            onChange={(e) => setDiff2(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <input
            type="text"
            placeholder="Dificuldade 3"
            value={diff3}
            onChange={(e) => setDiff3(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <input
            type="text"
            placeholder="O que acham mais urgente para ser adquirido no desenvolvimento?"
            value={urgentGoal}
            onChange={(e) => setUrgentGoal(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </section>

        {/* 11+N. Planejamento Terapêutico e Observações */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">{11 + customSections.length}. Planejamento & Observações</h2>
          <textarea
            placeholder="Observações do Terapeuta"
            rows={3}
            value={therapistObs}
            onChange={(e) => setTherapistObs(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <textarea
            placeholder="Anotações Gerais"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </section>

        {/* Rodapé com botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition"
          >
            <X size={16} /> Cancelar / Sair
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer text-sm"
          >
            <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Anamnese'}
          </button>
        </div>
      </form>
    </main>
  )
}