// src/lib/normalize.ts
// Normalização de texto para todos os formulários BRA-01
// Uso: import { norm } from '@/lib/normalize'

// ─── Primitivos ───────────────────────────────────────────────────────────────

/** Remove espaços extras e trim */
export function clean(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim()
}

/** Primeira letra maiúscula, resto minúsculo */
export function sentence(s: string | null | undefined): string {
  const v = clean(s)
  if (!v) return ''
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
}

/** Title Case — cada palavra com primeira maiúscula */
export function titleCase(s: string | null | undefined): string {
  const v = clean(s)
  if (!v) return ''
  const lower = ['de','da','do','das','dos','e','a','o','em','na','no','nas','nos','por','para','com','sem']
  return v
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (i === 0 || !lower.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}

/** MAIÚSCULAS */
export function upper(s: string | null | undefined): string {
  return clean(s).toUpperCase()
}

/** minúsculas */
export function lower(s: string | null | undefined): string {
  return clean(s).toLowerCase()
}

/** Código de item — maiúsculas, sem espaços */
export function itemCode(s: string | null | undefined): string {
  return clean(s).toUpperCase().replace(/\s/g, '')
}

/** Email — minúsculas */
export function email(s: string | null | undefined): string {
  return clean(s).toLowerCase()
}

/** Número/código alfanumérico — maiúsculas, sem espaços */
export function alphaCode(s: string | null | undefined): string {
  return clean(s).toUpperCase().replace(/\s/g, '')
}

/** Descrição longa — apenas trim e espaços, sem alterar capitalização */
export function description(s: string | null | undefined): string {
  return clean(s)
}

/** Nulo se vazio */
export function nullIfEmpty(s: string | null | undefined): string | null {
  const v = clean(s)
  return v === '' ? null : v
}

// ─── Normalizadores por entidade ──────────────────────────────────────────────

/** Membro da equipe */
export const normMember = {
  nome_completo:       (v: string) => titleCase(v),
  nome_guerra:         (v: string) => upper(v),
  posto_graduacao:     (v: string) => titleCase(v),
  numero_identidade:   (v: string) => alphaCode(v),
  numero_passaporte:   (v: string) => alphaCode(v),
  email_institucional: (v: string) => lower(v),
  email_pessoal:       (v: string) => lower(v),
  telefone:            (v: string) => clean(v),
  cidade_natal:        (v: string) => titleCase(v),
  estado_natal:        (v: string) => upper(v),
  localizacao_atual:   (v: string) => titleCase(v),
  especialidade:       (v: string) => titleCase(v),
  observacoes:         (v: string) => description(v),
}

/** Equipamento */
export const normEquipment = {
  codigo_item:         (v: string) => itemCode(v),
  nome:                (v: string) => titleCase(v),
  nome_en:             (v: string) => titleCase(v),
  descricao:           (v: string) => description(v),
  fabricante:          (v: string) => titleCase(v),
  modelo:              (v: string) => clean(v),
  numero_serie:        (v: string) => alphaCode(v),
  numero_patrimonio:   (v: string) => alphaCode(v),
  localizacao:         (v: string) => titleCase(v),
  dimensoes:           (v: string) => clean(v),
  observacao_validade: (v: string) => sentence(v),
}

/** Qualificação / curso */
export const normQualification = {
  nome_curso:        (v: string) => titleCase(v),
  codigo_curso:      (v: string) => alphaCode(v),
  entidade_emissora: (v: string) => titleCase(v),
  nivel:             (v: string) => titleCase(v),
  observacoes:       (v: string) => description(v),
}

/** Capacitação adicional */
export const normTraining = {
  titulo:      (v: string) => titleCase(v),
  organizador: (v: string) => titleCase(v),
  local:       (v: string) => titleCase(v),
  funcao_exercicio: (v: string) => titleCase(v),
  descricao:   (v: string) => description(v),
  observacoes: (v: string) => description(v),
}

/** Missão */
export const normMission = {
  nome:     (v: string) => titleCase(v),
  codigo:   (v: string) => alphaCode(v),
  pais:     (v: string) => titleCase(v),
  cidade:   (v: string) => titleCase(v),
  descricao: (v: string) => description(v),
}

/** EXCON — atividade */
export const normExconActivity = {
  titulo:      (v: string) => titleCase(v),
  descricao:   (v: string) => description(v),
  observacoes: (v: string) => description(v),
}

/** EXCON — membro */
export const normExconMember = {
  funcao_excon: (v: string) => titleCase(v),
  descricao:    (v: string) => description(v),
  observacoes:  (v: string) => description(v),
}

/** Manutenção */
export const normMaintenance = {
  descricao:       (v: string) => sentence(v),
  empresa_externa: (v: string) => titleCase(v),
  resultado:       (v: string) => sentence(v),
}

// ─── Helper genérico para aplicar normalização em um objeto form ───────────────
/**
 * Aplica as funções de normalização a um objeto form.
 *
 * Uso:
 *   const normalized = applyNorm(form, normMember)
 */
export function applyNorm<T extends Record<string, string>>(
  form: T,
  normMap: Partial<Record<keyof T, (v: string) => string>>,
): T {
  const result = { ...form }
  for (const key in normMap) {
    if (key in form && typeof form[key] === 'string') {
      const fn = normMap[key]
      if (fn) result[key] = fn(form[key]) as T[typeof key]
    }
  }
  return result
}