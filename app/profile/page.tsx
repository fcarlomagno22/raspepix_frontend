import ProfileCard from "@/components/profile-card"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-[#0B111B] p-4 pt-16 pb-24 md:pb-12">
        <ProfileCard />
      </div>
    </AuthenticatedLayout>
  )
}
