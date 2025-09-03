import {
  maskCPF,
  maskCEP,
  maskDate,
  maskPhone,
  validateCPF,
  validateAge,
  validatePassword,
  validateEmail,
  formatCPF,
} from '../form-utils'

describe('Form Utils', () => {
  describe('maskCPF', () => {
    it('deve mascarar CPF corretamente', () => {
      expect(maskCPF('12345678900')).toBe('123.456.789-00')
      expect(maskCPF('123456789')).toBe('123.456.789')
      expect(maskCPF('123456')).toBe('123.456')
      expect(maskCPF('123')).toBe('123')
      expect(maskCPF('')).toBe('')
    })

    it('deve remover caracteres não numéricos antes de mascarar', () => {
      expect(maskCPF('123.456.789-00')).toBe('123.456.789-00')
      expect(maskCPF('abc123def456ghi789jkl00')).toBe('123.456.789-00')
    })
  })

  describe('maskCEP', () => {
    it('deve mascarar CEP corretamente', () => {
      expect(maskCEP('12345678')).toBe('12345-678')
      expect(maskCEP('12345')).toBe('12345')
      expect(maskCEP('')).toBe('')
    })

    it('deve remover caracteres não numéricos antes de mascarar', () => {
      expect(maskCEP('12345-678')).toBe('12345-678')
      expect(maskCEP('abc123def45ghi678')).toBe('12345-678')
    })
  })

  describe('maskDate', () => {
    it('deve mascarar data corretamente', () => {
      expect(maskDate('01012024')).toBe('01/01/2024')
      expect(maskDate('0101')).toBe('01/01')
      expect(maskDate('01')).toBe('01')
      expect(maskDate('')).toBe('')
    })

    it('deve remover caracteres não numéricos antes de mascarar', () => {
      expect(maskDate('01/01/2024')).toBe('01/01/2024')
      expect(maskDate('abc01def01ghi2024')).toBe('01/01/2024')
    })
  })

  describe('maskPhone', () => {
    it('deve mascarar telefone corretamente', () => {
      expect(maskPhone('11987654321')).toBe('(11) 98765-4321')
      expect(maskPhone('1198765432')).toBe('(11) 98765-432')
      expect(maskPhone('119876')).toBe('(11) 9876')
      expect(maskPhone('11')).toBe('(11')
      expect(maskPhone('')).toBe('')
    })

    it('deve remover caracteres não numéricos antes de mascarar', () => {
      expect(maskPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
      expect(maskPhone('abc11def987ghi65jkl432mno1')).toBe('(11) 98765-4321')
    })
  })

  describe('validateCPF', () => {
    it('deve validar CPFs válidos', () => {
      expect(validateCPF('12345678909')).toBe(true)
      expect(validateCPF('11144477735')).toBe(true)
      expect(validateCPF('52998224725')).toBe(true)
    })

    it('deve rejeitar CPFs inválidos', () => {
      expect(validateCPF('12345678900')).toBe(false) // CPF inválido
      expect(validateCPF('11111111111')).toBe(false) // Todos os dígitos iguais
      expect(validateCPF('123')).toBe(false) // Muito curto
      expect(validateCPF('123456789012')).toBe(false) // Muito longo
      expect(validateCPF('')).toBe(false) // Vazio
    })

    it('deve remover caracteres não numéricos antes de validar', () => {
      expect(validateCPF('123.456.789-09')).toBe(true)
      expect(validateCPF('abc123def456ghi789jkl09')).toBe(true)
    })
  })

  describe('validateAge', () => {
    it('deve validar idades válidas', () => {
      const today = new Date()
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      const validDateString = validDate.toLocaleDateString('pt-BR').split('/').reverse().join('')
      
      expect(validateAge(validDateString)).toBe(true)
    })

    it('deve rejeitar idades inválidas', () => {
      expect(validateAge('')).toBe(false)
      expect(validateAge('123')).toBe(false)
      expect(validateAge('01012000')).toBe(false) // Data muito antiga
      expect(validateAge('01012030')).toBe(false) // Data futura
    })
  })

  describe('validatePassword', () => {
    it('deve validar senhas válidas', () => {
      expect(validatePassword('Senha123!')).toBe(true)
      expect(validatePassword('MyP@ssw0rd')).toBe(true)
      expect(validatePassword('Str0ng#Pass')).toBe(true)
    })

    it('deve rejeitar senhas inválidas', () => {
      expect(validatePassword('senha')).toBe(false) // Sem maiúscula, número e caractere especial
      expect(validatePassword('SENHA123')).toBe(false) // Sem minúscula e caractere especial
      expect(validatePassword('Senha123')).toBe(false) // Sem caractere especial
      expect(validatePassword('Senha!')).toBe(false) // Sem número
      expect(validatePassword('Sen123')).toBe(false) // Muito curta
      expect(validatePassword('')).toBe(false) // Vazia
    })
  })

  describe('validateEmail', () => {
    it('deve validar emails válidos', () => {
      expect(validateEmail('teste@exemplo.com')).toBe(true)
      expect(validateEmail('usuario.nome@dominio.co.uk')).toBe(true)
      expect(validateEmail('teste+tag@exemplo.com')).toBe(true)
    })

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('teste')).toBe(false) // Sem @
      expect(validateEmail('teste@')).toBe(false) // Sem domínio
      expect(validateEmail('@exemplo.com')).toBe(false) // Sem usuário
      expect(validateEmail('teste@exemplo')).toBe(false) // Sem TLD
      expect(validateEmail('')).toBe(false) // Vazio
    })
  })

  describe('formatCPF', () => {
    it('deve ser um alias para maskCPF', () => {
      expect(formatCPF('12345678900')).toBe(maskCPF('12345678900'))
      expect(formatCPF('12345678900')).toBe('123.456.789-00')
    })
  })
})
