import { useEffect, useState } from 'react'

interface PriceInputProps {
  sku: string
  value: number | null
  onChange: (value: number | null) => void
}

export function PriceInput({ sku, value, onChange }: PriceInputProps) {
  const [draft, setDraft] = useState(value?.toString() ?? '')

  useEffect(() => {
    setDraft(value?.toString() ?? '')
  }, [value])

  return (
    <input
      className="field field--table"
      data-price-input={sku}
      inputMode="decimal"
      onBlur={() => {
        const normalized = draft.replace(',', '.').trim()
        if (!normalized) {
          onChange(null)
          return
        }

        const parsed = Number(normalized)
        onChange(Number.isFinite(parsed) ? parsed : null)
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') {
          return
        }

        event.preventDefault()
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-price-input]'))
        const index = inputs.findIndex((input) => input.dataset.priceInput === sku)
        const nextInput = inputs[index + 1]

        event.currentTarget.blur()
        nextInput?.focus()
        nextInput?.select()
      }}
      placeholder="0"
      type="text"
      value={draft}
    />
  )
}
