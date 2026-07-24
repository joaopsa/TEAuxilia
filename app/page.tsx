'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import {
  Users,
  ClipboardList,
  Eye,
  Calendar,
  Target,
  Search,
  UserPlus,
  UserCheck,
  Trash2,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [patients, setPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  async function fetchPatients() {
    setLoading(true)
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPatients(data)
    }
    setLoading(false)
  }

  const handleDeletePatient = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o cadastro do paciente "${name}"?\n\nEsta ação removerá permanentemente o paciente e todo o seu histórico.`
    )

    if (!confirmed) return

    const { error } = await supabase.from('patients').delete().eq('id', id)

    if (error) {
      alert(`Erro ao excluir paciente: ${error.message}`)
    } else {
      alert('Paciente excluído com sucesso!')
      fetchPatients()
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Image
              src="/logo.svg"
              alt="TEAuxilia Logo"
              width={350}
              height={100}
              priority
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
            />
            <div>
              <p className="text-slate-500 text-sm mt-1">
                Painel de Acompanhamento Terapêutico e Evolução Clínica
              </p>
            </div>
          </div>

          <Link
            href="/patients/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer self-start sm:self-center shadow-sm"
          >
            <UserPlus size={18} /> Cadastrar Paciente
          </Link>
        </header>

        {/* Barra de Busca */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar paciente pelo nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-sm"
          />
        </div>

        {/* Lista de Pacientes */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Pacientes Cadastrados ({filteredPatients.length})
          </h2>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                Carregando lista de pacientes...
              </p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
              <Users className="mx-auto text-slate-300" size={48} />
              <p className="text-slate-600 font-medium">
                Nenhum paciente encontrado.
              </p>
              <p className="text-xs text-slate-400">
                Cadastre um novo paciente para iniciar o acompanhamento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between"
                >
                  {/* Info do Paciente */}
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          {patient.name}
                        </h3>
                        {patient.birth_date && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Nascimento:{' '}
                            {new Date(
                              patient.birth_date + 'T00:00:00'
                            ).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                          Ativo
                        </span>
                        <button
                          onClick={() =>
                            handleDeletePatient(patient.id, patient.name)
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir Paciente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {patient.responsibles && (
                      <p className="text-xs text-slate-500 mt-3">
                        <strong className="text-slate-700">
                          Responsáveis:
                        </strong>{' '}
                        {patient.responsibles}
                      </p>
                    )}
                  </div>

                  {/* Atalhos de Ação Rápida */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-medium">
                    <Link
                      href={`/patients/${patient.id}/view-anamnesis`}
                      className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200/60 transition"
                      title="Visualizar Anamnese Salva"
                    >
                      <Eye size={15} /> Ver Anamnese
                    </Link>

                    <Link
                      href={`/patients/${patient.id}/sessions`}
                      className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200/60 transition"
                      title="Registrar ou ver Histórico de Sessões"
                    >
                      <Calendar size={15} /> Evolução Diária
                    </Link>

                    <Link
                      href={`/patients/${patient.id}/attendance`}
                      className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200/60 transition"
                      title="Frequência do Paciente"
                    >
                      <UserCheck size={15} /> Frequência
                    </Link>

                    <Link
                      href={`/patients/${patient.id}/pei`}
                      className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200/60 transition"
                      title="Plano de Intervenção (PEI)"
                    >
                      <Target size={15} /> PEI / Metas
                    </Link>

                    <Link
                      href={`/patients/${patient.id}/report`}
                      className="col-span-2 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-semibold transition"
                      title="Gerar Relatório do Paciente"
                    >
                      <FileText size={15} /> Gerar Relatório Terapêutico
                    </Link>
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