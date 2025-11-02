"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";

interface Student {
  id: string;
  roll_no: string;
  name: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  department: string;
  cgpa: string;
  semester: string;
  skills: string[];
  resume_url: string;
  address: string;
  dob: string;
}

interface StudentIDCardProps {
  student: Student;
  theme?: "light" | "dark";
}

const StudentIDCard: React.FC<StudentIDCardProps> = ({ student, theme = "light" }) => {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const dividerColor = isDark ? "bg-gray-700" : "bg-black/20";
  const ringColor = isDark ? "ring-white/80" : "ring-gray-700/50";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = (x - centerX) / 20;
    const rotateX = (centerY - y) / 20;

    setTilt({ rotateX, rotateY });
  };

  const resetTilt = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <div
      className="w-80 h-[420px] perspective cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      {/* Outer div handles flip smoothly */}
      <div
        className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
        style={{
          transform: `rotateY(${flipped ? 180 : 0}deg)`,
        }}
      >
        {/* Inner div handles tilt instantly */}
        <div
          className="absolute w-full h-full transform-style-preserve-3d"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          }}
        >
          {/* Front Side */}
          <div
            className={`absolute w-full h-full backface-hidden rounded-xl shadow-xl ring-5 ${ringColor} p-4 ${bgColor} flex flex-col gap-3`}
          >
            <div className="flex gap-3 items-start mt-16">
              <div className="flex-1 space-y-0.5">
                <p className="text-blue-400 text-sm">{student.role}</p>
                <h1 className={`font-semibold text-lg ${textColor}`}>{student.name}</h1>
                <p className={`text-xs ${subTextColor}`}>{student.email}</p>
                <p className={`text-xs ${subTextColor}`}>{student.phone}</p>
              </div>
              <div className="flex-shrink-0">
                <QRCode
                  value={student.roll_no || "XXXX"}
                  size={84}
                  bgColor={isDark ? "#1f2937" : "#ffffff"}
                  fgColor={isDark ? "#ffffff" : "#000000"}
                />
              </div>
            </div>

            <div className={`w-full h-[1px] my-4 ${dividerColor}`} />

            <div className="text-left">
              <p className={`text-sm font-semibold ${textColor}`}>About Me</p>
              <p className={`text-xs ${subTextColor}`}>{student.bio || "No bio yet"}</p>
            </div>

            {student.role?.toLowerCase() === "student" && (
              <>
                <div className={`w-full h-[1px] ${dividerColor} my-4`} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${textColor}`}>Study at</p>
                  <p className={`text-xs ${subTextColor}`}>{student.department } - RCTI</p>
                </div>
              </>
            )}
          </div>

          {/* Back Side */}
          <div
            className={`absolute w-full h-full backface-hidden rounded-xl shadow-xl ring-5 ${ringColor} p-4 ${bgColor} transform rotateY-180 flex flex-col gap-2`}
          >
            <p className={`text-sm font-semibold ${textColor}`}>Personal Info</p>
            <p className={`text-xs ${subTextColor}`}>DOB: {student.dob || "-"}</p>
            <p className={`text-xs ${subTextColor}`}>Address: {student.address || "-"}</p>
            <p className={`text-xs ${subTextColor}`}>CGPA: {student.cgpa || "-"}</p>
            <p className={`text-xs ${subTextColor}`}>Semester: {student.semester || "-"}</p>

            <div className={`w-full h-[1px] my-2 ${dividerColor}`} />

            <p className={`text-sm font-semibold ${textColor}`}>Skills</p>
            <div className="flex flex-wrap gap-1">
              {student.skills.length > 0
                ? student.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 rounded border border-black text-black">{skill}</span>
                  ))
                : <p className={`text-xs ${subTextColor}`}>No skills added</p>}
            </div>
            <div className={`w-full h-[1px] my-4 ${dividerColor}`} />

            {student.resume_url && (
              <p className={`text-xs mt-1 ${subTextColor}`}>
                Resume: <a href={student.resume_url} target="_blank" className="underline">{student.resume_url}</a>
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default StudentIDCard;
