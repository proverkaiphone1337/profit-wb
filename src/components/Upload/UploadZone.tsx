import { FileArchive, FileSpreadsheet, LoaderCircle, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'

interface UploadZoneProps {
  isLoading: boolean
  onFileSelected: (file: File) => void
}

export function UploadZone({ isLoading, onFileSelected }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <section className="upload-card">
      <div
        className={`upload-dropzone ${isDragging ? 'is-dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
      >
        <div className="upload-dropzone__icon">
          {isLoading ? <LoaderCircle className="spin" size={34} /> : <UploadCloud size={34} />}
        </div>
        <h2>Перетащите weekly-отчет WB сюда</h2>
        <p>
          Приложение распакует `.zip`, прочитает `Sheet1`, соберет SKU-аналитику и позволит сразу
          ввести закупочные цены.
        </p>
        <div className="upload-dropzone__pills">
          <span>
            <FileSpreadsheet size={16} />
            `.xlsx`
          </span>
          <span>
            <FileArchive size={16} />
            `.zip`
          </span>
        </div>

        <button className="button button--primary" disabled={isLoading} type="button">
          Выбрать файл
        </button>
      </div>

      <input
        ref={inputRef}
        accept=".xlsx,.zip"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
        type="file"
      />
    </section>
  )
}
