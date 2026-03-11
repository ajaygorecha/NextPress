'use client'

import { useState } from 'react'

interface Props {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const encoded = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
  }

  const platforms = [
    {
      name: 'X',
      icon: 'ri-twitter-x-line',
      href: `https://x.com/intent/tweet?text=${encoded.title}&url=${encoded.url}`,
      color: '#000',
    },
    {
      name: 'Facebook',
      icon: 'ri-facebook-fill',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`,
      color: '#1877f2',
    },
    {
      name: 'LinkedIn',
      icon: 'ri-linkedin-fill',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`,
      color: '#0a66c2',
    },
    {
      name: 'WhatsApp',
      icon: 'ri-whatsapp-line',
      href: `https://api.whatsapp.com/send?text=${encoded.title}%20${encoded.url}`,
      color: '#25d366',
    },
  ]

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="share-bar">
      <span className="share-label">
        <i className="ri-share-line me-1" />
        Share
      </span>
      <div className="share-buttons">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
            title={`Share on ${p.name}`}
            style={{ '--share-color': p.color } as React.CSSProperties}
          >
            <i className={p.icon} />
          </a>
        ))}
        <button
          className={`share-btn share-btn--copy ${copied ? 'copied' : ''}`}
          onClick={copyLink}
          title="Copy link"
        >
          <i className={copied ? 'ri-check-line' : 'ri-link'} />
        </button>
      </div>
    </div>
  )
}
