"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeaderMobile from "@/components/admin/admin-header-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoModeration } from "./components/video-moderation";
import { PaidTraffic } from "./components/paid-traffic";
import { useAuth } from "@/hooks/use-auth";

export default function MarketingPage() {
  useAuth(true); // Adiciona verificação de autenticação de admin
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 lg:ml-[240px]">
        <AdminHeaderMobile onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 mt-[60px] lg:mt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Marketing</h1>
          </div>

          <div className="bg-[#1A2430] rounded-lg p-6">
            <Tabs defaultValue="video-moderation" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#131B24] border-[#9FFF00]/10">
                <TabsTrigger 
                  value="video-moderation"
                  className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black"
                >
                  Moderação de Vídeos
                </TabsTrigger>
                <TabsTrigger 
                  value="paid-traffic"
                  className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black"
                >
                  Tráfego Pago
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="video-moderation">
                <VideoModeration />
              </TabsContent>
              
              <TabsContent value="paid-traffic">
                <PaidTraffic />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}