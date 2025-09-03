export interface WithdrawalVideo {
  id: string;
  userId: string;
  userName: string;
  videoUrl: string;
  thumbnailUrl: string;
  withdrawalAmount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface TrafficTag {
  id: string;
  platform: "meta" | "tiktok" | "kwai" | "gtm";
  tagId: string;
  pages: string[];
  isActive: boolean;
  lastTested: string;
}

export const mockWithdrawalVideos: WithdrawalVideo[] = [
  {
    id: "1",
    userId: "user123",
    userName: "João Silva",
    videoUrl: "https://example.com/video1.mp4",
    thumbnailUrl: "https://example.com/thumb1.jpg",
    withdrawalAmount: 1500.00,
    status: "pending",
    createdAt: "2024-03-20T10:30:00Z"
  },
  {
    id: "2",
    userId: "user456",
    userName: "Maria Santos",
    videoUrl: "https://example.com/video2.mp4",
    thumbnailUrl: "https://example.com/thumb2.jpg",
    withdrawalAmount: 2300.00,
    status: "pending",
    createdAt: "2024-03-20T09:15:00Z"
  },
  {
    id: "3",
    userId: "user789",
    userName: "Pedro Oliveira",
    videoUrl: "https://example.com/video3.mp4",
    thumbnailUrl: "https://example.com/thumb3.jpg",
    withdrawalAmount: 1800.00,
    status: "approved",
    createdAt: "2024-03-19T15:45:00Z"
  }
];

export const mockTrafficTags: TrafficTag[] = [
  {
    id: "1",
    platform: "meta",
    tagId: "123456789",
    pages: ["/", "/cadastro", "/raspadinha"],
    isActive: true,
    lastTested: "2024-03-20T10:00:00Z"
  },
  {
    id: "2",
    platform: "tiktok",
    tagId: "tiktok_987654",
    pages: ["/", "/cadastro"],
    isActive: true,
    lastTested: "2024-03-20T09:30:00Z"
  },
  {
    id: "3",
    platform: "kwai",
    tagId: "kwai_456789",
    pages: ["/"],
    isActive: false,
    lastTested: "2024-03-19T14:20:00Z"
  },
  {
    id: "4",
    platform: "gtm",
    tagId: "GTM-XXXXX",
    pages: ["all"],
    isActive: true,
    lastTested: "2024-03-20T08:15:00Z"
  }
];

