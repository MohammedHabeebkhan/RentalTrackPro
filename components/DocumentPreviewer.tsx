
import React from 'react';
import { X, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Theme } from '../types';

interface DocumentPreviewerProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  theme: Theme;
}

const DocumentPreviewer: React.FC<DocumentPreviewerProps> = ({ isOpen, onClose, url, title, theme }) => {
  if (!isOpen) return null;

  // Cloudinary PDFs often have .pdf extension or 'pdf' in the URL structure
  const isPDF = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdf/');
  
  const modalBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`${modalBg} w-full max-w-6xl h-[88vh] rounded-[3rem] overflow-hidden shadow-3xl flex flex-col border`}>
        <div className={`px-8 py-5 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <h3 className={`font-black text-sm ${textColor}`}>{title}</h3>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Appseonit Secure Vault</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
              <ExternalLink size={20} />
            </a>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-hidden flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
          {isPDF ? (
            <div className="w-full h-full relative group">
              <iframe 
                src={`${url}#toolbar=1`} 
                className="w-full h-full border-none" 
                title={title}
                loading="lazy"
              />
              {/* Fallback overlay if iframe fails or is blocked */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 flex items-center justify-center">
                 <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <AlertCircle className="text-indigo-500" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">PDF Interactive Mode Active</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-10 flex items-center justify-center h-full">
               <img 
                 src={url} 
                 alt={title} 
                 className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl border-4 border-white" 
                 onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600?text=Preview+Unavailable';
                 }}
               />
            </div>
          )}
        </div>

        <div className={`px-8 py-5 border-t flex justify-between items-center ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {isPDF ? 'PDF Document Stream' : 'Raster Asset View'}
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = url;
                link.download = title;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }} 
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Download size={18} /> Download Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewer;
