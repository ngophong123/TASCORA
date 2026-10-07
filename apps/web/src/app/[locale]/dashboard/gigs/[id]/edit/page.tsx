"use client"
import { useParams } from "next/navigation"
import { GigWizard } from "@/components/dashboard/gigs/GigWizard"
export default function EditServicePage() {
  const params = useParams()
  return <GigWizard serviceId={String(params.id)} />
}
