'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { ensureArray } from '@/lib/api';
import { clearSession, getSession, isAdminRole } from '@/lib/auth';

export default function MusyrifPortalMobile() {
  const router = useRouter();
  const STORAGE_KEY = 'musyrif_portal_state';

  // Basic States
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [musyrifName, setMusyrifName] = useState('');
  const [santriList, setSantriList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'setoran_daily' | 'profile' | 'raport_log'>('setoran_daily');

  // CUSTOM POPUP NOTIFICATION STATE (Pengganti alert browser)
  const [popupModal, setPopupModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, title: '', message: '', type: 'info' });

  const showPopup = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setPopupModal({ show: true, title, message, type });
  };

  const closePopup = () => {
    setPopupModal((prev) => ({ ...prev, show: false }));
  };

  // Tanggal Lokal Helper
  const getTodayLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocalDate());

  // Profile Data State
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [historiSetoranFull, setHistoriSetoranFull] = useState<any[]>([]);
  const [raportList, setRaportList] = useState<any[]>([]);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // AI Output States
  const [overallAnalysis, setOverallAnalysis] = useState('');
  const [dailyAiSummary, setDailyAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Workflow & Portal Mode
  const [currentStep, setCurrentStep] = useState<
    'menu' | 'select_student' | 'ready_to_record' | 'recording_session' | 'input_form' | 'student_detail'
  >('menu');
  const [portalMode, setPortalMode] = useState<'input' | 'monitor'>('input');

  // Form Controls State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editStatus, setEditStatus] = useState('hadir');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [editTargetHarian, setEditTargetHarian] = useState('');

  // Form Ujian State
  const [showUjianModal, setShowUjianModal] = useState(false);
  const [tanggalUjian, setTanggalUjian] = useState('');
  const [catatanPersiapan, setCatatanPersiapan] = useState('');
  const [hasilUjian, setHasilUjian] = useState<'lulus' | 'remed'>('lulus');
  const [catatanHasilUjian, setCatatanHasilUjian] = useState('');

  // Form Raport State
  const [showRaportModal, setShowRaportModal] = useState(false);
  const [semesterRaport, setSemesterRaport] = useState('Ganjil 2026/2027');
  const [nilaiHarian, setNilaiHarian] = useState(85);
  const [nilaiBulanan, setNilaiBulanan] = useState(85);
  const [nilaiAkhir, setNilaiAkhir] = useState(85);
  const [catatanRaport, setCatatanRaport] = useState('');

  // Form Input Setoran States
  const [surahId, setSurahId] = useState<number | null>(null);
  const [surah, setSurah] = useState('');
  const [ayat, setAyat] = useState('');
  const [statusSetoran, setStatusSetoran] = useState('Lancar');
  const [catatanKoreksi, setCatatanKoreksi] = useState('');
  const [adaTeguran, setAdaTeguran] = useState(false);
  const [jenisTeguran, setJenisTeguran] = useState<string[]>([]);
  const [catatanTeguran, setCatatanTeguran] = useState('');
  const [catatanMusyrif, setCatatanMusyrif] = useState('');
  const [searchSantriQuery, setSearchSantriQuery] = useState('');

  const [inputLoading, setInputLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');

  // Restore LocalStorage
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
    } fontinally: {
      setIsStateLoaded(true);
    }
  }, []);

  // Save LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !isStateLoaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedSantri, currentStep, portalMode })
    );
  }, [selectedSantri, currentStep, portalMode, isStateLoaded]);

  useEffect(() => {
    if (selectedSantri?.id && currentStep === 'student_detail') {
      fetchFullSantriProfile(selectedSantri.id);
    }
  }, [selectedSantri?.id, currentStep]);

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

  useEffect(() => {
    fetchSantriList();
  }, [router]);

  const fetchFullSantriProfile = async (santriId: number | string) => {
    setProfileLoading(true);
    setOverallAnalysis('');
    setDailyAiSummary('');
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
          data.data?.histori_setoran ||
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

  const handleSelectSantri = (santri: any) => {
    setSelectedSantri(santri);
    setEditStatus(santri.status_santri || 'hadir');
    resetForm();

    if (portalMode === 'input') {
      setCurrentStep('ready_to_record');
    } else {
      fetchFullSantriProfile(santri.id);
      setCurrentStep('student_detail');
    }
  };

  const resetForm = () => {
    setSurahId(null);
    setSurah('');
    setAyat('');
    setStatusSetoran('Lancar');
    setCatatanKoreksi('');
    setAdaTeguran(false);
    setJenisTeguran([]);
    setCatatanTeguran('');
    setCatatanMusyrif('');
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showPopup('Browser Tidak Kompatibel', 'Browser Anda tidak mendukung Speech Recognition. Gunakan Google Chrome.', 'error');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = true;
    accumulatedTextRef.current = '';

    recognition.onstart = () => {
      setIsListening(true);
      setCurrentStep('recording_session');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      accumulatedTextRef.current = currentTranscript.trim();
      setCatatanMusyrif(accumulatedTextRef.current);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalTranscript = accumulatedTextRef.current.trim();
      if (!finalTranscript) {
        setCurrentStep('ready_to_record');
        return;
      }

      setCurrentStep('input_form');
      try {
        const res = await api.post('/musyrif/parse-voice', { raw_text: finalTranscript });
        const draft = res.data?.draft;
        if (draft) {
          if (draft.surah_id) setSurahId(draft.surah_id);
          if (draft.surah_sahih) setSurah(draft.surah_sahih);
          if (draft.ayat_standar) setAyat(draft.ayat_standar);
          if (draft.status_kelancaran) setStatusSetoran(draft.status_kelancaran);
          if (draft.catatan_koreksi) setCatatanKoreksi(draft.catatan_koreksi);
          if (typeof draft.ada_teguran === 'boolean') setAdaTeguran(draft.ada_teguran);
          if (Array.isArray(draft.jenis_teguran)) setJenisTeguran(draft.jenis_teguran);
          if (draft.catatan_teguran) setCatatanTeguran(draft.catatan_teguran);
          if (draft.catatan_musyrif) setCatatanMusyrif(draft.catatan_musyrif);
        }
      } catch (err) {
        console.warn('Fallback ke teks mentah:', err);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ACTION 1: Update Status Santri
  const handleUpdateStatus = async (statusVal: string, ketVal: string = '') => {
    if (!selectedSantri) return;
    setActionLoading(true);
    try {
      await api.put(`/musyrif/santri/${selectedSantri.id}/status`, {
        status: statusVal,
        keterangan: ketVal || null,
      });

      setSelectedSantri((prev: any) => ({ ...prev, status_santri: statusVal }));
      setSantriList((prev) =>
        prev.map((s) => (s.id === selectedSantri.id ? { ...s, status_santri: statusVal } : s))
      );
      if (fullProfile) setFullProfile((prev: any) => ({ ...prev, status_santri: statusVal }));

      showPopup('Status Diperbarui', `Status ${selectedSantri.nama_santri || selectedSantri.nama} berhasil diubah menjadi '${statusVal.toUpperCase()}'!`, 'success');
      setShowStatusModal(false);
      fetchFullSantriProfile(selectedSantri.id);
    } catch (err: any) {
      showPopup('Gagal Mengubah Status', err.response?.data?.detail || 'Gagal mengubah status santri', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 2: Set Target Harian
  const handleSaveTargetHarian = async () => {
    if (!selectedSantri || !editTargetHarian.trim()) return;
    setActionLoading(true);
    try {
      await api.put(`/musyrif/santri/${selectedSantri.id}/target-harian`, {
        target_harian: editTargetHarian.trim(),
      });
      showPopup('Target Disimpan', 'Target Harian Berhasil Disimpan!', 'success');
      fetchFullSantriProfile(selectedSantri.id);
    } catch (err: any) {
      showPopup('Gagal Menyimpan', err.response?.data?.detail || 'Gagal menyimpan target harian', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 3: Daftar Ujian Santri
  const handleDaftarUjian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri || !tanggalUjian) return;
    setActionLoading(true);
    try {
      await api.post(`/musyrif/santri/${selectedSantri.id}/daftar-ujian`, {
        tanggal_ujian: tanggalUjian,
        catatan_persiapan: catatanPersiapan || null,
      });
      showPopup('Pendaftaran Ujian', `Santri berhasil didaftarkan ujian untuk tanggal ${tanggalUjian}!`, 'success');
      setShowUjianModal(false);
      fetchFullSantriProfile(selectedSantri.id);
    } catch (err: any) {
      showPopup('Gagal Mendaftar Ujian', err.response?.data?.detail || 'Gagal mendaftarkan ujian', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 4: Submit Hasil Ujian
  const handleSubmitHasilUjian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/musyrif/santri/${selectedSantri.id}/hasil-ujian`, {
        hasil: hasilUjian,
        catatan: catatanHasilUjian || null,
      });
      showPopup('Hasil Ujian Disimpan', res.data?.detail || 'Hasil Ujian Berhasil Disimpan!', 'success');
      setShowUjianModal(false);
      fetchFullSantriProfile(selectedSantri.id);
    } catch (err: any) {
      showPopup('Gagal Menyimpan Hasil Ujian', err.response?.data?.detail || 'Gagal menyimpan hasil ujian', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 5: Submit Setoran
  const handleVerifySetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surah.trim() || !ayat.trim()) {
      showPopup('Input Tidak Lengkap', 'Isi nama surah/juz dan ayat/kaca terlebih dahulu!', 'info');
      return;
    }

    const santriId = Number(selectedSantri?.id);
    if (!santriId) return;
    setInputLoading(true);

    try {
      await api.post('/musyrif/setoran', {
        santri_id: santriId,
        surah_id: surahId,
        surah_sahih: surah.trim(),
        surah: surah.trim(),
        ayat_standar: ayat.trim(),
        ayat: ayat.trim(),
        status_kelancaran: statusSetoran,
        catatan_koreksi: catatanKoreksi.trim() || null,
        ada_teguran: adaTeguran,
        jenis_teguran: jenisTeguran,
        catatan_teguran: catatanTeguran.trim() || null,
        catatan_musyrif: catatanMusyrif.trim() || null,
      });

      showPopup('Setoran Disimpan', 'Setoran Berhasil Disimpan! 🎉', 'success');
      resetForm();
      fetchFullSantriProfile(santriId);
      setCurrentStep('student_detail');
    } catch (err: any) {
      showPopup('Gagal Simpan Setoran', err.response?.data?.detail || 'Error koneksi server', 'error');
    } finally {
      setInputLoading(false);
    }
  };

  // ACTION 6: Submit Raport
  const handleSubmitRaport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;
    setActionLoading(true);
    try {
      await api.post('/musyrif/raport', {
        santri_id: selectedSantri.id,
        semester: semesterRaport,
        nilai_harian: Number(nilaiHarian),
        nilai_bulanan: Number(nilaiBulanan),
        nilai_akhir: Number(nilaiAkhir),
        catatan_musyrif: catatanRaport,
      });
      showPopup('Raport Disimpan', 'Nilai Raport Berhasil Disimpan!', 'success');
      setShowRaportModal(false);
      fetchFullSantriProfile(selectedSantri.id);
    } catch (err: any) {
      showPopup('Gagal Simpan Raport', err.response?.data?.detail || 'Gagal menyimpan raport', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // AI FUNCTION 1: Rangkuman Harian AI
  const handleFetchDailyAiSummary = async () => {
    if (!selectedSantri) return;
    setAiLoading(true);
    setDailyAiSummary('Menggenerasi Rangkuman AI kilat...');
    try {
      const res = await api.post(`/musyrif/ai/rangkuman-harian/${selectedSantri.id}`, {
        tanggal: selectedDate,
      });
      setDailyAiSummary(res.data?.rangkuman_ai || 'Tidak ada rangkuman.');
    } catch (err) {
      setDailyAiSummary('Gagal terhubung ke layanan AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI FUNCTION 2: Analisis Keseluruhan
  const handleFetchOverallAnalysis = async () => {
    if (!selectedSantri) return;
    setAiLoading(true);
    setOverallAnalysis('Senior Musyrif AI sedang menganalisis histori setoran...');
    try {
      const res = await api.post(`/musyrif/statistik/analisis/${selectedSantri.id}`);
      setOverallAnalysis(res.data?.data?.analisis_ai || 'Belum ada data analisis.');
    } catch (err) {
      setOverallAnalysis('Gagal memproses analisis tren.');
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
      else if (st === 'persiapan_ujian') acc.persiapan_ujian++;
      else if (st === 'remed_ujian') acc.remed_ujian++;
      return acc;
    },
    { hadir: 0, izin: 0, persiapan_ujian: 0, remed_ujian: 0 }
  );

  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || 'hadir').toLowerCase();
    if (s === 'hadir') {
      return <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Hadir</span>;
    } else if (s === 'izin') {
      return <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Izin</span>;
    } else if (s === 'persiapan_ujian') {
      return <span className="bg-sky-100 border border-sky-300 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Persiapan Ujian</span>;
    } else if (s === 'remed_ujian') {
      return <span className="bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Remedial</span>;
    }
    return <span className="bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{s}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-600 font-mono text-xs tracking-wider">
        🌱 MEMUAT PORTAL HALAQAH...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center p-4 relative">
      <div className="w-full max-w-md flex flex-col gap-5 pt-4">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {(musyrifName || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 block">
                HALAQAH MUSYRIF
              </span>
              <h2 className="text-sm font-bold text-slate-800">{musyrifName}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              clearSession();
              localStorage.removeItem(STORAGE_KEY);
              router.push('/login');
            }}
            className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition font-medium"
          >
            Keluar
          </button>
        </div>

        {/* STEP 1: DASHBOARD MENU UTAMA */}
        {currentStep === 'menu' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div
              onClick={() => {
                setPortalMode('input');
                setCurrentStep('select_student');
              }}
              className="bg-emerald-600 p-8 rounded-3xl cursor-pointer shadow-xl hover:bg-emerald-500 transition transform active:scale-[0.99] text-center"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-2xl">🎙️</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-100 tracking-widest uppercase block mb-1">
                INPUT LIVE SESSION
              </span>
              <h3 className="text-xl font-black text-white">Input Setoran Santri</h3>
            </div>

            <div
              onClick={() => {
                setPortalMode('monitor');
                setCurrentStep('select_student');
              }}
              className="bg-white border border-emerald-100 p-6 rounded-3xl cursor-pointer hover:bg-emerald-50/50 transition flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200 text-2xl">
                📊
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase block">
                  MONITORING & AI ANALYTICS
                </span>
                <h4 className="text-md font-bold text-slate-800">Profil & Statistik Santri</h4>
              </div>
            </div>

            {isAdminRole(userRole) && (
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛡️</span>
                  <span className="text-xs font-semibold text-slate-700">Masuk Portal Admin</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* STEP 2: PILIH SANTRI */}
        {currentStep === 'select_student' && (
          <div className="bg-white p-5 rounded-3xl border border-emerald-100 flex flex-col gap-4 animate-fadeIn shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                {portalMode === 'input' ? '🎙️ Pilih Santri Penyetor' : '📊 Pilih Santri Dipantau'}
              </h3>
              <button onClick={() => setCurrentStep('menu')} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700">
                ← Kembali
              </button>
            </div>

            <div className="mt-1">
              <input
                type="text"
                placeholder="Cari nama atau NIS santri..."
                value={searchSantriQuery}
                onChange={(e) => setSearchSantriQuery(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400 shadow-sm transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              {error && <p className="text-xs text-center text-red-500 py-2">{error}</p>}
              
              {santriList.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-4">Belum ada data santri.</p>
              ) : (
                (() => {
                  const filteredSantri = santriList.filter((s: any) => {
                    const name = (s.nama_santri || s.nama || '').toLowerCase();
                    const nis = (s.nomor_induk || '').toLowerCase();
                    const query = searchSantriQuery.toLowerCase();
                    return name.includes(query) || nis.includes(query);
                  });

                  return filteredSantri.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 py-4">Santri tidak ditemukan.</p>
                  ) : (
                    filteredSantri.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSantri(s)}
                        className="bg-slate-50 hover:bg-emerald-50/70 p-3.5 rounded-2xl cursor-pointer border border-slate-200 hover:border-emerald-300 flex items-center justify-between transition group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center border border-emerald-400 text-xs font-bold text-white">
                            {(s.nama_santri || s.nama || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{s.nama_santri || s.nama}</h4>
                            <p className="text-[10px] text-slate-500">NIS: {s.nomor_induk || '-'}</p>
                          </div>
                        </div>
                        <div>{renderStatusBadge(s.status_santri)}</div>
                      </div>
                    ))
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* STEP 3: READY TO RECORD */}
        {currentStep === 'ready_to_record' && selectedSantri && (
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center gap-5 animate-fadeIn shadow-sm">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block mb-1">
                Siap Merekam Setoran Live
              </span>
              <h3 className="text-lg font-black text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</h3>
              <div className="mt-2">{renderStatusBadge(selectedSantri.status_santri)}</div>
            </div>

            {selectedSantri.status_santri && selectedSantri.status_santri !== 'hadir' && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-800 text-left w-full">
                <p className="font-bold mb-1">⚠️ Status Santri: {selectedSantri.status_santri.toUpperCase()}</p>
                <p className="mb-2 text-[11px] text-amber-700">Backend menolak input setoran jika status santri bukan "Hadir".</p>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('hadir')}
                  className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase hover:bg-amber-500 transition"
                >
                  {actionLoading ? 'Memproses...' : 'Ubah Status Jadi HADIR'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={startListening}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition flex items-center justify-center gap-2"
            >
              <span className="text-lg">🎙️</span> Mulai Bicara / Rekam
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep('select_student')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              ← Pilih Santri Lain
            </button>
          </div>
        )}

        {/* STEP 3: SESI REKAMAN VOICE */}
        {currentStep === 'recording_session' && selectedSantri && (
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center gap-5 animate-fadeIn shadow-sm">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block mb-1">
                Live Voice Assistant Active
              </span>
              <h3 className="text-md font-black text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</h3>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className={`absolute w-28 h-28 rounded-full bg-emerald-500/20 ${isListening ? 'animate-ping' : ''}`}></div>
              <button
                type="button"
                onClick={startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white shadow-xl relative z-10 ${
                  isListening ? 'bg-red-500' : 'bg-emerald-600'
                }`}
              >
                {isListening ? '⏹️' : '🎙️'}
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium max-w-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              {catatanMusyrif || 'Mendengarkan ucapan musyrif...'}
            </p>

            <button
              type="button"
              onClick={startListening}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition"
            >
              ⏹️ SELESAI & PROSES BACAAN
            </button>
          </div>
        )}

        {/* STEP 3: STUDENT DETAIL & MONITORING PORTAL */}
        {currentStep === 'student_detail' && selectedSantri && (
          <div className="flex flex-col gap-4 animate-fadeIn w-full pb-8">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep('select_student')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Kembali ke Daftar Santri
              </button>
            </div>

            {/* Profile Card Header */}
            <div className="bg-white border border-emerald-100 p-5 rounded-3xl flex flex-col items-center text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-xl font-black text-white mb-2 border-2 border-emerald-400">
                {(selectedSantri.nama_santri || selectedSantri.nama || 'S').charAt(0).toUpperCase()}
              </div>
              <h1 className="text-lg font-black text-slate-800">
                {fullProfile?.nama_santri || selectedSantri.nama_santri || selectedSantri.nama}
              </h1>
              
              <div className="flex items-center gap-2 mt-2">
                {renderStatusBadge(fullProfile?.status_santri || selectedSantri.status_santri)}
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  NIS: {fullProfile?.nomor_induk || selectedSantri.nomor_induk || '-'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5 w-full">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2.5 rounded-xl border border-slate-200 uppercase transition shadow-sm"
                >
                  <span className="text-sm">⚙️</span>
                  <span>Edit Target</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUjianModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-bold py-2.5 rounded-xl border border-sky-200 uppercase transition shadow-sm"
                >
                  <span className="text-sm">📝</span>
                  <span>Kelola Ujian</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1.5 border border-slate-200 shadow-inner mt-1">
              <button
                onClick={() => setActiveTab('setoran_daily')}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-bold uppercase rounded-xl transition ${
                  activeTab === 'setoran_daily' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="text-base">📅</span>
                <span>Harian</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-bold uppercase rounded-xl transition ${
                  activeTab === 'profile' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="text-base">👤</span>
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('raport_log')}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-bold uppercase rounded-xl transition ${
                  activeTab === 'raport_log' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="text-base">📑</span>
                <span>Raport</span>
              </button>
            </div>

            {/* TAB CONTENT SECTION */}
            {profileLoading ? (
              <div className="bg-white p-8 rounded-3xl text-center text-xs text-emerald-600 font-mono border border-emerald-100">
                🌱 Memuat data profil santri...
              </div>
            ) : (
              <>
                {/* TAB 1: SETORAN PER HARI */}
                {activeTab === 'setoran_daily' && (
                  <div className="flex flex-col gap-4">
                    
                    {/* Picker Tanggal */}
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between gap-3 mt-1">
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
                    </div>

                    {/* AI Buttons Bar */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleFetchDailyAiSummary}
                        className="flex flex-col items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-3.5 px-2 rounded-2xl uppercase tracking-wider transition shadow-md border border-emerald-500"
                      >
                        <span className="text-xl">⚡</span>
                        <span className="text-center">Rangkuman<br/>Hari Ini</span>
                      </button>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleFetchOverallAnalysis}
                        className="flex flex-col items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold py-3.5 px-2 rounded-2xl uppercase tracking-wider transition shadow-md border border-teal-500"
                      >
                        <span className="text-xl">📈</span>
                        <span className="text-center">Analisis<br/>Keseluruhan</span>
                      </button>
                    </div>

                    {/* AI Daily Summary Output */}
                    {dailyAiSummary && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm animate-fadeIn">
                        <div className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider mb-2">
                          📋 Rangkuman AI Per Hari ({selectedDate}):
                        </div>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                          {dailyAiSummary}
                        </div>
                      </div>
                    )}

                    {/* AI Overall Trend Output */}
                    {overallAnalysis && (
                      <div className="bg-white text-slate-800 p-4 rounded-2xl shadow-sm animate-fadeIn border border-teal-200">
                        <div className="text-[10px] font-bold uppercase text-teal-700 tracking-wider mb-2">
                          🧠 Analisis Grafik Performa Keseluruhan (Overall):
                        </div>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                          {overallAnalysis}
                        </div>
                      </div>
                    )}

                    {/* List Setoran */}
                    <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Setoran Tanggal {selectedDate}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          {filteredSetoranByDate.length} Rekaman
                        </span>
                      </div>

                      {filteredSetoranByDate.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 py-6">
                          Tidak ada catatan setoran pada tanggal {selectedDate}.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {filteredSetoranByDate.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h4 className="font-bold text-slate-800 text-xs">{item.surah}</h4>
                                  <p className="text-[10px] text-slate-500">
                                    Ayat {item.ayat} • {item.waktu_setoran || item.waktu || '-'}
                                  </p>
                                </div>
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                    (item.status_kelancaran || item.status || '').toLowerCase().includes('lancar')
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {item.status_kelancaran || item.status}
                                </span>
                              </div>
                              {item.catatan_musyrif && (
                                <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200 mt-2">
                                  "{item.catatan_musyrif}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 2: PROFIL & TARGET */}
                {activeTab === 'profile' && (
                  <div className="bg-white p-5 rounded-3xl border border-emerald-100 flex flex-col gap-4 shadow-sm animate-fadeIn">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Informasi Akademik Santri
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Kelompok</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">{fullProfile?.nama_kelompok || '-'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Musyrif</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">{fullProfile?.nama_musyrif || '-'}</p>
                      </div>
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-2">
                      Target & Ujian
                    </h3>

                    <div className="flex flex-col gap-2.5">
                      <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-emerald-700 block">Target Semester</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{fullProfile?.target_semester || 'Belum ditentukan'}</p>
                        </div>
                        <span className="text-lg">🎯</span>
                      </div>

                      <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-emerald-700 block">Target Harian</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{fullProfile?.target_harian || 'Belum ditentukan'}</p>
                        </div>
                        <span className="text-lg">📖</span>
                      </div>

                      <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-sky-700 block">Tanggal Ujian</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{fullProfile?.tanggal_ujian || 'Belum ada jadwal'}</p>
                          {fullProfile?.catatan_persiapan_ujian && (
                            <p className="text-[10px] text-slate-500 mt-1">Catatan: {fullProfile.catatan_persiapan_ujian}</p>
                          )}
                        </div>
                        <span className="text-lg">📅</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: RAPORT & HISTORI STATUS LOG */}
                {activeTab === 'raport_log' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* REKAPITULASI */}
                    <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                        📊 Rekapitulasi Presensi & Status
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-2xl">
                          <span className="text-[9px] font-bold text-emerald-700 block uppercase">Hadir</span>
                          <span className="text-lg font-black text-emerald-800">{statusCounters.hadir}</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 p-2 rounded-2xl">
                          <span className="text-[9px] font-bold text-amber-700 block uppercase">Izin</span>
                          <span className="text-lg font-black text-amber-800">{statusCounters.izin}</span>
                        </div>
                        <div className="bg-sky-50 border border-sky-200 p-2 rounded-2xl">
                          <span className="text-[9px] font-bold text-sky-700 block uppercase">Ujian</span>
                          <span className="text-lg font-black text-sky-800">{statusCounters.persiapan_ujian}</span>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 p-2 rounded-2xl">
                          <span className="text-[9px] font-bold text-rose-700 block uppercase">Remedial</span>
                          <span className="text-lg font-black text-rose-800">{statusCounters.remed_ujian}</span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: RAPORT */}
                    <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                          📜 Nilai Raport Santri
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowRaportModal(true)}
                          className="text-[10px] bg-emerald-600 text-white font-bold px-3 py-1 rounded-xl uppercase hover:bg-emerald-500 transition"
                        >
                          + Input Raport
                        </button>
                      </div>

                      {raportList.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Belum ada data nilai raport.</p>
                      ) : (
                        raportList.map((rap: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-2.5 last:mb-0">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-800">Semester: {rap.semester}</span>
                              <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                                Nilai Akhir: {rap.nilai_akhir}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-1.5">
                              <span>Harian: <b className="text-slate-700">{rap.nilai_harian}</b></span>
                              <span>Bulanan: <b className="text-slate-700">{rap.nilai_bulanan}</b></span>
                            </div>
                            {rap.catatan_musyrif && (
                              <p className="text-[10px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                                "{rap.catatan_musyrif}"
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* SECTION 2: LOG AKTIVITAS */}
                    <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
                      <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider border-b border-slate-100 pb-3 mb-3">
                        ⏱️ Log Histori Status
                      </h3>

                      {statusLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat aktivitas.</p>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {statusLogs.map((log: any, i: number) => (
                            <div key={i} className="flex gap-3 text-xs border-b border-slate-100 pb-2 last:border-0 items-start">
                              <span className="text-[9px] font-mono text-slate-400 min-w-[65px] pt-0.5">
                                {log.waktu?.split(',')[0] || '-'}
                              </span>
                              <div>
                                <span className="font-bold text-slate-700 uppercase text-[10px]">
                                  {log.status}
                                </span>
                                <p className="text-[11px] text-slate-500">{log.keterangan || '-'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 4: FORM INPUT SETORAN */}
        {currentStep === 'input_form' && selectedSantri && (
          <div className="flex flex-col gap-4 animate-fadeIn w-full pb-8">
            <div className="bg-white border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Penyetor</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</p>
                  {renderStatusBadge(selectedSantri.status_santri)}
                </div>
              </div>
              <button
                onClick={() => setCurrentStep('select_student')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition"
              >
                Batal
              </button>
            </div>

            {selectedSantri.status_santri && selectedSantri.status_santri !== 'hadir' && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-800">
                <p className="font-bold mb-1 text-rose-900">🛑 Peringatan Proteksi Backend</p>
                <p className="mb-2 text-[11px]">Santri ini berstatus "{selectedSantri.status_santri}". Setoran ditolak oleh backend sampai status diubah ke HADIR.</p>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('hadir')}
                  className="bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase hover:bg-rose-500 transition"
                >
                  {actionLoading ? 'Memproses...' : 'Ubah Ke Status HADIR'}
                </button>
              </div>
            )}

            <div className="bg-white border border-emerald-100 p-5 rounded-3xl shadow-sm">
              <form onSubmit={handleVerifySetoran} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Surah / Juz
                    </label>
                    <input
                      type="text"
                      placeholder="Al-Mulk / Juz 30"
                      value={surah}
                      onChange={(e) => setSurah(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Ayat / Kaca
                    </label>
                    <input
                      type="text"
                      placeholder="1-15 / Kaca 3"
                      value={ayat}
                      onChange={(e) => setAyat(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Kelancaran
                  </label>
                  <select
                    value={statusSetoran}
                    onChange={(e) => setStatusSetoran(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-emerald-500 outline-none font-medium"
                  >
                    <option value="Lancar">🟢 Lancar (Mumtaz)</option>
                    <option value="Cukup Lancar">🟡 Cukup Lancar (Jayyid)</option>
                    <option value="Kurang Lancar">🟠 Kurang Lancar (Dhoif)</option>
                    <option value="Mengulang">🔴 Mengulang</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Catatan Koreksi Tajwid/Makhraj
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Qalqalah kurang tahan"
                    value={catatanKoreksi}
                    onChange={(e) => setCatatanKoreksi(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">Ada Teguran Santri?</span>
                    <input
                      type="checkbox"
                      checked={adaTeguran}
                      onChange={(e) => setAdaTeguran(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {adaTeguran && (
                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200 animate-fadeIn">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Catatan Teguran Adab / Kedisiplinan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kurang fokus / mengobrol"
                        value={catatanTeguran}
                        onChange={(e) => setCatatanTeguran(e.target.value)}
                        className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl p-2 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Catatan Sesi Musyrif
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={catatanMusyrif}
                      onChange={(e) => setCatatanMusyrif(e.target.value)}
                      placeholder="Transkrip instruksi atau catatan musyrif..."
                      className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl p-2.5 pr-10 text-xs outline-none resize-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={startListening}
                      className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-slate-200 border border-slate-300 text-emerald-700 hover:text-emerald-800"
                    >
                      🎙️
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inputLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition disabled:opacity-50 shadow-md"
                >
                  {inputLoading ? 'MEMPROSES & MENYIMPAN...' : '✓ SIMPAN SETORAN'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: EDIT STATUS & TARGET HARIAN */}
      {showStatusModal && selectedSantri && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-emerald-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase text-slate-800">⚙️ Pengaturan Status & Target</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase text-slate-500">Status Santri</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="hadir">🟢 HADIR</option>
                  <option value="izin">🟡 IZIN / SAKIT</option>
                  <option value="persiapan_ujian">🔵 PERSIAPAN UJIAN</option>
                  <option value="remed_ujian">🔴 REMEDIAL UJIAN</option>
                </select>
              </div>

              {editStatus === 'izin' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-500">Keterangan Izin</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sakit demam / Acara keluarga"
                    value={editKeterangan}
                    onChange={(e) => setEditKeterangan(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(editStatus, editKeterangan)}
                className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-700 transition"
              >
                Simpan Perubahan Status
              </button>

              <hr className="my-1 border-slate-100" />

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase text-slate-500">Target Harian</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: 1 Kaca / Hari"
                    value={editTargetHarian}
                    onChange={(e) => setEditTargetHarian(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleSaveTargetHarian}
                    className="bg-emerald-600 text-white font-bold px-3 py-2.5 rounded-xl text-xs uppercase hover:bg-emerald-500 transition"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: KELOLA UJIAN SANTRI */}
      {showUjianModal && selectedSantri && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-sky-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase text-slate-800">📝 Kelola Ujian Santri</h3>
              <button onClick={() => setShowUjianModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <form onSubmit={handleDaftarUjian} className="flex flex-col gap-2.5 bg-sky-50 p-3 rounded-2xl border border-sky-200">
                <span className="text-[10px] font-bold text-sky-800 uppercase">1. Daftarkan Ujian Baru</span>
                <input
                  type="date"
                  value={tanggalUjian}
                  onChange={(e) => setTanggalUjian(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Catatan persiapan ujian..."
                  value={catatanPersiapan}
                  onChange={(e) => setCatatanPersiapan(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-sky-600 text-white font-bold py-2 rounded-xl text-xs uppercase hover:bg-sky-500 transition"
                >
                  Daftarkan Ujian
                </button>
              </form>

              <form onSubmit={handleSubmitHasilUjian} className="flex flex-col gap-2.5 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">2. Input Hasil Ujian</span>
                <select
                  value={hasilUjian}
                  onChange={(e: any) => setHasilUjian(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="lulus">🟢 LULUS</option>
                  <option value="remed">🔴 REMEDIAL</option>
                </select>
                <input
                  type="text"
                  placeholder="Catatan penguji/musyrif..."
                  value={catatanHasilUjian}
                  onChange={(e) => setCatatanHasilUjian(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs uppercase hover:bg-emerald-500 transition"
                >
                  Simpan Hasil Ujian
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INPUT RAPORT SANTRI */}
      {showRaportModal && selectedSantri && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-emerald-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase text-slate-800">📜 Input Nilai Raport</h3>
              <button onClick={() => setShowRaportModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRaport} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-500">Semester</label>
                <input
                  type="text"
                  value={semesterRaport}
                  onChange={(e) => setSemesterRaport(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none font-bold focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-bold uppercase text-slate-500">Nilai Harian</label>
                  <input
                    type="number"
                    value={nilaiHarian}
                    onChange={(e) => setNilaiHarian(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-bold uppercase text-slate-500">Nilai Bulanan</label>
                  <input
                    type="number"
                    value={nilaiBulanan}
                    onChange={(e) => setNilaiBulanan(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-bold uppercase text-slate-500">Nilai Akhir</label>
                  <input
                    type="number"
                    value={nilaiAkhir}
                    onChange={(e) => setNilaiAkhir(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none font-bold focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-500">Catatan Musyrif</label>
                <textarea
                  rows={2}
                  value={catatanRaport}
                  onChange={(e) => setCatatanRaport(e.target.value)}
                  placeholder="Catatan perkembangan..."
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-800 outline-none resize-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase hover:bg-emerald-500 transition shadow-md mt-2"
              >
                Simpan Nilai Raport
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP NOTIFIKASI MODAL UI (Pengganti Alert) */}
      {popupModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-slate-100 text-center flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-sm ${
              popupModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              popupModal.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {popupModal.type === 'success' ? '✓' : popupModal.type === 'error' ? '⚠️' : 'ℹ️'}
            </div>
            
            <h3 className="text-sm font-black text-slate-800 mb-1">{popupModal.title}</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">{popupModal.message}</p>
            
            <button
              type="button"
              onClick={closePopup}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition ${
                popupModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' :
                popupModal.type === 'error' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}