export const VREIN_CONFIG = {
  SESSION_COOKIE_NAME: 'vrein_session',
  SESSION_EXPIRY_DAYS: 30,
  S2_URL: 'https://s2.braindw.com',
  P_URL: 'https://p2.vrein.ai',
  ABTEST_URL: 'https://abtest.braindw.com',
  GET_GUID_ENDPOINT: '/tracking/GetGuid',
  CAPTURE_ENDPOINT: '/tracking/capture',
  PERSISTENCE_ENDPOINT: '/api/data/capture',
  ABTEST_ENDPOINT: '/api/abtest/events/capture',
  MAX_LAST_PRODUCTS: 15,
  CLICKED_PRODUCTS_MAX_HOURS: 3,
  DEFAULT_SALES_CHANNEL: '1',
  DEFAULT_CURRENCY: 'ARS',
} as const

export function getVreinConfig() {
  return {
    clientKey: process.env.NEXT_PUBLIC_VREIN_HASH || '',
    vreinHash: process.env.NEXT_PUBLIC_VREIN_HASH || '',
    branchOffice: process.env.NEXT_PUBLIC_VREIN_BRANCH_OFFICE || '1',
  }
}

export const VREIN_ENV = {
  get CLIENT_KEY() {
    return process.env.NEXT_PUBLIC_VREIN_HASH || ''
  },
  get VREIN_HASH() {
    return process.env.NEXT_PUBLIC_VREIN_HASH || ''
  },
  get BRANCH_OFFICE() {
    return process.env.NEXT_PUBLIC_VREIN_BRANCH_OFFICE || '1'
  },
  get VREIN_SECRET() {
    return process.env.NEXT_PUBLIC_VREIN_SECRET || ''
  }
} as const

export function enableVreinDebug() {
  if (typeof window !== 'undefined') {
    (window as any).VREIN_DEBUG = true
    console.log('[Vrein] Debug mode enabled')
    console.log('[Vrein] Config:', {
      clientKey: VREIN_ENV.CLIENT_KEY,
      branchOffice: VREIN_ENV.BRANCH_OFFICE,
      apis: {
        s2: VREIN_CONFIG.S2_URL,
        p: VREIN_CONFIG.P_URL,
        abtest: VREIN_CONFIG.ABTEST_URL,
      }
    })
  }
}

export function disableVreinDebug() {
  if (typeof window !== 'undefined') {
    (window as any).VREIN_DEBUG = false
    console.log('[Vrein] Debug mode disabled')
  }
}
