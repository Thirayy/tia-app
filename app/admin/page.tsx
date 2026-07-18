'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { ensureArray } from '@/lib/api';
import { getAuthHeaders, getSession, isAdminRole } from '@/lib/auth';
import { fetchApi } from '@/lib/fetchApi';
import { useRouter } from 'next/navigation';

function Modal({ children, onClose, maxWidth = 'md' }: { children: React.ReactNode; onClose: () => void; maxWidth?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const maxW = maxWidth === 'lg' ? 'max-w-lg' : (maxWidth === 'md' ? 'max-w-md' : 'max-w-sm');
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onMouseDown={onClose}>
      <div className={`${maxW} w-full bg-[#111827] border border-white/6 rounded-2xl p-6 shadow-2xl transform transition-all duration-200 hover:scale-[1.01]`} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function ComprehensiveAdminPortal() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'santri' | 'musyrif' | 'plotting' | 'halaqah'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [santriList, setSantriList] = useState<any[]>([]);
  const [ustadzList, setUstadzList] = useState<any[]>([]);
  const [kelompokList, setKelompokList] = useState<any[]>([]);
  const [monitorHalaqah, setMonitorHalaqah] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');

  // State Input & UI lainnya
  const [changedPlotting, setChangedPlotting] = useState<{ [santriId: number]: string | number | null }>({});
  const [newSantri, setNewSantri] = useState({ nama_santri: '', nomor_induk: '' });
  const [showAddSantri, setShowAddSantri] = useState(false);
  const [showAddKelompok, setShowAddKelompok] = useState(false);
  const [showDisrupsiForm, setShowDisrupsiForm] = useState(false);
  const [newKelompok, setNewKelompok] = useState({ nama_kelompok: '', musyrif_id: '' });
  const [disrupsiForm, setDisrupsiForm] = useState({ kelompok_id: '', badal_musyrif_id: '', alasan: '', status_halaqah: 'diganti_badal' });
  const [showHistoryModal, setShowHistoryModal] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAddMusyrif, setShowAddMusyrif] = useState(false);
  const [newMusyrif, setNewMusyrif] = useState({ nama_lengkap: '', username: '', password: '', role: 'musyrif' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ==========================================
  // RELOADERS (Fungsi Tarik Data Ulang)
  // ==========================================
  // 1. Ganti reloadSantriData
const reloadSantriData = async () => {
  try {
    const res = await api.get('/admin/santri');
    setSantriList(ensureArray<any>(res.data, ['santri']));
  } catch (err) {
    console.error('Gagal reload santri', err);
  }
};

const reloadMusyrifData = async () => {
  try {
    const res = await api.get('/admin/musyrif');
    setUstadzList(ensureArray(res.data, ['ustadz', 'musyrif']));
  } catch (err) {
    console.error('Gagal reload musyrif', err);
  }
};

const reloadKelompokData = async () => {
  try {
    const res = await api.get('/admin/kelompok');
    setKelompokList(ensureArray(res.data, ['kelompok']));
  } catch (err) {
    console.error('Gagal reload kelompok', err);
  }
};

const reloadMonitorHalaqah = async () => {
  try {
    const res = await api.get('/admin/halaqah/monitor');
    setMonitorHalaqah(ensureArray(res.data, ['monitor', 'halaqah']));
  } catch (err) {
    console.error('Gagal reload monitor', err);
  }
};
   //========================================
  // HANDLERS (Fungsi Tombol / Form)
  // ==========================================

  // ... (Handler Santri, Plotting, Musyrif sama seperti sebelumnya) ...
  const handleSavePlotting = async () => {
    if (Object.keys(changedPlotting).length === 0) return alert("Belum ada perubahan!");
    try {
      for (const [idSantri, idUstadz] of Object.entries(changedPlotting)) {
        await fetchApi(`/admin/santri/${idSantri}`, {
          method: 'PUT',
          body: JSON.stringify({
            student_id: Number(idSantri),
            kelompok_id: idUstadz ? Number(idUstadz) : null,
          }),
        });
      }
      alert("🎉 Formasi plotting baru tersimpan!");
      setChangedPlotting({});
      await reloadSantriData();
    } catch (err: any) { alert(`Gagal simpan!`); }
  };

  const handleDeleteSantri = async (id: number, nama: string) => {
    if (!window.confirm(`⚠️ Hapus data santri "${nama}"?`)) return;
    try {
      const res = await fetchApi(`/admin/santri/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSantriList((prev) => ensureArray<any>(prev).filter((s) => s.id !== id));
        await reloadSantriData();
      }
    } catch (err) { }
  };

  const handleAddSantri = async () => {
    try {
        const res = await fetchApi('/api/admin/santri', {
            method: 'POST',
            body: JSON.stringify({ ...newSantri, kelompok_id: null }),
        });

        if (res.ok) {
            alert("Santri berhasil ditambah!");
            setNewSantri({ nama_santri: '', nomor_induk: '' }); // Reset form
            setShowAddSantri(false); // Tutup form
            await reloadSantriData(); // Refresh list
        } else {
            // Kita gunakan casting 'any' agar TypeScript berhenti protes
            const errorInfo = res.data as any; 
            console.error("Gagal simpan:", errorInfo);
            alert("Gagal menambah santri: " + JSON.stringify(errorInfo));
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
};

  const handleAddMusyrif = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/musyrif', {
        method: 'POST',
        body: JSON.stringify(newMusyrif),
      });
      if (res.ok) {
        alert("💥 Musyrif baru diamankan!");
        setNewMusyrif({ nama_lengkap: '', username: '', password: '', role: 'musyrif' });
        setShowAddMusyrif(false);
        await reloadMusyrifData();
      }
    } catch (err) { }
  };

 // 🔥 HANDLER BARU: Hapus Data Musyrif (Admin Only)
const handleDeleteMusyrif = async (id: number, nama: string) => {
  if (!window.confirm(`⚠️ YAKIN MAU HAPUS MUSYRIF: "${nama}"?\nAksi ini akan berdampak pada kelompok binaannya!`)) return;
  try {
    const res = await fetchApi(`/admin/musyrif/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert("🗑️ Data Musyrif berhasil dibumihanguskan!");
      await reloadMusyrifData();
      await reloadKelompokData();
      await reloadMonitorHalaqah();
    } else {
      alert("Gagal menghapus data musyrif.");
    }
  } catch (err) {
    alert("Terjadi kesalahan koneksi database.");
  }
};

// 🔥 HANDLER BARU: Update Role Musyrif (Admin Only)
const handleChangeRoleMusyrif = async (id: number, currentNama: string, newRole: string) => {
  if (!window.confirm(`Ganti hak akses "${currentNama}" menjadi [${newRole.toUpperCase()}]?`)) return;
  try {
    const res = await fetchApi(`/admin/musyrif/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      alert("⚡ Hak akses / Role berhasil diperbarui!");
      await reloadMusyrifData();
    } else {
      alert("Gagal mengubah role pengguna.");
    }
  } catch (err) {
    alert("Terjadi kesalahan sistem saat ganti role.");
  }
};

  // 🔥 HANDLER: KELOLA HALAQAH GABUNGAN
  const handleAddKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/kelompok', {
        method: 'POST',
        body: JSON.stringify({
          nama_kelompok: newKelompok.nama_kelompok,
          musyrif_id: parseInt(newKelompok.musyrif_id),
        }),
      });
      if (res.ok) {
        alert("✅ Kelompok baru berhasil dibentuk!");
        setNewKelompok({ nama_kelompok: '', musyrif_id: '' });
        setShowAddKelompok(false);
        await reloadKelompokData();
        await reloadMonitorHalaqah();
      }
    } catch (err) { }
  };

  const handleSubmitDisrupsi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...disrupsiForm, kelompok_id: parseInt(disrupsiForm.kelompok_id), badal_musyrif_id: disrupsiForm.badal_musyrif_id ? parseInt(disrupsiForm.badal_musyrif_id) : null };
      const res = await fetchApi('/admin/halaqah/disrupsi', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("💥 Log disrupsi/badal berhasil dicatat!");
        setDisrupsiForm({ kelompok_id: '', badal_musyrif_id: '', alasan: '', status_halaqah: 'diganti_badal' });
        setShowDisrupsiForm(false);
        await reloadMonitorHalaqah();
      }
    } catch (err) { }
  };

  // 🔥 HANDLER BARU: Cancel Badal
  const handleCancelBadal = async (kelompokId: number) => {
  if (!window.confirm("Yakin musyrif asli udah balik dan mau cancel badalnya?")) return;
  try {
    // Ganti fetch ke api.put
    await api.put(`/admin/halaqah/${kelompokId}/cancel-badal`, {});
    alert("Mantap! Badal dicancel, kembali ke musyrif asli.");
    await reloadMonitorHalaqah();
  } catch (err) {
    console.error(err);
    alert("Gagal cancel badal!");
  }
};

  // 🔥 HANDLER BARU: Buka Histori Laporan
  const handleOpenHistory = async (kelompokId: number) => {
  setShowHistoryModal(kelompokId);
  setLoadingHistory(true);
  try {
    // Ganti fetch ke api.get
    const res = await api.get(`/admin/halaqah/${kelompokId}/laporan`);
    setHistoryData(ensureArray(res.data, ['laporan']));
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingHistory(false);
  }
};

  const [expandedMusyrif, setExpandedMusyrif] = useState(true);
  const [selectedDetailLaporan, setSelectedDetailLaporan] = useState<any | null>(null);
  const [selectedProfilSantri, setSelectedProfilSantri] = useState<any | null>(null);

  // ==========================================
  // INITIAL DATA FETCH (USEEFFECT)
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

  Promise.all([
    api.get('/admin/santri'),
    api.get('/admin/musyrif'),
    api.get('/admin/kelompok'),
    api.get('/admin/halaqah/monitor'),
  ])
    .then(([resSantri, resUstadz, resKelompok, resMonitor]) => {
      setSantriList(ensureArray(resSantri.data, ['santri']));
      setUstadzList(ensureArray(resUstadz.data, ['ustadz', 'musyrif']));
      setKelompokList(ensureArray(resKelompok.data, ['kelompok']));
      setMonitorHalaqah(ensureArray(resMonitor.data, ['monitor', 'halaqah']));
      setFetchError(null);
    })
    .catch((err) => {
      console.error('Fetch gagal', err);
      setFetchError('Gagal memuat data dashboard. Periksa koneksi API.');
      setSantriList([]);
      setUstadzList([]);
      setKelompokList([]);
      setMonitorHalaqah([]);
    })
    .finally(() => setLoading(false));
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
  const safeHistoryData = ensureArray<any>(historyData);

  const filteredSantri = safeSantriList.filter((s) =>
    s.nama_santri?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nomor_induk?.toString().includes(searchTerm)
  );
  const filteredUstadz = safeUstadzList.filter((u) =>
    u.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
<aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gnome-border p-6 flex flex-col gap-8 shadow-sm transition-transform duration-300 md:relative ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
  
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-gnome-green rounded-lg flex items-center justify-center font-black text-xs text-white shadow-lg shadow-emerald-200">A</div>
      <h1 className="text-sm font-bold tracking-tight text-slate-800 uppercase">Admin Portal</h1>
    </div>
    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase pl-10 block">TIA Management</span>
  </div>

  <nav className="flex flex-col gap-2 flex-1">
    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Navigasi Utama</span>
    
    {/* Menggunakan 'as const' dan tipe spesifik untuk menghindari error TS */}
    {(['overview', 'santri', 'musyrif', 'plotting', 'halaqah'] as const).map((tab) => (
      <button 
        key={tab} 
        onClick={() => { 
          setActiveTab(tab); 
          setIsSidebarOpen(false); 
        }} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
          activeTab === tab 
            ? 'bg-gnome-green text-white shadow-lg shadow-emerald-200' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {tab === 'overview' ? '📊 Overview' : 
         tab === 'santri' ? '🎓 Kelola Santri' : 
         tab === 'musyrif' ? '👥 Kelola Musyrif' : 
         tab === 'plotting' ? '📌 Plotting' : '🕌 Halaqah'}
      </button>
    ))}
  </nav>

  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
    <div className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-gnome-green animate-pulse"></span>
      User: {adminName}
    </div>
    <button onClick={() => router.push('/musyrif')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase text-slate-600 hover:text-red-500 hover:border-red-200 transition-all">
      🚪 Exit Gateway
    </button>
  </div>
</aside>

{/* 3. MAIN CONTENT AREA */}
<main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
  
  {/* Mobile Top Bar */}
  <div className="md:hidden bg-white p-4 border-b border-gnome-border flex items-center gap-4 sticky top-0 z-30 shrink-0">
    <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-2 border border-slate-200 rounded-lg">☰</button>
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">TIA Admin Portal</h2>
  </div>

  {/* CONTAINER KONTEN UTAMA (Scroll & Padding diatur di sini) */}
  <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
    <div className="max-w-6xl mx-auto w-full">

      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl">
          {fetchError}
        </div>
      )}
      
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-fadeIn w-full">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas TIA secara global.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Ustadz / Musyrif', val: safeUstadzList.filter((u) => u.role === 'musyrif').length },
              { label: 'Santri', val: safeSantriList.length },
              { label: 'Total Laporan', val: safeSantriList.reduce((acc, curr) => acc + (curr.total_setoran || 0), 0) },
              { label: 'Santri Aktif', val: safeSantriList.filter((s) => s.status_santri === 'aktif').length },
		
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-gnome-border p-5 rounded-xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
                <p className="text-2xl font-black text-slate-800">{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white border border-gnome-border p-5 rounded-xl xl:col-span-2 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">Aktivitas Minggu Ini</h3>
              <div className="h-40 flex items-end justify-between gap-2">
                {['Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum'].map((day) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-24 bg-gnome-green rounded-md shadow-sm"></div>
                    <span className="text-[10px] font-bold text-slate-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gnome-border p-5 rounded-xl shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Cakupan Ketercapaian</h3>
              <div className="flex flex-col gap-2">
                {safeSantriList.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <span className="text-slate-700 font-bold">{s.nama_santri}</span>
                    <span className="font-bold text-gnome-green">{s.total_setoran || 0} setoran</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

     
	{activeTab === 'santri' && (
  <div className="flex flex-col gap-6 animate-fadeIn w-full">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Manajemen Santri</h2>
        <p className="text-xs text-slate-500 mt-0.5">Kelola data seluruh santri pusat.</p>
      </div>
      <button 
        onClick={() => setShowAddSantri(!showAddSantri)} 
        className="bg-gnome-green hover:bg-emerald-600 px-4 py-2.5 rounded-xl text-xs text-white font-bold uppercase"
      >
        {showAddSantri ? 'Batal' : '+ Tambah Santri'}
      </button>
    </div>

    {/* FORM TAMBAH */}
    {showAddSantri && (
      <form 
        onSubmit={(e) => { e.preventDefault(); handleAddSantri(); }}
        className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
      >
        <h3 className="text-sm font-bold text-slate-800">Tambah Santri Baru</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-bold">
          Simpan Data
        </button>
      </form>
    )}

    {/* SEARCH & LIST */}
    <input
      type="text"
      placeholder="Cari santri..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs w-full outline-none"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredSantri.map((s) => (
        <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center font-black text-gnome-green text-xs">
              {s.nama_santri?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{s.nama_santri}</h4>
              <p className="text-[10px] text-slate-400">NIS: {s.nomor_induk}</p>
            </div>
          </div>
          <button onClick={() => handleDeleteSantri(s.id, s.nama_santri)} className="p-2 hover:text-red-500">🗑️</button>
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
              <p className="text-xs text-slate-500 mt-0.5">Kelola akun Musyrif pembimbing Tahfizh.</p>
            </div>
            <button
              onClick={() => setShowAddMusyrif(!showAddMusyrif)}
              className="bg-gnome-green hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition shadow-md w-full sm:w-auto text-center"
            >
              {showAddMusyrif ? 'Batal' : '+ Tambah Pengguna'}
            </button>
          </div>

          {/* FORM TAMBAH MUSYRIF */}
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
                    <input type="text" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs w-full focus:border-gnome-green outline-none" value={newMusyrif.nama_lengkap} onChange={e => setNewMusyrif({ ...newMusyrif, nama_lengkap: e.target.value })} required />
                  </label>
                  <label className="relative min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Username</span>
                    <input type="text" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs w-full focus:border-gnome-green outline-none" value={newMusyrif.username} onChange={e => setNewMusyrif({ ...newMusyrif, username: e.target.value.replace(/\s+/g, '').toLowerCase() })} required />
                  </label>
                  <label className="relative min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Password</span>
                    <input type="password" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs w-full focus:border-gnome-green outline-none" value={newMusyrif.password} onChange={e => setNewMusyrif({ ...newMusyrif, password: e.target.value })} required />
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddMusyrif(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-gnome-green hover:bg-emerald-600 text-white">Simpan Data</button>
                </div>
              </form>
            </Modal>
          )}

          <input
            type="text"
            placeholder="Cari musyrif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 w-full outline-none focus:ring-2 focus:ring-gnome-green/20"
          />

          {filteredUstadz.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 p-8 rounded-xl text-center text-xs text-slate-400">📭 Tidak ada data ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUstadz.map((u) => (
                <div key={u.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm hover:border-gnome-green transition-all">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 bg-emerald-50 text-gnome-green rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0">{u.nama_lengkap?.charAt(0) || 'M'}</div>
                    <div className="truncate pr-2">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{u.nama_lengkap}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">@{u.username} | <span className="uppercase">{u.role}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select value={u.role} onChange={(e) => handleChangeRoleMusyrif(u.id, u.nama_lengkap, e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[10px] text-slate-600 cursor-pointer outline-none flex-1 sm:flex-none">
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

      {/* TAB 4: PLOTTING SANTRI */}
      {activeTab === 'plotting' && (
        <div className="flex flex-col gap-6 animate-fadeIn w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Plotting Santri Pusat</h2>
              <p className="text-xs text-slate-500 mt-0.5">Asignasi data santri ke akun Musyrif masing-masing.</p>
            </div>
            <button
              onClick={handleSavePlotting}
              className="bg-gnome-green hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition shadow-md w-full sm:w-auto text-center"
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
                  <div className="truncate w-full">
                    <span className="font-bold text-slate-800 block truncate">{s.nama_santri}</span>
                    <span className="text-[10px] text-slate-400 font-mono">NIS: {s.nomor_induk}</span>
                  </div>
                  <div className="w-full">
                    <select
                      value={changedPlotting[s.id] !== undefined ? String(changedPlotting[s.id]) : String(s.kelompok_id || "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChangedPlotting(prev => ({ ...prev, [s.id]: val === "" ? null : parseInt(val) }));
                      }}
                      className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 w-full focus:outline-none focus:border-gnome-green cursor-pointer"
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

      {/* TAB 5: KELOLA HALAQAH */}
      {activeTab === 'halaqah' && (
        <div className="flex flex-col gap-6 animate-fadeIn w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 pb-4 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Kelola & Monitor Halaqah</h2>
              <p className="text-xs text-slate-500 mt-1">Satu pintu untuk kelola kelompok dan pantau laporan.</p>
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
                className="bg-gnome-green hover:bg-emerald-600 border border-emerald-500 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition text-white shadow-md w-full sm:w-auto text-center"
              >
                {showDisrupsiForm ? 'Batal' : '⚡ Catat Disrupsi/Badal'}
              </button>
            </div>
          </div>

          {/* Form Tambah Kelompok */}
          {showAddKelompok && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm mb-2">
              <h3 className="text-sm font-bold text-slate-700 mb-4">➕ Bikin Kelompok Baru</h3>
              <form onSubmit={handleAddKelompok} className="flex flex-col sm:flex-row gap-3">
                <input placeholder="Nama Kelompok" className="bg-white border border-slate-200 p-3 rounded-lg text-xs w-full focus:outline-none focus:border-gnome-green" value={newKelompok.nama_kelompok} onChange={e => setNewKelompok({ ...newKelompok, nama_kelompok: e.target.value })} />
                <select className="bg-white border border-slate-200 p-3 rounded-lg text-xs w-full focus:outline-none focus:border-gnome-green" value={newKelompok.musyrif_id} onChange={e => setNewKelompok({ ...newKelompok, musyrif_id: e.target.value })} >
                  <option value="">-- Tunjuk Musyrif Utama --</option>
                  {safeUstadzList.filter((u) => u.role === 'musyrif').map((u) => (
                    <option key={u.id} value={u.id}>{u.nama_lengkap}</option>
                  ))}
                </select>
                <button type="submit" className="bg-gnome-green hover:bg-emerald-600 px-6 py-3 rounded-lg text-xs font-bold w-full sm:w-48 text-white transition text-center">SIMPAN</button>
              </form>
            </div>
          )}

          {/* Form Disrupsi / Badal */}
          {showDisrupsiForm && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm mb-2">
              <h3 className="text-sm font-bold text-emerald-700 mb-4">⚡ Log Disrupsi & Ustadz Badal</h3>
              <form onSubmit={handleSubmitDisrupsi} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <select value={disrupsiForm.kelompok_id} onChange={(e) => setDisrupsiForm({ ...disrupsiForm, kelompok_id: e.target.value })} className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-gnome-green w-full" required>
                  <option value="">-- Pilih Kelompok Bermasalah --</option>
                  {safeKelompokList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelompok} (Asli: {k.nama_ustadz})</option>)}
                </select>

                <select value={disrupsiForm.status_halaqah} onChange={(e) => setDisrupsiForm({ ...disrupsiForm, status_halaqah: e.target.value })} className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-gnome-green w-full">
                  <option value="diganti_badal">Ganti dengan Ustadz Badal</option>
                  <option value="diliburkan_total">Diliburkan</option>
                </select>

                {disrupsiForm.status_halaqah === 'diganti_badal' && (
                  <select value={disrupsiForm.badal_musyrif_id} onChange={(e) => setDisrupsiForm({ ...disrupsiForm, badal_musyrif_id: e.target.value })} className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-gnome-green w-full">
                    <option value="">-- Tunjuk Ustadz Badal --</option>
                    {safeUstadzList.filter((u) => u.role === 'musyrif').map((u) => (<option key={u.id} value={u.id}>{u.nama_lengkap}</option>))}
                  </select>
                )}

                <input type="text" placeholder="Alasan..." value={disrupsiForm.alasan} onChange={(e) => setDisrupsiForm({ ...disrupsiForm, alasan: e.target.value })} className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-gnome-green w-full sm:col-span-2" required />

                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="bg-gnome-green hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition w-full sm:w-auto text-center">Simpan Log Disrupsi</button>
                </div>
              </form>
            </div>
          )}

          {/* List Monitor Halaqah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeMonitorHalaqah.map((h, idx) => (
              <div key={idx} className={`relative bg-white border ${h.status_halaqah === 'diganti_badal' ? 'border-red-200' : 'border-slate-200'} p-5 rounded-2xl flex flex-col gap-4 shadow-sm h-full`}>
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-1 rounded font-mono">ID:{h.kelompok_id}</span>
                  {h.status_halaqah === 'diganti_badal' && (
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] px-2 py-1 rounded font-bold">🔴 BADAL</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 truncate pr-20">{h.nama_kelompok}</h4>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                    <p>👤 Asli: <span className="text-slate-800">{h.musyrif_asli}</span></p>
                    <p>🎓 Santri: <span className="text-slate-800">{h.total_santri} anak</span></p>
                  </div>
                </div>
                {h.status_halaqah === 'diganti_badal' && h.info_badal && (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl mt-auto">
                    <p className="text-[10px] text-red-600 font-bold mb-1">Badal: {h.info_badal.nama_badal}</p>
                    <button onClick={() => handleCancelBadal(h.kelompok_id)} className="mt-2 w-full bg-white hover:bg-slate-50 text-red-600 text-[10px] py-1.5 rounded-lg border border-red-200 transition">Batalkan Badal</button>
                  </div>
                )}
                <div className={`${h.status_halaqah !== 'diganti_badal' ? 'mt-auto' : ''} pt-2 border-t border-slate-100`}>
                  <button onClick={() => handleOpenHistory(h.kelompok_id)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] py-2.5 rounded-xl font-bold transition">LIHAT HISTORI</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  </div>
</main>
   
{/* ========================================================= */}
{/* 1. MODAL UTAMA: HISTORI LAPORAN */}
{/* ========================================================= */}
{showHistoryModal !== null && !selectedDetailLaporan && !selectedProfilSantri && (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white border border-slate-200 w-full max-w-4xl h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden mx-auto">
      
      {/* Header Modal */}
      <div className="flex justify-between items-center p-5 bg-slate-50 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Histori Laporan Kelompok</h3>
        <button onClick={() => setShowHistoryModal(null)} className="text-slate-400 hover:text-slate-800 font-bold text-xl">&times;</button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="text-center text-slate-400 text-xs font-mono py-10 animate-pulse">Memuat data timeline...</div>
        ) : safeHistoryData.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-10">Belum ada histori laporan.</div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
              onClick={() => setExpandedMusyrif(!expandedMusyrif)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-black text-gnome-green">
                  {safeHistoryData[0]?.nama_musyrif ? safeHistoryData[0].nama_musyrif.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-sm">{safeHistoryData[0]?.nama_musyrif || 'Nama Musyrif'}</h4>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[10px] bg-emerald-50 text-gnome-green px-2 py-0.5 rounded-full font-bold">📖 {safeHistoryData.length} Laporan</span>
                  </div>
                </div>
              </div>
            </div>

            {expandedMusyrif && (
              <div className="border-t border-slate-200 p-5 bg-white">
                <div className="relative pl-6 ml-5 border-l border-slate-200 space-y-5">
                  {safeHistoryData.map((report, idx) => (
                    <div key={idx} className="relative bg-white border border-slate-200 rounded-xl p-4 hover:border-gnome-green transition-all group">
                      <div className="absolute -left-[30px] top-5 w-3 h-3 bg-gnome-green rounded-full ring-4 ring-white"></div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-[10px] text-slate-400 font-mono">📅 {new Date(report.waktu_setoran).toLocaleDateString('id-ID')}</div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedProfilSantri(report)} className="text-[10px] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-gnome-green">👤 Profil</button>
                          <button onClick={() => setSelectedDetailLaporan(report)} className="text-[10px] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-gnome-green">📄 Detail</button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic line-clamp-2">"{report.percakapan_mentah || report.catatan_musyrif}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* ========================================================= */}
{/* 2. MODAL DETAIL LAPORAN */}
{/* ========================================================= */}
{selectedDetailLaporan && (
  <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl flex flex-col shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">🤖 Analisa AI & Detail Laporan</h3>
        <button onClick={() => setSelectedDetailLaporan(null)} className="text-slate-400 hover:text-slate-800 text-xl">&times;</button>
      </div>
      <div className="p-6 space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
          <div><span className="block text-slate-400 mb-1">Surah & Ayat</span><span className="text-slate-800 font-mono bg-white px-2 py-1 rounded border border-slate-200">{selectedDetailLaporan.surah} : {selectedDetailLaporan.ayat}</span></div>
          <div><span className="block text-slate-400 mb-1">Kelancaran</span><span className="text-gnome-green font-bold uppercase">{selectedDetailLaporan.status_kelancaran}</span></div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Hasil Analisa AI</h4>
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            {selectedDetailLaporan.ai_rekomendasi || "Belum ada rekomendasi."}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

  {/* ========================================================= */}
  {/* 3. MODAL PROFIL SANTRI */}
  {/* ========================================================= */}
{selectedProfilSantri && (
  <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
    <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl flex flex-col p-6 text-center shadow-2xl">
      <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedProfilSantri.nama_santri}</h3>
      <span className="text-[10px] text-gnome-green font-mono bg-emerald-50 px-3 py-1 rounded-full mb-4 inline-block mx-auto border border-emerald-100">
        ID: {selectedProfilSantri.student_id || 'N/A'}
      </span>
      
      <div className="text-left bg-slate-50 p-4 rounded-xl text-xs space-y-3 text-slate-600 border border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-400">Musyrif:</span>
          <span className="font-bold text-slate-800">{selectedProfilSantri.nama_musyrif}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className="font-bold text-gnome-green">AKTIF</span>
        </div>
      </div>
      
      <button 
        onClick={() => setSelectedProfilSantri(null)} 
        className="mt-6 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-bold transition-all"
      >
        Tutup
      </button>
    </div>
  </div>
)}
</div>
);
}


