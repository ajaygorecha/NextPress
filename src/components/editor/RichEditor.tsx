'use client'

import { useRef, useCallback } from 'react'

interface Props {
  name: string
  defaultValue?: string
}

export default function RichEditor({ name, defaultValue = '' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const hiddenRef = useRef<HTMLInputElement>(null)

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    syncContent()
  }, [])

  const syncContent = () => {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) exec('createLink', url)
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) exec('insertImage', url)
  }

  const tools = [
    { icon: 'ri-bold', cmd: 'bold', title: 'Bold' },
    { icon: 'ri-italic', cmd: 'italic', title: 'Italic' },
    { icon: 'ri-underline', cmd: 'underline', title: 'Underline' },
    { icon: 'ri-strikethrough', cmd: 'strikeThrough', title: 'Strikethrough' },
  ]

  const headingTools = [
    { label: 'H2', cmd: 'formatBlock', val: 'h2' },
    { label: 'H3', cmd: 'formatBlock', val: 'h3' },
    { label: 'P', cmd: 'formatBlock', val: 'p' },
  ]

  const listTools = [
    { icon: 'ri-list-unordered', cmd: 'insertUnorderedList', title: 'Bullet List' },
    { icon: 'ri-list-ordered', cmd: 'insertOrderedList', title: 'Numbered List' },
  ]

  const alignTools = [
    { icon: 'ri-align-left', cmd: 'justifyLeft', title: 'Align Left' },
    { icon: 'ri-align-center', cmd: 'justifyCenter', title: 'Center' },
    { icon: 'ri-align-right', cmd: 'justifyRight', title: 'Align Right' },
  ]

  return (
    <div>
      <div className="editor-toolbar">
        {tools.map((t) => (
          <button key={t.cmd} type="button" title={t.title} onClick={() => exec(t.cmd)}>
            <i className={t.icon} />
          </button>
        ))}
        <span className="border-start mx-1" />
        {headingTools.map((t) => (
          <button key={t.val} type="button" onClick={() => exec(t.cmd, t.val)}>
            {t.label}
          </button>
        ))}
        <span className="border-start mx-1" />
        {listTools.map((t) => (
          <button key={t.cmd} type="button" title={t.title} onClick={() => exec(t.cmd)}>
            <i className={t.icon} />
          </button>
        ))}
        <span className="border-start mx-1" />
        {alignTools.map((t) => (
          <button key={t.cmd} type="button" title={t.title} onClick={() => exec(t.cmd)}>
            <i className={t.icon} />
          </button>
        ))}
        <span className="border-start mx-1" />
        <button type="button" title="Link" onClick={insertLink}>
          <i className="ri-link" />
        </button>
        <button type="button" title="Image" onClick={insertImage}>
          <i className="ri-image-add-line" />
        </button>
        <span className="border-start mx-1" />
        <button type="button" title="Undo" onClick={() => exec('undo')}>
          <i className="ri-arrow-go-back-line" />
        </button>
        <button type="button" title="Redo" onClick={() => exec('redo')}>
          <i className="ri-arrow-go-forward-line" />
        </button>
      </div>

      <div
        ref={editorRef}
        className="editor-area"
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        dangerouslySetInnerHTML={{ __html: defaultValue }}
      />

      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  )
}
