"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/profile-form';
import { ProfileHeader } from '@/components/profile-header';
import { api } from '@/services/api';
import type { UserProfile } from './actions';
import AuthenticatedLayout from '@/components/authenticated-layout';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get<UserProfile>('/api/profile');
        setProfile(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          if (err.message.includes("não encontrado")) {
            router.push('/login?from=/profile');
          }
        }
      }
    }

    loadProfile();
  }, [router]);

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8">
          <div className="text-red-500">{error}</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!profile) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8">
          <div>Carregando...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[#0A1118] relative">
        {/* Background com efeito de gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A1118] to-[#0A1118] pointer-events-none" />
        
        {/* Conteúdo */}
        <div className="relative">
          <ProfileHeader 
            name={profile.full_name}
            email={profile.email}
            avatarUrl="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/ripo_3x4.png"
          />
          
          <div className="py-12 pb-32">
            <ProfileForm initialData={profile} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
