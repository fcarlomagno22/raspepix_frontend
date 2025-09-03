"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockWithdrawalVideos, WithdrawalVideo } from "@/lib/mock-marketing-data";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Check, X } from "lucide-react";

export function VideoModeration() {
  const [videos, setVideos] = useState<WithdrawalVideo[]>(mockWithdrawalVideos);
  const [selectedVideo, setSelectedVideo] = useState<WithdrawalVideo | null>(null);

  const handleApprove = (videoId: string) => {
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, status: "approved" } : video
    ));
    toast.success("Vídeo aprovado com sucesso!");
  };

  const handleReject = (videoId: string) => {
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, status: "rejected" } : video
    ));
    toast.success("Vídeo rejeitado com sucesso!");
  };

  const formatName = (fullName: string) => {
    const names = fullName.split(" ");
    if (names.length > 1) {
      return `${names[0]} ${names[names.length - 1][0]}.`;
    }
    return names[0];
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="rounded-md border border-[#366D51] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1A2430]">
              <TableRow className="border-[#366D51]">
                <TableHead className="text-white text-center">Vídeo</TableHead>
                <TableHead className="text-white text-center">Cliente</TableHead>
                <TableHead className="text-white text-center">Valor do Saque</TableHead>
                <TableHead className="text-white text-center">Data do Prêmio</TableHead>
                <TableHead className="text-white text-center">Status</TableHead>
                <TableHead className="text-white text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#232D3F] divide-y divide-[#366D51]">
              {videos.map((video) => (
                <TableRow key={video.id} className="hover:bg-[#2A3547] transition-colors">
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-[#9FFF00]/10"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="w-16 h-12 bg-[#0D1117] rounded flex items-center justify-center">
                        <Play className="w-6 h-6 text-[#9FFF00]" />
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium text-white text-center text-xs">
                    {formatName(video.userName)}
                  </TableCell>
                  <TableCell className="text-gray-300 text-xs text-center">
                    R$ {video.withdrawalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-gray-300 text-xs text-center">
                    {new Date(video.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={
                      video.status === "approved" ? "text-[#9FFF00]" :
                      video.status === "rejected" ? "text-red-400" :
                      "text-yellow-400"
                    }>
                      {video.status === "approved" ? "Aprovado" :
                       video.status === "rejected" ? "Rejeitado" :
                       "Pendente"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {video.status === "pending" && (
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(video.id)}
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(video.id)}
                          className="text-green-500 hover:bg-green-500/10 hover:text-green-400"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="bg-[#0D1117] border-[#9FFF00]/10 text-white max-w-4xl">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video
              src={selectedVideo?.videoUrl}
              controls
              className="w-full h-full"
              autoPlay
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}