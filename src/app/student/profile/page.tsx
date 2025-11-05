'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any | null>(null)
  const [faculty, setFaculty] = useState<any | null>(null)
  const [skills, setSkills] = useState<string[]>([])

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/students/my-profile')
        const data = await res.json()
        if (data.student) {
          const studentData = data.student
          setStudent({ ...studentData, branch: studentData.department })
          setSkills(studentData.skills || [])
          console.log(data)
        }
        if (data.faculty) {
          setFaculty(data.faculty)
        }
      } catch (err) {
        console.error('Error fetching student:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (!student) return <div className="text-center py-10">No student data found</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">First Name:</p>
          <p>{student.first_name || '-'}</p>
        </div>
        <div>
          <p className="font-semibold">Last Name:</p>
          <p>{student.last_name || '-'}</p>
        </div>
        <div>
          <p className="font-semibold">Roll Number:</p>
          <p>{student.roll_number || '-'}</p>
        </div>
        <div>
          <p className="font-semibold">Department:</p>
          <p>{student.department || '-'}</p>
        </div>
        <div>
          <p className="font-semibold">Semester:</p>
          <p>{student.semester || '-'}</p>
        </div>
        <div>
          <p className="font-semibold">CGPA:</p>
          <p>{student.cgpa ?? '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Email:</p>
          <p>{student.email || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Phone:</p>
          <p>{student.phone || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Address:</p>
          <p>{student.address || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Date of Birth:</p>
          <p>{student.dob || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Bio:</p>
          <p>{student.bio || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Skills:</p>
          {skills.length > 0 ? (
            <ul className="flex flex-wrap gap-2 mt-1">
              {skills.map((skill, idx) => (
                <li key={idx} className="bg-muted text-foreground border border-primary px-2 py-1 rounded">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p>-</p>
          )}
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Resume:</p>
          {student.resume_url ? (
            <a
              href={student.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Resume
            </a>
          ) : (
            <p>-</p>
          )}
        </div>
      </div>

      {/* Faculty Info Section */}
      {faculty && (
        <div className="mt-10 p-4 border rounded-lg bg-muted border border-muted-900">
          <h2 className="text-2xl font-bold mb-4">Assigned Faculty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Name:</p>
              <p>{faculty.profiles.full_name}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{faculty.profiles.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button
          onClick={() => {
            window.location.href = '/student/profile-completion'
          }}
        >
          Update Profile
        </Button>
      </div>
    </div>
  )
}
