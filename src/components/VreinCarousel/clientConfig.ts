export interface ClientConfig {
  useH1Title: boolean
  useH2Title: boolean
  useGAImpressions: boolean
  separateMercadoTracking: boolean
  mercadoCategoryPath: string
}

const DEFAULT_CONFIG: ClientConfig = {
  useH1Title: false,
  useH2Title: false,
  useGAImpressions: false,
  separateMercadoTracking: false,
  mercadoCategoryPath: '',
}

const CLIENT_CONFIGS: Record<string, Partial<ClientConfig>> = {
  asics_produccion_xopkk: { useH1Title: true, useH2Title: true },
  fila_produccion_mauga: { useH1Title: true, useH2Title: true },
  umbro_produccion_bkq2t: { useH1Title: true, useH2Title: true },
  megusta_testing_4nk2d: { useH2Title: true },
  megusta_produccion_gimz9: { useH2Title: true },
  corebiz: { useGAImpressions: true },
  farmaciaindiana_produccion_toy4l: { useGAImpressions: true },
  exitocol_produccion_pavpr: {
    separateMercadoTracking: true,
    mercadoCategoryPath: '/Mercado/',
  },
}

export function getClientConfig(clientHash?: string): ClientConfig {
  const hash = clientHash || process.env.NEXT_PUBLIC_VREIN_HASH || ''

  if (CLIENT_CONFIGS[hash]) {
    return { ...DEFAULT_CONFIG, ...CLIENT_CONFIGS[hash] }
  }

  for (const key of Object.keys(CLIENT_CONFIGS)) {
    if (hash.includes(key)) {
      return { ...DEFAULT_CONFIG, ...CLIENT_CONFIGS[key] }
    }
  }

  return DEFAULT_CONFIG
}

export function getShelfTitleTag(clientHash?: string): 'h1' | 'h2' | 'div' {
  const config = getClientConfig(clientHash)
  if (config.useH1Title) return 'h1'
  if (config.useH2Title) return 'h2'
  return 'h2'
}
