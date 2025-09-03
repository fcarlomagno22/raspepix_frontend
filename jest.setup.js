import '@testing-library/jest-dom'

// Mock do Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock do Next.js cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn((name) => {
      if (name === 'access_token') {
        return { value: 'mock-access-token' }
      }
      return null
    }),
  }),
}))

// Mock das variáveis de ambiente
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Mock global fetch
global.fetch = jest.fn()

// Mock do console para evitar logs durante os testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
