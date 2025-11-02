"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stepper } from "@/components/ui/stepper"
import { Upload, X, Plus, CheckCircle } from "lucide-react"

export function ProfileCompletion() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>({})
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return setLoading(false)

        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("profile_id", user.id)
          .single()
        console.log("Fetched student data:", data, "Error:", error)

        if (error) {
          console.warn("No student data found:", error.message)
          setStudent({})
          setSkills([])
        } else {
          setStudent(data || {})
          setSkills(data?.skills || [])
        }
      } catch (err) {
        console.error("Error fetching student:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  // ✅ Profile completion logic
  const fields = [
    student.first_name,
    student.last_name,
    student.dob,
    student.phone,
    student.address,
    student.roll_number,
    student.branch,
    student.semester,
    student.cgpa,
    skills.length > 0,
  ]
  const completedFields = fields.filter(Boolean).length
  const completionPercentage = Math.round((completedFields / fields.length) * 100)

  const stages = [
    { id: 1, title: "Personal Info", completed: completionPercentage >= 25 },
    { id: 2, title: "Academic Info", completed: completionPercentage >= 50 },
    { id: 3, title: "Skills & Documents", completed: completionPercentage >= 75 },
    { id: 4, title: "Finalize", completed: completionPercentage === 100 },
  ]

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Progress</CardTitle>
          <CardDescription>Complete all stages to submit your profile for approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />

            <Stepper
              steps={stages.map((s) => s.title)}
              currentStep={stages.filter((s) => s.completed).length + 1}
              className="mt-6"
            />

            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <Badge
                  key={stage.id}
                  variant={stage.completed ? "default" : "outline"}
                  className="flex items-center gap-1"
                >
                  {stage.completed && <CheckCircle className="h-3 w-3" />}
                  {stage.title}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Personal Info */}
            <TabsContent value="personal" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={student.first_name || ""} placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={student.last_name || ""} placeholder="Enter last name" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={student.dob || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={student.phone || ""} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={student.address || ""} placeholder="Enter your address" />
              </div>
            </TabsContent>

            {/* Academic Info */}
            <TabsContent value="academic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input value={student.roll_number || ""} placeholder="Enter roll number" />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select defaultValue={student.branch || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">Computer Science</SelectItem>
                      <SelectItem value="it">Information Technology</SelectItem>
                      <SelectItem value="ece">Electronics & Communication</SelectItem>
                      <SelectItem value="me">Mechanical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select defaultValue={student.semester?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CGPA</Label>
                  <Input value={student.cgpa?.toString() || ""} placeholder="e.g., 8.5" />
                </div>
              </div>
            </TabsContent>

            {/* Skills */}
            <TabsContent value="skills" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Add Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={addSkill} size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Resume (PDF)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button variant="outline">Save Draft</Button>
            <Button disabled={completionPercentage < 100}>
              {completionPercentage < 100 ? "Complete Profile" : "Submit for Approval"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
