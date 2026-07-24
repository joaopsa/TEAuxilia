'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Printer,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Target,
  Award,
  ThumbsUp,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const patientId = resolvedParams.id

  const [patient, setPatient] = useState<any>(null)
  const [anamnesis, setAnamnesis] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [peiGoals, setPeiGoals] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Campos clínicos editáveis para emissão do relatório
  const [positivePoints, setPositivePoints] = useState(
    'O paciente demonstra boa receptividade ao ambiente terapêutico, reconhece comandos verbais simples, mantém bom vínculo com o terapeuta e demonstra interesse por jogos estruturados e atividades visuais.'
  )
  const [workingOn, setWorkingOn] = useState(
    'Ampliação da comunicação funcional (uso de CAA/gestos), autorregulação emocional durante transições de atividades, rastreio visual sustentado e habilidades de imitação motora fina.'
  )
  const [improvementPoints, setImprovementPoints] = useState(
    'Tolerância à frustração diante de tarefas com maior grau de complexidade, manutenção da atenção compartilhada por períodos mais longos e flexibilização da rotina em momentos de mudança estipulada.'
  )
  const [conclusion, setConclusion] = useState(
    'Diante do acompanhamento realizado, o paciente apresenta evolução contínua e positiva em seu desenvolvimento global. Recomenda-se a continuidade das intervenções terapêuticas semanais, bem como o reforço das estratégias de comunicação e rotina no ambiente familiar e escolar.'
  )

  useEffect(() => {
    fetchReportData()
  }, [patientId])

  async function fetchReportData() {
    if (!patientId) return
    setLoading(true)

    // 1. Dados do Paciente
    const { data: pData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()
    if (pData) setPatient(pData)

    // 2. Anamnese
    const { data: aData } = await supabase
      .from('anamnesis')
      .select('*')
      .eq('patient_id', patientId)
      .single()
    if (aData) setAnamnesis(aData)

    // 3. Frequência
    const { data: attData } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })
    if (attData) setAttendance(attData)

    // 4. Metas do PEI
    const { data: gData } = await supabase
      .from('pei_goals')
      .select('*')
      .eq('patient_id', patientId)
    if (gData) setPeiGoals(gData)

    // 5. Histórico de Sessões / Evolução
    const { data: sData } = await supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })
    if (sData) setSessions(sData)

    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  // Estatísticas de Frequência
  const totalSessions = attendance.length
  const totalPresents = attendance.filter((r) => r.status === 'Presente').length
  const attendanceRate =
    totalSessions > 0 ? Math.round((totalPresents / totalSessions) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 font-medium">Gerando relatório do paciente...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-12 print:p-0 print:bg-white">
      {/* Botões de Ação na Tela (Ocultos na Impressão) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} /> Voltar para o Início
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm cursor-pointer"
        >
          <Printer size={18} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Documento do Relatório */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Cabeçalho do Relatório */}
        <header className="border-b border-slate-200 pb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Relatório de Acompanhamento Terapêutico
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              TEAuxilia — Avaliação e Evolução Clínica
            </p>
          </div>
          <div className="text-xs text-slate-400 text-right">
            <p>Data de emissão:</p>
            <p className="font-semibold text-slate-700">
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </header>

        {/* 1. Dados do Paciente */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b pb-1 text-indigo-700 flex items-center gap-2">
            <User size={18} /> Identificação do Paciente
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Nome</span>
              <p className="font-semibold text-slate-800">{patient?.name}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                Data de Nascimento
              </span>
              <p className="font-semibold text-slate-800">
                {patient?.birth_date
                  ? new Date(
                      patient.birth_date + 'T00:00:00'
                    ).toLocaleDateString('pt-BR')
                  : 'Não informada'}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                Responsáveis
              </span>
              <p className="font-semibold text-slate-800">
                {patient?.responsibles || 'Não informado'}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Resumo da Anamnese */}
        {anamnesis && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b pb-1 text-indigo-700 flex items-center gap-2">
              <FileText size={18} /> Síntese da Anamnese & Queixas
            </h2>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {anamnesis.main_complaint && (
                <div>
                  <strong className="text-slate-900 block text-xs font-semibold uppercase text-slate-500">
                    Queixa Principal:
                  </strong>
                  <p>{anamnesis.main_complaint}</p>
                </div>
              )}
              {anamnesis.communication_level && (
                <div>
                  <strong className="text-slate-900 block text-xs font-semibold uppercase text-slate-500">
                    Comunicação e Linguagem:
                  </strong>
                  <p>{anamnesis.communication_level}</p>
                </div>
              )}
              {anamnesis.behavioral_aspects && (
                <div>
                  <strong className="text-slate-900 block text-xs font-semibold uppercase text-slate-500">
                    Aspectos Comportamentais:
                  </strong>
                  <p>{anamnesis.behavioral_aspects}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. Frequência e Assiduidade */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b pb-1 text-indigo-700 flex items-center gap-2">
            <Calendar size={18} /> Assiduidade e Frequência
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase block">
                Sessões Totais
              </span>
              <p className="text-xl font-bold text-slate-800">{totalSessions}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-600 font-semibold uppercase block">
                Presenças
              </span>
              <p className="text-xl font-bold text-emerald-700">{totalPresents}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <span className="text-xs text-indigo-600 font-semibold uppercase block">
                Taxa de Assiduidade
              </span>
              <p className="text-xl font-bold text-indigo-700">{attendanceRate}%</p>
            </div>
          </div>
        </section>

        {/* 4. Pontos Positivos (O que o paciente já sabe) */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-emerald-700 uppercase tracking-wider border-b pb-1 flex items-center gap-2">
            <ThumbsUp size={18} /> Pontos Positivos / Habilidades Adquiridas
          </h2>
          <textarea
            value={positivePoints}
            onChange={(e) => setPositivePoints(e.target.value)}
            rows={3}
            className="w-full text-sm text-slate-700 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500 resize-none print:border-none print:p-0 print:bg-transparent print:resize-none"
            placeholder="Descreva aqui as competências e habilidades já consolidadas..."
          />
        </section>

        {/* 5. O que está sendo trabalhado */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-indigo-700 uppercase tracking-wider border-b pb-1 flex items-center gap-2">
            <TrendingUp size={18} /> Em Desenvolvimento / Objetivos Atuais
          </h2>
          <textarea
            value={workingOn}
            onChange={(e) => setWorkingOn(e.target.value)}
            rows={3}
            className="w-full text-sm text-slate-700 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none print:border-none print:p-0 print:bg-transparent print:resize-none"
            placeholder="Descreva as habilidades em processo de aquisição..."
          />
        </section>

        {/* 6. Pontos a Melhorar (Intervenção Necessária) */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-amber-700 uppercase tracking-wider border-b pb-1 flex items-center gap-2">
            <AlertCircle size={18} /> Pontos a Melhorar / Necessitam de Maior Intervenção
          </h2>
          <textarea
            value={improvementPoints}
            onChange={(e) => setImprovementPoints(e.target.value)}
            rows={3}
            className="w-full text-sm text-slate-700 bg-amber-50/40 p-4 rounded-xl border border-amber-100 outline-none focus:ring-2 focus:ring-amber-500 resize-none print:border-none print:p-0 print:bg-transparent print:resize-none"
            placeholder="Descreva as áreas que demandam mais suporte e intervenção..."
          />
        </section>

        {/* 7. Metas Terapêuticas (PEI) */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b pb-1 text-indigo-700 flex items-center gap-2">
            <Target size={18} /> Status do Plano de Intervenção (PEI)
          </h2>
          {peiGoals.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Nenhuma meta cadastrada no PEI até o momento.
            </p>
          ) : (
            <div className="space-y-3">
              {peiGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 border rounded-xl bg-slate-50 text-sm flex justify-between items-start gap-3"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{goal.description}</p>
                    {goal.target_date && (
                      <span className="text-xs text-slate-400">
                        Previsão:{' '}
                        {new Date(
                          goal.target_date + 'T00:00:00'
                        ).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      goal.status === 'Alcançada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : goal.status === 'Em Progresso'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 8. Conclusão e Parecer Terapêutico */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider border-b pb-1 text-indigo-700 flex items-center gap-2">
            <CheckCircle2 size={18} /> Conclusão e Parecer Clínico
          </h2>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={4}
            className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none print:border-none print:p-0 print:bg-transparent print:resize-none"
            placeholder="Escreva a conclusão e orientações finais do relatório..."
          />
        </section>

        {/* Rodapé de Assinatura */}
        <footer className="pt-12 mt-12 border-t border-slate-200 text-center space-y-8">
          <div className="max-w-xs mx-auto border-t border-slate-400 pt-2">
            <p className="text-sm font-semibold text-slate-800">
              Assinatura do Profissional
            </p>
            <p className="text-xs text-slate-500">
              Terapeuta / Especialista Responsável
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}