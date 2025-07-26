import PasswordRecoveryForm from "@/components/password-recovery-form"
import { ThemeProvider } from "@/components/theme-provider"

export default function RecuperarSenhaPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <main className="min-h-screen bg-[#181f27] flex flex-col items-center justify-center p-4 md:p-0">
        <PasswordRecoveryForm />
      </main>
    </ThemeProvider>
  )
}
