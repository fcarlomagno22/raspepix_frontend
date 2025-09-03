import { getUserProfile, updatePhone } from '../actions'

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

// Mock global fetch
global.fetch = jest.fn()

describe('Profile Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('deve retornar perfil do usuário com sucesso', async () => {
      const mockProfileData = {
        full_name: 'João Silva',
        cpf: '12345678900',
        email: 'joao@example.com',
        phone: '11987654321',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData,
      })

      const result = await getUserProfile()

      expect(result).toEqual({
        id: '12345678900',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        document: '123.456.789-00',
        birth_date: null,
        gender: null,
        profile_picture: expect.any(String),
        affiliate_code: null,
        is_influencer: false,
        status: 'active',
        created_at: expect.any(String),
        updated_at: expect.any(String),
        last_login: null,
        playable_balance: 0,
        withdrawable_balance: 0,
        affiliate_commission_balance: 0,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/user/profile'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mock-access-token',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        })
      )
    })

    it('deve lançar erro quando não há token de acesso', async () => {
      // Mock sem token
      jest.mocked(require('next/headers').cookies).mockReturnValue({
        get: jest.fn(() => null),
      } as any)

      await expect(getUserProfile()).rejects.toThrow('Sessão expirada, faça login novamente')
    })

    it('deve lançar erro quando a API retorna 401', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      })

      await expect(getUserProfile()).rejects.toThrow('Sessão expirada, faça login novamente')
    })

    it('deve lançar erro quando a API retorna 404', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Perfil não encontrado' }),
      })

      await expect(getUserProfile()).rejects.toThrow('Perfil não encontrado')
    })

    it('deve lançar erro genérico para outros status codes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Erro interno do servidor' }),
      })

      await expect(getUserProfile()).rejects.toThrow('Erro interno do servidor')
    })

    it('deve lançar erro quando fetch falha', async () => {
      const networkError = new Error('Network error')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

      await expect(getUserProfile()).rejects.toThrow('Network error')
    })
  })

  describe('updatePhone', () => {
    it('deve atualizar telefone com sucesso', async () => {
      const newPhone = '11987654321'
      const mockResponse = {
        phone: newPhone,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await updatePhone(newPhone)

      expect(result).toEqual({
        success: true,
        message: 'Telefone atualizado com sucesso',
        phone: newPhone,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/user/profile/phone'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer mock-access-token',
          },
          credentials: 'include',
          body: JSON.stringify({ phone: newPhone }),
        })
      )
    })

    it('deve validar telefone com menos de 10 dígitos', async () => {
      const invalidPhone = '119876'

      const result = await updatePhone(invalidPhone)

      expect(result).toEqual({
        success: false,
        message: 'Telefone deve ter no mínimo 10 dígitos',
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('deve validar telefone com mais de 11 dígitos', async () => {
      const invalidPhone = '119876543210'

      const result = await updatePhone(invalidPhone)

      expect(result).toEqual({
        success: false,
        message: 'Telefone deve ter no máximo 11 dígitos',
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('deve validar telefone com caracteres não numéricos', async () => {
      const invalidPhone = '11abc87654'

      const result = await updatePhone(invalidPhone)

      expect(result).toEqual({
        success: false,
        message: 'Telefone deve conter apenas números',
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando não há token de acesso', async () => {
      // Mock sem token
      jest.mocked(require('next/headers').cookies).mockReturnValue({
        get: jest.fn(() => null),
      } as any)

      const result = await updatePhone('11987654321')

      expect(result).toEqual({
        success: false,
        message: 'Sessão expirada, faça login novamente',
      })
    })

    it('deve lançar erro quando a API retorna 401', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      })

      const result = await updatePhone('11987654321')

      expect(result).toEqual({
        success: false,
        message: 'Sessão expirada, faça login novamente',
      })
    })

    it('deve lançar erro genérico para outros status codes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Erro interno do servidor' }),
      })

      const result = await updatePhone('11987654321')

      expect(result).toEqual({
        success: false,
        message: 'Erro interno do servidor',
      })
    })

    it('deve lançar erro quando fetch falha', async () => {
      const networkError = new Error('Network error')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

      const result = await updatePhone('11987654321')

      expect(result).toEqual({
        success: false,
        message: 'Network error',
      })
    })
  })

  describe('updateUserProfile', () => {
    it('deve retornar sucesso simulado', async () => {
      const { updateUserProfile } = require('../actions')
      const mockFormData = new FormData()
      mockFormData.append('name', 'João Silva')

      const result = await updateUserProfile('user123', mockFormData)

      expect(result).toEqual({
        success: true,
        message: 'Perfil atualizado com sucesso!',
      })
    })
  })
})
