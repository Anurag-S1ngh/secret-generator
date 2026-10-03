"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-0 rounded-xl border border-border px-4 py-3 transition-colors select-none hover:bg-accent/50"
    >
      <span className="text-[13.5px] font-normal text-muted-foreground">
        {label}
      </span>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </Label>
  )
}
