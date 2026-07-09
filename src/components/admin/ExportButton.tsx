'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/export';

interface ExportButtonProps {
  filename: string;
  csvHeaders: string[];
  csvRows: string[][];
  pdfTitle?: string;
  pdfElementId?: string;
}

export function ExportButton({ filename, csvHeaders, csvRows, pdfTitle, pdfElementId }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCsv = () => {
    exportToCsv(filename, csvHeaders, csvRows);
    setOpen(false);
  };

  const handlePdf = async () => {
    if (!pdfElementId) return;
    setPdfLoading(true);
    try {
      const { exportToPdf } = await import('@/lib/admin/export');
      await exportToPdf(pdfTitle || filename, pdfElementId);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setPdfLoading(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={pdfLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4 text-[#38A3F1]" />
        <span>Exportar</span>
        <ChevronDown className="w-3 h-3 text-[#93B8D4]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E8F3FD] rounded-lg shadow-lg z-20 py-1">
          <button
            onClick={handleCsv}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1D9E75]" />
            Exportar CSV
          </button>
          {pdfElementId && (
            <button
              onClick={handlePdf}
              disabled={pdfLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-red-500" />
              {pdfLoading ? 'Generando PDF...' : 'Exportar PDF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
