import { useRef, useState } from 'react';
import { matchesAccept } from '../../utils/fileAccept';

/**
 * Drag-and-drop / click-to-browse / folder-select file picker, shared by
 * every admin bulk-upload flow (Offer Publisher's image step; formerly
 * Bulk Import's spreadsheet and image steps too). Extracted here once a
 * second real consumer needed the exact same drag-drop + folder + accept-
 * filtering behavior, rather than copy-pasting a second ~60-line copy.
 */
export default function Dropzone({
  icon: Icon,
  title,
  subtitle,
  onFiles,
  onReject,
  multiple,
  directory,
  disabled,
  accept,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // `accept` only filters the OS browse dialog — a drag-and-dropped file
  // ignores it completely. Without this, dropping (say) a PNG on a
  // spreadsheet-only zone uploaded it just to have the server reject it,
  // which read as a server fault rather than the wrong file.
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const allowed = files.filter((f) => matchesAccept(f, accept));
    const rejected = files.filter((f) => !matchesAccept(f, accept));
    if (rejected.length > 0) {
      onReject?.(rejected);
      if (allowed.length === 0) return;
    }
    onFiles(allowed);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
          : dragging
            ? 'border-[#5B12D6] bg-[#5B12D6]/5'
            : 'border-slate-300 bg-white/60 hover:border-[#5B12D6]/50'
      }`}
    >
      <Icon size={26} className="text-[#5B12D6]" />
      <div className="text-sm font-bold text-slate-700">{title}</div>
      <div className="text-xs text-slate-400 font-medium">{subtitle}</div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        // `directory` is deliberately separate from `multiple`: setting
        // webkitdirectory makes Chromium offer ONLY a folder picker, so
        // tying the two together made it impossible to pick individual
        // files. Folder upload is its own zone in every caller.
        {...(directory ? { webkitdirectory: '', directory: '' } : {})}
        className="hidden"
        disabled={disabled}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
