  'use client';

  import React, { useState, useEffect, useRef } from 'react';
  import { useRouter } from 'next/navigation';
  import api from '@/lib/axiosInstance';
  import { getApiUrl, ensureArray } from '@/lib/api';
  import { clearSession, getSession, isAdminRole } from '@/lib/auth';

  // ----------------------------------------------------------------------
  // KHWARIZMI UI SYSTEM - TACTILE 3D MODERN COMPONENTS (PORTED FROM SVELTE)
  // Reference: https://khwarizmi-ui.khwarizmi.workers.dev/
  // ----------------------------------------------------------------------

  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning' | 'sky';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children?: React.ReactNode;
  }

  function KhwarizmiButton({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    children,
    ...rest
  }: ButtonProps) {
    const base =
      'inline-flex items-center justify-center font-black transition-all duration-150 cursor-pointer select-none border-2';

    const variants = {
      primary:
        'bg-gradient-to-b from-emerald-400 to-emerald-500 text-white border-emerald-600 shadow-[0_4px_0_0_#047857] active:translate-y-1 active:shadow-none hover:from-emerald-300 hover:to-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:shadow-none disabled:cursor-not-allowed',
      secondary:
        'bg-white text-slate-700 border-slate-200 shadow-[0_3px_0_0_#cbd5e1] active:translate-y-0.75 active:shadow-none hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed',
      danger:
        'bg-gradient-to-b from-rose-400 to-rose-500 text-white border-rose-600 shadow-[0_4px_0_0_#be123c] active:translate-y-1 active:shadow-none hover:from-rose-300 hover:to-rose-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:shadow-none disabled:cursor-not-allowed',
      warning:
        'bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 border-amber-600 shadow-[0_4px_0_0_#b45309] active:translate-y-1 active:shadow-none hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed',
      sky:
        'bg-gradient-to-b from-sky-400 to-sky-500 text-white border-sky-600 shadow-[0_4px_0_0_#0369a1] active:translate-y-1 active:shadow-none hover:from-sky-300 hover:to-sky-400 disabled:opacity-50 disabled:cursor-not-allowed',
      ghost:
        'bg-transparent text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 border-transparent active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
      md: 'px-4.5 py-3 text-xs rounded-2xl gap-2 uppercase tracking-wider',
      lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2.5 uppercase tracking-wider',
    };

    return (
      <button
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...rest}
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Memproses...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }

  interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'raised' | 'flat' | 'interactive';
  }

  function KhwarizmiCard({
    padding = 'md',
    variant = 'raised',
    className = '',
    children,
    ...rest
  }: CardProps) {
    const paddings = {
      none: '',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-6',
    };

    const variants = {
      raised: 'border-2 border-emerald-100/80 shadow-[0_4px_0_0_#d1fae5] bg-white',
      flat: 'border-2 border-slate-200 bg-white',
      interactive:
        'border-2 border-emerald-100/80 shadow-[0_4px_0_0_#d1fae5] bg-white hover:border-emerald-300 hover:shadow-[0_4px_0_0_#a7f3d0] active:translate-y-1 active:shadow-none cursor-pointer transition-all duration-150',
    };

    return (
      <div
        className={`rounded-3xl ${variants[variant]} ${paddings[padding]} ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }

  interface BadgeProps {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    size?: 'sm' | 'md';
    className?: string;
    children: React.ReactNode;
  }

  function KhwarizmiBadge({
    variant = 'primary',
    size = 'sm',
    className = '',
    children,
  }: BadgeProps) {
    const variants = {
      primary: 'bg-emerald-100/90 text-emerald-800 border border-emerald-300',
      success: 'bg-emerald-100/90 text-emerald-800 border border-emerald-300',
      warning: 'bg-amber-100/90 text-amber-800 border border-amber-300',
      danger: 'bg-rose-100/90 text-rose-800 border border-rose-300',
      info: 'bg-sky-100/90 text-sky-800 border border-sky-300',
      neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    };

    const sizes = {
      sm: 'px-2.5 py-0.5 text-[10px]',
      md: 'px-3 py-1 text-xs',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 font-black uppercase tracking-wider rounded-full shadow-2xs ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </span>
    );
  }
  interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helper?: string;
  }

  function KhwarizmiInput({
    label,
    error,
    helper,
    className = '',
    disabled = false,
    ...rest
  }: InputProps) {
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 text-xs font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''
          } ${className}`}
          {...rest}
        />
        {error && <span className="text-[11px] font-bold text-rose-500">{error}</span>}
        {!error && helper && <span className="text-[10px] font-semibold text-slate-400">{helper}</span>}
      </div>
    );
  }

  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    maxWidth?: string;
    children: React.ReactNode;
  }

  function KhwarizmiModal({
    isOpen,
    onClose,
    title,
    subtitle,
    maxWidth = 'max-w-md',
    children,
  }: ModalProps) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative z-10 w-full ${maxWidth} bg-white rounded-3xl border-2 border-emerald-100 shadow-[0_8px_0_0_#a7f3d0] p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-left`}
        >
          {(title || subtitle) && (
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                {title && (
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-black flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    confirmLabel?: string;
    onConfirm: () => void;
  }

  function KhwarizmiConfirmModal({
    isOpen,
    title,
    message,
    type = 'info',
    confirmLabel = 'Tutup',
    onConfirm,
  }: ConfirmModalProps) {
    if (!isOpen) return null;

    const icons = {
      success: { icon: '✅', bg: 'bg-emerald-50 text-emerald-600 border-2 border-emerald-300' },
      error: { icon: '❌', bg: 'bg-rose-50 text-rose-600 border-2 border-rose-300' },
      info: { icon: 'ℹ️', bg: 'bg-sky-50 text-sky-600 border-2 border-sky-300' },
      warning: { icon: '⚠️', bg: 'bg-amber-50 text-amber-600 border-2 border-amber-300' },
    };

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fadeIn">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onConfirm} />
        <div className="relative z-10 w-full max-w-xs bg-white rounded-3xl border-2 border-emerald-100 shadow-[0_8px_0_0_#a7f3d0] p-5 flex flex-col items-center text-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${icons[type].bg}`}
          >
            {icons[type].icon}
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-1">
              {title}
            </h3>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">{message}</p>
          </div>
          <KhwarizmiButton
            variant="secondary"
            size="sm"
            className="w-full mt-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </KhwarizmiButton>
        </div>
      </div>
    );
  }

  interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }

  interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
  }

  function KhwarizmiTabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
    return (
      <div
        className={`flex bg-emerald-50/70 p-1.5 rounded-2xl gap-1.5 border-2 border-emerald-100 shadow-inner ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 gap-1 text-[10px] font-black uppercase rounded-xl transition-all duration-150 select-none cursor-pointer ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-[0_3px_0_0_#a7f3d0] border-2 border-emerald-200 -translate-y-px'
                  : 'text-slate-500 hover:text-emerald-800 hover:bg-emerald-100/40'
              }`}
            >
              {tab.icon && <span className="text-base leading-none">{tab.icon}</span>}
              <span className="tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  interface StatCardProps {
    label: string;
    value: string | number;
    subvalue?: string;
    icon?: React.ReactNode;
    trend?: string;
    variant?: 'primary' | 'warning' | 'info' | 'danger' | 'neutral';
  }

  function KhwarizmiStatCard({
    label,
    value,
    subvalue,
    icon,
    trend,
    variant = 'neutral',
  }: StatCardProps) {
    const variants = {
      primary: 'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-[0_3px_0_0_#a7f3d0]',
      warning: 'bg-amber-50/90 border-amber-200 text-amber-800 shadow-[0_3px_0_0_#fde68a]',
      info: 'bg-sky-50/90 border-sky-200 text-sky-800 shadow-[0_3px_0_0_#bae6fd]',
      danger: 'bg-rose-50/90 border-rose-200 text-rose-800 shadow-[0_3px_0_0_#fecdd3]',
      neutral: 'bg-white border-slate-200 text-slate-800 shadow-[0_3px_0_0_#e2e8f0]',
    };

    return (
      <div
        className={`p-3.5 rounded-2xl border-2 flex flex-col gap-1 text-left ${variants[variant]}`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
            {label}
          </span>
          {icon && <span className="text-sm">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xl font-black">{value}</span>
          {subvalue && <span className="text-xs text-slate-400 font-bold">{subvalue}</span>}
        </div>
        {trend && <span className="text-[10px] font-bold text-slate-500">{trend}</span>}
      </div>
    );
  }

  interface ProgressBarProps {
    value: number;
    variant?: 'primary' | 'info' | 'warning' | 'danger' | 'purple';
    className?: string;
  }

  function KhwarizmiProgress({
    value,
    variant = 'primary',
    className = '',
  }: ProgressBarProps) {
    const barColors = {
      primary: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      info: 'bg-gradient-to-r from-sky-400 to-sky-500',
      warning: 'bg-gradient-to-r from-amber-400 to-amber-500',
      danger: 'bg-gradient-to-r from-rose-400 to-rose-500',
      purple: 'bg-gradient-to-r from-purple-400 to-purple-500',
    };

    const clamped = Math.min(Math.max(value, 0), 100);

    return (
      <div
        className={`w-full bg-slate-100 h-3 rounded-full overflow-hidden border-2 border-slate-200 ${className}`}
      >
        <div
          className={`${barColors[variant]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }

  interface LoadingOverlayProps {
    show: boolean;
    message?: string;
    submessage?: string;
  }

  function KhwarizmiLoadingOverlay({
    show,
    message = 'Sedang Memproses AI...',
    submessage = 'Mohon tunggu sejenak, sistem sedang mengolah data setoran.',
  }: LoadingOverlayProps) {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-slate-100 shadow-[0_8px_0_0_#CBD5E1] flex flex-col items-center text-center gap-4">
          <div className="relative flex items-center justify-center my-2">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
            <span className="absolute text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
              {message}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {submessage}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-3 py-2 text-[10px] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Anda sedang dalam antrean proses AI...</span>
          </div>
        </div>
      </div>
    );
  }

  interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  }

  function KhwarizmiEmptyState({
    icon = '📭',
    title,
    description,
    action,
  }: EmptyStateProps) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-2">
        <span className="text-3xl mb-1">{icon}</span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-slate-400 max-w-xs">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // HELPER PARSER JSON AI UNTUK RAPORT
  // ----------------------------------------------------------------------
  function parseAiAnalysisData(raw: any): any {
    if (!raw) return null;

    let data = raw;

    if (typeof data === 'string') {
      let trimmed = data.trim();
      if (trimmed.startsWith('```json')) {
        trimmed = trimmed.substring(7);
      } else if (trimmed.startsWith('```')) {
        trimmed = trimmed.substring(3);
      }
      if (trimmed.endsWith('```')) {
        trimmed = trimmed.substring(0, trimmed.length - 3);
      }
      trimmed = trimmed.trim();

      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          data = JSON.parse(trimmed);
        } catch {
          return { ringkasan: trimmed };
        }
      } else {
        return { ringkasan: trimmed };
      }
    }

    if (typeof data === 'object' && data !== null) {
      if (data.preview_raport_ai) {
        return parseAiAnalysisData(data.preview_raport_ai);
      }
      if (data.rekomendasi_ai) {
        return parseAiAnalysisData(data.rekomendasi_ai);
      }
      if (data.analisis_raport) {
        return parseAiAnalysisData(data.analisis_raport);
      }
      if (data.data && typeof data.data === 'object' && !Array.isArray(data.data) && (data.data.preview_raport_ai || data.data.rekomendasi_ai || data.data.evaluasi_musyrif || data.data.kualitas_hafalan)) {
        return parseAiAnalysisData(data.data);
      }

      const normalized: Record<string, any> = { ...data };

      if (data.evaluasi_musyrif && !normalized.rekomendasi_musyrif) {
        normalized.rekomendasi_musyrif = data.evaluasi_musyrif;
      }
      if (data.rekomendasi_musyrif && !normalized.evaluasi_musyrif) {
        normalized.evaluasi_musyrif = data.rekomendasi_musyrif;
      }
      if (data.rekomendasi_ortu && !normalized.rekomendasi_orang_tua) {
        normalized.rekomendasi_orang_tua = data.rekomendasi_ortu;
      }
      if (data.rekomendasi_orang_tua && !normalized.rekomendasi_ortu) {
        normalized.rekomendasi_ortu = data.rekomendasi_orang_tua;
      }
      if (data.pesan_santri && !normalized.pesan_anak) {
        normalized.pesan_anak = data.pesan_santri;
      }
      if (data.pesan_untuk_anak && !normalized.pesan_anak) {
        normalized.pesan_anak = data.pesan_untuk_anak;
      }

      return normalized;
    }

    return { ringkasan: String(data) };
  }

  // ----------------------------------------------------------------------
  // KOMPONEN TAMPILAN ANALISIS AI RAPORT (GNOME MODERN UI STYLE)
  // ----------------------------------------------------------------------
  function FormattedAiAnalysis({ content }: { content: any }) {
    const data = parseAiAnalysisData(content);
    if (!data) return null;


    const rekomendasiOrtu = data.rekomendasi_orang_tua || data.rekomendasi_ortu;
    const evaluasiMusyrif = data.rekomendasi_musyrif || data.evaluasi_musyrif || data.rekomendasi || data.saran || data.area_pengembangan;
    const pesanAnak = data.pesan_anak || data.pesan_santri || data.pesan_untuk_anak;


    return (
      <div className="flex flex-col gap-2.5 font-sans animate-fadeIn text-xs">
        {/* 1. REKOMENDASI ORANG TUA */}
        {rekomendasiOrtu && (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl shadow-[0_2px_0_0_#FDE68A]">
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
              <span>🏡</span> Rekomendasi Untuk Orang Tua
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
              {String(rekomendasiOrtu)}
            </p>
          </div>
        )}

        {/* 2. REKOMENDASI MUSYRIF / PENGAJAR */}
        {evaluasiMusyrif && (
          <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl shadow-[0_2px_0_0_#BAE6FD]">
            <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider flex items-center gap-1.5">
              <span>💡</span> Evaluasi & Rekomendasi Musyrif
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
              {Array.isArray(evaluasiMusyrif)
                ? evaluasiMusyrif.join(', ')
                : String(evaluasiMusyrif)}
            </p>
          </div>
        )}

        {/* 3. PESAN UNTUK SANTRI / ANAK */}
        {pesanAnak && (
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl shadow-[0_2px_0_0_#E9D5FF]">
            <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
              <span>💌</span> Pesan Motivasi Santri
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
              {String(pesanAnak)}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // KOMPONEN TEXTAREA DINAMIS AUTO-RESIZE (KHWARIZMI TEXTAREA)
  // ----------------------------------------------------------------------
  interface DynamicTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
  }

  function DynamicTextarea({ value, onChange, className = '', rows = 2, ...props }: DynamicTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full resize-none overflow-hidden transition-all duration-150 ${className}`}
        {...props}
      />
    );
  }

  // ----------------------------------------------------------------------
  // HELPER MERGE TRANSKRIP ANTI DUPLIKAT / DOUBLE TEXT
  // ----------------------------------------------------------------------
  function mergeTranscript(existing: string, incoming: string): string {
    const current = existing.trim();
    const next = incoming.trim();
    if (!next) return current;
    if (!current) return next;

    const currentTokens = current.split(/\s+/);
    const nextTokens = next.split(/\s+/);
    const maxOverlap = Math.min(currentTokens.length, nextTokens.length, 32);

    for (let size = maxOverlap; size > 0; size--) {
      const currentTail = currentTokens.slice(-size).join(' ').toLocaleLowerCase('id-ID');
      const nextHead = nextTokens.slice(0, size).join(' ').toLocaleLowerCase('id-ID');
      if (currentTail === nextHead) {
        return [...currentTokens, ...nextTokens.slice(size)].join(' ');
      }
    }

    return `${current} ${next}`.replace(/\s+/g, ' ').trim();
  }

  // ----------------------------------------------------------------------
  // MAIN PORTAL COMPONENT
  // ----------------------------------------------------------------------
  export default function MusyrifPortalMobile() {
    const router = useRouter();
    const STORAGE_KEY = 'musyrif_portal_state';

    const getSantriId = (santriObj: any): number | string | null => {
      if (!santriObj) return null;
      return santriObj.id ?? santriObj.santri_id ?? santriObj.student_id ?? null;
    };

    const [isStateLoaded, setIsStateLoaded] = useState(false);
    const [musyrifName, setMusyrifName] = useState('');
    const [santriList, setSantriList] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedSantri, setSelectedSantri] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'setoran_daily' | 'profile' | 'raport_log'>('setoran_daily');

    const [musyrifProfileData, setMusyrifProfileData] = useState<any>(null);
    const [showMusyrifProfileModal, setShowMusyrifProfileModal] = useState(false);
    const [musyrifProfileTab, setMusyrifProfileTab] = useState<'info' | 'password'>('info');
    const [musyrifNamaLengkap, setMusyrifNamaLengkap] = useState('');
    const [musyrifUsername, setMusyrifUsername] = useState('');
    const [passwordLama, setPasswordLama] = useState('');
    const [passwordBaru, setPasswordBaru] = useState('');
    const [konfirmasiPasswordBaru, setKonfirmasiPasswordBaru] = useState('');
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [uploadingFotoSantri, setUploadingFotoSantri] = useState(false);
    const [musyrifActionLoading, setMusyrifActionLoading] = useState(false);
    const [progressTrackingData, setProgressTrackingData] = useState<any>(null);
    const [progressLoading, setProgressLoading] = useState(false);

    const [popupModal, setPopupModal] = useState<{
      show: boolean;
      title: string;
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
    }>({ show: false, title: '', message: '', type: 'info' });

    // State untuk Pop-up Detail Setoran per Item yang diklik
    const [selectedSetoranDetail, setSelectedSetoranDetail] = useState<any>(null);

    const showPopup = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      setPopupModal({ show: true, title, message, type });
    };

    const closePopup = () => {
      setPopupModal((prev) => ({ ...prev, show: false }));
    };

    const getTodayLocalDate = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState<string>(getTodayLocalDate());

    const [fullProfile, setFullProfile] = useState<any>(null);
    const [historiSetoranFull, setHistoriSetoranFull] = useState<any[]>([]);
    const [raportList, setRaportList] = useState<any[]>([]);
    const [statusLogs, setStatusLogs] = useState<any[]>([]);
    const [profileLoading, setProfileLoading] = useState(false);

    const [dailyAiSummary, setDailyAiSummary] = useState<any>(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [copilotLoading, setCopilotLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const [currentStep, setCurrentStep] = useState<
      'menu' | 'select_student' | 'ready_to_record' | 'recording_session' | 'input_form' | 'student_detail'
    >('menu');
    const [portalMode, setPortalMode] = useState<'input' | 'monitor'>('input');

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editStatus, setEditStatus] = useState('hadir');
    const [editKeterangan, setEditKeterangan] = useState('');
    const [editTargetHarian, setEditTargetHarian] = useState('');

    const [showUjianModal, setShowUjianModal] = useState(false);
    const [juzUjian, setJuzUjian] = useState('Juz 30');
    const [customJuz, setCustomJuz] = useState('');
    const [catatanPersiapan, setCatatanPersiapan] = useState('');

    const [showRaportModal, setShowRaportModal] = useState(false);
    const [showPrintRaportModal, setShowPrintRaportModal] = useState(false);
    const [selectedRaportForPrint, setSelectedRaportForPrint] = useState<any>(null);

    const [semesterRaport, setSemesterRaport] = useState('Ganjil 2026/2027');
    const [nilaiHarian, setNilaiHarian] = useState(85);
    const [nilaiBulanan, setNilaiBulanan] = useState(85);
    const [nilaiAkhir, setNilaiAkhir] = useState(85);
    const [catatanRaport, setCatatanRaport] = useState('');

    const initialAiFormFields = {
      rekomendasi_orang_tua: 'Mohon didampingi saat murojaah di rumah.',
      rekomendasi_musyrif: 'Pertahankan ritme setoran harian.',
      pesan_anak: 'Barakallahu fiik! Pertahankan semangat menghafal Al-Quran.',
    };

    const [aiFormFields, setAiFormFields] = useState(initialAiFormFields);

    const [surahId, setSurahId] = useState<number | null>(null);
    const [surah, setSurah] = useState('');
    const [ayat, setAyat] = useState('');
    const [catatanMusyrif, setCatatanMusyrif] = useState('');
    const [searchSantriQuery, setSearchSantriQuery] = useState('');

    const [inputLoading, setInputLoading] = useState(false);
    const [inputLoadingMessage, setInputLoadingMessage] = useState('Memproses...');
    const [actionLoading, setActionLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef<any>(null);
    const transcriptAccumulatorRef = useRef<string>('');
    const interimTranscriptRef = useRef<string>('');

    const fetchMusyrifProfile = async () => {
      try {
        const res = await api.get('/musyrif/profile');
        if (res.data?.data) {
          const profile = res.data.data;
          setMusyrifProfileData(profile);
          setMusyrifNamaLengkap(profile.nama_lengkap || '');
          setMusyrifUsername(profile.username || '');
          if (profile.nama_lengkap) {
            setMusyrifName(profile.nama_lengkap);
          }
        }
      } catch (err: any) {
        console.warn('Gagal memuat profil musyrif:', err);
      }
    };

    const fetchSantriList = async () => {
      setLoading(true);
      setError(null);
      const session = getSession();
      if (!session?.username) {
        router.push('/login');
        return;
      }
      setUserRole(session.role);
      setMusyrifName(session.nama_lengkap || session.nama || session.username);

      try {
        const res = await api.get('/musyrif/halaqah');
        const list = ensureArray(res.data.data || res.data.santri || res.data);
        setSantriList(list);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Gagal mengambil data santri');
        setSantriList([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchProgressTracking = async (santriId: number | string) => {
    setProgressLoading(true);
    try {
      const res = await api.get(`/musyrif/santri/${santriId}/progress-tracking`);
      if (res.data?.data) {
        setProgressTrackingData(res.data.data);
      }
    } catch (e) {
      console.warn('Gagal memuat progress tracking:', e);
      setProgressTrackingData(null);
    } finally {
      setProgressLoading(false);
    }
  };

const fetchFullSantriProfile = async (santriId: number | string) => {
      setProfileLoading(true);
      setDailyAiSummary(null);

      // 🚀 SISIPKAN DI SINI SUPAYA OTOMATIS KE-LOAD
      fetchProgressTracking(santriId);

      try {
        const res = await api.get(`/musyrif/santri/${santriId}/profile`);
        const data = res.data;

        if (data) {
          const profileObj = data.profile || data.data?.profile || data.santri || data;
          setFullProfile(profileObj);

          const rawSetoran =
            data.histori_setoran_full ||
            data.histori_setoran ||
            data.setoran ||
            data.data?.histori_setoran_full ||
            [];
          setHistoriSetoranFull(ensureArray(rawSetoran));

          setRaportList(ensureArray(data.raport || data.data?.raport));
          setStatusLogs(ensureArray(data.histori_status_log || data.data?.histori_status_log));

          if (profileObj?.target_harian) {
            setEditTargetHarian(profileObj.target_harian);
          }
        }
      } catch (e) {
        console.error('Gagal fetch profil santri:', e);
      } finally {
        setProfileLoading(false);
      }
    };

    useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedSantri) setSelectedSantri(parsed.selectedSantri);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          if (parsed.portalMode) setPortalMode(parsed.portalMode);
        }
      } catch (e) {
        console.warn('Gagal memuat state:', e);
      } finally {
        setIsStateLoaded(true);
      }
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined' || !isStateLoaded) return;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selectedSantri, currentStep, portalMode })
      );
    }, [selectedSantri, currentStep, portalMode, isStateLoaded]);

    useEffect(() => {
      const sId = getSantriId(selectedSantri);
      if (sId && currentStep === 'student_detail') {
        fetchFullSantriProfile(sId);
      }
    }, [selectedSantri, currentStep]);

    useEffect(() => {
      if (raportList && raportList.length > 0) {
        const latest = raportList[0];
        setSemesterRaport(latest.semester || 'Ganjil 2026/2027');
        setNilaiHarian(latest.nilai_harian ?? 85);
        setNilaiBulanan(latest.nilai_bulanan ?? 85);
        setNilaiAkhir(latest.nilai_akhir ?? 85);
        setCatatanRaport(latest.catatan_musyrif || '');

        const parsed = parseAiAnalysisData(latest.rekomendasi_ai || latest.analisis_raport);
        if (parsed) {
          setAiFormFields({
            rekomendasi_orang_tua: parsed.rekomendasi_orang_tua || parsed.rekomendasi_ortu || '',
            rekomendasi_musyrif: Array.isArray(parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran)
              ? (parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran).join(', ')
              : String(parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran || ''),
            pesan_anak: parsed.pesan_anak || parsed.pesan_santri || parsed.pesan_untuk_anak || '',
          });
        }
      } else {
        setSemesterRaport('Ganjil 2026/2027');
        setNilaiHarian(85);
        setNilaiBulanan(85);
        setNilaiAkhir(85);
        setCatatanRaport('');
        setAiFormFields(initialAiFormFields);
      }
    }, [raportList]);

    useEffect(() => {
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Ignore
          }
        }
      };
    }, []);

    useEffect(() => {
      fetchSantriList();
      fetchMusyrifProfile();
    }, [router]);

    const handleUpdateMusyrifProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setMusyrifActionLoading(true);
      try {
        await api.put('/musyrif/profile', {
          nama_lengkap: musyrifNamaLengkap,
          username: musyrifUsername,
        });
        showPopup('Profil Diperbarui', 'Informasi profil musyrif berhasil disimpan!', 'success');
        fetchMusyrifProfile();
      } catch (err: any) {
        showPopup('Gagal Update Profil', err.response?.data?.detail || 'Terjadi kesalahan.', 'error');
      } finally {
        setMusyrifActionLoading(false);
      }
    };

    const handleUploadFotoMusyrif = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('foto', file);

      setUploadingFoto(true);
      try {
        await api.post('/musyrif/profile/upload-foto', formData);
        showPopup('Foto Terunggah', 'Foto profil berhasil diperbarui!', 'success');
        await fetchMusyrifProfile();
      } catch (err: any) {
        showPopup('Gagal Upload', err.response?.data?.detail || 'Gagal mengunggah foto.', 'error');
      } finally {
        setUploadingFoto(false);
      }
    };

    const handleUploadFotoSantri = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const sId = getSantriId(selectedSantri);
      if (!sId) return;

      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('foto', file);

      setUploadingFotoSantri(true);
      try {
        await api.post(`/musyrif/santri/${sId}/upload-foto`, formData);
        showPopup('Foto Santri Diperbarui', 'Foto profil santri berhasil diunggah!', 'success');
        fetchFullSantriProfile(sId);
      } catch (err: any) {
        showPopup('Gagal Upload', err.response?.data?.detail || 'Gagal mengunggah foto santri.', 'error');
      } finally {
        setUploadingFotoSantri(false);
      }
    };

    const handleChangePasswordMusyrif = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordBaru !== konfirmasiPasswordBaru) {
        showPopup('Password Tidak Cocok', 'Konfirmasi password baru tidak sesuai.', 'error');
        return;
      }

      setMusyrifActionLoading(true);
      try {
        await api.put('/musyrif/profile/ganti-password', {
          password_lama: passwordLama,
          password_baru: passwordBaru,
          konfirmasi_password_baru: konfirmasiPasswordBaru,
        });
        showPopup('Password Berhasil Diubah', 'Silakan gunakan password baru pada login berikutnya.', 'success');
        setPasswordLama('');
        setPasswordBaru('');
        setKonfirmasiPasswordBaru('');
      } catch (err: any) {
        showPopup('Gagal Ganti Password', err.response?.data?.detail || 'Terjadi kesalahan.', 'error');
      } finally {
        setMusyrifActionLoading(false);
      }
    };

    const handleSelectSantri = (santri: any) => {
      const sId = getSantriId(santri);
      setSelectedSantri(santri);
      setEditStatus(santri.status_santri || 'hadir');
      setEditTargetHarian(santri.target_harian || '');
      setShowRaportModal(false);
      resetForm();

      if (portalMode === 'input') {
        setCurrentStep('ready_to_record');
      } else if (sId) {
        fetchFullSantriProfile(sId);
        setCurrentStep('student_detail');
      }
    };

    const resetForm = () => {
      setSurahId(null);
      setSurah('');
      setAyat('');
      setCatatanMusyrif('');
      transcriptAccumulatorRef.current = '';
      interimTranscriptRef.current = '';
    };

    const startListening = (e?: any) => {
      if (e && e.preventDefault) e.preventDefault();

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        showPopup('Browser Tidak Kompatibel', 'Gunakan Chrome untuk Speech Recognition.', 'error');
        return;
      }

      if (isListening) return;

      const existing = catatanMusyrif.trim();
      transcriptAccumulatorRef.current = existing ? existing + ' ' : '';
      interimTranscriptRef.current = '';

      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcriptAccumulatorRef.current = mergeTranscript(
              transcriptAccumulatorRef.current,
              result[0].transcript,
            );
          } else {
            interim += result[0].transcript;
          }
        }
        interimTranscriptRef.current = interim;
        const totalText = mergeTranscript(transcriptAccumulatorRef.current, interim);
        setCatatanMusyrif(totalText);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          console.warn('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.warn(err);
        setIsListening(false);
      }
    };

    const stopListening = (e?: any) => {
      if (e && e.preventDefault) e.preventDefault();

      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // ignore
        }
      }
      setIsListening(false);
    };

    const handleFinishRecording = async () => {
      const finalTranscript = catatanMusyrif.trim();
      if (!finalTranscript) {
        showPopup('Transkrip Kosong', 'Belum ada suara terekam.', 'info');
        return;
      }

      setCurrentStep('input_form');
      setInputLoadingMessage('🤖 Memproses Voice AI & mengekstrak surah/ayat... Mohon tunggu sebentar.');
      setInputLoading(true);

      try {
        const res = await api.post(
          '/musyrif/parse-voice',
          { raw_text: finalTranscript },
          { timeout: 120000 }
        );

        const draft = res.data?.draft || res.data;
        if (draft) {
          if (draft.surah_id) setSurahId(draft.surah_id);
          if (draft.surah && draft.surah !== '-') setSurah(draft.surah);
          if (draft.ayat && draft.ayat !== '-') setAyat(draft.ayat);
          if (draft.catatan_musyrif) setCatatanMusyrif(draft.catatan_musyrif);
          else setCatatanMusyrif(finalTranscript);
        } else {
          setCatatanMusyrif(finalTranscript);
        }
      } catch (err: any) {
        console.warn('Voice AI Parser Fallback ke Teks Mentah:', err);
        setCatatanMusyrif(finalTranscript);
        showPopup(
          'Voice AI Timeout / Fallback',
          'Sistem tetap menyimpan suara ke teks mentah. Silakan periksa atau lengkapi kolom Surah & Ayat secara manual.',
          'info'
        );
      } finally {
        setInputLoading(false);
      }
    };

    const handleUpdateStatus = async (statusVal: string, ketVal: string = '') => {
      const sId = getSantriId(selectedSantri);
      if (!sId) return;
      setActionLoading(true);
      try {
        await api.put(`/musyrif/santri/${sId}/status`, {
          status: statusVal,
          keterangan: ketVal || null,
        });

        setSelectedSantri((prev: any) => ({ ...prev, status_santri: statusVal }));
        setSantriList((prev) =>
          prev.map((s) => (getSantriId(s) === sId ? { ...s, status_santri: statusVal } : s))
        );
        if (fullProfile) setFullProfile((prev: any) => ({ ...prev, status_santri: statusVal }));

        showPopup('Status Diperbarui', `Status santri menjadi '${statusVal.toUpperCase()}'!`, 'success');
        setShowStatusModal(false);
        fetchFullSantriProfile(sId);
      } catch (err: any) {
        showPopup('Gagal Mengubah Status', err.response?.data?.detail || 'Error', 'error');
      } finally {
        setActionLoading(false);
      }
    };

    const handleSaveTargetHarian = async () => {
      const sId = getSantriId(selectedSantri);
      if (!sId || !editTargetHarian.trim()) return;
      setActionLoading(true);
      try {
        await api.put(`/musyrif/santri/${sId}/target-harian`, {
          target_harian: editTargetHarian.trim(),
        });
        showPopup('Target Disimpan', 'Target Harian Berhasil Disimpan!', 'success');
        setShowStatusModal(false);
        fetchFullSantriProfile(sId);
      } catch (err: any) {
        showPopup('Gagal', err.response?.data?.detail || 'Error', 'error');
      } finally {
        setActionLoading(false);
      }
    };

    const handleDaftarUjian = async (e: React.FormEvent) => {
      e.preventDefault();
      const sId = getSantriId(selectedSantri);
      const chosenJuz = juzUjian === 'custom' ? customJuz.trim() : juzUjian.trim();
      if (!sId) {
        showPopup('Santri Belum Dipilih', 'Silakan pilih santri terlebih dahulu.', 'error');
        return;
      }
      if (!chosenJuz) {
        showPopup('Juz Wajib Diisi', 'Silakan pilih atau ketik Juz yang diajukan untuk ujian.', 'warning');
        return;
      }
      setActionLoading(true);
      try {
        const res = await api.post(`/musyrif/santri/${sId}/daftar-ujian`, {
          juz: chosenJuz,
          catatan_persiapan: catatanPersiapan ? catatanPersiapan.trim() : null,
        });

        // Sinkronisasi status santri lokal ke 'pengajuan_ujian'
        setSelectedSantri((prev: any) => ({ ...prev, status_santri: 'pengajuan_ujian' }));
        setSantriList((prev) =>
          prev.map((s) => (getSantriId(s) === sId ? { ...s, status_santri: 'pengajuan_ujian' } : s))
        );
        if (fullProfile) {
          setFullProfile((prev: any) => ({
            ...prev,
            status_santri: 'pengajuan_ujian',
            tanggal_ujian: null,
            catatan_persiapan_ujian: `Mengajukan Ujian untuk: ${chosenJuz}. Catatan: ${catatanPersiapan ? catatanPersiapan.trim() : '-'}`,
          }));
        }

        const msg = res.data?.message || `Pengajuan ujian santri (${chosenJuz}) berhasil dikirim ke Admin!`;
        showPopup('Pengajuan Ujian Berhasil', `${msg} Tanggal ujian akan ditentukan dan dijadwalkan oleh Admin.`, 'success');
        setShowUjianModal(false);
        setCatatanPersiapan('');
        setCustomJuz('');
        await fetchFullSantriProfile(sId);
      } catch (err: any) {
        showPopup('Gagal Mengajukan Ujian', err.response?.data?.detail || err.message || 'Terjadi kesalahan.', 'error');
      } finally {
        setActionLoading(false);
      }
    };

    const handleVerifySetoran = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!surah.trim() || !ayat.trim()) {
        showPopup('Input Tidak Lengkap', 'Isi surah dan ayat terlebih dahulu!', 'info');
        return;
      }

      const santriId = Number(getSantriId(selectedSantri));
      if (!santriId) return;

      setInputLoadingMessage('💾 Menyimpan data setoran santri ke database...');
      setInputLoading(true);

      try {
        await api.post('/musyrif/setoran', {
          santri_id: santriId,
          student_id: santriId,
          surah_id: surahId,
          surah: surah.trim(),
          ayat: ayat.trim(),
          catatan_musyrif: catatanMusyrif.trim() || null,
        });

        showPopup('Setoran Disimpan', 'Setoran Berhasil Disimpan! 🎉', 'success');
        resetForm();
        fetchFullSantriProfile(santriId);
        setCurrentStep('student_detail');
      } catch (err: any) {
        showPopup('Gagal Simpan Setoran', err.response?.data?.detail || 'Terjadi kesalahan saat menyimpan.', 'error');
      } finally {
        setInputLoading(false);
      }
    };

    const handleOpenRaportModal = (item?: any) => {
      const target = item || (raportList && raportList.length > 0 ? raportList[0] : null);
      if (target) {
        setSemesterRaport(target.semester || 'Ganjil 2026/2027');
        setNilaiHarian(target.nilai_harian ?? 85);
        setNilaiBulanan(target.nilai_bulanan ?? 85);
        setNilaiAkhir(target.nilai_akhir ?? 85);
        setCatatanRaport(target.catatan_musyrif || '');

        const parsed = parseAiAnalysisData(target.rekomendasi_ai || target.analisis_raport);
        if (parsed) {
          setAiFormFields({
            rekomendasi_orang_tua: parsed.rekomendasi_orang_tua || parsed.rekomendasi_ortu || '',
            rekomendasi_musyrif: Array.isArray(parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran)
              ? (parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran).join(', ')
              : String(parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran || ''),
            pesan_anak: parsed.pesan_anak || parsed.pesan_santri || parsed.pesan_untuk_anak || '',
          });
        } else {
          setAiFormFields(initialAiFormFields);
        }
      } else {
        setSemesterRaport('Ganjil 2026/2027');
        setNilaiHarian(85);
        setNilaiBulanan(85);
        setNilaiAkhir(85);
        setCatatanRaport('');
        setAiFormFields(initialAiFormFields);
      }
      setShowRaportModal(true);
    };

    const handleGenerateCopilotRaport = async () => {
      const sId = getSantriId(selectedSantri);
      if (!sId) {
        showPopup('Santri Belum Dipilih', 'Pilih santri terlebih dahulu.', 'error');
        return;
      }
      setCopilotLoading(true);
      try {
        const res = await api.post(
          '/musyrif/raport/preview-ai',
          {
            santri_id: Number(sId),
            student_id: Number(sId),
            semester: semesterRaport,
            nilai_harian: Number(nilaiHarian),
            nilai_bulanan: Number(nilaiBulanan),
            nilai_akhir: Number(nilaiAkhir),
            catatan_musyrif: catatanRaport,
          },
          { timeout: 35000 }
        );

        const rawAi = res.data?.preview_raport_ai || res.data?.rekomendasi_ai || res.data?.analisis_ai || res.data?.data || res.data;
        if (rawAi) {
          const parsed = parseAiAnalysisData(rawAi);
          if (parsed) {
            setAiFormFields((prev) => ({
              rekomendasi_orang_tua: parsed.rekomendasi_orang_tua || parsed.rekomendasi_ortu || prev.rekomendasi_orang_tua || '',
              rekomendasi_musyrif: Array.isArray(parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran)
                ? (parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran).join(', ')
                : String(parsed.rekomendasi_musyrif || parsed.evaluasi_musyrif || parsed.rekomendasi || parsed.saran || prev.rekomendasi_musyrif || ''),
              pesan_anak: parsed.pesan_anak || parsed.pesan_santri || parsed.pesan_untuk_anak || prev.pesan_anak || '',
            }));

            if ((parsed.evaluasi_musyrif || parsed.catatan_musyrif) && (!catatanRaport || catatanRaport.trim() === '')) {
              setCatatanRaport(parsed.evaluasi_musyrif || parsed.catatan_musyrif);
            }

            showPopup('✨ AI Berhasil', 'Analisis & Rekomendasi AI berhasil dimuat ke formulir raport!', 'success');
          } else {
            showPopup('Info AI', 'AI tidak memberikan respons evaluasi tambahan.', 'info');
          }
        }
      } catch (e: any) {
        showPopup('Gagal AI', e.response?.data?.detail || 'Koneksi AI terganggu/timeout, silakan isi manual.', 'error');
      } finally {
        setCopilotLoading(false);
      }
    };

    const handleSubmitRaport = async (e: React.FormEvent) => {
      e.preventDefault();
      const sId = getSantriId(selectedSantri);
      if (!sId) {
        showPopup('Santri Belum Dipilih', 'Pilih santri terlebih dahulu.', 'error');
        return;
      }
      setActionLoading(true);


      const formattedPayload = {
        rekomendasi_orang_tua: aiFormFields.rekomendasi_orang_tua,
        rekomendasi_ortu: aiFormFields.rekomendasi_orang_tua,
        rekomendasi_musyrif: aiFormFields.rekomendasi_musyrif,
        evaluasi_musyrif: aiFormFields.rekomendasi_musyrif,
        pesan_anak: aiFormFields.pesan_anak,
      };

      try {
        const res = await api.post('/musyrif/raport', {
          santri_id: Number(sId),
          student_id: Number(sId),
          semester: semesterRaport,
          nilai_harian: Number(nilaiHarian),
          nilai_bulanan: Number(nilaiBulanan),
          nilai_akhir: Number(nilaiAkhir),
          catatan_musyrif: catatanRaport,
          rekomendasi_ai: JSON.stringify(formattedPayload),
          auto_generate_ai: false,
        });

        const message = res.data?.message || 'Detail Raport & Analisa AI Berhasil Disimpan!';
        showPopup('Raport Disimpan', message, 'success');
        setShowRaportModal(false);
        await fetchFullSantriProfile(sId);
      } catch (err: any) {
        showPopup('Gagal Simpan Raport', err.response?.data?.detail || err.message || 'Terjadi kesalahan saat menyimpan raport.', 'error');
      } finally {
        setActionLoading(false);
      }
    };

    const handleFetchDailyAiSummary = async () => {
      const sId = getSantriId(selectedSantri);
      if (!sId) return;
      setAiLoading(true);
      try {
        const res = await api.post(
          `/musyrif/ai/rangkuman-harian/${sId}`,
          {
            tanggal: selectedDate,
          },
          { timeout: 60000 }
        );

        const payload = res.data?.penilaian_harian_ai || res.data;
        if (payload && typeof payload === 'object') {
          setDailyAiSummary(payload);
        } else {
          setDailyAiSummary({
            rangkuman_teks: res.data?.rangkuman_ai || res.data?.rangkuman || 'Tidak ada rangkuman.',
          });
        }
        setShowAiModal(true);
      } catch (err) {
        showPopup('AI Offline', 'Gagal terhubung ke layanan AI (Timeout / Server busy).', 'error');
      } finally {
        setAiLoading(false);
      }
    };

  const filteredSetoranByDate = historiSetoranFull.filter((s) => {
    if (!selectedDate) return true;
    const timeStr = String(s.waktu_setoran || s.waktu || s.created_at || s.tanggal || s.date || '');
    if (!timeStr) return false;

    const [yyyy, mm, dd] = selectedDate.split('-');
    const formattedDDMM = `${dd}-${mm}-${yyyy}`;
    const formattedSlash = `${yyyy}/${mm}/${dd}`;
    const formattedSlashReverse = `${dd}/${mm}/${yyyy}`;

    return (
      timeStr.includes(selectedDate) ||
      timeStr.includes(formattedDDMM) ||
      timeStr.includes(formattedSlash) ||
      timeStr.includes(formattedSlashReverse)
    );
  });

  const statusCounters = statusLogs.reduce(
    (acc: any, log: any) => {
      const st = (log.status || '').toLowerCase();
      if (st === 'hadir') acc.hadir++;
      else if (st === 'izin') acc.izin++;
      else if (st === 'pengajuan_ujian') acc.pengajuan_ujian++;
      else if (st === 'persiapan_ujian') acc.persiapan_ujian++;
      else if (st === 'remed_ujian') acc.remed_ujian++;
      return acc;
    },
    { hadir: 0, izin: 0, pengajuan_ujian: 0, persiapan_ujian: 0, remed_ujian: 0 }
  );

  const getDisplayPhotoUrl = (photoValue?: string | null) => {
    if (!photoValue) return null;
    return photoValue.startsWith('http') ? photoValue : getApiUrl(photoValue);
  };

  const filteredSantriList = santriList.filter((s: any) => {
    const name = (s.nama_santri || s.nama || '').toLowerCase();
    const nis = (s.nomor_induk || '').toLowerCase();
    const query = searchSantriQuery.toLowerCase();
    return name.includes(query) || nis.includes(query);
  });

  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || 'hadir').toLowerCase();
    if (s === 'hadir') {
      return <KhwarizmiBadge variant="success">Hadir</KhwarizmiBadge>;
    } else if (s === 'izin') {
      return <KhwarizmiBadge variant="warning">Izin</KhwarizmiBadge>;
    } else if (s === 'pengajuan_ujian') {
      return <KhwarizmiBadge variant="warning">⏳ Pengajuan Ujian</KhwarizmiBadge>;
    } else if (s === 'persiapan_ujian') {
      return <KhwarizmiBadge variant="info">📝 Persiapan Ujian</KhwarizmiBadge>;
    } else if (s === 'remed_ujian') {
      return <KhwarizmiBadge variant="danger">⚠️ Remedial</KhwarizmiBadge>;
    }
    return <KhwarizmiBadge variant="neutral">{s}</KhwarizmiBadge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-600 font-mono text-xs tracking-wider">
        🌱 MEMUAT PORTAL HALAQAH...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex justify-center p-4 relative">
      <div className="w-full max-w-md flex flex-col gap-5 pt-2">

        {/* TOP HEADER */}
        <KhwarizmiCard padding="sm" variant="raised" className="flex justify-between items-center bg-white border-2 border-emerald-100 shadow-[0_4px_0_0_#d1fae5]">
          <div
            onClick={() => setShowMusyrifProfileModal(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              {musyrifProfileData?.foto_profile ? (
                <img
                  src={
                    musyrifProfileData.foto_profile.startsWith('http')
                      ? musyrifProfileData.foto_profile
                      : getApiUrl(musyrifProfileData.foto_profile)
                  }
                  alt="Foto Profil"
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 ring-2 ring-emerald-100 shadow-sm group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-black shadow-sm ring-2 ring-emerald-100 group-hover:scale-105 transition-transform">
                  {(musyrifName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 border-2 border-white text-white rounded-full p-0.5 text-[8px] shadow">
                ✏️
              </span>
            </div>
            <div className="text-left">
              <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full text-[9px] uppercase border border-emerald-300 tracking-wider inline-block mb-0.5">
                HALAQAH MUSYRIF
              </span>
              <h2 className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition">
                {musyrifName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <KhwarizmiButton
              variant="secondary"
              size="sm"
              onClick={() => setShowMusyrifProfileModal(true)}
            >
              Profil
            </KhwarizmiButton>
            <KhwarizmiButton
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSession();
                localStorage.removeItem(STORAGE_KEY);
                router.push('/login');
              }}
            >
              Keluar
            </KhwarizmiButton>
          </div>
        </KhwarizmiCard>

        {/* STEP 1: DASHBOARD MENU UTAMA */}
        {currentStep === 'menu' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div
              onClick={() => {
                setPortalMode('input');
                setCurrentStep('select_student');
              }}
              className="bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border-2 border-emerald-700 p-8 rounded-3xl cursor-pointer shadow-[0_6px_0_0_#047857] hover:brightness-105 active:translate-y-1.5 active:shadow-none transition-all duration-150 text-center select-none"
            >
              <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs shadow-inner border border-white/30">
                <span className="text-3xl">🎙️</span>
              </div>
              <span className="text-[10px] font-black text-emerald-100 tracking-widest uppercase block mb-1">
                INPUT LIVE SESSION
              </span>
              <h3 className="text-xl font-black text-white drop-shadow-xs">Input Setoran Santri</h3>
            </div>

            <KhwarizmiCard
              variant="interactive"
              onClick={() => {
                setPortalMode('monitor');
                setCurrentStep('select_student');
              }}
              className="p-5 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200 text-2xl shrink-0 shadow-xs">
                📊
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-600 tracking-wider uppercase block">
                  MONITORING & AI ANALYTICS
                </span>
                <h4 className="text-sm font-black text-slate-800">Profil & Statistik Santri</h4>
              </div>
            </KhwarizmiCard>

            {isAdminRole(userRole) && (
              <KhwarizmiCard
                variant="interactive"
                onClick={() => router.push('/admin')}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛡️</span>
                  <span className="text-xs font-black text-slate-700">Masuk Portal Admin</span>
                </div>
                <span className="text-emerald-500 font-black">→</span>
              </KhwarizmiCard>
            )}
          </div>
        )}

        {/* STEP 2: PILIH SANTRI */}
        {currentStep === 'select_student' && (
          <KhwarizmiCard variant="raised" className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-500 tracking-wider uppercase">
                {portalMode === 'input' ? '🎙️ Pilih Santri Penyetor' : '📊 Pilih Santri Dipantau'}
              </h3>
              <KhwarizmiButton
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('menu')}
              >
                ← Kembali
              </KhwarizmiButton>
            </div>

            <KhwarizmiInput
              type="text"
              placeholder="Cari nama atau NIS santri..."
              value={searchSantriQuery}
              onChange={(e) => setSearchSantriQuery(e.target.value)}
            />

            <div className="flex flex-col gap-2.5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
                  {error}
                </div>
              )}

              {santriList.length === 0 ? (
                <KhwarizmiEmptyState
                  title="Belum Ada Data Santri"
                  description="Daftar santri pada halaqah ini belum tersedia."
                />
              ) : filteredSantriList.length === 0 ? (
                <KhwarizmiEmptyState
                  icon="🔍"
                  title="Santri Tidak Ditemukan"
                  description={`Tidak ditemukan hasil untuk "${searchSantriQuery}".`}
                />
              ) : (
                filteredSantriList.map((s: any, index: number) => {
                  const sId = getSantriId(s) || index;
                  return (
                    <KhwarizmiCard
                      key={sId}
                      variant="interactive"
                      padding="sm"
                      onClick={() => handleSelectSantri(s)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {s.foto_profile || s.foto ? (
                          <img
                            src={getApiUrl(s.foto_profile || s.foto)}
                            alt={s.nama_santri || s.nama}
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-400 text-xs font-black text-white">
                            {(s.nama_santri || s.nama || 'S').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="text-left">
                          <h4 className="text-xs font-black text-slate-800">{s.nama_santri || s.nama}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold">NIS: {s.nomor_induk || '-'}</p>
                        </div>
                      </div>
                      <div>{renderStatusBadge(s.status_santri)}</div>
                    </KhwarizmiCard>
                  );
                })
              )}
            </div>
          </KhwarizmiCard>
        )}

        {/* STEP 3: REKAM VOICE SESSION */}
        {(currentStep === 'ready_to_record' || currentStep === 'recording_session') && selectedSantri && (
          <KhwarizmiCard variant="raised" className="flex flex-col items-center text-center gap-5 animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                {getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto) ? (
                  <img
                    src={getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto)!}
                    alt={selectedSantri.nama_santri || selectedSantri.nama}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-xl font-black text-white border-2 border-emerald-400 shadow-md">
                    {(selectedSantri.nama_santri || selectedSantri.nama || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">
                    Input Live Voice Session
                  </span>
                  <h3 className="text-lg font-black text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</h3>
                </div>
              </div>
              <div>{renderStatusBadge(selectedSantri.status_santri)}</div>
            </div>

            {selectedSantri.status_santri && selectedSantri.status_santri !== 'hadir' && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-800 text-left w-full shadow-[0_2px_0_0_#FDE68A]">
                <p className="font-black mb-1">⚠️ Status Santri: {selectedSantri.status_santri.toUpperCase()}</p>
                <p className="mb-2 text-[11px] text-amber-700 font-medium">Setoran hanya dapat diinput jika status "Hadir".</p>
                <KhwarizmiButton
                  variant="warning"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('hadir')}
                >
                  {actionLoading ? 'Memproses...' : 'Ubah Status Jadi HADIR'}
                </KhwarizmiButton>
              </div>
            )}

            <p className="text-[11px] text-slate-500 font-bold -mb-2">
              Tahan tombol untuk merekam ucapan setoran.
            </p>

            <div className="relative flex items-center justify-center my-4">
              {isListening && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-rose-400/25 animate-ping pointer-events-none" />
                  <div className="absolute w-36 h-36 rounded-full bg-rose-400/35 animate-pulse pointer-events-none" />
                </>
              )}
              {!isListening && (
                <div className="absolute w-36 h-36 rounded-full bg-emerald-400/20 animate-pulse pointer-events-none" />
              )}
              <button
                type="button"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onMouseLeave={(e) => { if (isListening) stopListening(e); }}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white relative z-10 select-none transition-all duration-200 active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-b from-rose-400 to-rose-500 border-4 border-rose-300 shadow-[0_6px_0_0_#be123c] scale-105'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 border-4 border-emerald-300 shadow-[0_6px_0_0_#047857]'
                }`}
              >
                <span className="text-3xl mb-1 drop-shadow-xs">🎙️</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-center px-2 drop-shadow-xs">
                  {isListening ? 'MEREKAM...' : 'TAHAN UNTUK BICARA'}
                </span>
              </button>
            </div>

            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left shadow-inner">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Transkrip Terakumulasi:</span>
                {catatanMusyrif && (
                  <button
                    type="button"
                    onClick={() => {
                      transcriptAccumulatorRef.current = '';
                      interimTranscriptRef.current = '';
                      setCatatanMusyrif('');
                    }}
                    className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Reset Suara
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 font-medium min-h-[50px] italic leading-relaxed">
                {catatanMusyrif || 'Tekan dan tahan tombol untuk mulai merekam...'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <KhwarizmiButton
                variant="primary"
                size="md"
                onClick={handleFinishRecording}
                disabled={!catatanMusyrif.trim() || inputLoading}
                className="w-full"
              >
                {inputLoading ? 'Memproses Voice AI...' : 'Lanjut Ke Form Setoran →'}
              </KhwarizmiButton>

              <KhwarizmiButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentStep('input_form')}
                className="w-full"
              >
                Atau Input Manual (Tanpa Voice)
              </KhwarizmiButton>

              <KhwarizmiButton
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('select_student')}
                className="w-full text-slate-500"
              >
                ← Pilih Santri Lain
              </KhwarizmiButton>
            </div>
          </KhwarizmiCard>
        )}

        {/* STEP 3.5: FORM VERIFIKASI SETORAN */}
        {currentStep === 'input_form' && selectedSantri && (
          <KhwarizmiCard variant="raised" className="animate-fadeIn">
            <form onSubmit={handleVerifySetoran} className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  {getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto) ? (
                    <img
                      src={getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto)!}
                      alt={selectedSantri.nama_santri || selectedSantri.nama}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-black text-white border-2 border-emerald-400">
                      {(selectedSantri.nama_santri || selectedSantri.nama || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-black text-slate-400">Verifikasi Setoran</span>
                    <h3 className="text-sm font-black text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</h3>
                  </div>
                </div>
                <KhwarizmiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('ready_to_record')}
                  className="text-emerald-700 font-bold"
                >
                  🎙️ Voice lagi
                </KhwarizmiButton>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <KhwarizmiInput
                  label="Surah"
                  placeholder="misal: Al-Baqarah"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  required
                />

                <KhwarizmiInput
                  label="Ayat"
                  placeholder="misal: 1-15"
                  value={ayat}
                  onChange={(e) => setAyat(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Catatan Musyrif</label>
                <DynamicTextarea
                  value={catatanMusyrif}
                  onChange={(e) => setCatatanMusyrif(e.target.value)}
                  rows={3}
                  placeholder="Catatan evaluasi setoran..."
                  className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <KhwarizmiButton
                type="submit"
                variant="primary"
                size="md"
                disabled={inputLoading}
                className="w-full mt-2"
              >
                {inputLoading ? 'Sedang Menyimpan...' : 'Simpan Setoran Santri'}
              </KhwarizmiButton>
            </form>
          </KhwarizmiCard>
        )}

      {/* STEP 4: STUDENT DETAIL & MONITORING PORTAL */}
      {currentStep === 'student_detail' && selectedSantri && (
        <div className="flex flex-col gap-4 animate-fadeIn w-full pb-8">
          <div className="flex justify-between items-center">
            <KhwarizmiButton
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep('select_student')}
              className="text-slate-500 hover:text-slate-800"
            >
              ← Kembali ke Daftar Santri
            </KhwarizmiButton>
          </div>

          {/* CARD PROFIL SANTRI */}
          <KhwarizmiCard variant="raised" className="flex flex-col items-center text-center relative">
            <div className="relative group mb-2">
              {fullProfile?.foto_profile || fullProfile?.foto || selectedSantri?.foto_profile ? (
                <img
                  src={getApiUrl(fullProfile?.foto_profile || fullProfile?.foto || selectedSantri?.foto_profile)}
                  alt="Foto Santri"
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-black text-white border-2 border-emerald-400 shadow-md">
                  {(selectedSantri.nama_santri || selectedSantri.nama || 'S').charAt(0).toUpperCase()}
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-full shadow-lg cursor-pointer transition">
                <span className="text-xs">📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFotoSantri}
                  className="hidden"
                  disabled={uploadingFotoSantri}
                />
              </label>
            </div>

            {uploadingFotoSantri && (
              <span className="text-[10px] text-emerald-600 font-bold mb-1">Mengunggah Foto...</span>
            )}

            <h1 className="text-lg font-black text-slate-800">
              {fullProfile?.nama_santri || selectedSantri.nama_santri || selectedSantri.nama}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              {renderStatusBadge(fullProfile?.status_santri || selectedSantri.status_santri)}
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                NIS: {fullProfile?.nomor_induk || selectedSantri.nomor_induk || '-'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5 w-full">
              <KhwarizmiButton
                variant="secondary"
                size="sm"
                onClick={() => setShowStatusModal(true)}
                className="w-full"
              >
                ⚙️ Target
              </KhwarizmiButton>
              <KhwarizmiButton
                variant={fullProfile?.status_santri === 'pengajuan_ujian' ? 'warning' : 'sky'}
                size="sm"
                onClick={() => setShowUjianModal(true)}
                className="w-full"
              >
                {fullProfile?.status_santri === 'pengajuan_ujian'
                  ? '⏳ Pengajuan Ujian'
                  : fullProfile?.status_santri === 'persiapan_ujian'
                  ? '📝 Jadwal Ujian'
                  : '📝 Ajukan Ujian'}
              </KhwarizmiButton>
            </div>
          </KhwarizmiCard>

          {/* TAB NAVIGATION */}
          <KhwarizmiTabs
            tabs={[
              { id: 'setoran_daily', label: 'Harian', icon: '📅' },
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'raport_log', label: 'Raport', icon: '📑' },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />

          {profileLoading ? (
            <div className="bg-white p-8 rounded-3xl text-center text-xs text-emerald-600 font-mono border border-slate-200 shadow-sm">
              🌱 Memuat data profil santri...
            </div>
          ) : (
            <>
              {/* TAB 1: SETORAN PER HARI */}
              {activeTab === 'setoran_daily' && (
                <div className="flex flex-col gap-4">
                  <KhwarizmiCard padding="sm" variant="raised" className="flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-lg">🗓️</span>
                      <label className="text-[10px] font-bold uppercase text-slate-600 tracking-wider whitespace-nowrap">
                        Pilih Tanggal
                      </label>
                    </div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner w-full max-w-[145px]"
                    />
                  </KhwarizmiCard>

                  <div className="mt-0.5">
                    <KhwarizmiButton
                      variant="primary"
                      size="md"
                      disabled={aiLoading}
                      onClick={handleFetchDailyAiSummary}
                      className="w-full"
                    >
                      <span>⚡</span>
                      <span>{aiLoading ? 'Sedang Memproses AI...' : 'Rangkuman Hari Ini'}</span>
                    </KhwarizmiButton>
                  </div>

                  <KhwarizmiCard variant="raised" className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[10px] uppercase font-black text-slate-400">
                        Setoran Tanggal {selectedDate}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {filteredSetoranByDate.length} Rekaman
                      </span>
                    </div>

                    {filteredSetoranByDate.length === 0 ? (
                      <KhwarizmiEmptyState
                        icon="📖"
                        title="Belum Ada Setoran"
                        description={`Tidak ada catatan setoran pada tanggal ${selectedDate}.`}
                      />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {filteredSetoranByDate.map((item: any, idx: number) => {
                          const kelancaranVal = item.status_kelancaran || item.kelancaran || item.predikat || 'Lancar';
                          const catatanText = item.catatan_musyrif || '';

                          const getKelancaranBadge = (val: string) => {
                            const v = (val || '').toLowerCase();
                            if (v.includes('tersendat')) {
                              return <KhwarizmiBadge variant="warning">{val}</KhwarizmiBadge>;
                            } else if (v.includes('gagal') || v.includes('ulang') || v.includes('kurang')) {
                              return <KhwarizmiBadge variant="danger">{val}</KhwarizmiBadge>;
                            }
                            return <KhwarizmiBadge variant="success">{val}</KhwarizmiBadge>;
                          };

                          const jumlahTersendat = Number(item.jumlah_tersendat ?? item.tersendat ?? 0);
                          const jumlahTeguran = Number(item.jumlah_teguran ?? item.teguran ?? 0);

                          return (
                            <KhwarizmiCard
                              key={item.id || idx}
                              variant="interactive"
                              padding="sm"
                              onClick={() => setSelectedSetoranDetail(item)}
                              className="text-left"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-black text-slate-800 text-xs group-hover:text-emerald-700 transition">
                                    {item.surah}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    Ayat {item.ayat} • {item.waktu_setoran || item.waktu || '-'}
                                  </p>
                                </div>
                                <div>{getKelancaranBadge(kelancaranVal)}</div>
                              </div>

                              <div className="flex flex-col gap-1.5 text-xs mt-2">
                                {jumlahTersendat > 0 && (
                                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                                    <span>⚠️</span>
                                    <span>
                                      <strong>Jumlah Tersendat:</strong> {jumlahTersendat}
                                    </span>
                                  </div>
                                )}

                                {jumlahTeguran > 0 && (
                                  <div className="flex items-center gap-2 text-rose-800 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200">
                                    <span>🔔</span>
                                    <span>
                                      <strong>Jumlah Teguran:</strong> {jumlahTeguran}
                                    </span>
                                  </div>
                                )}

                                {catatanText && (
                                  <div className="flex items-start gap-2 text-slate-700 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
                                    <span>📝</span>
                                    <span className="min-w-0">
                                      <strong>Ringkasan Catatan:</strong>
                                      <p className="text-[11px] italic mt-0.5 line-clamp-2">
                                        "{catatanText.replace(/^["']|["']$/g, '')}"
                                      </p>
                                    </span>
                                  </div>
                                )}

                                <div className="text-[9px] font-bold text-emerald-600 text-right mt-1">
                                  Klik untuk detail lengkap & koreksi →
                                </div>
                              </div>
                            </KhwarizmiCard>
                          );
                        })}
                      </div>
                    )}
                  </KhwarizmiCard>
                </div>
              )}

              {/* TAB 2: PROFIL & TARGET (DENGAN PROGRESS TRACKING TERSEMAT) */}
              {activeTab === 'profile' && (
                <KhwarizmiCard variant="raised" className="flex flex-col gap-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Informasi Akademik Santri
                    </h3>
                    <KhwarizmiButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenRaportModal()}
                    >
                      <span>📑</span>
                      <span>Input Raport</span>
                    </KhwarizmiButton>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Kelompok</span>
                      <p className="text-xs font-black text-slate-800 mt-1">{fullProfile?.nama_kelompok || '-'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Musyrif</span>
                      <p className="text-xs font-black text-slate-800 mt-1">{fullProfile?.nama_musyrif || '-'}</p>
                    </div>
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-2">
                    Target & Ujian
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex justify-between items-center shadow-[0_2px_0_0_#A7F3D0]">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-emerald-700 block">Target Semester</span>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{fullProfile?.target_semester || 'Belum ditentukan'}</p>
                      </div>
                      <span className="text-lg">🎯</span>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex justify-between items-center shadow-[0_2px_0_0_#A7F3D0]">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-emerald-700 block">Target Harian</span>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{fullProfile?.target_harian || 'Belum ditentukan'}</p>
                      </div>
                      <span className="text-lg">📖</span>
                    </div>

                    <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 flex justify-between items-center shadow-[0_2px_0_0_#BAE6FD]">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase text-sky-700 block">Jadwal & Status Ujian</span>
                          {fullProfile?.status_santri === 'pengajuan_ujian' && (
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded-md border border-amber-300">
                              Menunggu Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-black text-slate-800 mt-0.5">
                          {fullProfile?.status_santri === 'pengajuan_ujian'
                            ? '⏳ Menunggu penetapan tanggal oleh Admin'
                            : fullProfile?.tanggal_ujian
                            ? `📅 ${fullProfile.tanggal_ujian}`
                            : 'Belum ditetapkan'}
                        </p>
                        {fullProfile?.catatan_persiapan_ujian && (
                          <p className="text-[10px] text-slate-600 font-medium mt-1 bg-white/80 p-2 rounded-xl border border-sky-100 leading-relaxed">
                            {fullProfile.catatan_persiapan_ujian}
                          </p>
                        )}
                      </div>
                      <span className="text-lg shrink-0">📅</span>
                    </div>
                  </div>

                  {/* KARTU PROGRESS TRACKING & TARGET COMPARE */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 mt-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider">
                        📈 Progress & Perbandingan Target Hafalan
                      </span>
                      <KhwarizmiButton
                        variant="secondary"
                        size="sm"
                        onClick={() => fetchProgressTracking(getSantriId(selectedSantri)!)}
                        className="py-1 px-2.5"
                      >
                        🔄 Refresh
                      </KhwarizmiButton>
                    </div>

                    {progressLoading ? (
                      <div className="text-center py-4 text-xs text-emerald-600 font-mono animate-pulse">Menghitung progress tracking...</div>
                    ) : progressTrackingData ? (
                      <div className="flex flex-col gap-3">
                        {/* 1. Keseluruhan (All-Time) */}
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold uppercase text-slate-400">Keseluruhan (All-Time)</span>
                            <KhwarizmiBadge variant="success">
                              {progressTrackingData.tracking.keseluruhan.status} ({progressTrackingData.tracking.keseluruhan.persentase}%)
                            </KhwarizmiBadge>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xl font-black text-slate-800">
                              {progressTrackingData.tracking.keseluruhan.halaman_tersetor}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">/ {progressTrackingData.tracking.keseluruhan.target_halaman} Halaman</span>
                          </div>
                          <KhwarizmiProgress
                            value={progressTrackingData.tracking.keseluruhan.persentase}
                            variant="primary"
                            className="mt-2"
                          />
                        </div>

                        {/* 2. Per Semester */}
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold uppercase text-slate-400">Semester Ini</span>
                            <KhwarizmiBadge variant="info">
                              {progressTrackingData.tracking.per_semester.status} ({progressTrackingData.tracking.per_semester.persentase}%)
                            </KhwarizmiBadge>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xl font-black text-slate-800">
                              {progressTrackingData.tracking.per_semester.halaman_tersetor}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">/ {progressTrackingData.tracking.per_semester.target_halaman} Halaman</span>
                          </div>
                          <KhwarizmiProgress
                            value={progressTrackingData.tracking.per_semester.persentase}
                            variant="info"
                            className="mt-2"
                          />
                        </div>

                        {/* 3. Konsistensi Bulan Ini */}
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold uppercase text-slate-400">Konsistensi Bulan Ini</span>
                            <KhwarizmiBadge variant="warning">
                              {progressTrackingData.tracking.per_bulan.status} ({progressTrackingData.tracking.per_bulan.persentase_konsistensi}%)
                            </KhwarizmiBadge>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xl font-black text-slate-800">
                              {progressTrackingData.tracking.per_bulan.halaman_tersetor_bulan_ini}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">/ Ideal {progressTrackingData.tracking.per_bulan.target_halaman_ideal_bulan} Halaman</span>
                          </div>
                          <KhwarizmiProgress
                            value={progressTrackingData.tracking.per_bulan.persentase_konsistensi}
                            variant="warning"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-center text-slate-400 py-3">Data progress tracking belum tersedia.</p>
                    )}
                  </div>
                </KhwarizmiCard>
              )}

              {/* TAB 3: RAPORT & HISTORI STATUS LOG */}
              {activeTab === 'raport_log' && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <KhwarizmiCard variant="raised" className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      📊 Rekapitulasi Presensi & Status
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      <KhwarizmiStatCard
                        label="Hadir"
                        value={statusCounters.hadir}
                        variant="primary"
                      />
                      <KhwarizmiStatCard
                        label="Izin"
                        value={statusCounters.izin}
                        variant="warning"
                      />
                      <KhwarizmiStatCard
                        label="Diajukan"
                        value={statusCounters.pengajuan_ujian}
                        variant="warning"
                      />
                      <KhwarizmiStatCard
                        label="Ujian"
                        value={statusCounters.persiapan_ujian}
                        variant="info"
                      />
                      <KhwarizmiStatCard
                        label="Remed"
                        value={statusCounters.remed_ujian}
                        variant="danger"
                      />
                    </div>
                  </KhwarizmiCard>

                  <KhwarizmiCard variant="raised" className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                        📑 Histori Raport Santri
                      </h3>
                      <KhwarizmiButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenRaportModal()}
                      >
                        <span>✏️</span>
                        <span>Input / Edit</span>
                      </KhwarizmiButton>
                    </div>

                    {raportList.length === 0 ? (
                      <KhwarizmiEmptyState
                        icon="📑"
                        title="Belum Ada Riwayat Raport"
                        description="Belum ada riwayat raport yang tersimpan untuk santri ini."
                      />
                    ) : (
                      <div className="flex flex-col gap-4">
                        {raportList.map((r: any, idx: number) => {
                          const aiContent = r.rekomendasi_ai || r.analisis_raport;
                          return (
                            <div
                              key={r.id || idx}
                              className="bg-slate-50/80 p-4 rounded-3xl border border-slate-200/80 shadow-[0_3px_0_0_#E2E8F0] flex flex-col gap-3 relative overflow-hidden text-left"
                            >
                              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                                <div>
                                  <span className="text-[9px] font-black uppercase text-emerald-700 block tracking-wider">
                                    RAPOR EVALUASI
                                  </span>
                                  <h4 className="font-black text-sm text-slate-800">{r.semester}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <KhwarizmiButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleOpenRaportModal(r)}
                                  >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                  </KhwarizmiButton>
                                  <KhwarizmiButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRaportForPrint(r);
                                      setShowPrintRaportModal(true);
                                    }}
                                  >
                                    <span>🖨️</span>
                                    <span>Cetak</span>
                                  </KhwarizmiButton>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-2xl border border-slate-200/60">
                                <div className="border-r border-slate-100 pr-1">
                                  <span className="text-[8px] font-bold uppercase text-slate-400 block">Harian</span>
                                  <span className="text-xs font-black text-slate-700">{r.nilai_harian ?? '-'}</span>
                                </div>
                                <div className="border-r border-slate-100 px-1">
                                  <span className="text-[8px] font-bold uppercase text-slate-400 block">Bulanan</span>
                                  <span className="text-xs font-black text-slate-700">{r.nilai_bulanan ?? '-'}</span>
                                </div>
                                <div className="pl-1">
                                  <span className="text-[8px] font-bold uppercase text-emerald-700 block">Nilai Akhir</span>
                                  <span className="text-xs font-black text-emerald-700">{r.nilai_akhir ?? '-'}</span>
                                </div>
                              </div>

                              {r.catatan_musyrif && (
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/60">
                                  <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
                                    💬 Catatan Musyrif
                                  </span>
                                  <p className="text-xs text-slate-700 italic">"{r.catatan_musyrif}"</p>
                                </div>
                              )}

                              {aiContent && (
                                <div className="flex flex-col gap-1.5 mt-1">
                                  <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                                    <span>🤖</span>
                                    <span>Analisis & Rekomendasi AI</span>
                                  </span>
                                  <FormattedAiAnalysis content={aiContent} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </KhwarizmiCard>

                  <KhwarizmiCard variant="raised" className="flex flex-col gap-3 text-left">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">
                      📜 Riwayat Log Status Presensi
                    </h3>
                    {statusLogs.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-4">Belum ada riwayat status log.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {statusLogs.map((log: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                {renderStatusBadge(log.status)}
                                <span className="text-[10px] text-slate-400 font-semibold">{log.waktu || '-'}</span>
                              </div>
                              {log.keterangan && (
                                <p className="text-[10px] text-slate-600 mt-0.5">{log.keterangan}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </KhwarizmiCard>
                </div>
              )}
            </>
          )}
        </div>
      )}

      </div>

      {/* POPUP MODAL DETAIL SETORAN */}
      <KhwarizmiModal
        isOpen={!!selectedSetoranDetail}
        onClose={() => setSelectedSetoranDetail(null)}
        title="DETAIL SETORAN SANTRI"
        subtitle={selectedSetoranDetail?.waktu_setoran || selectedSetoranDetail?.waktu || 'Waktu tidak tercatat'}
      >
        {selectedSetoranDetail && (
          <div className="flex flex-col gap-3 text-left">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Surah</span>
                <span className="text-xs font-black text-slate-800">{selectedSetoranDetail.surah || '-'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Ayat</span>
                <span className="text-xs font-black text-slate-800">{selectedSetoranDetail.ayat || '-'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">
                📌 Catatan & Koreksi Kesalahan Detail
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedSetoranDetail.catatan_musyrif || 'Tidak ada catatan khusus.'}
              </p>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800">
              💡 <strong>Info:</strong> Untuk analisis komprehensif kesalahan dan evaluasi harian mendalam, gunakan menu <strong>Rangkuman Hari Ini</strong> pada halaman utama setoran.
            </div>

            <KhwarizmiButton
              variant="primary"
              size="sm"
              onClick={() => setSelectedSetoranDetail(null)}
              className="w-full mt-1"
            >
              Tutup Detail
            </KhwarizmiButton>
          </div>
        )}
      </KhwarizmiModal>

      {/* OVERLAY POPUP LOADING */}
      <KhwarizmiLoadingOverlay
        show={inputLoading}
        message="Sedang Memproses AI..."
        submessage={inputLoadingMessage || 'Mohon tunggu sejenak, sistem sedang mengolah data setoran.'}
      />

      {/* POPUP NOTIFIKASI CUSTOM */}
      <KhwarizmiConfirmModal
        isOpen={popupModal.show}
        title={popupModal.title}
        message={popupModal.message}
        type={popupModal.type}
        onConfirm={closePopup}
      />

      {/* POPUP MODAL RANGKUMAN AI HARIAN */}
      <KhwarizmiModal
        isOpen={showAiModal && !!dailyAiSummary}
        onClose={() => setShowAiModal(false)}
        title="EVALUASI AI HARIAN"
        subtitle={`Tanggal: ${selectedDate}`}
      >
        {dailyAiSummary && (
          <div className="flex flex-col gap-3">
            <FormattedAiAnalysis content={dailyAiSummary} />
            <KhwarizmiButton
              variant="primary"
              size="sm"
              onClick={() => setShowAiModal(false)}
              className="w-full mt-1"
            >
              Tutup Rangkuman
            </KhwarizmiButton>
          </div>
        )}
      </KhwarizmiModal>

      {/* POPUP MODAL UBAH STATUS & TARGET HARIAN */}
      <KhwarizmiModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="⚙️ Pengaturan Status & Target"
      >
        <div className="flex flex-col gap-3 text-left">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status Kehadiran</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
            >
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="pengajuan_ujian">Pengajuan Ujian</option>
              <option value="persiapan_ujian">Persiapan Ujian</option>
              <option value="remed_ujian">Remedial</option>
            </select>
          </div>

          <KhwarizmiInput
            label="Keterangan Status"
            value={editKeterangan}
            onChange={(e) => setEditKeterangan(e.target.value)}
            placeholder="Keterangan tambahan (opsional)..."
          />

          <KhwarizmiButton
            variant="primary"
            size="sm"
            disabled={actionLoading}
            onClick={() => handleUpdateStatus(editStatus, editKeterangan)}
            className="w-full"
          >
            {actionLoading ? 'Menyimpan...' : 'Perbarui Status'}
          </KhwarizmiButton>

          <hr className="border-slate-100 my-1" />

          <KhwarizmiInput
            label="Target Harian Santri"
            value={editTargetHarian}
            onChange={(e) => setEditTargetHarian(e.target.value)}
            placeholder="Contoh: 1 Juz / 5 Halaman"
          />

          <KhwarizmiButton
            variant="secondary"
            size="sm"
            disabled={actionLoading}
            onClick={handleSaveTargetHarian}
            className="w-full"
          >
            {actionLoading ? 'Menyimpan...' : 'Simpan Target Harian'}
          </KhwarizmiButton>
        </div>
      </KhwarizmiModal>

      {/* POPUP MODAL DAFTAR UJIAN */}
      <KhwarizmiModal
        isOpen={showUjianModal}
        onClose={() => setShowUjianModal(false)}
        title="📝 Pengajuan Ujian Santri"
        subtitle={fullProfile?.nama_santri || selectedSantri?.nama_santri || selectedSantri?.nama}
      >
        <form onSubmit={handleDaftarUjian} className="flex flex-col gap-3 text-left">
          <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-[11px] text-sky-800 font-medium leading-relaxed">
            💡 <strong>Alur Sistem:</strong> Musyrif mendaftarkan <strong>Nama & Juz</strong> yang diajukan. Tanggal pelaksanaan ujian akan <strong>ditentukan oleh Admin</strong> setelah diverifikasi.
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Nama Santri</span>
            <span className="text-xs font-black text-slate-800">
              {fullProfile?.nama_santri || selectedSantri?.nama_santri || selectedSantri?.nama}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              NIS: {fullProfile?.nomor_induk || selectedSantri?.nomor_induk || '-'}
            </span>
          </div>

          <div className="flex flex-col gap-1 w-full text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Pilih Juz yang Diajukan Ujian <span className="text-rose-500">*</span>
            </label>
            <select
              value={juzUjian}
              onChange={(e) => setJuzUjian(e.target.value)}
              className="w-full px-3.5 py-3 text-xs font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-800 outline-none transition-all duration-150 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 cursor-pointer"
              required
            >
              <option value="Juz 30">Juz 30 (An-Naba&apos; - An-Nas)</option>
              <option value="Juz 29">Juz 29 (Al-Mulk - Al-Mursalat)</option>
              <option value="Juz 28">Juz 28 (Al-Mujadilah - At-Tahrim)</option>
              <option value="Juz 1">Juz 1 (Al-Fatihah - Al-Baqarah:141)</option>
              <option value="Juz 2">Juz 2 (Al-Baqarah:142 - 252)</option>
              <option value="Juz 3">Juz 3 (Al-Baqarah:253 - Ali &apos;Imran:92)</option>
              {Array.from({ length: 27 }, (_, i) => i + 4).map((juzNum) => (
                <option key={juzNum} value={`Juz ${juzNum}`}>
                  Juz {juzNum}
                </option>
              ))}
              <option value="custom">✏️ Juz Lainnya / Kustom</option>
            </select>
          </div>

          {juzUjian === 'custom' && (
            <KhwarizmiInput
              label="Tuliskan Juz / Materi Ujian Kustom"
              placeholder="Contoh: Juz 28-30 atau Juz 1 (Setengah Juz)"
              value={customJuz}
              onChange={(e) => setCustomJuz(e.target.value)}
              required
            />
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Catatan Persiapan / Rekomendasi Musyrif (Opsional)
            </label>
            <DynamicTextarea
              value={catatanPersiapan}
              onChange={(e) => setCatatanPersiapan(e.target.value)}
              placeholder="Contoh: Sudah lancar murajaah 3x putaran, siap diuji..."
              rows={3}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 mt-1">
            <KhwarizmiButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowUjianModal(false)}
              className="flex-1"
            >
              Batal
            </KhwarizmiButton>
            <KhwarizmiButton
              type="submit"
              variant="sky"
              size="md"
              loading={actionLoading}
              className="flex-1"
            >
              Kirim Pengajuan Ujian
            </KhwarizmiButton>
          </div>
        </form>
      </KhwarizmiModal>

      {/* POPUP MODAL FORM INPUT & EDIT RAPORT */}
      <KhwarizmiModal
        isOpen={showRaportModal}
        onClose={() => setShowRaportModal(false)}
        title="FORM EVALUASI RAPORT"
        subtitle={fullProfile?.nama_santri || selectedSantri?.nama_santri || selectedSantri?.nama}
      >
        <form onSubmit={handleSubmitRaport} className="flex flex-col gap-4 text-left">
          <KhwarizmiInput
            label="Semester"
            value={semesterRaport}
            onChange={(e) => setSemesterRaport(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-2">
            <KhwarizmiInput
              label="Harian"
              type="number"
              value={nilaiHarian}
              onChange={(e) => setNilaiHarian(Number(e.target.value))}
              min={0}
              max={100}
              className="text-center font-bold"
            />
            <KhwarizmiInput
              label="Bulanan"
              type="number"
              value={nilaiBulanan}
              onChange={(e) => setNilaiBulanan(Number(e.target.value))}
              min={0}
              max={100}
              className="text-center font-bold"
            />
            <KhwarizmiInput
              label="Nilai Akhir"
              type="number"
              value={nilaiAkhir}
              onChange={(e) => setNilaiAkhir(Number(e.target.value))}
              min={0}
              max={100}
              className="text-center font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Catatan Musyrif
            </label>
            <DynamicTextarea
              value={catatanRaport}
              onChange={(e) => setCatatanRaport(e.target.value)}
              placeholder="Catatan perkembangan santri selama semester..."
              rows={2}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <div className="border border-emerald-200 p-3.5 bg-emerald-50/50 rounded-2xl flex flex-col gap-3 shadow-[0_2px_0_0_#A7F3D0]">
            <div className="flex justify-between items-center border-b border-emerald-200/60 pb-2">
              <label className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1.5 tracking-wider">
                <span>🤖</span>
                <span>Analisis AI Copilot (Form GNOME)</span>
              </label>
              <KhwarizmiButton
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerateCopilotRaport}
                loading={copilotLoading}
                className="py-1 px-2.5"
              >
                ✨ Auto-Fill AI
              </KhwarizmiButton>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">
                Rekomendasi Untuk Orang Tua
              </label>
              <DynamicTextarea
                value={aiFormFields.rekomendasi_orang_tua}
                onChange={(e) => setAiFormFields({ ...aiFormFields, rekomendasi_orang_tua: e.target.value })}
                placeholder="Instruksi untuk wali santri di rumah..."
                rows={2}
                className="text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">
                Rekomendasi / Instruksi Musyrif
              </label>
              <DynamicTextarea
                value={aiFormFields.rekomendasi_musyrif}
                onChange={(e) => setAiFormFields({ ...aiFormFields, rekomendasi_musyrif: e.target.value })}
                placeholder="Saran latihan & evaluasi musyrif..."
                rows={2}
                className="text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">
                Pesan Motivasi Santri
              </label>
              <DynamicTextarea
                value={aiFormFields.pesan_anak}
                onChange={(e) => setAiFormFields({ ...aiFormFields, pesan_anak: e.target.value })}
                placeholder="Pesan bimbingan & motivasi personal langsung untuk santri..."
                rows={2}
                className="text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <KhwarizmiButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowRaportModal(false)}
              className="flex-1"
            >
              Batal
            </KhwarizmiButton>
            <KhwarizmiButton
              type="submit"
              variant="primary"
              size="md"
              loading={actionLoading}
              className="flex-1"
            >
              Simpan Raport
            </KhwarizmiButton>
          </div>
        </form>
      </KhwarizmiModal>

      {/* POPUP MODAL LEMBAR RAPOR SIAP CETAK */}
      <KhwarizmiModal
        isOpen={showPrintRaportModal && !!selectedRaportForPrint}
        onClose={() => setShowPrintRaportModal(false)}
        maxWidth="max-w-lg"
        title="📄 Preview Lembar Rapor Santri"
      >
        {selectedRaportForPrint && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex justify-end print:hidden">
              <KhwarizmiButton
                variant="primary"
                size="sm"
                onClick={() => window.print()}
              >
                🖨️ Cetak Rapor
              </KhwarizmiButton>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-base font-black tracking-widest text-slate-900 uppercase">
                  LEMBAR EVALUASI & RAPOR HALAQAH
                </h2>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  PROGRAM TAHFIDZ & MURAJA'AH AL-QUR'AN
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Nama Santri</span>
                  <span className="font-bold text-slate-800">{fullProfile?.nama_santri || selectedSantri?.nama_santri || selectedSantri?.nama}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">NIS / Nomor Induk</span>
                  <span className="font-bold text-slate-800">{fullProfile?.nomor_induk || selectedSantri?.nomor_induk || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Semester / Periode</span>
                  <span className="font-bold text-slate-800">{selectedRaportForPrint.semester}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Kelompok / Halaqah</span>
                  <span className="font-bold text-slate-800">{fullProfile?.nama_kelompok || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Nilai Harian</span>
                  <span className="text-xs font-bold text-slate-800">{selectedRaportForPrint.nilai_harian ?? '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Nilai Bulanan</span>
                  <span className="text-xs font-bold text-slate-800">{selectedRaportForPrint.nilai_bulanan ?? '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase block">Nilai Akhir</span>
                  <span className="text-xs font-black text-emerald-700">{selectedRaportForPrint.nilai_akhir ?? '-'}</span>
                </div>
              </div>

              {selectedRaportForPrint.catatan_musyrif && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Catatan Musyrif</span>
                  <p className="text-xs text-slate-700 italic">"{selectedRaportForPrint.catatan_musyrif}"</p>
                </div>
              )}

              {(selectedRaportForPrint.rekomendasi_ai || selectedRaportForPrint.analisis_raport) && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase block mb-2">Analisis & Rekomendasi AI</span>
                  <FormattedAiAnalysis content={selectedRaportForPrint.rekomendasi_ai || selectedRaportForPrint.analisis_raport} />
                </div>
              )}

              <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-200 text-xs">
                <div className="text-center">
                  <p className="text-slate-500 mb-10">Orang Tua / Wali Santri</p>
                  <p className="font-bold text-slate-800">( .................................... )</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 mb-10">Musyrif Halaqah</p>
                  <p className="font-bold text-slate-800">({musyrifName || 'Musyrif'})</p>
                </div>
              </div>
            </div>

            <KhwarizmiButton
              variant="secondary"
              size="md"
              onClick={() => setShowPrintRaportModal(false)}
              className="w-full print:hidden"
            >
              Tutup Preview
            </KhwarizmiButton>
          </div>
        )}
      </KhwarizmiModal>

      {/* POPUP MODAL PROFIL & GANTI PASSWORD MUSYRIF */}
      <KhwarizmiModal
        isOpen={showMusyrifProfileModal}
        onClose={() => setShowMusyrifProfileModal(false)}
        title="⚙️ Profil & Pengaturan Musyrif"
      >
        <div className="flex flex-col gap-4 text-left">
          <KhwarizmiTabs
            tabs={[
              { id: 'info', label: 'Informasi Akun' },
              { id: 'password', label: 'Ganti Password' },
            ]}
            activeTab={musyrifProfileTab}
            onChange={(id) => setMusyrifProfileTab(id as any)}
          />

          {musyrifProfileTab === 'info' ? (
            <form onSubmit={handleUpdateMusyrifProfile} className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2 my-2">
                <div className="relative">
                  {musyrifProfileData?.foto_profile ? (
                    <img
                      src={
                        musyrifProfileData.foto_profile.startsWith('http')
                          ? musyrifProfileData.foto_profile
                          : getApiUrl(musyrifProfileData.foto_profile)
                      }
                      alt="Foto Musyrif"
                      className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-black text-white border-2 border-emerald-400 shadow-md">
                      {(musyrifName || 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-full shadow cursor-pointer transition">
                    <span className="text-xs">📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFotoMusyrif}
                      className="hidden"
                      disabled={uploadingFoto}
                    />
                  </label>
                </div>
                {uploadingFoto && <span className="text-[10px] text-emerald-600 font-bold">Mengunggah Foto...</span>}
              </div>

              <KhwarizmiInput
                label="Nama Lengkap"
                value={musyrifNamaLengkap}
                onChange={(e) => setMusyrifNamaLengkap(e.target.value)}
                required
              />

              <KhwarizmiInput
                label="Username / ID"
                value={musyrifUsername}
                onChange={(e) => setMusyrifUsername(e.target.value)}
                required
              />

              <KhwarizmiButton
                type="submit"
                variant="primary"
                size="md"
                loading={musyrifActionLoading}
                className="w-full mt-1"
              >
                Simpan Perubahan
              </KhwarizmiButton>
            </form>
          ) : (
            <form onSubmit={handleChangePasswordMusyrif} className="flex flex-col gap-4">
              <KhwarizmiInput
                label="Password Lama"
                type="password"
                value={passwordLama}
                onChange={(e) => setPasswordLama(e.target.value)}
                required
              />

              <KhwarizmiInput
                label="Password Baru"
                type="password"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                required
              />

              <KhwarizmiInput
                label="Konfirmasi Password Baru"
                type="password"
                value={konfirmasiPasswordBaru}
                onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
                required
              />

              <KhwarizmiButton
                type="submit"
                variant="primary"
                size="md"
                loading={musyrifActionLoading}
                className="w-full mt-1"
              >
                Ubah Password
              </KhwarizmiButton>
            </form>
          )}
        </div>
      </KhwarizmiModal>
    </div>
  );
}