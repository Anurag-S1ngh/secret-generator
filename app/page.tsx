"use client"

import { useCallback, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ToggleRow } from "@/components/toggle-row"
import {
  buildCharset,
  clampLength,
  makeSecret,
  DEFAULT_LENGTH,
  MIN_LENGTH,
  MAX_LENGTH,
} from "@/lib/secret"

export default function Page() {
  const [length, setLength] = useState(DEFAULT_LENGTH)
  const [includeNumbers, setIncludeNumbers] = useState(false)
  const [includeSymbols, setIncludeSymbols] = useState(false)
  const [secret, setSecret] = useState("")
  const [copied, setCopied] = useState(false)

  const charset = buildCharset(includeNumbers, includeSymbols)

  const regenerate = useCallback((len: number, chars: string) => {
    setSecret(makeSecret(len, chars))
    setCopied(false)
  }, [])

  // Seed after hydration so the server-rendered markup and the client agree.
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      regenerate(DEFAULT_LENGTH, buildCharset(false, false))
    )
    return () => cancelAnimationFrame(frame)
  }, [regenerate])

  const onLengthChange = (next: number) => {
    const clamped = clampLength(next)
    setLength(clamped)
    regenerate(clamped, charset)
  }

  const onToggleNumbers = (checked: boolean) => {
    setIncludeNumbers(checked)
    regenerate(length, buildCharset(checked, includeSymbols))
  }

  const onToggleSymbols = (checked: boolean) => {
    setIncludeSymbols(checked)
    regenerate(length, buildCharset(includeNumbers, checked))
  }

  const copy = useCallback(async () => {
    if (!secret) return
    try {
      await navigator.clipboard.writeText(secret)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = secret
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [secret])

  // Enter copies, Space generates. Skipped while an interactive element has
  // focus so native behavior (typing, button activation) still works.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName ?? ""
      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tag)
      ) {
        return
      }

      if (e.key === "Enter") {
        e.preventDefault()
        void copy()
      } else if (e.key === " ") {
        e.preventDefault()
        regenerate(length, charset)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [copy, length, charset, regenerate])

  return (
    <main className="flex min-h-svh justify-center bg-background px-6 py-20 text-foreground antialiased">
      <div className="w-full max-w-xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight uppercase">
          Secret generator
        </h1>
        <p className="mt-1 text-sm text-primary/50">
          Runs entirely on your device. Nothing is ever sent anywhere.
        </p>

        <div className="group relative mt-12 min-h-24 rounded-xl border border-none bg-muted p-5 font-mono text-[15px] leading-relaxed break-all">
          {secret || "…"}
          <Button
            variant="outline"
            size="icon-lg"
            onClick={copy}
            aria-label={copied ? "Copied to clipboard" : "Copy secret"}
            title={copied ? "Copied" : "Copy"}
            className={`absolute top-3 right-3 bg-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 ${
              copied ? "text-primary opacity-100" : "text-muted-foreground"
            }`}
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden
            />
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <Label
            htmlFor="length"
            className="shrink-0 text-[13px] font-normal text-muted-foreground"
          >
            Length
          </Label>
          <Slider
            value={length}
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            onValueChange={(v) => onLengthChange(Number(v))}
            aria-label="Secret length"
            className="flex-1 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-primary"
          />
          <Input
            id="length"
            type="number"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={length}
            onChange={(e) => onLengthChange(Number(e.target.value))}
            aria-label="Secret length value"
            className="w-12 shrink-0 [appearance:textfield] border-none bg-muted px-1 text-center text-primary/60 ring-0 outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <ToggleRow
            id="include-numbers"
            label="Include numbers"
            checked={includeNumbers}
            onCheckedChange={onToggleNumbers}
          />
          <ToggleRow
            id="include-symbols"
            label="Include special characters"
            checked={includeSymbols}
            onCheckedChange={onToggleSymbols}
          />
        </div>

        <div className="mt-8 flex gap-2">
          <Button
            size="lg"
            onClick={() => regenerate(length, charset)}
            className="flex-1 rounded-xl"
          >
            Generate new secret
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={copy}
            className="flex-1 rounded-xl"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              size={16}
              strokeWidth={1.8}
              data-icon="inline-start"
              aria-hidden
            />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
              Enter
            </kbd>
            Copy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
              Space
            </kbd>
            Generate
          </span>
        </div>
      </div>
    </main>
  )
}
