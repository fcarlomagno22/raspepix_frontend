import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileCard from '../profile-card'
import { getUserProfile, updatePhone } from '@/app/profile/actions'

// Mock das ações do perfil
jest.mock('@/app/profile/actions', () => ({
  getUserProfile: jest.fn(),
  updatePhone: jest.fn(),
}))

// Mock do hook useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock do logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
  logUserOperation: jest.fn(),
  logApiError: jest.fn(),
}))

// Mock da configuração de segurança
jest.mock('@/lib/security-config', () => ({
  SECURITY_CONFIG: {
    SECURITY_LEVELS: {
      MEDIUM: 'medium',
      HIGH: 'high',
    },
  },
  maskSensitiveData: jest.fn((data) => data),
}))

const mockUserProfile = {
  id: 'user123',
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '11987654321',
  document: '123.456.789-00',
  birth_date: null,
  gender: null,
  profile_picture: 'https://test.supabase.co/storage/v1/object/public/raspepix/ripo_3x4.png',
  affiliate_code: null,
  is_influencer: false,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_login: null,
  playable_balance: 100.00,
  withdrawable_balance: 50.00,
  affiliate_commission_balance: 25.00,
}

describe('ProfileCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile)
  })

  describe('Renderização inicial', () => {
    it('deve mostrar loading inicialmente', () => {
      ;(getUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}))
      
      render(<ProfileCard />)
      
      expect(screen.getByText('Carregando perfil...')).toBeInTheDocument()
    })

    it('deve renderizar o perfil do usuário após carregar', async () => {
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
        expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
        expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument()
        expect(screen.getByDisplayValue('123.456.789-00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('(11) 98765-4321')).toBeInTheDocument()
      })
    })

    it('deve mostrar erro quando falhar ao carregar perfil', async () => {
      const errorMessage = 'Erro ao carregar dados do perfil'
      ;(getUserProfile as jest.Mock).mockRejectedValue(new Error(errorMessage))
      
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })
  })

  describe('Edição de telefone', () => {
    beforeEach(async () => {
      render(<ProfileCard />)
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
      })
    })

    it('deve ativar modo de edição ao clicar no botão de editar', async () => {
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      
      await userEvent.click(editButton)
      
      expect(screen.getByRole('button', { name: /salvar telefone/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar edição/i })).toBeInTheDocument()
    })

    it('deve permitir digitar novo telefone no modo de edição', async () => {
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '11987654321')
      
      expect(phoneInput).toHaveValue('(11) 98765-4321')
    })

    it('deve validar telefone com menos de 10 dígitos', async () => {
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '119876')
      
      const saveButton = screen.getByRole('button', { name: /salvar telefone/i })
      await userEvent.click(saveButton)
      
      expect(screen.getByText('Telefone deve ter no mínimo 10 dígitos')).toBeInTheDocument()
    })

    it('deve validar telefone com mais de 11 dígitos', async () => {
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '119876543210')
      
      const saveButton = screen.getByRole('button', { name: /salvar telefone/i })
      await userEvent.click(saveButton)
      
      expect(screen.getByText('Telefone deve ter no máximo 11 dígitos')).toBeInTheDocument()
    })

    it('deve validar telefone com caracteres não numéricos', async () => {
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '11abc87654')
      
      const saveButton = screen.getByRole('button', { name: /salvar telefone/i })
      await userEvent.click(saveButton)
      
      expect(screen.getByText('Telefone deve conter apenas números')).toBeInTheDocument()
    })

    it('deve salvar telefone válido com sucesso', async () => {
      const newPhone = '11987654321'
      ;(updatePhone as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Telefone atualizado com sucesso',
        phone: newPhone,
      })
      
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, newPhone)
      
      const saveButton = screen.getByRole('button', { name: /salvar telefone/i })
      await userEvent.click(saveButton)
      
      await waitFor(() => {
        expect(updatePhone).toHaveBeenCalledWith(newPhone)
      })
    })

    it('deve cancelar edição e restaurar valor original', async () => {
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '11987654321')
      
      const cancelButton = screen.getByRole('button', { name: /cancelar edição/i })
      await userEvent.click(cancelButton)
      
      expect(phoneInput).toHaveValue('(11) 98765-4321')
      expect(screen.queryByRole('button', { name: /salvar telefone/i })).not.toBeInTheDocument()
    })

    it('deve mostrar erro quando falhar ao atualizar telefone', async () => {
      const errorMessage = 'Erro ao atualizar telefone'
      ;(updatePhone as jest.Mock).mockResolvedValue({
        success: false,
        message: errorMessage,
      })
      
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '11987654321')
      
      const saveButton = screen.getByRole('button', { name: /salvar telefone/i })
      await userEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })
  })

  describe('Validação de dados', () => {
    it('deve mascarar telefone corretamente', async () => {
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('(11) 98765-4321')).toBeInTheDocument()
      })
    })

    it('deve formatar CPF corretamente', async () => {
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('123.456.789-00')).toBeInTheDocument()
      })
    })
  })

  describe('Tratamento de erros', () => {
    it('deve lidar com erro de rede', async () => {
      const networkError = new Error('Network error')
      ;(getUserProfile as jest.Mock).mockRejectedValue(networkError)
      
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('deve lidar com erro de sessão expirada', async () => {
      const sessionError = new Error('Sessão expirada, faça login novamente')
      ;(getUserProfile as jest.Mock).mockRejectedValue(sessionError)
      
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByText('Sessão expirada, faça login novamente')).toBeInTheDocument()
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para todos os campos', async () => {
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('CPF')).toBeInTheDocument()
        expect(screen.getByLabelText('Telefone')).toBeInTheDocument()
      })
    })

    it('deve ter textos alternativos para botões de ação', async () => {
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByText('Editar telefone')).toBeInTheDocument()
      })
    })
  })

  describe('Estados de loading', () => {
    it('deve mostrar indicador de loading ao salvar telefone', async () => {
      ;(updatePhone as jest.Mock).mockImplementation(() => new Promise(() => {}))
      
      render(<ProfileCard />)
      
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
      })
      
      const editButton = screen.getByRole('button', { name: /editar telefone/i })
      await userEvent.click(editButton)
      
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321')
      await userEvent.clear(phoneInput)
      await userEvent.type(phoneInput, '11987654321')
      
      const saveButton = screen.getByRole('button', { name: /salvar telefone/i })
      await userEvent.click(saveButton)
      
      expect(screen.getByRole('button', { name: /salvar telefone/i })).toBeDisabled()
    })
  })
})
