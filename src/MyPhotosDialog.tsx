import { useEffect, useState } from 'react'

type MyPhoto = {
  id: string
  public_url: string
  created_at: string
}

type MyPhotosDialogProps = {
  photos: MyPhoto[]
  onClose: () => void
  onDelete: (photoId: string) => Promise<void>
  tr: (en: string, hi: string, bn: string) => string
}

const PAGE_SIZE = 5

// Lists the guest's own uploaded photos as links, five per page. Each link
// opens the full photo in a new browser tab.
export default function MyPhotosDialog({ photos, onClose, onDelete, tr }: MyPhotosDialogProps) {
  const [page, setPage] = useState(0)
  const [deletingId, setDeletingId] = useState('')
  const pageCount = Math.max(1, Math.ceil(photos.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pagePhotos = photos.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const formatUploadTime = (value: string) =>
    new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

  return (
    <div className="my-photos-backdrop" onClick={onClose}>
      <div
        className="my-photos-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-photos-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="my-photos-header">
          <h3 id="my-photos-title">{tr('Your photos', 'आपकी फोटो', 'আপনার ছবি')} ({photos.length})</h3>
          <button type="button" className="my-photos-close" onClick={onClose} aria-label="Close" title={tr('Close', 'बंद करें', 'বন্ধ করুন')}>
            <svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true">
              <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {photos.length === 0 ? (
          <p className="my-photos-empty">{tr('You have not shared any photos yet.', 'आपने अभी तक कोई फोटो साझा नहीं की है।', 'আপনি এখনও কোনো ছবি শেয়ার করেননি।')}</p>
        ) : (
          <ol className="my-photos-list" start={currentPage * PAGE_SIZE + 1}>
            {pagePhotos.map((photo, index) => (
              <li key={photo.id}>
                <a href={photo.public_url} target="_blank" rel="noreferrer">
                  <i className="fas fa-image" />
                  <span>{tr('Photo', 'फोटो', 'ছবি')} {currentPage * PAGE_SIZE + index + 1}</span>
                  <small>{formatUploadTime(photo.created_at)}</small>
                  <i className="fas fa-external-link-alt my-photos-open" />
                </a>
                <button
                  type="button"
                  className="my-photos-delete"
                  disabled={deletingId === photo.id}
                  onClick={async () => {
                    setDeletingId(photo.id)
                    await onDelete(photo.id)
                    setDeletingId('')
                  }}
                  aria-label={`Delete photo ${currentPage * PAGE_SIZE + index + 1}`}
                  title={tr('Delete photo', 'फोटो हटाएं', 'ছবি মুছুন')}
                >
                  {/* Drawn inline so the cross always shows, even if the icon font is slow to load. */}
                  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                    <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
        )}

        {pageCount > 1 && (
          <div className="my-photos-pager">
            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0}>
              <i className="fas fa-chevron-left" /> {tr('Previous', 'पिछला', 'আগের')}
            </button>
            <span>{tr('Page', 'पेज', 'পৃষ্ঠা')} {currentPage + 1} / {pageCount}</span>
            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount - 1}>
              {tr('Next', 'अगला', 'পরের')} <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
