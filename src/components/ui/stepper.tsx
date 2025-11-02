"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary bg-background",
                    isUpcoming && "border-muted-foreground text-muted-foreground bg-background"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs text-center max-w-20",
                    isCompleted && "text-primary font-medium",
                    isCurrent && "text-primary font-medium",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-muted-foreground"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
