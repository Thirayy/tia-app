'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { ensureArray, getApiUrl } from '@/lib/api';
import { getSession, isAdminRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------
// KHWARIZMI UI SYSTEM - TACTILE 3D MODERN COMPONENTS
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
    md: 'px-4.5 py-2.5 text-xs rounded-2xl gap-2 uppercase tracking-wider',
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
        className={`w-full px-4 py-2.5 text-xs font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
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
    warning: { icon: '⚠️', bg: 'bg-amber-50 text-amber-600 border-2 border-amber-300' },
    info: { icon: 'ℹ️', bg: 'bg-sky-50 text-sky-600 border-2 border-sky-300' },
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
      className={`p-4 rounded-3xl border-2 flex flex-col gap-1 text-left ${variants[variant]}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-2xl font-black">{value}</span>
        {subvalue && <span className="text-xs text-slate-400 font-bold">{subvalue}</span>}
      </div>
      {trend && <span className="text-[10px] font-bold text-slate-500">{trend}</span>}
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

export default function ComprehensiveAdminPortal() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'santri' | 'musyrif' | 'ujian' | 'plotting' | 'halaqah'>('overview');
  const [loading, setLoading] = useState(true);

  // Data States
  const [overviewData, setOverviewData] = useState({ ustadz: 0, santri: 0, total_laporan: 0, santri_aktif: 0 });
  const [santriList, setSantriList] = useState<any[]>([]);
  const [ustadzList, setUstadzList] = useState<any[]>([]);
  const [kelompokList, setKelompokList] = useState<any[]>([]);
  const [monitorHalaqah, setMonitorHalaqah] = useState<any[]>([]);
  const [examList, setExamList] = useState<any[]>([]);
  const [examLoading, setExamLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal Input Hasil Ujian
  const [selectedExamSantri, setSelectedExamSantri] = useState<any | null>(null);
  const [examResultForm, setExamResultForm] = useState<{ hasil: 'lulus' | 'remed'; nilai: string; catatan: string }>({
    hasil: 'lulus',
    nilai: '',
    catatan: ''
  });

  // State Modal Tentukan Jadwal Ujian (Workflow Pengajuan Ujian dari Musyrif)
  const [selectedJadwalSantri, setSelectedJadwalSantri] = useState<any | null>(null);
  const [jadwalForm, setJadwalForm] = useState<{ tanggal_ujian: string; catatan_persiapan_ujian: string }>({
    tanggal_ujian: '',
    catatan_persiapan_ujian: ''
  });
  const [jadwalLoading, setJadwalLoading] = useState(false);
  const [examFilterStatus, setExamFilterStatus] = useState<'all' | 'pengajuan' | 'persiapan' | 'remed'>('all');

  // Custom Pop-up Notification State
  const [popup, setPopup] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setPopup({ isOpen: true, title, message, type });
  };

  // State Input & UI
  const [changedPlotting, setChangedPlotting] = useState<{ [santriId: number]: string | number | null }>({});
  const [newSantri, setNewSantri] = useState({ nama_santri: '', nomor_induk: '', kelompok_id: '' });
  const [showAddSantri, setShowAddSantri] = useState(false);
  const [showAddKelompok, setShowAddKelompok] = useState(false);
  const [showDisrupsiForm, setShowDisrupsiForm] = useState(false);
  const [newKelompok, setNewKelompok] = useState({ nama_kelompok: '', musyrif_id: '' });
  const [disrupsiForm, setDisrupsiForm] = useState({ kelompok_id: '', badal_musyrif_id: '', alasan: '', status_halaqah: 'diganti_badal' });

  // Modals Histori, Profil & Reset Password
  const [showHistoryModal, setShowHistoryModal] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [showAddMusyrif, setShowAddMusyrif] = useState(false);
  const [newMusyrif, setNewMusyrif] = useState({ nama_lengkap: '', username: '', password: '' });

  const [selectedMusyrifProfile, setSelectedMusyrifProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // New States for Admin Reset Password Feature
  const [selectedResetMusyrif, setSelectedResetMusyrif] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [selectedTargetSantri, setSelectedTargetSantri] = useState<any | null>(null);
  const [targetSemesterInput, setTargetSemesterInput] = useState('');

  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reloaders
  const reloadOverview = async () => {
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.counts) setOverviewData(res.data.counts);
    } catch (err) { console.error('Gagal reload overview', err); }
  };

  const reloadSantriData = async () => {
    try {
      const res = await api.get('/admin/santri');
      setSantriList(ensureArray<any>(res.data, ['santri', 'data']));
    } catch (err) { console.error('Gagal reload santri', err); }
  };

  const reloadMusyrifData = async () => {
    try {
      const res = await api.get('/admin/musyrif');
      setUstadzList(ensureArray(res.data, ['ustadz', 'musyrif', 'data']));
    } catch (err) { console.error('Gagal reload musyrif', err); }
  };

  const reloadKelompokData = async () => {
    try {
      const res = await api.get('/admin/kelompok');
      setKelompokList(ensureArray(res.data, ['kelompok', 'data']));
    } catch (err) { console.error('Gagal reload kelompok', err); }
  };

  const reloadMonitorHalaqah = async () => {
    try {
      const res = await api.get('/admin/halaqah/monitor');
      setMonitorHalaqah(ensureArray(res.data, ['monitor', 'halaqah', 'data']));
    } catch (err) { console.error('Gagal reload monitor', err); }
  };

  const reloadExamList = async () => {
    setExamLoading(true);
    try {
      const res = await api.get('/admin/ujian');
      const data = ensureArray(res.data, ['data', 'santri', 'ujian']);
      setExamList(data);
    } catch (err) {
      console.error('Gagal reload list ujian', err);
      setExamList([]);
    } finally {
      setExamLoading(false);
    }
  };

  const formatTanggalIndo = (dateStr?: string | null) => {
    if (!dateStr) return 'Belum dijadwalkan';
    try {
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
      const d = isDateOnly ? new Date(dateStr.trim() + 'T00:00:00') : new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      if (!isDateOnly) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        return d.toLocaleDateString('id-ID', options) + ' WIB';
      }
      return d.toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  // Handlers
  const handleSavePlotting = async () => {
    if (Object.keys(changedPlotting).length === 0) {
      return showNotification("Informasi", "Belum ada perubahan plotting yang dipilih.", "info");
    }
    try {
      for (const [idSantri, idUstadz] of Object.entries(changedPlotting)) {
        await api.put(`/admin/santri/${idSantri}`, {
          student_id: Number(idSantri),
          kelompok_id: idUstadz ? Number(idUstadz) : null,
        });
      }
      showNotification("Berhasil!", "Formasi plotting baru berhasil diperbarui.", "success");
      setChangedPlotting({});
      await reloadSantriData();
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal menyimpan formasi plotting baru.", "error");
    }
  };

  const handleDeleteSantri = async (id: number, nama: string) => {
    if (!window.confirm(`⚠️ Yakin hapus data santri "${nama}"?\nSemua histori setorannya juga akan ikut terhapus!`)) return;
    try {
      const res = await api.delete(`/admin/santri/${id}`);
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Terhapus", res.data?.message || `Data santri ${nama} berhasil dihapus.`, "success");
        setSantriList((prev) => ensureArray<any>(prev).filter((s) => s.id !== id));
        await reloadSantriData();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal menghapus santri.", "error");
    }
  };

  const handleAddSantri = async () => {
    try {
      const payload = {
        nama_santri: newSantri.nama_santri,
        nomor_induk: newSantri.nomor_induk,
        kelompok_id: newSantri.kelompok_id ? Number(newSantri.kelompok_id) : null
      };
      const res = await api.post('/admin/santri', payload);

      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Berhasil", res.data?.message || "Santri baru berhasil ditambahkan!", "success");
        setNewSantri({ nama_santri: '', nomor_induk: '', kelompok_id: '' });
        setShowAddSantri(false);
        await reloadSantriData();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || err.message, "error");
    }
  };

  const handleSaveTargetSemester = async () => {
    if (!selectedTargetSantri) return;
    try {
      const res = await api.put(`/admin/santri/${selectedTargetSantri.id}/target-semester`, {
        target_semester: targetSemesterInput
      });
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Target Tersimpan", res.data?.message || "Target semester berhasil diset!", "success");
        setSelectedTargetSantri(null);
        setTargetSemesterInput('');
        await reloadSantriData();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal menyimpan target semester.", "error");
    }
  };

  const handleAddMusyrif = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/musyrif', newMusyrif);
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Sukses", res.data?.message || "Musyrif baru berhasil terdaftar!", "success");
        setNewMusyrif({ nama_lengkap: '', username: '', password: '' });
        setShowAddMusyrif(false);
        await reloadMusyrifData();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || err.message, "error");
    }
  };

  const handleDeleteMusyrif = async (id: number, nama: string) => {
    if (!window.confirm(`⚠️ YAKIN MAU HAPUS MUSYRIF: "${nama}"?\nAksi ini akan memutus hubungan kelompok binaannya!`)) return;
    try {
      const res = await api.delete(`/admin/musyrif/${id}`);
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Terhapus", res.data?.message || "Data Musyrif berhasil dihapus!", "success");
        await reloadMusyrifData();
        await reloadKelompokData();
        await reloadMonitorHalaqah();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal menghapus data musyrif.", "error");
    }
  };

  const handleChangeRoleMusyrif = async (id: number, currentNama: string, newRole: string) => {
    if (!window.confirm(`Ganti hak akses "${currentNama}" menjadi [${newRole.toUpperCase()}]?`)) return;
    try {
      const res = await api.put(`/admin/musyrif/${id}`, { role: newRole });
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Hak Akses Diperbarui", res.data?.message || `Role ${currentNama} diubah menjadi ${newRole.toUpperCase()}`, "success");
        await reloadMusyrifData();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal mengubah role pengguna.", "error");
    }
  };

  // Handler for Admin Reset Password Musyrif
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResetMusyrif) return;
    try {
      const res = await api.put(`/admin/musyrif/${selectedResetMusyrif.id}/reset-password`, {
        new_password: newPasswordInput
      });
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Berhasil", res.data?.message || "Password musyrif berhasil direset!", "success");
        setSelectedResetMusyrif(null);
        setNewPasswordInput('');
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal mereset password musyrif.", "error");
    }
  };

  const handleOpenMusyrifProfile = async (userId: number) => {
    setLoadingProfile(true);
    try {
      const res = await api.get(`/admin/musyrif/${userId}/profile`);
      setSelectedMusyrifProfile(res.data);
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal memuat profil musyrif.", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenSubmitHasilModal = (santri: any) => {
    setSelectedExamSantri(santri);
    setExamResultForm({
      hasil: 'lulus',
      nilai: santri.nilai_ujian ? String(santri.nilai_ujian) : '',
      catatan: ''
    });
  };

  const handleOpenSetJadwalModal = (santri: any) => {
    setSelectedJadwalSantri(santri);
    setJadwalForm({
      tanggal_ujian: santri.tanggal_ujian ? santri.tanggal_ujian.split('T')[0] : '',
      catatan_persiapan_ujian: santri.catatan_persiapan_ujian || ''
    });
  };

  const handleSubmitSetJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJadwalSantri) return;
    if (!jadwalForm.tanggal_ujian) {
      showNotification("Peringatan", "Silakan pilih tanggal pelaksanaan ujian terlebih dahulu.", "warning");
      return;
    }

    setJadwalLoading(true);
    try {
      let success = false;
      let message = '';
      try {
        const res = await api.put(`/admin/ujian/santri/${selectedJadwalSantri.id}/jadwal`, {
          tanggal_ujian: jadwalForm.tanggal_ujian,
          catatan_persiapan_ujian: jadwalForm.catatan_persiapan_ujian || null
        });
        if (res.status === 200 || res.data?.status === 'success') {
          success = true;
          message = res.data?.message || `Jadwal ujian untuk ${selectedJadwalSantri.nama_santri} berhasil ditentukan!`;
        }
      } catch (errPrim: any) {
        if (errPrim.response?.status === 404 || errPrim.response?.status === 405) {
          const resFallback = await api.put(`/musyrif/admin/santri/${selectedJadwalSantri.id}/jadwal-ujian`, {
            tanggal_ujian: jadwalForm.tanggal_ujian,
            catatan_admin: jadwalForm.catatan_persiapan_ujian || null
          });
          if (resFallback.status === 200 || resFallback.data?.status === 'success') {
            success = true;
            message = resFallback.data?.message || `Jadwal ujian untuk ${selectedJadwalSantri.nama_santri} berhasil ditentukan!`;
          }
        } else {
          throw errPrim;
        }
      }

      if (success) {
        showNotification("Jadwal Berhasil Ditetapkan", message, "success");
        setSelectedJadwalSantri(null);
        await reloadExamList();
        await reloadSantriData();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal Menentukan Jadwal", err.response?.data?.detail || err.message || "Gagal menetapkan tanggal ujian.", "error");
    } finally {
      setJadwalLoading(false);
    }
  };

  const handleSubmitHasilUjian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamSantri) return;

    try {
      const payload = {
        hasil: examResultForm.hasil,
        nilai: examResultForm.nilai !== '' ? parseFloat(examResultForm.nilai) : null,
        catatan: examResultForm.catatan || null
      };

      const res = await api.post(`/admin/ujian/santri/${selectedExamSantri.id}/hasil`, payload);
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Ujian Selesai", res.data?.message || `Hasil ujian untuk ${selectedExamSantri.nama_santri} berhasil disimpan!`, "success");
        setSelectedExamSantri(null);
        await reloadExamList();
        await reloadSantriData();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal menyimpan hasil ujian.", "error");
    }
  };

  const handleAddKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/kelompok', {
        nama_kelompok: newKelompok.nama_kelompok,
        musyrif_id: parseInt(newKelompok.musyrif_id),
      });
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Kelompok Terbentuk", res.data?.message || "Kelompok halaqah baru berhasil dibuat!", "success");
        setNewKelompok({ nama_kelompok: '', musyrif_id: '' });
        setShowAddKelompok(false);
        await reloadKelompokData();
        await reloadMonitorHalaqah();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal membuat kelompok.", "error");
    }
  };

  const handleDeleteKelompok = async (kelompokId: number, namaKelompok: string) => {
    if (!window.confirm(`⚠️ YAKIN INGIN MENGHAPUS KELOMPOK "${namaKelompok}"?\nSantri di kelompok ini akan dialihkan menjadi 'Tanpa Kelompok' (tidak terhapus).`)) return;
    try {
      const res = await api.delete(`/admin/kelompok/${kelompokId}`);
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Terhapus", res.data?.message || `Kelompok '${namaKelompok}' berhasil dihapus.`, "success");
        await reloadKelompokData();
        await reloadSantriData();
        await reloadMonitorHalaqah();
        await reloadOverview();
      }
    } catch (err: any) {
      showNotification("Gagal Hapus Kelompok", err.response?.data?.detail || "Gagal menghapus kelompok halaqah.", "error");
    }
  };

  const handleSubmitDisrupsi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isLibur = disrupsiForm.status_halaqah === 'diliburkan_total';
      const payload = {
        ...disrupsiForm,
        kelompok_id: isLibur ? null : (disrupsiForm.kelompok_id ? parseInt(disrupsiForm.kelompok_id) : null),
        badal_musyrif_id: isLibur ? null : (disrupsiForm.badal_musyrif_id ? parseInt(disrupsiForm.badal_musyrif_id) : null)
      };

      const res = await api.post('/admin/halaqah/disrupsi', payload);
      if (res.status === 200 || res.data?.status === 'success') {
        showNotification("Berhasil!", res.data?.message || (isLibur ? "Semua halaqah telah berhasil diliburkan!" : "Status disrupsi badal telah diaktifkan."), "success");
        setDisrupsiForm({ kelompok_id: '', badal_musyrif_id: '', alasan: '', status_halaqah: 'diganti_badal' });
        setShowDisrupsiForm(false);
        await reloadMonitorHalaqah();
      }
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal mencatat disrupsi.", "error");
    }
  };

  const handleCancelBadal = async (kelompokId: number) => {
    if (!window.confirm("Yakin ingin membatalkan status disrupsi / libur kelompok ini?")) return;
    try {
      const res = await api.put(`/admin/halaqah/${kelompokId}/cancel-badal`, {});
      showNotification("Status Diperbarui", res.data?.message || "Status halaqah kembali Normal (Musyrif Asli).", "success");
      await reloadMonitorHalaqah();
    } catch (err: any) {
      showNotification("Gagal", err.response?.data?.detail || "Gagal membatalkan status disrupsi!", "error");
    }
  };

  const handleOpenHistory = async (kelompokId: number) => {
    setShowHistoryModal(kelompokId);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/admin/halaqah/${kelompokId}/laporan`);
      setHistoryData(ensureArray(res.data, ['laporan', 'data']));
    } catch (err: any) {
      console.error(err);
      showNotification("Gagal", err.response?.data?.detail || "Gagal memuat histori laporan kelompok.", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    if (!isAdminRole(session.role)) {
      router.push('/musyrif');
      return;
    }

    setAdminName(session.nama_lengkap || session.nama || session.username || 'Admin');

    const fetchAllData = () => {
      Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/santri'),
        api.get('/admin/musyrif'),
        api.get('/admin/kelompok'),
        api.get('/admin/halaqah/monitor'),
        api.get('/admin/ujian'),
      ])
        .then(([resOverview, resSantri, resUstadz, resKelompok, resMonitor, resUjian]) => {
          if (resOverview.data?.counts) setOverviewData(resOverview.data.counts);
          setSantriList(ensureArray(resSantri.data, ['santri', 'data']));
          setUstadzList(ensureArray(resUstadz.data, ['ustadz', 'musyrif', 'data']));
          setKelompokList(ensureArray(resKelompok.data, ['kelompok', 'data']));
          setMonitorHalaqah(ensureArray(resMonitor.data, ['monitor', 'halaqah', 'data']));
          setExamList(ensureArray(resUjian.data, ['data', 'santri', 'ujian']));
          setFetchError(null);
        })
        .catch((err) => {
          console.error('Fetch gagal', err);
          setFetchError('Gagal memuat data dashboard. Periksa koneksi API.');
        })
        .finally(() => setLoading(false));
    };

    fetchAllData();

    const interval = setInterval(() => {
      reloadMonitorHalaqah();
      reloadOverview();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">
        Memuat dashboard admin...
      </div>
    );
  }

  const safeSantriList = ensureArray<any>(santriList);
  const safeUstadzList = ensureArray<any>(ustadzList);
  const safeKelompokList = ensureArray<any>(kelompokList);
  const safeMonitorHalaqah = ensureArray<any>(monitorHalaqah);

  const halaqahBermasalahList = safeMonitorHalaqah.filter(h => h.status_halaqah === 'diganti_badal' || h.status_halaqah === 'diliburkan_total');

  const getDisplayPhotoUrl = (photoValue?: string | null) => {
    if (!photoValue) return null;
    return photoValue.startsWith('http') ? photoValue : getApiUrl(photoValue);
  };

  const resolveEntityPhoto = (entity: any) => {
    if (!entity || typeof entity !== 'object') return null;
    const keys = ['foto_profile', 'foto', 'avatar', 'photo', 'foto_santri', 'gambar'];
    for (const k of keys) {
      const v = entity[k];
      if (v) return getDisplayPhotoUrl(v);
    }
    return null;
  };

  const filteredSantri = safeSantriList.filter((s) =>
    s.nama_santri?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nomor_induk?.toString().includes(searchTerm)
  );
  const filteredUstadz = safeUstadzList.filter((u) =>
    u.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pengajuanCount = examList.filter((ex) => ex.status_santri === 'pengajuan_ujian').length;
  const persiapanCount = examList.filter((ex) => ex.status_santri === 'persiapan_ujian').length;
  const remedCount = examList.filter((ex) => ex.status_santri === 'remed_ujian').length;

  const filteredExams = examList.filter((ex) => {
    const matchSearch =
      ex.nama_santri?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.nomor_induk?.toString().includes(searchTerm) ||
      ex.nama_kelompok?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.nama_musyrif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.catatan_persiapan_ujian?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (examFilterStatus === 'pengajuan') return ex.status_santri === 'pengajuan_ujian';
    if (examFilterStatus === 'persiapan') return ex.status_santri === 'persiapan_ujian';
    if (examFilterStatus === 'remed') return ex.status_santri === 'remed_ujian';
    return true;
  });

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative">
      {/* NOTIFICATION MODAL */}
      <KhwarizmiConfirmModal
        isOpen={popup.isOpen}
        onConfirm={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-6 flex-col gap-8 shrink-0 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-[0_2px_0_0_#065f46]">
              A
            </div>
            <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase">Admin Portal</h1>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase pl-10.5 block">TIA Management</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Navigasi Utama</span>
          {(['overview', 'santri', 'musyrif', 'ujian', 'plotting', 'halaqah'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-[0_3px_0_0_#065f46] -translate-y-px border border-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab === 'overview' ? '📊 Overview' :
                 tab === 'santri' ? '🎓 Kelola Santri' :
                 tab === 'musyrif' ? '👥 Kelola Musyrif' :
                 tab === 'ujian' ? '📝 Kelola Ujian' :
                 tab === 'plotting' ? '📌 Plotting' : '🕌 Halaqah'}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            User: <span className="font-bold text-slate-700">{adminName}</span>
          </div>
          <KhwarizmiButton
            variant="secondary"
            size="sm"
            onClick={() => router.push('/musyrif')}
            className="w-full"
          >
            🚪 Exit Gateway
          </KhwarizmiButton>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc]">
        {/* TOP HEADER MOBILE */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-[0_2px_0_0_#065f46]">
              A
            </div>
            <h2 className="text-sm font-black tracking-tight text-slate-800 uppercase">TIA Admin Portal</h2>
          </div>
          <KhwarizmiButton
            variant="secondary"
            size="sm"
            onClick={() => router.push('/musyrif')}
          >
            Exit
          </KhwarizmiButton>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-5">

            {/* WARNING BANNER HALAQAH DISRUPSI/BADAL/LIBUR */}
            {halaqahBermasalahList.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[0_3px_0_0_#FDE68A]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-bounce">⚡</span>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-amber-800 uppercase">Perhatian: {halaqahBermasalahList.length} Halaqah Memiliki Status Disrupsi / Libur</h4>
                    <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                      Kelompok: {halaqahBermasalahList.map(h => h.nama_kelompok).join(', ')}
                    </p>
                  </div>
                </div>
                <KhwarizmiButton
                  variant="warning"
                  size="sm"
                  onClick={() => setActiveTab('halaqah')}
                  className="self-end sm:self-auto"
                >
                  Cek Realtime
                </KhwarizmiButton>
              </div>
            )}

            {fetchError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-4 rounded-2xl">
                {fetchError}
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full text-left">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas TIA secara global dari backend.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KhwarizmiStatCard
                    label="Ustadz / Musyrif"
                    value={overviewData.ustadz}
                    variant="primary"
                    icon="👥"
                  />
                  <KhwarizmiStatCard
                    label="Santri Terdaftar"
                    value={overviewData.santri}
                    variant="neutral"
                    icon="🎓"
                  />
                  <KhwarizmiStatCard
                    label="Total Laporan"
                    value={overviewData.total_laporan}
                    variant="info"
                    icon="📑"
                  />
                  <KhwarizmiStatCard
                    label="Santri Aktif"
                    value={overviewData.santri_aktif}
                    variant="warning"
                    icon="🌟"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <KhwarizmiCard variant="raised" className="xl:col-span-2 flex flex-col gap-4">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Aktivitas & Log Laporan Global
                    </h3>

                    <div className="h-56 flex flex-col justify-between bg-slate-50 rounded-2xl border border-slate-200 p-4 relative overflow-hidden shadow-inner">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-slate-700">Statistik Tren Laporan</span>
                        <KhwarizmiBadge variant="success">Live Line</KhwarizmiBadge>
                      </div>

                      <div className="relative w-full h-32 flex items-end">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00b86b" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#00b86b" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,110 Q 75,80 150,95 T 300,50 T 500,20 L 500,150 L 0,150 Z" fill="url(#lineGradient)" />
                          <path d="M 0,110 Q 75,80 150,95 T 300,50 T 500,20" fill="none" stroke="#00b86b" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono mt-1">
                        <span>Pekan 1</span>
                        <span>Pekan 2</span>
                        <span>Pekan 3</span>
                        <span>Pekan Ini ({overviewData.total_laporan} Laporan)</span>
                      </div>
                    </div>
                  </KhwarizmiCard>

                  <KhwarizmiCard variant="raised" className="flex flex-col gap-3">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Cakupan Setoran Santri
                    </h3>
                    <div className="flex flex-col gap-2">
                      {safeSantriList.slice(0, 5).map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="text-slate-800 font-bold truncate pr-2">{s.nama_santri}</span>
                          <KhwarizmiBadge variant="primary">{s.total_setoran || 0} setoran</KhwarizmiBadge>
                        </div>
                      ))}
                    </div>
                  </KhwarizmiCard>
                </div>
              </div>
            )}

            {/* TAB 2: KELOLA SANTRI */}
            {activeTab === 'santri' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full text-left">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Manajemen Santri</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola data seluruh santri dan target semester.</p>
                  </div>
                  <KhwarizmiButton
                    variant={showAddSantri ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => setShowAddSantri(!showAddSantri)}
                  >
                    {showAddSantri ? 'Batal' : '+ Tambah Santri'}
                  </KhwarizmiButton>
                </div>

                {showAddSantri && (
                  <KhwarizmiCard variant="raised" className="animate-fadeIn">
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleAddSantri(); }}
                      className="flex flex-col gap-4"
                    >
                      <h3 className="text-sm font-black text-slate-800">Tambah Santri Baru</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <KhwarizmiInput
                          label="Nama Lengkap"
                          placeholder="Nama Lengkap"
                          value={newSantri.nama_santri}
                          onChange={(e) => setNewSantri({...newSantri, nama_santri: e.target.value})}
                          required
                        />
                        <KhwarizmiInput
                          label="Nomor Induk (NIS)"
                          placeholder="Nomor Induk (NIS)"
                          value={newSantri.nomor_induk}
                          onChange={(e) => setNewSantri({...newSantri, nomor_induk: e.target.value})}
                          required
                        />
                        <div className="flex flex-col gap-1 w-full text-left">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Kelompok Halaqah
                          </label>
                          <select
                            value={newSantri.kelompok_id}
                            onChange={(e) => setNewSantri({...newSantri, kelompok_id: e.target.value})}
                            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none transition-all duration-150 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                          >
                            <option value="">-- Pilih Kelompok (Opsional) --</option>
                            {safeKelompokList.map(k => (
                              <option key={k.id} value={k.id}>{k.nama_kelompok} ({k.nama_ustadz})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <KhwarizmiButton type="submit" variant="primary" size="md">
                          Simpan Data Santri
                        </KhwarizmiButton>
                      </div>
                    </form>
                  </KhwarizmiCard>
                )}

                <KhwarizmiInput
                  type="text"
                  placeholder="Cari santri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {filteredSantri.length === 0 ? (
                  <KhwarizmiEmptyState
                    icon="🎓"
                    title="Santri Tidak Ditemukan"
                    description="Tidak ada data santri yang cocok dengan pencarian Anda."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSantri.map((s) => (
                      <KhwarizmiCard key={s.id} variant="raised" padding="sm" className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {resolveEntityPhoto(s) ? (
                            <img
                              src={resolveEntityPhoto(s)!}
                              alt={s.nama_santri}
                              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs shrink-0">
                              {s.nama_santri?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-800 truncate">{s.nama_santri}</h4>
                            <p className="text-[10px] text-slate-400 truncate">NIS: {s.nomor_induk} | Kelompok: <span className="text-slate-700 font-bold">{s.nama_kelompok || '-'}</span></p>
                            <p className="text-[10px] text-emerald-600 font-bold truncate mt-0.5">Target: {s.target_semester || 'Belum diatur'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <KhwarizmiButton
                            variant="secondary"
                            size="sm"
                            onClick={() => { setSelectedTargetSantri(s); setTargetSemesterInput(s.target_semester || ''); }}
                          >
                            🎯 Target
                          </KhwarizmiButton>
                          <button
                            onClick={() => handleDeleteSantri(s.id, s.nama_santri)}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-bold flex items-center justify-center transition cursor-pointer"
                            title="Hapus Santri"
                          >
                            🗑️
                          </button>
                        </div>
                      </KhwarizmiCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: KELOLA USTADZ / MUSYRIF */}
            {activeTab === 'musyrif' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full text-left">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Manajemen Pengguna (Musyrif)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola akun Musyrif pembimbing Tahfizh, hak akses, dan reset password.</p>
                  </div>
                  <KhwarizmiButton
                    variant={showAddMusyrif ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => setShowAddMusyrif(!showAddMusyrif)}
                  >
                    {showAddMusyrif ? 'Batal' : '+ Tambah Pengguna'}
                  </KhwarizmiButton>
                </div>

                <KhwarizmiModal
                  isOpen={showAddMusyrif}
                  onClose={() => setShowAddMusyrif(false)}
                  title="Registrasi Musyrif"
                  subtitle="Buat akun Musyrif baru untuk sistem."
                >
                  <form onSubmit={handleAddMusyrif} className="flex flex-col gap-4">
                    <KhwarizmiInput
                      label="Nama Lengkap"
                      value={newMusyrif.nama_lengkap}
                      onChange={e => setNewMusyrif({ ...newMusyrif, nama_lengkap: e.target.value })}
                      required
                    />
                    <KhwarizmiInput
                      label="Username"
                      value={newMusyrif.username}
                      onChange={e => setNewMusyrif({ ...newMusyrif, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                      required
                    />
                    <KhwarizmiInput
                      label="Password"
                      type="password"
                      value={newMusyrif.password}
                      onChange={e => setNewMusyrif({ ...newMusyrif, password: e.target.value })}
                      required
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <KhwarizmiButton
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={() => setShowAddMusyrif(false)}
                      >
                        Batal
                      </KhwarizmiButton>
                      <KhwarizmiButton
                        type="submit"
                        variant="primary"
                        size="md"
                      >
                        Simpan Data
                      </KhwarizmiButton>
                    </div>
                  </form>
                </KhwarizmiModal>

                <KhwarizmiInput
                  type="text"
                  placeholder="Cari musyrif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {filteredUstadz.length === 0 ? (
                  <KhwarizmiEmptyState
                    icon="👥"
                    title="Musyrif Tidak Ditemukan"
                    description="Tidak ada data musyrif yang cocok dengan pencarian Anda."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredUstadz.map((u) => (
                      <KhwarizmiCard
                        key={u.id}
                        variant="raised"
                        padding="md"
                        className="flex flex-col justify-between gap-4 hover:border-emerald-500 transition-all"
                      >
                        <div
                          className="flex items-center gap-3.5 min-w-0 cursor-pointer"
                          onClick={() => handleOpenMusyrifProfile(u.id)}
                        >
                          {resolveEntityPhoto(u) ? (
                            <img
                              src={resolveEntityPhoto(u)!}
                              alt={u.nama_lengkap}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xs uppercase shrink-0">
                              {u.nama_lengkap?.charAt(0) || 'M'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-800 truncate hover:text-emerald-700 transition">{u.nama_lengkap}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-400 font-mono truncate">@{u.username}</span>
                              <KhwarizmiBadge variant={u.role === 'admin' ? 'info' : 'primary'}>
                                {u.role}
                              </KhwarizmiBadge>
                            </div>
                          </div>
                        </div>

                        {/* Streamlined & Clean Actions Toolbar */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
                          <div className="flex items-center gap-2">
                            <KhwarizmiButton
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenMusyrifProfile(u.id)}
                            >
                              👤 Profil
                            </KhwarizmiButton>
                            <KhwarizmiButton
                              variant="warning"
                              size="sm"
                              onClick={() => { setSelectedResetMusyrif(u); setNewPasswordInput(''); }}
                            >
                              🔑 Reset Pass
                            </KhwarizmiButton>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRoleMusyrif(u.id, u.nama_lengkap, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-700 cursor-pointer outline-none focus:bg-white focus:border-emerald-500"
                            >
                              <option value="musyrif">Musyrif</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleDeleteMusyrif(u.id, u.nama_lengkap)}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-bold flex items-center justify-center transition cursor-pointer"
                              title="Hapus Musyrif"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </KhwarizmiCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KELOLA UJIAN */}
            {activeTab === 'ujian' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Manajemen Ujian Tahfizh</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola pengajuan ujian dari musyrif, tentukan tanggal ujian santri, dan input hasil kelulusan.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <KhwarizmiButton
                      variant="secondary"
                      size="sm"
                      onClick={() => reloadExamList()}
                    >
                      🔄 Refresh Data
                    </KhwarizmiButton>
                  </div>
                </div>

                {/* FILTER STATUS CHIPS & SEARCH */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button
                      type="button"
                      onClick={() => setExamFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer select-none border whitespace-nowrap ${
                        examFilterStatus === 'all'
                          ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Semua ({examList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamFilterStatus('pengajuan')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer select-none border whitespace-nowrap flex items-center gap-1.5 ${
                        examFilterStatus === 'pengajuan'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <span>⏳ Pengajuan Baru</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${examFilterStatus === 'pengajuan' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {pengajuanCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamFilterStatus('persiapan')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer select-none border whitespace-nowrap flex items-center gap-1.5 ${
                        examFilterStatus === 'persiapan'
                          ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                          : 'bg-white text-sky-700 border-sky-200 hover:bg-sky-50'
                      }`}
                    >
                      <span>📝 Terjadwal</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${examFilterStatus === 'persiapan' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-800'}`}>
                        {persiapanCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamFilterStatus('remed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer select-none border whitespace-nowrap flex items-center gap-1.5 ${
                        examFilterStatus === 'remed'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <span>⚠️ Remedial</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${examFilterStatus === 'remed' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
                        {remedCount}
                      </span>
                    </button>
                  </div>

                  <div className="w-full sm:max-w-xs">
                    <KhwarizmiInput
                      type="text"
                      placeholder="Cari santri, NIS, materi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {examLoading ? (
                  <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-xs text-slate-500 font-bold shadow-sm">
                    ⌛ Memuat antrean ujian...
                  </div>
                ) : filteredExams.length === 0 ? (
                  <KhwarizmiEmptyState
                    icon={examFilterStatus === 'pengajuan' ? '⏳' : '🎉'}
                    title={
                      examFilterStatus === 'pengajuan'
                        ? 'Tidak Ada Pengajuan Ujian Baru'
                        : 'Tidak Ada Santri Dalam Antrean Ujian'
                    }
                    description={
                      examFilterStatus === 'pengajuan'
                        ? 'Belum ada santri yang diajukan ujian oleh musyrif.'
                        : 'Saat ini belum ada data santri yang cocok dengan filter atau pencarian.'
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExams.map((santri) => {
                      const isPengajuan = santri.status_santri === 'pengajuan_ujian';
                      const isRemed = santri.status_santri === 'remed_ujian';
                      const isPersiapan = santri.status_santri === 'persiapan_ujian';

                      return (
                        <KhwarizmiCard
                          key={santri.id}
                          variant="raised"
                          className="flex flex-col justify-between gap-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {resolveEntityPhoto(santri) ? (
                                <img
                                  src={resolveEntityPhoto(santri)!}
                                  alt={santri.nama_santri}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-sm shrink-0">
                                  {santri.nama_santri?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="text-sm font-black text-slate-800 truncate">{santri.nama_santri}</h3>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  NIS: <span className="font-bold text-slate-700">{santri.nomor_induk || '-'}</span>
                                </p>
                              </div>
                            </div>

                            {isPengajuan ? (
                              <KhwarizmiBadge variant="warning">⏳ Pengajuan Baru</KhwarizmiBadge>
                            ) : isRemed ? (
                              <KhwarizmiBadge variant="danger">⚠️ Remedial</KhwarizmiBadge>
                            ) : (
                              <KhwarizmiBadge variant="info">📝 Terjadwal</KhwarizmiBadge>
                            )}
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2 text-xs text-slate-600">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                              <span className="text-slate-400 font-bold text-[10px] uppercase">📅 Tanggal Ujian:</span>
                              {isPengajuan || !santri.tanggal_ujian ? (
                                <span className="font-bold text-amber-700 text-[11px] bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <span>⏳</span>
                                  <span>Belum Ditentukan (Menunggu Admin)</span>
                                </span>
                              ) : (
                                <span className="font-black text-slate-800 text-[11px]">
                                  {formatTanggalIndo(santri.tanggal_ujian)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                              <span className="text-slate-400 font-bold text-[10px] uppercase">🕌 Kelompok Halaqah:</span>
                              <span className="font-bold text-slate-700 text-[11px] truncate max-w-[180px]">
                                {santri.nama_kelompok || 'Belum Ada'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                              <span className="text-slate-400 font-bold text-[10px] uppercase">👤 Musyrif Pengampu:</span>
                              <span className="font-black text-emerald-600 text-[11px] truncate max-w-[180px]">
                                {santri.nama_musyrif || 'Belum Diplotting'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 pt-0.5">
                              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                {isPengajuan ? '📋 Pengajuan Juz & Catatan Musyrif:' : '📌 Catatan / Materi Ujian:'}
                              </span>
                              <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 italic leading-relaxed">
                                {santri.catatan_persiapan_ujian || 'Tidak ada catatan khusus dari musyrif.'}
                              </p>
                            </div>
                          </div>

                          {isPengajuan ? (
                            <KhwarizmiButton
                              variant="primary"
                              size="md"
                              onClick={() => handleOpenSetJadwalModal(santri)}
                              className="w-full bg-gradient-to-b from-sky-500 to-sky-600 border-sky-700 shadow-[0_4px_0_0_#0369a1] hover:from-sky-400 hover:to-sky-500"
                            >
                              📅 Tentukan Tanggal Ujian
                            </KhwarizmiButton>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <KhwarizmiButton
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenSetJadwalModal(santri)}
                                className="w-full"
                              >
                                📅 Ubah Jadwal
                              </KhwarizmiButton>
                              <KhwarizmiButton
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenSubmitHasilModal(santri)}
                                className="w-full"
                              >
                                ✏️ Input Hasil
                              </KhwarizmiButton>
                            </div>
                          )}
                        </KhwarizmiCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PLOTTING SANTRI */}
            {activeTab === 'plotting' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full text-left">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Plotting Santri Pusat</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Asignasi data santri ke akun Musyrif masing-masing.</p>
                  </div>
                  <KhwarizmiButton
                    variant="primary"
                    size="sm"
                    onClick={handleSavePlotting}
                  >
                    💾 Simpan Formasi {Object.keys(changedPlotting).length > 0 ? `(${Object.keys(changedPlotting).length})` : ''}
                  </KhwarizmiButton>
                </div>

                <KhwarizmiCard variant="raised" padding="none" className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 p-4 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <span className="hidden sm:block">Data Santri</span>
                    <span className="hidden sm:block">Ustadz Pengampu</span>
                    <span className="block sm:hidden">Data Santri & Pengampu</span>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100">
                    {safeSantriList.map((s) => (
                      <div key={s.id} className="flex flex-col sm:grid-cols-2 sm:grid p-4 items-start sm:items-center text-xs hover:bg-slate-50/70 transition-all duration-150 gap-3 sm:gap-4">
                        <div className="min-w-0 w-full flex items-center gap-3">
                          {resolveEntityPhoto(s) ? (
                            <img
                              src={resolveEntityPhoto(s)!}
                              alt={s.nama_santri}
                              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs shrink-0">
                              {s.nama_santri?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block truncate">{s.nama_santri}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">NIS: {s.nomor_induk}</span>
                          </div>
                        </div>
                        <div className="w-full">
                          <select
                            value={changedPlotting[s.id] !== undefined ? String(changedPlotting[s.id]) : String(s.kelompok_id || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              setChangedPlotting(prev => ({ ...prev, [s.id]: val === "" ? null : parseInt(val) }));
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 w-full focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                          >
                            <option value="" className="text-slate-400">-- Pilih Kelompok Halaqah --</option>
                            {safeKelompokList.map((k) => (
                              <option key={k.id} value={String(k.id)}>
                                {k.nama_kelompok} ({k.nama_ustadz})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </KhwarizmiCard>
              </div>
            )}

            {/* TAB 6: KELOLA HALAQAH */}
            {activeTab === 'halaqah' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full text-left">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Kelola & Monitor Halaqah</h2>
                    <p className="text-xs text-slate-500 mt-1">Satu pintu untuk kelola kelompok dan pantau laporan secara realtime.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <KhwarizmiButton
                      variant={showAddKelompok ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => { setShowAddKelompok(!showAddKelompok); setShowDisrupsiForm(false); }}
                      className="w-full sm:w-auto"
                    >
                      {showAddKelompok ? 'Batal' : '+ Kelompok Baru'}
                    </KhwarizmiButton>
                    <KhwarizmiButton
                      variant={showDisrupsiForm ? 'secondary' : 'warning'}
                      size="sm"
                      onClick={() => { setShowDisrupsiForm(!showDisrupsiForm); setShowAddKelompok(false); }}
                      className="w-full sm:w-auto"
                    >
                      {showDisrupsiForm ? 'Batal' : '⚡ Catat Disrupsi/Libur'}
                    </KhwarizmiButton>
                  </div>
                </div>

                {showAddKelompok && (
                  <KhwarizmiCard variant="raised" className="animate-fadeIn">
                    <h3 className="text-sm font-black text-slate-800 mb-3">➕ Bikin Kelompok Baru</h3>
                    <form onSubmit={handleAddKelompok} className="flex flex-col sm:flex-row gap-3 items-end">
                      <KhwarizmiInput
                        label="Nama Kelompok"
                        placeholder="Nama Kelompok"
                        value={newKelompok.nama_kelompok}
                        onChange={e => setNewKelompok({ ...newKelompok, nama_kelompok: e.target.value })}
                        required
                      />
                      <div className="flex flex-col gap-1 w-full text-left">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Musyrif Utama
                        </label>
                        <select
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none transition-all duration-150 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                          value={newKelompok.musyrif_id}
                          onChange={e => setNewKelompok({ ...newKelompok, musyrif_id: e.target.value })}
                          required
                        >
                          <option value="">-- Tunjuk Musyrif Utama --</option>
                          {safeUstadzList.filter((u) => u.role === 'musyrif').map((u) => (
                            <option key={u.id} value={u.id}>{u.nama_lengkap}</option>
                          ))}
                        </select>
                      </div>
                      <KhwarizmiButton type="submit" variant="primary" size="md" className="w-full sm:w-44 shrink-0">
                        SIMPAN
                      </KhwarizmiButton>
                    </form>
                  </KhwarizmiCard>
                )}

                {showDisrupsiForm && (
                  <KhwarizmiCard variant="raised" className="animate-fadeIn border-amber-200">
                    <h3 className="text-sm font-black text-amber-800 mb-3">⚡ Log Disrupsi & Status Libur</h3>
                    <form onSubmit={handleSubmitDisrupsi} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipe Disrupsi</label>
                        <select
                          value={disrupsiForm.status_halaqah}
                          onChange={(e) => setDisrupsiForm({ ...disrupsiForm, status_halaqah: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                        >
                          <option value="diganti_badal">Ganti dengan Ustadz Badal</option>
                          <option value="diliburkan_total">Diliburkan (Semua Halaqah)</option>
                        </select>
                      </div>

                      {disrupsiForm.status_halaqah === 'diganti_badal' && (
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kelompok Bermasalah</label>
                          <select
                            value={disrupsiForm.kelompok_id}
                            onChange={(e) => setDisrupsiForm({ ...disrupsiForm, kelompok_id: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                            required
                          >
                            <option value="">-- Pilih Kelompok Bermasalah --</option>
                            {safeKelompokList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelompok} (Asli: {k.nama_ustadz})</option>)}
                          </select>
                        </div>
                      )}

                      {disrupsiForm.status_halaqah === 'diganti_badal' && (
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ustadz Badal</label>
                          <select
                            value={disrupsiForm.badal_musyrif_id}
                            onChange={(e) => setDisrupsiForm({ ...disrupsiForm, badal_musyrif_id: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                          >
                            <option value="">-- Tunjuk Ustadz Badal --</option>
                            {safeUstadzList.filter((u) => u.role === 'musyrif').map((u) => (<option key={u.id} value={u.id}>{u.nama_lengkap}</option>))}
                          </select>
                        </div>
                      )}

                      <div className={disrupsiForm.status_halaqah === 'diliburkan_total' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                        <KhwarizmiInput
                          label="Alasan"
                          placeholder={disrupsiForm.status_halaqah === 'diliburkan_total' ? "Alasan Libur (cth: Tanggal Merah / Libur Nasional)..." : "Alasan Badal..."}
                          value={disrupsiForm.alasan}
                          onChange={(e) => setDisrupsiForm({ ...disrupsiForm, alasan: e.target.value })}
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end mt-2">
                        <KhwarizmiButton type="submit" variant="primary" size="md">
                          Simpan Status {disrupsiForm.status_halaqah === 'diliburkan_total' ? 'Libur' : 'Disrupsi'}
                        </KhwarizmiButton>
                      </div>
                    </form>
                  </KhwarizmiCard>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeMonitorHalaqah.map((h, idx) => (
                    <KhwarizmiCard
                      key={idx}
                      variant="raised"
                      className={`relative flex flex-col justify-between gap-4 h-full ${
                        h.status_halaqah === 'diganti_badal'
                          ? 'border-rose-200'
                          : h.status_halaqah === 'diliburkan_total'
                            ? 'border-amber-200'
                            : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-slate-800 truncate">{h.nama_kelompok}</h4>
                          <span className="text-[9px] font-mono font-bold text-slate-400">ID: {h.kelompok_id}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {h.status_halaqah === 'diganti_badal' && (
                            <KhwarizmiBadge variant="danger">BADAL</KhwarizmiBadge>
                          )}
                          {h.status_halaqah === 'diliburkan_total' && (
                            <KhwarizmiBadge variant="warning">LIBUR</KhwarizmiBadge>
                          )}
                          {h.status_halaqah === 'normal' && (
                            <KhwarizmiBadge variant="success">NORMAL</KhwarizmiBadge>
                          )}

                          <button
                            onClick={() => handleDeleteKelompok(h.kelompok_id, h.nama_kelompok)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-bold flex items-center justify-center transition cursor-pointer"
                            title="Hapus Kelompok Ini"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="truncate">👤 Musyrif Asli: <span className="font-bold text-slate-800">{h.musyrif_asli}</span></p>
                        <p className="truncate">🎓 Total Santri: <span className="font-bold text-slate-800">{h.total_santri} santri</span></p>
                      </div>

                      {(h.status_halaqah === 'diganti_badal' || h.status_halaqah === 'diliburkan_total') && h.info_badal && (
                        <div className={`${h.status_halaqah === 'diliburkan_total' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'} border p-3 rounded-xl mt-auto`}>
                          {h.status_halaqah === 'diganti_badal' ? (
                            <p className="text-[10px] text-rose-700 font-black mb-0.5 truncate">Badal: {h.info_badal.nama_badal}</p>
                          ) : (
                            <p className="text-[10px] text-amber-700 font-black mb-0.5 truncate">Status: Sedang Libur</p>
                          )}
                          <p className={`text-[9px] ${h.status_halaqah === 'diliburkan_total' ? 'text-amber-600' : 'text-rose-500'} italic mb-2 line-clamp-1`}>"{h.info_badal.alasan}"</p>
                          <KhwarizmiButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelBadal(h.kelompok_id)}
                            className="w-full"
                          >
                            Batalkan {h.status_halaqah === 'diliburkan_total' ? 'Libur' : 'Badal'}
                          </KhwarizmiButton>
                        </div>
                      )}

                      <div className={`${h.status_halaqah === 'normal' ? 'mt-auto' : ''} pt-2 border-t border-slate-100`}>
                        <KhwarizmiButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenHistory(h.kelompok_id)}
                          className="w-full"
                        >
                          LIHAT HISTORI
                        </KhwarizmiButton>
                      </div>
                    </KhwarizmiCard>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM NAVIGATION MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {(['overview', 'santri', 'musyrif', 'ujian', 'plotting', 'halaqah'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const tabConfig = {
                overview: { icon: '📊', label: 'Overview' },
                santri: { icon: '🎓', label: 'Santri' },
                musyrif: { icon: '👥', label: 'Musyrif' },
                ujian: { icon: '📝', label: 'Ujian' },
                plotting: { icon: '📌', label: 'Plotting' },
                halaqah: { icon: '🕌', label: 'Halaqah' },
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center justify-center flex-1 min-w-[54px] py-2 px-1 rounded-2xl text-[10px] font-black transition-all select-none cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-[0_3px_0_0_#065f46] -translate-y-px border border-emerald-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base leading-none mb-1">{tabConfig[tab].icon}</span>
                  <span className="truncate w-full text-center tracking-tight leading-none text-[9px]">
                    {tabConfig[tab].label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>

      {/* MODAL RESET PASSWORD MUSYRIF */}
      <KhwarizmiModal
        isOpen={!!selectedResetMusyrif}
        onClose={() => setSelectedResetMusyrif(null)}
        title="Reset Password Musyrif"
        subtitle={selectedResetMusyrif ? `Akun: ${selectedResetMusyrif.nama_lengkap} (@${selectedResetMusyrif.username})` : undefined}
      >
        {selectedResetMusyrif && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 text-left">
            <KhwarizmiInput
              label="Password Baru"
              type="password"
              placeholder="Masukkan password baru..."
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-1">
              <KhwarizmiButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setSelectedResetMusyrif(null)}
                className="flex-1"
              >
                Batal
              </KhwarizmiButton>
              <KhwarizmiButton
                type="submit"
                variant="primary"
                size="md"
                className="flex-1"
              >
                Simpan Password Baru
              </KhwarizmiButton>
            </div>
          </form>
        )}
      </KhwarizmiModal>

      {/* MODAL SUBMIT HASIL UJIAN */}
      <KhwarizmiModal
        isOpen={!!selectedExamSantri}
        onClose={() => setSelectedExamSantri(null)}
        title="Input Hasil Ujian"
        subtitle={selectedExamSantri ? `${selectedExamSantri.nama_santri} — ${selectedExamSantri.nama_kelompok || 'Halaqah'}` : undefined}
      >
        {selectedExamSantri && (
          <form onSubmit={handleSubmitHasilUjian} className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {resolveEntityPhoto(selectedExamSantri) ? (
                <img
                  src={resolveEntityPhoto(selectedExamSantri)!}
                  alt={selectedExamSantri.nama_santri}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {selectedExamSantri.nama_santri?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-xs font-black text-slate-800">{selectedExamSantri.nama_santri}</h4>
                <p className="text-[10px] text-slate-500 font-medium">NIS: {selectedExamSantri.nomor_induk || '-'}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                Hasil Kelulusan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExamResultForm({ ...examResultForm, hasil: 'lulus' })}
                  className={`py-3 px-3 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer ${
                    examResultForm.hasil === 'lulus'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_3px_0_0_#A7F3D0]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ✅ Lulus Ujian
                </button>
                <button
                  type="button"
                  onClick={() => setExamResultForm({ ...examResultForm, hasil: 'remed' })}
                  className={`py-3 px-3 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer ${
                    examResultForm.hasil === 'remed'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-[0_3px_0_0_#FECDD3]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔄 Remedial
                </button>
              </div>
            </div>

            <KhwarizmiInput
              label="Nilai Ujian (Skala 0 - 100)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="Contoh: 87.5"
              value={examResultForm.nilai}
              onChange={(e) => setExamResultForm({ ...examResultForm, nilai: e.target.value })}
            />

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Catatan Penguji / Evaluasi
              </label>
              <textarea
                rows={3}
                placeholder="Catatan evaluasi tajwid, kelancaran, atau poin perbaikan..."
                value={examResultForm.catatan}
                onChange={(e) => setExamResultForm({ ...examResultForm, catatan: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none resize-none focus:bg-white focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <KhwarizmiButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setSelectedExamSantri(null)}
                className="flex-1"
              >
                Batal
              </KhwarizmiButton>
              <KhwarizmiButton
                type="submit"
                variant="primary"
                size="md"
                className="flex-1"
              >
                Simpan & Selesai
              </KhwarizmiButton>
            </div>
          </form>
        )}
      </KhwarizmiModal>

      {/* MODAL TENTUKAN / EDIT JADWAL UJIAN */}
      <KhwarizmiModal
        isOpen={!!selectedJadwalSantri}
        onClose={() => setSelectedJadwalSantri(null)}
        title="📅 Penetapan Tanggal Ujian"
        subtitle={selectedJadwalSantri ? `${selectedJadwalSantri.nama_santri} — ${selectedJadwalSantri.nama_kelompok || 'Halaqah'}` : undefined}
      >
        {selectedJadwalSantri && (
          <form onSubmit={handleSubmitSetJadwal} className="flex flex-col gap-4 text-left">
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-[11px] text-sky-800 font-medium leading-relaxed">
              💡 <strong>Instruksi Admin:</strong> Musyrif telah mengajukan santri ini untuk ujian. Silakan tentukan <strong>Tanggal Ujian</strong> agar santri resmi terdaftar pada jadwal ujian tahfizh.
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {resolveEntityPhoto(selectedJadwalSantri) ? (
                <img
                  src={resolveEntityPhoto(selectedJadwalSantri)!}
                  alt={selectedJadwalSantri.nama_santri}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {selectedJadwalSantri.nama_santri?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-800">{selectedJadwalSantri.nama_santri}</h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  NIS: {selectedJadwalSantri.nomor_induk || '-'} • Kelompok: {selectedJadwalSantri.nama_kelompok || '-'}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  Musyrif: {selectedJadwalSantri.nama_musyrif || '-'}
                </p>
              </div>
            </div>

            {selectedJadwalSantri.catatan_persiapan_ujian && (
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider block mb-1">
                  📋 Detail Pengajuan Dari Musyrif
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {selectedJadwalSantri.catatan_persiapan_ujian}
                </p>
              </div>
            )}

            <KhwarizmiInput
              label="Tanggal Pelaksanaan Ujian *"
              type="date"
              value={jadwalForm.tanggal_ujian}
              onChange={(e) => setJadwalForm({ ...jadwalForm, tanggal_ujian: e.target.value })}
              required
            />

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                Catatan / Materi Ujian (Bisa Disunting)
              </label>
              <textarea
                rows={3}
                placeholder="Catatan tambahan admin atau revisi materi ujian..."
                value={jadwalForm.catatan_persiapan_ujian}
                onChange={(e) => setJadwalForm({ ...jadwalForm, catatan_persiapan_ujian: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none resize-none focus:bg-white focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <KhwarizmiButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setSelectedJadwalSantri(null)}
                className="flex-1"
              >
                Batal
              </KhwarizmiButton>
              <KhwarizmiButton
                type="submit"
                variant="primary"
                size="md"
                loading={jadwalLoading}
                className="flex-1"
              >
                💾 Tetapkan Jadwal Ujian
              </KhwarizmiButton>
            </div>
          </form>
        )}
      </KhwarizmiModal>

      {/* MODAL TARGET SEMESTER SANTRI */}
      <KhwarizmiModal
        isOpen={!!selectedTargetSantri}
        onClose={() => setSelectedTargetSantri(null)}
        title="Atur Target Semester"
        subtitle={selectedTargetSantri ? `Santri: ${selectedTargetSantri.nama_santri}` : undefined}
      >
        {selectedTargetSantri && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {resolveEntityPhoto(selectedTargetSantri) ? (
                <img
                  src={resolveEntityPhoto(selectedTargetSantri)!}
                  alt={selectedTargetSantri.nama_santri}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  {selectedTargetSantri.nama_santri?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-xs font-black text-slate-800">{selectedTargetSantri.nama_santri}</h4>
                <p className="text-[10px] text-slate-500 font-medium">NIS: {selectedTargetSantri.nomor_induk || '-'}</p>
              </div>
            </div>

            <KhwarizmiInput
              label="Target Semester"
              placeholder="Contoh: Juz 1 - 3"
              value={targetSemesterInput}
              onChange={e => setTargetSemesterInput(e.target.value)}
            />

            <div className="flex gap-2 mt-1">
              <KhwarizmiButton
                variant="secondary"
                size="md"
                onClick={() => setSelectedTargetSantri(null)}
                className="flex-1"
              >
                Batal
              </KhwarizmiButton>
              <KhwarizmiButton
                variant="primary"
                size="md"
                onClick={handleSaveTargetSemester}
                className="flex-1"
              >
                Simpan
              </KhwarizmiButton>
            </div>
          </div>
        )}
      </KhwarizmiModal>

      {/* MODAL PROFIL MUSYRIF */}
      <KhwarizmiModal
        isOpen={!!selectedMusyrifProfile}
        onClose={() => setSelectedMusyrifProfile(null)}
        maxWidth="max-w-lg"
        title={selectedMusyrifProfile?.profile?.nama_lengkap || 'Profil Musyrif'}
        subtitle={selectedMusyrifProfile?.profile?.username ? `@${selectedMusyrifProfile.profile.username}` : undefined}
      >
        {selectedMusyrifProfile && (
          <div className="flex flex-col gap-4 text-left">
            {/* Streamlined 2x2 Grid for Stat Cards inside modal to prevent squishing */}
            <div className="grid grid-cols-2 gap-3">
              <KhwarizmiStatCard
                label="Kelompok"
                value={selectedMusyrifProfile.profile?.total_kelompok || 0}
                variant="primary"
              />
              <KhwarizmiStatCard
                label="Santri Binaan"
                value={selectedMusyrifProfile.profile?.total_santri_binaan || 0}
                variant="neutral"
              />
              <KhwarizmiStatCard
                label="Total Setoran"
                value={selectedMusyrifProfile.profile?.total_setoran_diampu || 0}
                variant="info"
              />
              <KhwarizmiStatCard
                label="Terdaftar"
                value={selectedMusyrifProfile.profile?.tanggal_dibuat || '-'}
                variant="neutral"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Kelompok Yang Diampu
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMusyrifProfile.profile?.kelompok_diampu?.map((k: string, i: number) => (
                  <KhwarizmiBadge key={i} variant="primary">{k}</KhwarizmiBadge>
                )) || <span className="text-xs text-slate-400 italic">Belum mengampu kelompok</span>}
              </div>
            </div>

            <KhwarizmiButton
              variant="secondary"
              size="md"
              onClick={() => setSelectedMusyrifProfile(null)}
              className="w-full"
            >
              Tutup Profil
            </KhwarizmiButton>
          </div>
        )}
      </KhwarizmiModal>

      {/* MODAL HISTORI LAPORAN KELOMPOK */}
      <KhwarizmiModal
        isOpen={showHistoryModal !== null}
        onClose={() => setShowHistoryModal(null)}
        maxWidth="max-w-lg"
        title={`Histori Setoran Kelompok #${showHistoryModal}`}
        subtitle="Rekapitulasi setoran hafalan santri dalam kelompok ini."
      >
        <div className="flex flex-col gap-3 text-left">
          {loadingHistory ? (
            <div className="text-center py-8 text-xs font-mono text-emerald-600 animate-pulse">
              Memuat histori setoran...
            </div>
          ) : historyData.length === 0 ? (
            <KhwarizmiEmptyState
              icon="📖"
              title="Belum Ada Histori"
              description="Belum ada catatan setoran untuk kelompok ini."
            />
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {historyData.map((h: any, i: number) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-800">{h.nama_santri}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{h.waktu_setoran}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-700">{h.surah} : {h.ayat}</span>
                    <KhwarizmiBadge variant={String(h.status_kelancaran || '').toLowerCase().includes('tersendat') ? 'warning' : 'success'}>
                      {h.status_kelancaran || 'Lancar'}
                    </KhwarizmiBadge>
                  </div>
                  {h.catatan_musyrif && (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100 mt-1">
                      "{h.catatan_musyrif}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <KhwarizmiButton
            variant="secondary"
            size="md"
            onClick={() => setShowHistoryModal(null)}
            className="w-full mt-1"
          >
            Tutup Histori
          </KhwarizmiButton>
        </div>
      </KhwarizmiModal>
    </div>
  );
}