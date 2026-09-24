"use client"

import * as React from "react"
import { GigWizard } from "@/components/dashboard/gigs/GigWizard"

export default function CreateGigPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-[500px] w-full flex items-center justify-center text-xs text-[#6B6B7B]">
          Loading gig wizard...
        </div>
      }
    >
      <GigWizard />
    </React.Suspense>
  )
}
