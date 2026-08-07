'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { getApiUrl, ensureArray } from '@/lib/api';
import { clearSession, getSession, isAdminRole } from '@/lib/auth';

export default function MusyrifPortalMobile() {
  const router = useRouter();
  const STORAGE_KEY = 'musyrif_portal_state';

  // Helper extractor ID Santri
  const getSantriId = (santriObj: any): number | string | null => {
    if (!santriObj) return null;
    return santriObj.id ?? santriObj.santri_id ?? santriObj.student_id ?? null;
  };

  // Helper Auto-Resize Textarea
  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

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

  // MUSYRIF PROFILE STATES
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

  // CUSTOM POPUP NOTIFICATION STATE
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
  const [dailyAiSummary, setDailyAiSummary] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
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

  // Form Ujian State (Hanya untuk pendaftaran)
  const [showUjianModal, setShowUjianModal] = useState(false);
  const [tanggalUjian, setTanggalUjian] = useState('');
  const [catatanPersiapan, setCatatanPersiapan] = useState('');

  // POPUP FORM RAPORT STATE
  const [showRaportModal, setShowRaportModal] = useState(false);
  const [semesterRaport, setSemesterRaport] = useState('Ganjil 2026/2027');
  const [nilaiHarian, setNilaiHarian] = useState(85);
  const [nilaiBulanan, setNilaiBulanan] = useState(85);
  const [nilaiAkhir, setNilaiAkhir] = useState(85);
  const [catatanRaport, setCatatanRaport] = useState('');
  const [rekomendasiAiForm, setRekomendasiAiForm] = useState('');

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
  const [newTeguranInput, setNewTeguranInput] = useState('');

  const [inputLoading, setInputLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');
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
    } finally {
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
      setRekomendasiAiForm(latest.rekomendasi_ai || latest.analisis_raport || '');
    } else {
      setSemesterRaport('Ganjil 2026/2027');
      setNilaiHarian(85);
      setNilaiBulanan(85);
      setNilaiAkhir(85);
      setCatatanRaport('');
      setRekomendasiAiForm('');
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

  // API CALL: Fetch Musyrif Profile
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

  useEffect(() => {
    fetchSantriList();
    fetchMusyrifProfile();
  }, [router]);

  // MUSYRIF PROFILE HANDLERS
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

  // HANDLER UPLOAD FOTO SANTRI BINAAN
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

  const fetchFullSantriProfile = async (santriId: number | string) => {
    setProfileLoading(true);
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
    setStatusSetoran('Lancar');
    setCatatanKoreksi('');
    setAdaTeguran(false);
    setJenisTeguran([]);
    setCatatanTeguran('');
    setCatatanMusyrif('');
    setNewTeguranInput('');
    baseTextRef.current = '';
    accumulatedTextRef.current = '';
  };

  // RECOGNITION
  const startListening = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showPopup('Browser Tidak Kompatibel', 'Gunakan Chrome untuk Speech Recognition.', 'error');
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let sessionTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        sessionTranscript += event.results[i][0].transcript + ' ';
      }
      const totalText = `${baseTextRef.current} ${sessionTranscript}`.trim();
      accumulatedTextRef.current = totalText;
      setCatatanMusyrif(totalText);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      baseTextRef.current = accumulatedTextRef.current;
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
    baseTextRef.current = accumulatedTextRef.current;
  };

  const handleFinishRecording = async () => {
    const finalTranscript = accumulatedTextRef.current.trim() || catatanMusyrif.trim();
    if (!finalTranscript) {
      showPopup('Transkrip Kosong', 'Belum ada suara terekam.', 'info');
      return;
    }

    setCurrentStep('input_form');
    setInputLoading(true);

    try {
      const res = await api.post(
        '/musyrif/parse-voice',
        { raw_text: finalTranscript },
        { timeout: 20000 }
      );

      const draft = res.data?.draft;
      if (draft) {
        if (draft.surah_id) setSurahId(draft.surah_id);
        if (draft.surah_sahih) setSurah(draft.surah_sahih);
        if (draft.ayat_standar) setAyat(draft.ayat_standar);
        if (draft.status_kelancaran) setStatusSetoran(draft.status_kelancaran);
        if (draft.catatan_koreksi) setCatatanKoreksi(draft.catatan_koreksi);
        if (typeof draft.ada_teguran === 'boolean') setAdaTeguran(draft.ada_teguran);
        if (Array.isArray(draft.jenis_teguran)) {
          setJenisTeguran(draft.jenis_teguran);
        }
        if (draft.catatan_teguran) setCatatanTeguran(draft.catatan_teguran);
        if (draft.catatan_musyrif) setCatatanMusyrif(draft.catatan_musyrif);
      }
    } catch (err: any) {
      console.warn('Fallback ke teks mentah:', err);
      setCatatanMusyrif(finalTranscript);
    } finally {
      setInputLoading(false);
    }
  };

  // ACTIONS
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
    if (!sId || !tanggalUjian) return;
    setActionLoading(true);
    try {
      await api.post(`/musyrif/santri/${sId}/daftar-ujian`, {
        tanggal_ujian: tanggalUjian,
        catatan_persiapan: catatanPersiapan || null,
      });
      showPopup('Pendaftaran Ujian', `Ujian diset tanggal ${tanggalUjian}!`, 'success');
      setShowUjianModal(false);
      setTanggalUjian('');
      setCatatanPersiapan('');
      fetchFullSantriProfile(sId);
    } catch (err: any) {
      showPopup('Gagal', err.response?.data?.detail || 'Error', 'error');
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
    setInputLoading(true);

    try {
      await api.post('/musyrif/setoran', {
        santri_id: santriId,
        student_id: santriId,
        surah_id: surahId,
        surah_sahih: surah.trim(),
        surah: surah.trim(),
        ayat_standar: ayat.trim(),
        ayat: ayat.trim(),
        status_kelancaran: statusSetoran,
        catatan_koreksi: catatanKoreksi.trim() || null,
        ada_teguran: jenisTeguran.length > 0 || adaTeguran,
        jenis_teguran: jenisTeguran,
        catatan_teguran: jenisTeguran.join(', ') || catatanTeguran.trim() || null,
        catatan_musyrif: catatanMusyrif.trim() || null,
      });

      showPopup('Setoran Disimpan', 'Setoran Berhasil Disimpan! 🎉', 'success');
      resetForm();
      fetchFullSantriProfile(santriId);
      setCurrentStep('student_detail');
    } catch (err: any) {
      showPopup('Gagal Simpan Setoran', err.response?.data?.detail || 'Error', 'error');
    } finally {
      setInputLoading(false);
    }
  };

  const handleGenerateCopilotRaport = async () => {
    const sId = getSantriId(selectedSantri);
    if (!sId) return;
    setCopilotLoading(true);
    try {
      const res = await api.post('/musyrif/raport/preview-ai', {
        santri_id: Number(sId),
        student_id: Number(sId),
        semester: semesterRaport,
        nilai_harian: Number(nilaiHarian),
        nilai_bulanan: Number(nilaiBulanan),
        nilai_akhir: Number(nilaiAkhir),
        catatan_musyrif: catatanRaport,
      });
      if (res.data?.rekomendasi_ai || res.data?.analisis_ai) {
        setRekomendasiAiForm(res.data.rekomendasi_ai || res.data.analisis_ai);
        showPopup('✨ AI Berhasil', 'Analisis & Rekomendasi AI otomatis diisikan!', 'success');
      }
    } catch (e: any) {
      showPopup('Gagal AI', 'Koneksi AI terganggu.', 'error');
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleSubmitRaport = async (e: React.FormEvent) => {
    e.preventDefault();
    const sId = getSantriId(selectedSantri);
    if (!sId) return;
    setActionLoading(true);
    try {
      await api.post('/musyrif/raport', {
        santri_id: Number(sId),
        student_id: Number(sId),
        semester: semesterRaport,
        nilai_harian: Number(nilaiHarian),
        nilai_bulanan: Number(nilaiBulanan),
        nilai_akhir: Number(nilaiAkhir),
        catatan_musyrif: catatanRaport,
        rekomendasi_ai: rekomendasiAiForm.trim() || null,
        auto_generate_ai: !rekomendasiAiForm.trim(),
      });
      showPopup('Raport Disimpan', 'Detail Raport & Analisa AI Berhasil Disimpan!', 'success');
      setShowRaportModal(false);
      fetchFullSantriProfile(sId);
    } catch (err: any) {
      showPopup('Gagal Simpan Raport', err.response?.data?.detail || 'Error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFetchDailyAiSummary = async () => {
    const sId = getSantriId(selectedSantri);
    if (!sId) return;
    setAiLoading(true);
    setDailyAiSummary('Menggenerasi Rangkuman AI kilat...');
    try {
      const res = await api.post(`/musyrif/ai/rangkuman-harian/${sId}`, {
        tanggal: selectedDate,
      });
      setDailyAiSummary(res.data?.rangkuman_ai || 'Tidak ada rangkuman.');
    } catch (err) {
      setDailyAiSummary('Gagal terhubung ke layanan AI.');
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

  const handleAddManualTeguran = () => {
    const val = newTeguranInput.trim();
    if (val) {
      setJenisTeguran((prev) => [...prev, val]);
      setAdaTeguran(true);
      setNewTeguranInput('');
    }
  };

  const getDisplayPhotoUrl = (photoValue?: string | null) => {
    if (!photoValue) return null;
    return photoValue.startsWith('http') ? photoValue : getApiUrl(photoValue);
  };

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
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-md group-hover:opacity-90 transition"
                />
              ) : (
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:bg-emerald-500 transition">
                  {(musyrifName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white rounded-full p-0.5 text-[8px] shadow">
                ✏️
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 block">
                HALAQAH MUSYRIF
              </span>
              <h2 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition">
                {musyrifName}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMusyrifProfileModal(true)}
              className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-xl hover:bg-emerald-100 transition font-semibold"
            >
              Profil
            </button>
            <button
              onClick={() => {
                clearSession();
                localStorage.removeItem(STORAGE_KEY);
                router.push('/login');
              }}
              className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-200 transition font-medium"
            >
              Keluar
            </button>
          </div>
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
                    filteredSantri.map((s: any, index: number) => {
                      const sId = getSantriId(s) || index;
                      return (
                        <div
                          key={sId}
                          onClick={() => handleSelectSantri(s)}
                          className="bg-slate-50 hover:bg-emerald-50/70 p-3.5 rounded-2xl cursor-pointer border border-slate-200 hover:border-emerald-300 flex items-center justify-between transition group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            {s.foto_profile || s.foto ? (
                              <img
                                src={getApiUrl(s.foto_profile || s.foto)}
                                alt={s.nama_santri || s.nama}
                                className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center border border-emerald-400 text-xs font-bold text-white">
                                {(s.nama_santri || s.nama || 'S').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{s.nama_santri || s.nama}</h4>
                              <p className="text-[10px] text-slate-500">NIS: {s.nomor_induk || '-'}</p>
                            </div>
                          </div>
                          <div>{renderStatusBadge(s.status_santri)}</div>
                        </div>
                      );
                    })
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* STEP 3: REKAM VOICE SESSION */}
        {(currentStep === 'ready_to_record' || currentStep === 'recording_session') && selectedSantri && (
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center gap-5 animate-fadeIn shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                {getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto) ? (
                  <img
                    src={getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto)!}
                    alt={selectedSantri.nama_santri || selectedSantri.nama}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-lg font-black text-white border-2 border-emerald-400 shadow-sm">
                    {(selectedSantri.nama_santri || selectedSantri.nama || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block mb-1">
                    Input Live Voice Session
                  </span>
                  <h3 className="text-lg font-black text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</h3>
                </div>
              </div>
              <div className="mt-1">{renderStatusBadge(selectedSantri.status_santri)}</div>
            </div>

            {selectedSantri.status_santri && selectedSantri.status_santri !== 'hadir' && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-800 text-left w-full">
                <p className="font-bold mb-1">⚠️ Status Santri: {selectedSantri.status_santri.toUpperCase()}</p>
                <p className="mb-2 text-[11px] text-amber-700">Setoran hanya dapat diinput jika status "Hadir".</p>
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

            <p className="text-[11px] text-slate-500 -mb-2">
              Tahan tombol untuk merekam ucapan setoran/teguran.
            </p>

            <div className="relative flex items-center justify-center my-3">
              <div className={`absolute w-36 h-36 rounded-full bg-emerald-500/20 ${isListening ? 'animate-ping' : ''}`}></div>
              <button
                type="button"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onMouseLeave={(e) => { if (isListening) stopListening(e); }}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl relative z-10 select-none transition-all duration-200 active:scale-95 ${
                  isListening ? 'bg-rose-500 scale-105 shadow-rose-500/50' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                <span className="text-3xl mb-1">🎙️</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-center px-2">
                  {isListening ? 'MEREKAM...' : 'TAHAN UNTUK BICARA'}
                </span>
              </button>
            </div>

            <div className="w-full bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold uppercase text-slate-400">Transkrip Terakumulasi:</span>
                {catatanMusyrif && (
                  <button
                    type="button"
                    onClick={() => {
                      baseTextRef.current = '';
                      accumulatedTextRef.current = '';
                      setCatatanMusyrif('');
                    }}
                    className="text-[10px] text-rose-500 font-bold hover:underline"
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
              <button
                type="button"
                onClick={handleFinishRecording}
                disabled={!catatanMusyrif.trim() || inputLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{inputLoading ? 'Memproses Voice AI...' : 'Lanjut Ke Form Setoran →'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('input_form')}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 py-1"
              >
                Atau Input Manual (Tanpa Voice)
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentStep('select_student')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ← Pilih Santri Lain
              </button>
            </div>
          </div>
        )}

        {/* STEP 3.5: FORM VERIFIKASI SETORAN */}
        {currentStep === 'input_form' && selectedSantri && (
          <form onSubmit={handleVerifySetoran} className="bg-white p-5 rounded-3xl border border-emerald-100 flex flex-col gap-4 animate-fadeIn shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                {getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto) ? (
                  <img
                    src={getDisplayPhotoUrl(selectedSantri?.foto_profile || selectedSantri?.foto)!}
                    alt={selectedSantri.nama_santri || selectedSantri.nama}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-300 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-black text-white border border-emerald-400">
                    {(selectedSantri.nama_santri || selectedSantri.nama || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Verifikasi Setoran</span>
                  <h3 className="text-sm font-bold text-slate-800">{selectedSantri.nama_santri || selectedSantri.nama}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('ready_to_record')}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                🎙️ Voice lagi
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Surah</label>
                <input
                  type="text"
                  placeholder="misal: Al-Baqarah"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Ayat</label>
                <input
                  type="text"
                  placeholder="misal: 1-15"
                  value={ayat}
                  onChange={(e) => setAyat(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Kelancaran Bacaan</label>
              <select
                value={statusSetoran}
                onChange={(e) => setStatusSetoran(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Lancar">Lancar</option>
                <option value="Cukup Lancar">Cukup Lancar</option>
                <option value="Kurang Lancar">Kurang Lancar</option>
                <option value="Mengulang">Mengulang</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Catatan Koreksi (Tajwid/Makhraj)</label>
              <input
                type="text"
                placeholder="Catatan kesalahan bacaan..."
                value={catatanKoreksi}
                onChange={(e) => setCatatanKoreksi(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Kategori Teguran</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['Tajwid/Makhraj', 'Ingatan', 'Adab', 'Kedisiplinan', 'Lainnya'].map((teg) => {
                  const isChecked = jenisTeguran.includes(teg);
                  return (
                    <button
                      key={teg}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setJenisTeguran(jenisTeguran.filter((t) => t !== teg));
                        } else {
                          setJenisTeguran([...jenisTeguran, teg]);
                          setAdaTeguran(true);
                        }
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        isChecked
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {teg}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kategori teguran khusus..."
                  value={newTeguranInput}
                  onChange={(e) => setNewTeguranInput(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-200 rounded-xl flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddManualTeguran}
                  className="text-xs font-bold bg-slate-200 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-300"
                >
                  + Tambah
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Catatan Musyrif</label>
              <textarea
                value={catatanMusyrif}
                onChange={(e) => {
                  setCatatanMusyrif(e.target.value);
                  handleAutoResize(e);
                }}
                rows={2}
                placeholder="Evaluasi keseluruhan..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none overflow-hidden transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={inputLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md"
            >
              {inputLoading ? 'Menyimpan Setoran...' : 'Simpan Setoran Santri'}
            </button>
          </form>
        )}

        {/* STEP 4: STUDENT DETAIL & MONITORING PORTAL */}
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

            {/* CARD PROFIL SANTRI BINAAN WITH PHOTO UPLOAD */}
            <div className="bg-white border border-emerald-100 p-5 rounded-3xl flex flex-col items-center text-center shadow-sm relative">
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
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  NIS: {fullProfile?.nomor_induk || selectedSantri.nomor_induk || '-'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5 w-full">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2.5 rounded-xl border border-slate-200 uppercase transition shadow-sm"
                >
                  <span className="text-xs">⚙️</span>
                  <span>Target</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUjianModal(true)}
                  className="flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-bold py-2.5 rounded-xl border border-sky-200 uppercase transition shadow-sm"
                >
                  <span className="text-xs">📝</span>
                  <span>Daftar Ujian</span>
                </button>
              </div>
            </div>

            {/* TAB NAVIGATION */}
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

            {profileLoading ? (
              <div className="bg-white p-8 rounded-3xl text-center text-xs text-emerald-600 font-mono border border-emerald-100">
                🌱 Memuat data profil santri...
              </div>
            ) : (
              <>
                {/* TAB 1: SETORAN PER HARI */}
                {activeTab === 'setoran_daily' && (
                  <div className="flex flex-col gap-4">
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

                    <div className="mt-1">
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleFetchDailyAiSummary}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-3.5 px-4 rounded-2xl uppercase tracking-wider transition shadow-md border border-emerald-500"
                      >
                        <span className="text-lg">⚡</span>
                        <span>Rangkuman Hari Ini</span>
                      </button>
                    </div>

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
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Informasi Akademik Santri
                      </h3>
                      {/* BUTTON BUKA MODAL POPUP RAPORT */}
                      <button
                        type="button"
                        onClick={() => setShowRaportModal(true)}
                        className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl uppercase transition shadow-sm flex items-center gap-1"
                      >
                        <span>📑</span>
                        <span>Raport & Nilai Santri</span>
                      </button>
                    </div>

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
                          <p className="text-xs font-bold text-slate-800 mt-0.5">
                            {fullProfile?.tanggal_ujian || 'Belum ditetapkan'}
                          </p>
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
                          <span className="text-[9px] font-bold text-rose-700 block uppercase">Remed</span>
                          <span className="text-lg font-black text-rose-800">{statusCounters.remed_ujian}</span>
                        </div>
                      </div>
                    </div>

                    {/* LIST HISTORI RAPORT TERDAFTAR */}
                    <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                          📑 Histori Raport Santri
                        </h3>
                        <button
                          onClick={() => setShowRaportModal(true)}
                          className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl uppercase transition shadow-sm flex items-center gap-1"
                        >
                          <span>✏️</span>
                          <span>Input / Edit Raport</span>
                        </button>
                      </div>

                      {raportList.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 py-4">Belum ada riwayat raport terdaftar.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {raportList.map((r: any, idx: number) => (
                            <div key={r.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-xs text-slate-800">{r.semester}</span>
                                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  NA: {r.nilai_akhir ?? '-'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 mb-2">
                                <span>Nilai Harian: <b>{r.nilai_harian ?? '-'}</b></span>
                                <span>Nilai Bulanan: <b>{r.nilai_bulanan ?? '-'}</b></span>
                              </div>
                              {r.catatan_musyrif && (
                                <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-xl border border-slate-200 mb-2">
                                  "{r.catatan_musyrif}"
                                </p>
                              )}
                              {r.rekomendasi_ai && (
                                <div className="text-[10px] bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-slate-700">
                                  <span className="font-bold text-emerald-800 block mb-1">💡 Rekomendasi AI:</span>
                                  <p className="whitespace-pre-wrap">{r.rekomendasi_ai}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* LOG STATUS RIWAYAT */}
                    <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
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
                                  <span className="text-[10px] text-slate-400">{log.waktu || '-'}</span>
                                </div>
                                {log.keterangan && (
                                  <p className="text-[10px] text-slate-600 mt-0.5">{log.keterangan}</p>
                                )}
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

      </div>

      {/* POPUP MODAL FORM INPUT & EDIT RAPORT */}
      {showRaportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-emerald-100 shadow-2xl flex flex-col gap-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase text-emerald-600 tracking-wider">FORM EVALUASI RAPORT</span>
                <h3 className="text-sm font-black text-slate-800">
                  {fullProfile?.nama_santri || selectedSantri?.nama_santri || selectedSantri?.nama}
                </h3>
              </div>
              <button
                onClick={() => setShowRaportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRaport} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Semester</label>
                <input
                  type="text"
                  value={semesterRaport}
                  onChange={(e) => setSemesterRaport(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Nilai Harian</label>
                  <input
                    type="number"
                    value={nilaiHarian}
                    onChange={(e) => setNilaiHarian(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    min={0} max={100}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Nilai Bulanan</label>
                  <input
                    type="number"
                    value={nilaiBulanan}
                    onChange={(e) => setNilaiBulanan(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    min={0} max={100}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Nilai Akhir</label>
                  <input
                    type="number"
                    value={nilaiAkhir}
                    onChange={(e) => setNilaiAkhir(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-emerald-700"
                    min={0} max={100}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Catatan Musyrif</label>
                <textarea
                  value={catatanRaport}
                  onChange={(e) => {
                    setCatatanRaport(e.target.value);
                    handleAutoResize(e);
                  }}
                  placeholder="Catatan perkembangan santri selama semester..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none overflow-hidden transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">Rekomendasi / Analisa AI Copilot</label>
                  <button
                    type="button"
                    onClick={handleGenerateCopilotRaport}
                    disabled={copilotLoading}
                    className="text-[9px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-2.5 py-1 rounded-lg uppercase transition"
                  >
                    {copilotLoading ? 'Generasi...' : '✨ Generate AI'}
                  </button>
                </div>
                <textarea
                  value={rekomendasiAiForm}
                  onChange={(e) => {
                    setRekomendasiAiForm(e.target.value);
                    handleAutoResize(e);
                  }}
                  placeholder="Klik 'Generate AI' atau ketik masukan AI manual..."
                  rows={3}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-emerald-200 rounded-xl resize-none overflow-hidden transition-all"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRaportModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl uppercase transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl uppercase tracking-wider transition shadow"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Raport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROFIL MUSYRIF */}
      {showMusyrifProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-emerald-100 shadow-2xl flex flex-col gap-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                ⚙️ Profil Musyrif
              </h3>
              <button
                onClick={() => setShowMusyrifProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setMusyrifProfileTab('info')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition ${
                  musyrifProfileTab === 'info' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                Informasi
              </button>
              <button
                type="button"
                onClick={() => setMusyrifProfileTab('password')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition ${
                  musyrifProfileTab === 'password' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                Password
              </button>
            </div>

            {musyrifProfileTab === 'info' ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {musyrifProfileData?.foto_profile ? (
                      <img
                        src={
                          musyrifProfileData.foto_profile.startsWith('http')
                            ? musyrifProfileData.foto_profile
                            : getApiUrl(musyrifProfileData.foto_profile)
                        }
                        alt="Foto Profil"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">
                        {(musyrifNamaLengkap || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <label className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-100 transition">
                    {uploadingFoto ? 'Mengunggah...' : '📷 Unggah Foto'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFotoMusyrif}
                      className="hidden"
                      disabled={uploadingFoto}
                    />
                  </label>
                </div>

                <form onSubmit={handleUpdateMusyrifProfile} className="flex flex-col gap-3 mt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={musyrifNamaLengkap}
                      onChange={(e) => setMusyrifNamaLengkap(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Username</label>
                    <input
                      type="text"
                      value={musyrifUsername}
                      onChange={(e) => setMusyrifUsername(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={musyrifActionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow mt-1"
                  >
                    {musyrifActionLoading ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordMusyrif} className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Password Lama</label>
                  <input
                    type="password"
                    value={passwordLama}
                    onChange={(e) => setPasswordLama(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={passwordBaru}
                    onChange={(e) => setPasswordBaru(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={konfirmasiPasswordBaru}
                    onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={musyrifActionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow mt-1"
                >
                  {musyrifActionLoading ? 'Memproses...' : 'Ubah Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL SET TARGET & STATUS */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-emerald-100 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                ⚙️ Atur Target & Presensi
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Harian Santri</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTargetHarian}
                    onChange={(e) => setEditTargetHarian(e.target.value)}
                    placeholder="misal: 1 Halaman / Day"
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTargetHarian}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 rounded-xl uppercase"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ubah Status Presensi</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold mb-2"
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin / Sakit</option>
                </select>

                {editStatus === 'izin' && (
                  <input
                    type="text"
                    placeholder="Keterangan Izin/Sakit..."
                    value={editKeterangan}
                    onChange={(e) => setEditKeterangan(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-2"
                  />
                )}

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(editStatus, editKeterangan)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider"
                >
                  {actionLoading ? 'Memproses...' : 'Update Presensi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENDAFTARAN UJIAN */}
      {showUjianModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-emerald-100 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                📝 Pendaftaran Ujian
              </h3>
              <button
                onClick={() => setShowUjianModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {fullProfile?.status_santri === 'persiapan_ujian' && (
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-xs text-sky-800 font-medium leading-relaxed">
                ℹ️ Santri saat ini terdaftar dalam masa persiapan ujian. Penilaian hasil ujian akan ditentukan oleh <b>Admin</b>.
              </div>
            )}

            <form onSubmit={handleDaftarUjian} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tanggal Jadwal Ujian</label>
                <input
                  type="date"
                  value={tanggalUjian}
                  onChange={(e) => setTanggalUjian(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Catatan Persiapan</label>
                <textarea
                  value={catatanPersiapan}
                  onChange={(e) => {
                    setCatatanPersiapan(e.target.value);
                    handleAutoResize(e);
                  }}
                  placeholder="Materi / Juz yang diujikan..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none overflow-hidden transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow"
              >
                {actionLoading ? 'Mendaftarkan...' : 'Daftarkan Ujian'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP NOTIFIKASI SYSTEM */}
      {popupModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center flex flex-col items-center gap-3 shadow-2xl animate-fadeIn">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
              popupModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : popupModal.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {popupModal.type === 'success' ? '✓' : popupModal.type === 'error' ? '✕' : 'ℹ'}
            </div>
            <h4 className="font-bold text-sm text-slate-800">{popupModal.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{popupModal.message}</p>
            <button
              onClick={closePopup}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider mt-1 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}