import AdminLoginForm from "@/components/admin-login-form"
import LoginLeftPanel from "@/components/login-left-panel"
import { ThemeProvider } from "@/components/theme-provider"

export default function AdminLoginPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <main className="min-h-screen flex items-center justify-center p-4 md:p-0">
        <div className="w-full max-w-4xl md:grid md:grid-cols-2 md:min-h-screen md:max-w-none">
          {/* Left Panel - Visible only on medium and larger screens */}
          <div className="hidden md:flex">
            <LoginLeftPanel />
          </div>
          {/* Right Panel - Admin Login Form */}
          <div className="flex items-center justify-center p-4 md:p-8 bg-[#181f27]">
            <AdminLoginForm />
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}
