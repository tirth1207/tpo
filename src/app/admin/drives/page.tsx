"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuth } from "@/lib/supabase/useSupabaseAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Edit, CheckSquare2, Square, ChevronDownIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Company {
  id: string
  company_name: string
}

interface Drive {
  companies: Company | null
  id: string
  title: string
  description: string
  requirements: string[]
  company_id: string
  skills_required: string[]
  salary_min: number
  salary_max: number
  job_type: string
  location: string
  application_deadline: string
  is_active: boolean
  is_approved: string
}

export default function DriveManagement() {
  const { user } = useAuth()
  const [drives, setDrives] = useState<Drive[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedDrives, setSelectedDrives] = useState<string[]>([])
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [requirementInput, setRequirementInput] = useState("")
  const [newDrive, setNewDrive] = useState<Partial<Drive>>({
    title: "",
    description: "",
    requirements: [],
    skills_required: [],
    salary_min: 0,
    salary_max: 0,
    job_type: "",
    location: "",
    application_deadline: "",
    company_id: "",
  })

  useEffect(() => {
    fetchDrives()
    fetchCompanies()
  }, [])

  const fetchDrives = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        companies:company_id (
          id,
          company_name
        ),
        profiles:posted_by (id, full_name)
      `)
      .order("application_deadline")

    if (error) console.error(error)
    else setDrives(data || [])
  }

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, company_name") // Fixed column name
    if (error) console.error(error)
    else setCompanies(data || [])
  }

  const toggleSelect = (id: string) => {
    setSelectedDrives(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const bulkApproveReject = async (approve: boolean) => {
    if (!selectedDrives.length) return
    const { error } = await supabase
      .from("jobs")
      .update({ is_approved: approve ? "approved" : "rejected" })
      .in("id", selectedDrives)
    if (error) {
      console.error(error)
      alert("Bulk update failed")
    } else {
      setSelectedDrives([])
      fetchDrives()
      alert(`Bulk ${approve ? "Approved" : "Rejected"}!`)
    }
  }

  const approveRejectDrive = async (drive: Drive, approve: boolean) => {
    const { error } = await supabase
      .from("jobs")
      .update({ is_approved: approve ? "approved" : "rejected" })
      .eq("id", drive.id)
    if (error) {
      console.error(error)
      alert("Update failed")
    } else {
      fetchDrives()
      alert(`${approve ? "Approved" : "Rejected"}!`)
    }
  }

  const updateDrive = async (drive: Drive) => {
    const { error } = await supabase
      .from("jobs")
      .update({
        title: drive.title,
        description: drive.description,
        salary_min: drive.salary_min,
        salary_max: drive.salary_max,
      })
      .eq("id", drive.id)
    if (error) {
      console.error(error)
      alert("Update failed")
    } else {
      setEditingDrive(null)
      fetchDrives()
      alert("Drive updated successfully!")
    }
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault()
      setNewDrive({
        ...newDrive,
        skills_required: [...(newDrive.skills_required || []), skillInput.trim()],
      })
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setNewDrive({
      ...newDrive,
      skills_required: (newDrive.skills_required || []).filter(s => s !== skill),
    })
  }

  const handleRequirementKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && requirementInput.trim()) {
      e.preventDefault()
      setNewDrive({
        ...newDrive,
        requirements: [...(newDrive.requirements || []), requirementInput.trim()],
      })
      setRequirementInput("")
    }
  }

  const removeRequirement = (requirement: string) => {
    setNewDrive({
      ...newDrive,
      requirements: (newDrive.requirements || []).filter(r => r !== requirement),
    })
  }

  const createDrive = async () => {
    if (!newDrive.title?.trim() || !newDrive.description?.trim() || !newDrive.company_id || !user?.id) {
      alert("Please fill all required fields.")
      return
    }

    const payload = {
      title: newDrive.title.trim(),
      description: newDrive.description.trim(),
      requirements: newDrive.requirements?.length ? newDrive.requirements : [],
      skills_required: newDrive.skills_required?.length ? newDrive.skills_required : [],
      company_id: newDrive.company_id,
      salary_min: newDrive.salary_min || null,
      salary_max: newDrive.salary_max || null,
      job_type: ["Full-time","Internship","Part-time"].includes(newDrive.job_type || "") ? newDrive.job_type : null,
      location: newDrive.location || null,
      application_deadline: newDrive.application_deadline || null,
      is_active: true,
      posted_by: user.id,
      is_approved: "pending",
    }

    const { error } = await supabase.from("jobs").insert([payload])

    if (error) {
      console.error("Supabase insert error:", error)
      alert("Failed to create drive")
    } else {
      setCreateDialogOpen(false)
      setNewDrive({
        title: "",
        description: "",
        requirements: [],
        skills_required: [],
        salary_min: 0,
        salary_max: 0,
        job_type: "",
        location: "",
        application_deadline: "",
        company_id: "",
      })
      setSkillInput("")
      fetchDrives()
      alert("Drive created successfully!")
    }
  }


  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Drive Management</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Drive
        </Button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <Button
          variant="outline"
          onClick={() => {
            if (selectedDrives.length === drives.length) setSelectedDrives([])
            else setSelectedDrives(drives.map(d => d.id))
          }}
        >
          {selectedDrives.length === drives.length ? (
            <>
              <CheckSquare2 className="mr-2" /> Deselect All
            </>
          ) : (
            <>
              <Square className="mr-2" /> Select All
            </>
          )}
        </Button>

        <Button onClick={() => bulkApproveReject(true)} disabled={!selectedDrives.length}>
          Bulk Approve
        </Button>

        <Button onClick={() => bulkApproveReject(false)} disabled={!selectedDrives.length}>
          Bulk Reject
        </Button>
      </div>

      {/* Drives Grid */}
      {drives.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center text-muted-foreground">
          <p className="text-sm">No drives available yet.</p>
          <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create your first drive
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map(d => (
            <Card key={d.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Checkbox checked={selectedDrives.includes(d.id)} onCheckedChange={() => toggleSelect(d.id)} />
                    <div>
                      <CardTitle className="text-base">{d.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">{d.companies?.company_name || "Company N/A"}</Badge>
                        <Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge>
                        {getApprovalBadge(d.is_approved)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="text-foreground/90">{d.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium text-foreground">Salary</span>
                    <div>₹{d.salary_min} - ₹{d.salary_max}</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Type</span>
                    <div>{d.job_type || "—"}</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Location</span>
                    <div>{d.location || "—"}</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Deadline</span>
                    <div>{d.application_deadline?.split("T")[0] || "—"}</div>
                  </div>
                </div>
                {!!d.skills_required.length && (
                  <div>
                    <span className="font-medium text-foreground">Skills</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {d.skills_required.map(s => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {!!d.requirements.length && (
                  <div>
                    <span className="font-medium text-foreground">Requirements</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {d.requirements.map(r => (
                        <Badge key={r} variant="outline">{r}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="mt-auto flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setEditingDrive(d)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => approveRejectDrive(d, true)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => approveRejectDrive(d, false)}>
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}


      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Drive</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title*</Label>
              <Input
                value={newDrive.title}
                onChange={e => setNewDrive({ ...newDrive, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Job Type</Label>
              <Input
                value={newDrive.job_type}
                onChange={e => setNewDrive({ ...newDrive, job_type: e.target.value })}
              />
            </div>

            <div>
              <Label>Description*</Label>
              <Input
                value={newDrive.description}
                onChange={e => setNewDrive({ ...newDrive, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={newDrive.location}
                onChange={e => setNewDrive({ ...newDrive, location: e.target.value })}
              />
            </div>

            <div>
              <Label>Company*</Label>
              <Select>
                <SelectTrigger className="w-full border rounded-md p-2">
                  {newDrive.company_id
                    ? companies.find(c => c.id === newDrive.company_id)?.company_name
                    : "Select a company"}
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id} onClick={() => setNewDrive({ ...newDrive, company_id: c.id })}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
                
            <div>
              <Label htmlFor="date" className="px-1">
                Application Deadline
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date)
                      setOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Min Salary</Label>
              <Input
                type="number"
                value={newDrive.salary_min}
                onChange={e => setNewDrive({ ...newDrive, salary_min: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Max Salary</Label>
              <Input
                type="number"
                value={newDrive.salary_max}
                onChange={e => setNewDrive({ ...newDrive, salary_max: Number(e.target.value) })}
              />
            </div>


            <div className="md:col-span-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(newDrive.skills_required || []).map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill} <span onClick={() => removeSkill(skill)} className="cursor-pointer">✕</span>
                  </Badge>
                ))}
              </div>
              <Input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Requirements</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(newDrive.requirements || []).map(requirement => (
                  <Badge key={requirement} variant="secondary" className="flex items-center gap-1">
                    {requirement} <span onClick={() => removeRequirement(requirement)} className="cursor-pointer">✕</span>
                  </Badge>
                ))}
              </div>
              <Input
                value={requirementInput}
                onChange={e => setRequirementInput(e.target.value)}
                onKeyDown={handleRequirementKeyDown}
                placeholder="Type a requirement and press Enter"
              />
            </div>

          </div>

          {/* <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDrive}>Create</Button>
          </DialogFooter> */}

            {/* Salary, deadline, posted by remain the same */}
          

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDrive}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
