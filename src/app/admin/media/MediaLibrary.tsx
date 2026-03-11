'use client'

import { useState, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FileObject {
  name: string
  id: string
  created_at: string
  metadata: { size: number; mimetype: string }
}

interface Props {
  files: FileObject[]
  supabaseUrl: string
}

function getPublicUrl(supabaseUrl: string, name: string) {
  return `${supabaseUrl}/storage/v1/object/public/media/${name}`
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function MediaLibrary({ files, supabaseUrl }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [preview, setPreview] = useState<FileObject | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadFiles = e.target.files
    if (!uploadFiles || uploadFiles.length === 0) return

    setUploading(true)
    const supabase = createClient()

    for (const file of Array.from(uploadFiles)) {
      const ext = file.name.split('.').pop()
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      await supabase.storage.from('media').upload(name, file)
    }

    setUploading(false)
    router.refresh()
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    const supabase = createClient()
    await supabase.storage.from('media').remove([name])
    router.refresh()
  }

  function handleCopy(file: FileObject) {
    const url = getPublicUrl(supabaseUrl, file.name)
    navigator.clipboard.writeText(url)
    setCopiedId(file.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isImage = (mime: string) => mime?.startsWith('image/')
  const isVideo = (mime: string) => mime?.startsWith('video/')

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="text-muted small">{files.length} file{files.length !== 1 ? 's' : ''}</div>
        <button
          className="btn btn-primary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Uploading...
            </>
          ) : (
            <>
              <i className="ri-upload-cloud-line me-2" />
              Upload Files
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="d-none"
          onChange={handleUpload}
        />
      </div>

      {files.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="ri-image-line" style={{ fontSize: '3rem' }} />
          <p className="mt-2">No media files yet. Upload your first file.</p>
        </div>
      ) : (
        <div className="media-grid">
          {files.map((file) => {
            const url = getPublicUrl(supabaseUrl, file.name)
            const mime = file.metadata?.mimetype || ''

            return (
              <div key={file.id} className="media-item">
                {isImage(mime) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={file.name} onClick={() => setPreview(file)} />
                ) : isVideo(mime) ? (
                  <video src={url} muted onClick={() => setPreview(file)} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-light"
                    style={{ height: 120 }}>
                    <i className="ri-file-line" style={{ fontSize: '2rem', color: '#aaa' }} />
                  </div>
                )}
                <div className="media-actions">
                  <button onClick={() => handleCopy(file)} title="Copy URL">
                    {copiedId === file.id ? <i className="ri-check-line" /> : <i className="ri-clipboard-line" />}
                  </button>
                  <button onClick={() => handleDelete(file.name)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
                <div className="media-name" title={file.name}>{file.name}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setPreview(null)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title text-truncate">{preview.name}</h6>
                <button className="btn-close" onClick={() => setPreview(null)} />
              </div>
              <div className="modal-body text-center p-2">
                {preview.metadata?.mimetype?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getPublicUrl(supabaseUrl, preview.name)}
                    alt={preview.name}
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  />
                ) : (
                  <video
                    src={getPublicUrl(supabaseUrl, preview.name)}
                    controls
                    style={{ maxWidth: '100%' }}
                  />
                )}
              </div>
              <div className="modal-footer">
                <small className="text-muted me-auto">
                  {formatBytes(preview.metadata?.size || 0)}
                </small>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleCopy(preview)}
                >
                  {copiedId === preview.id ? 'Copied!' : 'Copy URL'}
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => {
                  handleDelete(preview.name)
                  setPreview(null)
                }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
