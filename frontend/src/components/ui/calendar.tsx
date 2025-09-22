import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

type SingleCalendarProps = {
  selected?: Date
  onSelect?: (date?: Date) => void
  className?: string
}

export function Calendar({ className, selected, onSelect }: SingleCalendarProps) {
  return (
    <DayPicker
      className={className}
      mode="single"
      selected={selected}
      onSelect={onSelect as any}
    />
  )
}
