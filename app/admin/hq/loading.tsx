import { TableCell } from "@/components/ui/table"
import { TableBody } from "@/components/ui/table"
import { TableHead } from "@/components/ui/table"
import { TableRow } from "@/components/ui/table"
import { TableHeader } from "@/components/ui/table"
import { Table } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#191F26] text-white">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block w-[--sidebar-width] bg-[#1A2430] p-4">
        <Skeleton className="h-8 w-3/4 mb-6 bg-[#2A333F]" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full bg-[#2A333F]" />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {/* Header Skeleton */}
        <div className="h-16 border-b border-[#366D51] bg-[#1A2430] flex items-center justify-between px-4 md:hidden">
          <Skeleton className="h-8 w-32 bg-[#2A333F]" />
          <Skeleton className="h-8 w-8 rounded-full bg-[#2A333F]" />
        </div>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64 bg-[#2A333F]" />
            <Skeleton className="h-10 w-32 bg-[#9FFF00]/20" />
          </div>

          <div className="rounded-md border border-[#366D51] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#1A2430]">
                <TableRow className="border-b border-[#366D51]">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableHead key={i} className="text-center">
                      <Skeleton className="h-4 w-24 mx-auto bg-[#2A333F]" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#232A34] divide-y divide-[#366D51]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-[#366D51]">
                    <TableCell className="py-2">
                      <Skeleton className="h-[70px] w-[40px] mx-auto rounded-sm bg-[#2A333F]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48 mx-auto bg-[#2A333F]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 mx-auto bg-[#2A333F]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 mx-auto rounded-full bg-[#2A333F]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 mx-auto rounded-full bg-[#2A333F]" />
                    </TableCell>
                    <TableCell className="flex items-center justify-center space-x-2 py-2">
                      <Skeleton className="h-8 w-8 rounded-full bg-[#2A333F]" />
                      <Skeleton className="h-8 w-8 rounded-full bg-[#2A333F]" />
                      <Skeleton className="h-8 w-8 rounded-full bg-[#2A333F]" />
                      <Skeleton className="h-8 w-8 rounded-full bg-[#2A333F]" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  )
}
