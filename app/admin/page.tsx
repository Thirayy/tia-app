'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { ensureArray, getApiUrl } from '@/lib/api';
import { getSession, isAdminRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// Custom Notification Pop-up Component
function NotificationModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning' 
}) {
  if (!isOpen) return null;

  const typeStyles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  };

  const icons = {
    success: '🎉',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className={`max-w-md w-full bg-[#111827] border rounded-2xl p-6 shadow-2xl flex flex-col gap-4 transform transition-all ${typeStyles[type]}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icons[type]}</span>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="mt-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
        >
          Tutup & Lanjutkan
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose, maxWidth = 'md' }: { children: React.ReactNode; onClose: () => void; maxWidth?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const maxW = maxWidth === 'lg' ? 'max-w-lg' : (maxWidth === 'md' ? 'max-w-md' : 'max-w-sm');
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onMouseDown={onClose}>
      <div className={`${maxW} w-full bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
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
  
  // Modals Histori & Profil
  const [showHistoryModal, setShowHistoryModal] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [showAddMusyrif, setShowAddMusyrif] = useState(false);
  const [newMusyrif, setNewMusyrif] = useState({ nama_lengkap: '', username: '', password: '' });
  
  const [selectedMusyrifProfile, setSelectedMusyrifProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

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
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch (e) {
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
  const filteredExams = examList.filter((ex) =>
    ex.nama_santri?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.nomor_induk?.toString().includes(searchTerm) ||
    ex.nama_kelompok?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* NOTIFICATION MODAL */}
      <NotificationModal 
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-6 flex-col gap-8 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-lg shadow-emerald-200">A</div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 uppercase">Admin Portal</h1>
          </div>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase pl-10 block">TIA Management</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Navigasi Utama</span>
          {(['overview', 'santri', 'musyrif', 'ujian', 'plotting', 'halaqah'] as const).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'overview' ? '📊 Overview' : 
               tab === 'santri' ? '🎓 Kelola Santri' : 
               tab === 'musyrif' ? '👥 Kelola Musyrif' : 
               tab === 'ujian' ? '📝 Kelola Ujian' : 
               tab === 'plotting' ? '📌 Plotting' : '🕌 Halaqah'}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            User: {adminName}
          </div>
          <button onClick={() => router.push('/musyrif')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase text-slate-600 hover:text-red-500 hover:border-red-200 transition-all">
            🚪 Exit Gateway
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* TOP HEADER MOBILE */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-lg shadow-emerald-200">A</div>
            <h2 className="text-sm font-bold tracking-tight text-slate-800 uppercase">TIA Admin Portal</h2>
          </div>
          <button onClick={() => router.push('/musyrif')} className="text-[10px] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-bold uppercase text-slate-600">
            Exit
          </button>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-4">

            {/* WARNING BANNER HALAQAH DISRUPSI/BADAL/LIBUR */}
            {halaqahBermasalahList.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl animate-bounce">⚡</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-700 uppercase">Perhatian: {halaqahBermasalahList.length} Halaqah Memiliki Status Disrupsi / Libur</h4>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Kelompok: {halaqahBermasalahList.map(h => h.nama_kelompok).join(', ')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('halaqah')} 
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition self-end sm:self-auto"
                >
                  Cek Realtime
                </button>
              </div>
            )}

            {fetchError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl">
                {fetchError}
              </div>
            )}
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas TIA secara global dari backend.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'Ustadz / Musyrif', val: overviewData.ustadz },
                    { label: 'Santri', val: overviewData.santri },
                    { label: 'Total Laporan', val: overviewData.total_laporan },
                    { label: 'Santri Aktif', val: overviewData.santri_aktif },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
                      <p className="text-2xl font-black text-slate-800">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 p-5 rounded-xl xl:col-span-2 shadow-sm">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">Aktivitas & Log Laporan Global</h3>
                    
                    <div className="h-56 flex flex-col justify-between bg-slate-50 rounded-xl border border-slate-200 p-4 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">Statistik Tren Laporan</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">Live Line</span>
                      </div>
                      
                      <div className="relative w-full h-32 flex items-end">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,110 Q 75,80 150,95 T 300,50 T 500,20 L 500,150 L 0,150 Z" fill="url(#lineGradient)" />
                          <path d="M 0,110 Q 75,80 150,95 T 300,50 T 500,20" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                        <span>Pekan 1</span>
                        <span>Pekan 2</span>
                        <span>Pekan 3</span>
                        <span>Pekan Ini ({overviewData.total_laporan} Laporan)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Cakupan Setoran Santri</h3>
                    <div className="flex flex-col gap-2">
                      {safeSantriList.slice(0, 5).map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                          <span className="text-slate-700 font-bold truncate pr-2">{s.nama_santri}</span>
                          <span className="font-bold text-emerald-600 shrink-0">{s.total_setoran || 0} setoran</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KELOLA SANTRI */}
            {activeTab === 'santri' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Manajemen Santri</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola data seluruh santri dan target semester.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddSantri(!showAddSantri)} 
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl text-xs text-white font-bold uppercase"
                  >
                    {showAddSantri ? 'Batal' : '+ Tambah Santri'}
                  </button>
                </div>

                {showAddSantri && (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleAddSantri(); }}
                    className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                  >
                    <h3 className="text-sm font-bold text-slate-800">Tambah Santri Baru</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={newSantri.nama_santri}
                        onChange={(e) => setNewSantri({...newSantri, nama_santri: e.target.value})}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nomor Induk (NIS)"
                        value={newSantri.nomor_induk}
                        onChange={(e) => setNewSantri({...newSantri, nomor_induk: e.target.value})}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <select
                        value={newSantri.kelompok_id}
                        onChange={(e) => setNewSantri({...newSantri, kelompok_id: e.target.value})}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none bg-white cursor-pointer"
                      >
                        <option value="">-- Pilih Kelompok (Opsional) --</option>
                        {safeKelompokList.map(k => (
                          <option key={k.id} value={k.id}>{k.nama_kelompok} ({k.nama_ustadz})</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-bold">
                      Simpan Data
                    </button>
                  </form>
                )}

                <input
                  type="text"
                  placeholder="Cari santri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs w-full outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSantri.map((s) => (
                    <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm gap-3">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {resolveEntityPhoto(s) ? (
                          <img
                            src={resolveEntityPhoto(s)!}
                            alt={s.nama_santri}
                            className="w-11 h-11 rounded-full object-cover border border-emerald-300 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs shrink-0">
                            {s.nama_santri?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{s.nama_santri}</h4>
                          <p className="text-[10px] text-slate-400 truncate">NIS: {s.nomor_induk} | Kelompok: <span className="text-slate-700 font-semibold">{s.nama_kelompok}</span></p>
                          <p className="text-[10px] text-emerald-600 font-medium truncate">Target: {s.target_semester || 'Belum diatur'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => { setSelectedTargetSantri(s); setTargetSemesterInput(s.target_semester || ''); }}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-[10px] rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          🎯 Target
                        </button>
                        <button onClick={() => handleDeleteSantri(s.id, s.nama_santri)} className="p-2 hover:text-red-500">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: KELOLA USTADZ / MUSYRIF */}
            {activeTab === 'musyrif' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna (Musyrif)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola akun Musyrif pembimbing Tahfizh dan hak akses.</p>
                  </div>
                  <button
                    onClick={() => setShowAddMusyrif(!showAddMusyrif)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition shadow-md w-full sm:w-auto text-center"
                  >
                    {showAddMusyrif ? 'Batal' : '+ Tambah Pengguna'}
                  </button>
                </div>

                {showAddMusyrif && (
                  <Modal onClose={() => setShowAddMusyrif(false)} maxWidth="lg">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Registrasi Musyrif</h3>
                        <p className="text-xs text-slate-500">Buat akun Musyrif baru untuk sistem.</p>
                      </div>
                      <button onClick={() => setShowAddMusyrif(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
                    </div>

                    <form onSubmit={handleAddMusyrif} className="mt-4 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="relative min-w-0">
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Nama Lengkap</span>
                          <input type="text" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs w-full focus:border-emerald-600 outline-none text-slate-800" value={newMusyrif.nama_lengkap} onChange={e => setNewMusyrif({ ...newMusyrif, nama_lengkap: e.target.value })} required />
                        </label>
                        <label className="relative min-w-0">
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Username</span>
                          <input type="text" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs w-full focus:border-emerald-600 outline-none text-slate-800" value={newMusyrif.username} onChange={e => setNewMusyrif({ ...newMusyrif, username: e.target.value.replace(/\s+/g, '').toLowerCase() })} required />
                        </label>
                        <label className="relative min-w-0">
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Password</span>
                          <input type="password" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs w-full focus:border-emerald-600 outline-none text-slate-800" value={newMusyrif.password} onChange={e => setNewMusyrif({ ...newMusyrif, password: e.target.value })} required />
                        </label>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowAddMusyrif(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Batal</button>
                        <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">Simpan Data</button>
                      </div>
                    </form>
                  </Modal>
                )}

                <input
                  type="text"
                  placeholder="Cari musyrif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 w-full outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {filteredUstadz.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 p-8 rounded-xl text-center text-xs text-slate-400">📭 Tidak ada data ditemukan.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredUstadz.map((u) => (
                      <div key={u.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm hover:border-emerald-500 transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => handleOpenMusyrifProfile(u.id)}>
                          {resolveEntityPhoto(u) ? (
                            <img
                              src={resolveEntityPhoto(u)!}
                              alt={u.nama_lengkap}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-300 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0">{u.nama_lengkap?.charAt(0) || 'M'}</div>
                          )}
                          <div className="min-w-0 flex-1 pr-2">
                            <h4 className="text-xs font-bold text-slate-800 truncate hover:underline">{u.nama_lengkap}</h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate">@{u.username} | <span className="uppercase text-emerald-600 font-bold">{u.role}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button onClick={() => handleOpenMusyrifProfile(u.id)} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-[10px] rounded-lg text-slate-600 hover:bg-slate-100">👤 Profil</button>
                          <select value={u.role} onChange={(e) => handleChangeRoleMusyrif(u.id, u.nama_lengkap, e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[10px] text-slate-600 cursor-pointer outline-none">
                            <option value="musyrif">Musyrif</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => handleDeleteMusyrif(u.id, u.nama_lengkap)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg text-xs shrink-0">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KELOLA UJIAN */}
            {activeTab === 'ujian' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Manajemen Ujian Tahfizh</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Daftar santri yang dalam status Persiapan / Remedial Ujian beserta jadwal dan musyrif pengampu.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => reloadExamList()} 
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                    >
                      🔄 Refresh Data
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Cari nama santri, NIS, atau kelompok halaqah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 w-full outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />

                {examLoading ? (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-500 font-medium shadow-sm">
                    ⌛ Memuat daftar peserta ujian...
                  </div>
                ) : filteredExams.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 p-10 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🎉</span>
                    <h4 className="text-xs font-bold text-slate-700">Tidak ada santri dalam antrean ujian</h4>
                    <p className="text-[11px] text-slate-400">Saat ini belum ada santri bertipe status "persiapan_ujian" atau "remed_ujian".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExams.map((santri) => {
                      const isRemed = santri.status_santri === 'remed_ujian';

                      return (
                        <div 
                          key={santri.id} 
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-emerald-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {resolveEntityPhoto(santri) ? (
                                <img
                                  src={resolveEntityPhoto(santri)!}
                                  alt={santri.nama_santri}
                                  className="w-12 h-12 rounded-full object-cover border border-emerald-300 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm shrink-0">
                                  {santri.nama_santri?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-800 truncate">{santri.nama_santri}</h3>
                                <p className="text-[11px] text-slate-400 font-mono">NIS: <span className="font-semibold text-slate-600">{santri.nomor_induk || '-'}</span></p>
                              </div>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                              isRemed 
                                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              {isRemed ? '⚠️ Remedial' : '📝 Persiapan Ujian'}
                            </span>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs text-slate-600">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                              <span className="text-slate-400 font-medium text-[11px]">📅 Tanggal Ujian:</span>
                              <span className="font-bold text-slate-800 text-[11px]">
                                {formatTanggalIndo(santri.tanggal_ujian)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                              <span className="text-slate-400 font-medium text-[11px]">🕌 Kelompok Halaqah:</span>
                              <span className="font-bold text-slate-700 text-[11px] truncate max-w-[180px]">
                                {santri.nama_kelompok || 'Belum Ada'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                              <span className="text-slate-400 font-medium text-[11px]">👤 Musyrif Penguji:</span>
                              <span className="font-bold text-emerald-600 text-[11px] truncate max-w-[180px]">
                                {santri.nama_musyrif || 'Belum Diplotting'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 pt-0.5">
                              <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">📌 Catatan / Materi Ujian:</span>
                              <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 italic leading-relaxed">
                                {santri.catatan_persiapan_ujian || 'Tidak ada catatan materi ujian dari musyrif.'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenSubmitHasilModal(santri)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
                          >
                            ✏️ Input Hasil Ujian
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PLOTTING SANTRI */}
            {activeTab === 'plotting' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Plotting Santri Pusat</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Asignasi data santri ke akun Musyrif masing-masing.</p>
                  </div>
                  <button
                    onClick={handleSavePlotting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition shadow-md w-full sm:w-auto text-center"
                  >
                    💾 Simpan Formasi {Object.keys(changedPlotting).length > 0 ? `(${Object.keys(changedPlotting).length})` : ''}
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 p-4 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <span className="hidden sm:block">Data Santri</span>
                    <span className="hidden sm:block">Ustadz Pengampu</span>
                    <span className="block sm:hidden">Data Santri & Pengampu</span>
                  </div>
                  
                  <div className="flex flex-col divide-y divide-slate-100">
                    {safeSantriList.map((s) => (
                      <div key={s.id} className="flex flex-col sm:grid-cols-2 sm:grid p-4 items-start sm:items-center text-xs hover:bg-slate-50 transition-all duration-150 gap-3 sm:gap-4">
                        <div className="min-w-0 w-full flex items-center gap-3">
                          {resolveEntityPhoto(s) ? (
                            <img
                              src={resolveEntityPhoto(s)!}
                              alt={s.nama_santri}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-300 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs shrink-0">
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
                            className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 w-full focus:outline-none focus:border-emerald-600 cursor-pointer"
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
                </div>
              </div>
            )}

            {/* TAB 6: KELOLA HALAQAH */}
            {activeTab === 'halaqah' && (
              <div className="flex flex-col gap-6 animate-fadeIn w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Kelola & Monitor Halaqah</h2>
                    <p className="text-xs text-slate-500 mt-1">Satu pintu untuk kelola kelompok dan pantau laporan secara realtime.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => { setShowAddKelompok(!showAddKelompok); setShowDisrupsiForm(false); }} 
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition text-slate-600 w-full sm:w-auto text-center"
                    >
                      {showAddKelompok ? 'Batal' : '+ Kelompok Baru'}
                    </button>
                    <button 
                      onClick={() => { setShowDisrupsiForm(!showDisrupsiForm); setShowAddKelompok(false); }} 
                      className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition text-white shadow-md w-full sm:w-auto text-center"
                    >
                      {showDisrupsiForm ? 'Batal' : '⚡ Catat Disrupsi/Libur'}
                    </button>
                  </div>
                </div>

                {showAddKelompok && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm mb-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">➕ Bikin Kelompok Baru</h3>
                    <form onSubmit={handleAddKelompok} className="flex flex-col sm:flex-row gap-3">
                      <input placeholder="Nama Kelompok" className="bg-white border border-slate-200 p-3 rounded-lg text-xs w-full focus:outline-none focus:border-emerald-600 text-slate-800" value={newKelompok.nama_kelompok} onChange={e => setNewKelompok({ ...newKelompok, nama_kelompok: e.target.value })} required />
                      <select className="bg-white border border-slate-200 p-3 rounded-lg text-xs w-full focus:outline-none focus:border-emerald-600 text-slate-800" value={newKelompok.musyrif_id} onChange={e => setNewKelompok({ ...newKelompok, musyrif_id: e.target.value })} required >
                        <option value="">-- Tunjuk Musyrif Utama --</option>
                        {safeUstadzList.filter((u) => u.role === 'musyrif').map((u) => (
                          <option key={u.id} value={u.id}>{u.nama_lengkap}</option>
                        ))}
                      </select>
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-xs font-bold w-full sm:w-48 text-white transition text-center">SIMPAN</button>
                    </form>
                  </div>
                )}

                {showDisrupsiForm && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm mb-2">
                    <h3 className="text-sm font-bold text-emerald-700 mb-4">⚡ Log Disrupsi & Status Libur</h3>
                    <form onSubmit={handleSubmitDisrupsi} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <select 
                        value={disrupsiForm.status_halaqah} 
                        onChange={(e) => setDisrupsiForm({ ...disrupsiForm, status_halaqah: e.target.value })} 
                        className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-emerald-600 w-full"
                      >
                        <option value="diganti_badal">Ganti dengan Ustadz Badal</option>
                        <option value="diliburkan_total">Diliburkan (Semua Halaqah)</option>
                      </select>

                      {disrupsiForm.status_halaqah === 'diganti_badal' && (
                        <select 
                          value={disrupsiForm.kelompok_id} 
                          onChange={(e) => setDisrupsiForm({ ...disrupsiForm, kelompok_id: e.target.value })} 
                          className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-emerald-600 w-full" 
                          required
                        >
                          <option value="">-- Pilih Kelompok Bermasalah --</option>
                          {safeKelompokList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelompok} (Asli: {k.nama_ustadz})</option>)}
                        </select>
                      )}

                      {disrupsiForm.status_halaqah === 'diganti_badal' && (
                        <select 
                          value={disrupsiForm.badal_musyrif_id} 
                          onChange={(e) => setDisrupsiForm({ ...disrupsiForm, badal_musyrif_id: e.target.value })} 
                          className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-emerald-600 w-full"
                        >
                          <option value="">-- Tunjuk Ustadz Badal --</option>
                          {safeUstadzList.filter((u) => u.role === 'musyrif').map((u) => (<option key={u.id} value={u.id}>{u.nama_lengkap}</option>))}
                        </select>
                      )}

                      <input 
                        type="text" 
                        placeholder={disrupsiForm.status_halaqah === 'diliburkan_total' ? "Alasan Libur (cth: Tanggal Merah / Libur Nasional)..." : "Alasan Badal..."} 
                        value={disrupsiForm.alasan} 
                        onChange={(e) => setDisrupsiForm({ ...disrupsiForm, alasan: e.target.value })} 
                        className={`bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-emerald-600 w-full ${disrupsiForm.status_halaqah === 'diliburkan_total' ? 'sm:col-span-1' : 'sm:col-span-2'}`} 
                        required 
                      />

                      <div className="sm:col-span-2 flex justify-end mt-2">
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition w-full sm:w-auto text-center">
                          Simpan Status {disrupsiForm.status_halaqah === 'diliburkan_total' ? 'Libur' : 'Disrupsi'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeMonitorHalaqah.map((h, idx) => (
                    <div 
                      key={idx} 
                      className={`relative bg-white border ${
                        h.status_halaqah === 'diganti_badal' 
                          ? 'border-red-200' 
                          : h.status_halaqah === 'diliburkan_total' 
                            ? 'border-amber-200' 
                            : 'border-slate-200'
                      } p-5 rounded-2xl flex flex-col gap-4 shadow-sm h-full`}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-1 rounded font-mono">ID:{h.kelompok_id}</span>
                        
                        {h.status_halaqah === 'diganti_badal' && (
                          <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] px-2 py-1 rounded font-bold animate-pulse">🔴 BADAL</span>
                        )}
                        
                        {h.status_halaqah === 'diliburkan_total' && (
                          <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] px-2 py-1 rounded font-bold animate-pulse">🏖️ LIBUR</span>
                        )}

                        <button 
                          onClick={() => handleDeleteKelompok(h.kelompok_id, h.nama_kelompok)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                          title="Hapus Kelompok Ini"
                        >
                          🗑️
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2 truncate pr-24">{h.nama_kelompok}</h4>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                          <p className="truncate">👤 Asli: <span className="text-slate-800">{h.musyrif_asli}</span></p>
                          <p className="truncate">🎓 Santri: <span className="text-slate-800">{h.total_santri} anak</span></p>
                        </div>
                      </div>

                      {(h.status_halaqah === 'diganti_badal' || h.status_halaqah === 'diliburkan_total') && h.info_badal && (
                        <div className={`${h.status_halaqah === 'diliburkan_total' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'} p-3 rounded-xl mt-auto`}>
                          {h.status_halaqah === 'diganti_badal' ? (
                            <p className="text-[10px] text-red-600 font-bold mb-1 truncate">Badal: {h.info_badal.nama_badal}</p>
                          ) : (
                            <p className="text-[10px] text-amber-600 font-bold mb-1 truncate">Status: Sedang Libur</p>
                          )}
                          <p className={`text-[9px] ${h.status_halaqah === 'diliburkan_total' ? 'text-amber-500' : 'text-red-400'} italic mb-2 line-clamp-1`}>"{h.info_badal.alasan}"</p>
                          <button 
                            onClick={() => handleCancelBadal(h.kelompok_id)} 
                            className={`w-full bg-white hover:bg-slate-50 text-[10px] py-1.5 rounded-lg border transition font-bold ${
                              h.status_halaqah === 'diliburkan_total' ? 'text-amber-600 border-amber-200' : 'text-red-600 border-red-200'
                            }`}
                          >
                            Batalkan {h.status_halaqah === 'diliburkan_total' ? 'Libur' : 'Badal'}
                          </button>
                        </div>
                      )}

                      <div className={`${h.status_halaqah === 'normal' ? 'mt-auto' : ''} pt-2 border-t border-slate-100`}>
                        <button onClick={() => handleOpenHistory(h.kelompok_id)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] py-2.5 rounded-xl font-bold transition">LIHAT HISTORI</button>
                      </div>
                    </div>
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
                  className={`flex flex-col items-center justify-center flex-1 min-w-[54px] py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-[1.02]' 
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

      {/* MODAL SUBMIT HASIL UJIAN */}
      {selectedExamSantri && (
        <Modal onClose={() => setSelectedExamSantri(null)} maxWidth="md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              {resolveEntityPhoto(selectedExamSantri) ? (
                <img
                  src={resolveEntityPhoto(selectedExamSantri)!}
                  alt={selectedExamSantri.nama_santri}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {selectedExamSantri.nama_santri?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white">Input Hasil Ujian</h3>
                <p className="text-[11px] text-slate-400">{selectedExamSantri.nama_santri} — <span className="text-slate-300">{selectedExamSantri.nama_kelompok}</span></p>
              </div>
            </div>
            <button onClick={() => setSelectedExamSantri(null)} className="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <form onSubmit={handleSubmitHasilUjian} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">Hasil Kelulusan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExamResultForm({ ...examResultForm, hasil: 'lulus' })}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                    examResultForm.hasil === 'lulus'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg'
                      : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  ✅ Lulus Ujian
                </button>
                <button
                  type="button"
                  onClick={() => setExamResultForm({ ...examResultForm, hasil: 'remed' })}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                    examResultForm.hasil === 'remed'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg'
                      : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  🔄 Remedial
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1 uppercase tracking-wider">Nilai Ujian (Skala 0 - 100)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Contoh: 87.5"
                value={examResultForm.nilai}
                onChange={(e) => setExamResultForm({ ...examResultForm, nilai: e.target.value })}
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1 uppercase tracking-wider">Catatan Penguji / Evaluasi</label>
              <textarea
                rows={3}
                placeholder="Masukkan catatan evaluasi tajwid, kelancaran, atau poin perbaikan..."
                value={examResultForm.catatan}
                onChange={(e) => setExamResultForm({ ...examResultForm, catatan: e.target.value })}
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExamSantri(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition"
              >
                Simpan & Selesaikan Ujian
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL TARGET SEMESTER SANTRI */}
      {selectedTargetSantri && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {resolveEntityPhoto(selectedTargetSantri) ? (
                <img
                  src={resolveEntityPhoto(selectedTargetSantri)!}
                  alt={selectedTargetSantri.nama_santri}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-300 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm">
                  {selectedTargetSantri.nama_santri?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-800">Atur Target Semester</h3>
                <p className="text-xs text-slate-500">Santri: <span className="font-bold text-slate-700">{selectedTargetSantri.nama_santri}</span></p>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Contoh: Juz 1 - 3"
              value={targetSemesterInput} 
              onChange={e => setTargetSemesterInput(e.target.value)}
              className="border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-600"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setSelectedTargetSantri(null)} className="px-4 py-2 rounded-xl text-xs bg-slate-100 text-slate-600 font-bold">Batal</button>
              <button onClick={handleSaveTargetSemester} className="px-4 py-2 rounded-xl text-xs bg-emerald-600 text-white font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROFIL MUSYRIF */}
      {selectedMusyrifProfile && (
        <Modal onClose={() => setSelectedMusyrifProfile(null)} maxWidth="lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">{selectedMusyrifProfile.profile?.nama_lengkap}</h3>
              <p className="text-xs text-slate-400">@{selectedMusyrifProfile.profile?.username} • <span className="uppercase text-emerald-400 font-bold">{selectedMusyrifProfile.profile?.role}</span></p>
            </div>
            <button onClick={() => setSelectedMusyrifProfile(null)} className="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <div className="mt-4 flex flex-col gap-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Kelompok</span>
                <span className="text-sm font-bold text-white">{selectedMusyrifProfile.profile?.total_kelompok}</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Santri Binaan</span>
                <span className="text-sm font-bold text-white">{selectedMusyrifProfile.profile?.total_santri_binaan}</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Total Setoran</span>
                <span className="text-sm font-bold text-white">{selectedMusyrifProfile.profile?.total_setoran_diampu}</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Terdaftar</span>
                <span className="text-xs font-bold text-white">{selectedMusyrifProfile.profile?.tanggal_dibuat}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kelompok Diampu</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMusyrifProfile.profile?.kelompok_diampu?.map((k: string, i: number) => (
                  <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-bold text-[11px]">{k}</span>
                )) || <span className="text-slate-500 italic">Belum mengampu kelompok</span>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL HISTORI LAPORAN KELOMPOK */}
      {showHistoryModal !== null && (
        <Modal onClose={() => setShowHistoryModal(null)} maxWidth="lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Histori Setoran Kelompok #{showHistoryModal}</h3>
              <p className="text-xs text-slate-400">Rekapitulasi setoran hafalan santri dalam kelompok ini.</p>
            </div>
            <button onClick={() => setShowHistoryModal(null)} className="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8 text-xs text-slate-400">Memuat histori setoran...</div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Belum ada histori setoran untuk kelompok ini.</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {historyData.map((h: any, i: number) => (
                <div key={i} className="bg-slate-800/50 border border-white/5 p-3 rounded-xl flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{h.nama_santri}</span>
                    <span className="text-[10px] text-slate-400">{h.waktu_setoran}</span>
                  </div>
                  <div className="text-emerald-400 font-semibold">{h.surah} : {h.ayat} ({h.status_kelancaran})</div>
                  {h.catatan_musyrif && <div className="text-[11px] text-slate-300 italic">"{h.catatan_musyrif}"</div>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}