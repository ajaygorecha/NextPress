'use client'

import { useState, useTransition } from 'react'
import { updateSidebarWidgets } from '@/lib/actions/settings'

interface Props {
  initial: Record<string, boolean>
}

const WIDGETS = [
  { key: 'categories', label: 'Categories', icon: 'ri-folder-2-line' },
  { key: 'recent_posts', label: 'Recent Posts', icon: 'ri-time-line' },
  { key: 'tags', label: 'Tags', icon: 'ri-price-tag-3-line' },
]

export default function SidebarWidgetSettings({ initial }: Props) {
  const [values, setValues] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function toggle(key: string) {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateSidebarWidgets(values)
      setSaved(true)
    })
  }

  return (
    <div>
      <div className="d-flex flex-column gap-3 mb-4">
        {WIDGETS.map((w) => (
          <div key={w.key} className="sidebar-widget-toggle">
            <div className="d-flex align-items-center gap-2">
              <i className={`${w.icon} sidebar-widget-toggle-icon`} />
              <span className="sidebar-widget-toggle-label">{w.label}</span>
            </div>
            <button
              type="button"
              className={`toggle-switch ${values[w.key] ? 'on' : ''}`}
              onClick={() => toggle(w.key)}
              aria-label={`Toggle ${w.label}`}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-sm"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? (
          <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
        ) : saved ? (
          <><i className="ri-check-line me-1" />Saved</>
        ) : (
          <><i className="ri-save-line me-1" />Save Changes</>
        )}
      </button>
    </div>
  )
}
