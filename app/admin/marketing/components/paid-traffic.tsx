"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTrafficTags, TrafficTag } from "@/lib/mock-marketing-data";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function PaidTraffic() {
  const [tags, setTags] = useState<TrafficTag[]>(mockTrafficTags);

  const handleTagUpdate = (tagId: string, updates: Partial<TrafficTag>) => {
    setTags(tags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    ));
    toast.success("Tag atualizada com sucesso!");
  };

  const testConnection = async (platform: TrafficTag["platform"]) => {
    toast.loading("Testando conexão...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`Conexão com ${platform.toUpperCase()} testada com sucesso!`);
  };

  const getPlatformName = (platform: TrafficTag["platform"]) => {
    switch (platform) {
      case "meta":
        return "Meta (Facebook)";
      case "tiktok":
        return "TikTok";
      case "kwai":
        return "Kwai";
      case "gtm":
        return "Google Tag Manager";
      default:
        return platform;
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="grid gap-4">
        {tags.map((tag) => (
          <Card key={tag.id} className="p-6 bg-[#131B24] border-[#9FFF00]/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    {getPlatformName(tag.platform)}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Último teste: {new Date(tag.lastTested).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Switch
                  checked={tag.isActive}
                  onCheckedChange={(checked) => handleTagUpdate(tag.id, { isActive: checked })}
                  className="data-[state=checked]:bg-[#9FFF00]"
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">
                    ID da Tag
                  </label>
                  <Input
                    value={tag.tagId}
                    onChange={(e) => handleTagUpdate(tag.id, { tagId: e.target.value })}
                    placeholder={`ID da tag ${getPlatformName(tag.platform)}`}
                    className="bg-[#0D1117] border-[#9FFF00]/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">
                    Páginas Ativas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tag.pages.map((page) => (
                      <Badge 
                        key={page}
                        className="bg-[#9FFF00]/10 text-[#9FFF00] hover:bg-[#9FFF00]/20"
                      >
                        {page}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => testConnection(tag.platform)}
                    className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10"
                  >
                    Testar Conexão
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}