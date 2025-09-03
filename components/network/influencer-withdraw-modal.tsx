"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Building2, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useInfluencerDashboard } from "@/hooks/use-influencer-dashboard"
import { useToast } from "@/hooks/use-toast"

interface InfluencerWithdrawModalProps {
  open: boolean
  onClose: () => void
}

export function InfluencerWithdrawModal({ open, onClose }: InfluencerWithdrawModalProps) {
  const [hasCompany, setHasCompany] = useState(false)
  const [step, setStep] = useState<"company" | "withdraw" | "confirmation">("company")
  const { data: dashboardData, isLoading: isDashboardLoading } = useInfluencerDashboard()
  const { toast } = useToast()
  
  // Exemplo de estado para os dados da empresa
  const [companyData, setCompanyData] = useState({
    cnpj: "",
    razaoSocial: "",
  })

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  // Função para formatar número de telefone
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const [withdrawData, setWithdrawData] = useState({
    pixKeyType: "",
    pixKey: "",
    amount: 0,
    invoice: null as File | null,
  })

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasCompany(true)
    setStep("withdraw")
  }

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verifica se o valor do saque é maior que o saldo disponível
    if (withdrawData.amount > (dashboardData?.saldo_disponivel || 0)) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: "Você não possui saldo suficiente para realizar este saque.",
      })
      return
    }
    
    setStep("confirmation")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E2530] text-white border-gray-700 sm:max-w-[425px] mx-auto w-[90%] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {
              step === "company" ? "Cadastro da Empresa" :
              step === "withdraw" ? "Realizar Saque" :
              "Confirmação do Saque"
            }
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "company" && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleCompanySubmit}
              className="space-y-4"
            >
              <Alert className="bg-yellow-500/20 text-yellow-200 border-yellow-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sua empresa precisa ter o CNAE 7319-0/02 – Promoção de vendas
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">CNPJ</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={companyData.cnpj}
                    onChange={(e) => setCompanyData({ ...companyData, cnpj: formatCNPJ(e.target.value) })}
                    className="bg-gray-800 border-gray-700 pl-10"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Razão Social</label>
                <Input
                  value={companyData.razaoSocial}
                  onChange={(e) => setCompanyData({ ...companyData, razaoSocial: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Nome da sua empresa"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#9ffe00] text-[#191F26] hover:bg-[#8FEF00]"
              >
                Continuar
              </Button>
            </motion.form>
          )}

          {step === "withdraw" && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleWithdrawSubmit}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Tipo de Chave PIX</label>
                  <Select
                    value={withdrawData.pixKeyType}
                    onValueChange={(value) => setWithdrawData({ ...withdrawData, pixKeyType: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione o tipo de chave" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Chave PIX</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={withdrawData.pixKey}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (withdrawData.pixKeyType === "telefone") {
                          value = formatPhoneNumber(value);
                        }
                        setWithdrawData({ ...withdrawData, pixKey: value });
                      }}
                      className="bg-gray-800 border-gray-700 pl-10"
                      placeholder={
                        withdrawData.pixKeyType === "cnpj" ? "00.000.000/0000-00" :
                        withdrawData.pixKeyType === "email" ? "exemplo@email.com" :
                        withdrawData.pixKeyType === "telefone" ? "(00) 00000-0000" :
                        withdrawData.pixKeyType === "aleatoria" ? "Chave aleatória" :
                        "Selecione o tipo de chave primeiro"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Valor do Saque</label>
                <div>
                  <CurrencyInput
                    value={withdrawData.amount}
                    onChange={(value) => setWithdrawData({ ...withdrawData, amount: value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Saldo disponível: {isDashboardLoading ? "..." : `R$ ${(dashboardData?.saldo_disponivel || 0).toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nota Fiscal</label>
                <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setWithdrawData({ ...withdrawData, invoice: file })
                      }
                    }}
                    className="hidden"
                    id="invoice-upload"
                  />
                  <label
                    htmlFor="invoice-upload"
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <div className="bg-gray-700 rounded-full p-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">
                      {withdrawData.invoice ? withdrawData.invoice.name : "Clique para anexar a nota fiscal"}
                    </span>
                  </label>
                </div>
              </div>

              <Button
                disabled={!withdrawData.invoice}
                type="submit"
                className="w-full bg-[#9ffe00] text-[#191F26] hover:bg-[#8FEF00]"
              >
                Continuar
              </Button>
            </motion.form>
          )}

          {step === "confirmation" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Alert className="bg-[#9ffe00]/20 text-[#9ffe00] border-[#9ffe00]/50">
                <AlertDescription className="text-center">
                  Recebemos sua solicitação de saque! Em até 3 dias úteis iremos conferir a nota fiscal e realizar o pagamento. 
                  Caso seja necessário algum ajuste, nossa equipe entrará em contato.
                </AlertDescription>
              </Alert>
              <Button
                onClick={onClose}
                className="w-full bg-[#9ffe00] text-[#191F26] hover:bg-[#8FEF00]"
              >
                Fechar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}