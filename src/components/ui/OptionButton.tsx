interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] min-w-[44px] rounded-lg border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
        selected
          ? 'border-brand-900 bg-brand-900 text-white'
          : 'border-gray-300 bg-white text-gray-800 hover:border-brand-400 active:bg-brand-50'
      }`}
    >
      {label}
    </button>
  )
}
