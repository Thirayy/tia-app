// @/lib/surahDictionary.ts

export interface SurahMapping {
  name: string;
  aliases: string[];
}

export const SURAH_DICTIONARY: SurahMapping[] = [
  { name: "Al-Fatihah", aliases: ["fatihah", "patehah", "patihah"] },
  { name: "Al-Baqarah", aliases: ["baqarah", "bakarah"] },
  { name: "Ali 'Imran", aliases: ["ali imran", "imran", "keluarga imran"] },
  { name: "An-Nisa'", aliases: ["nisa", "nisa pihak", "an-nisa"] },
  { name: "Al-Ma'idah", aliases: ["maidah", "maida"] },
  { name: "Al-An'am", aliases: ["anam", "an'am"] },
  { name: "Yasin", aliases: ["yasin", "yasiin", "yasim"] },
  { name: "Al-Waqi'ah", aliases: ["waqiah", "waqiah", "wakiah"] },
  { name: "Ar-Rahman", aliases: ["rahman", "rohman"] },
  { name: "Al-Mulk", aliases: ["mulk", "tabaraka", "tabarok"] },
  { name: "Al-Ikhlash", aliases: ["qulhu", "ikhlas", "qul huwallahu ahad", "ikhlash"] },
  // Tambahan umum lainnya bisa disesuaikan
];

/**
 * Fungsi helper untuk memparsing transkrip suara bebas menjadi Nama Surah & Ayat terstruktur
 * Contoh input: "qulhu satu sampai empat" atau "yasin ayat sembilan belas"
 */
export function parseSpeechToSurah(transcript: string): { surah: string; ayat: string; raw: string } {
  const cleanText = transcript.toLowerCase().trim();
  let detectedSurah = "Al-Ikhlash"; // Default fallback
  let detectedAyat = "1-5";

  // Deteksi Surah dari Dictionary
  for (const item of SURAH_DICTIONARY) {
    if (item.aliases.some(alias => cleanText.includes(alias))) {
      detectedSurah = item.name;
      break;
    }
  }

  // Deteksi Angka / Rentang Ayat (Contoh: "1 sampai 4", "1-5", "ayat 10")
  const numbers = cleanText.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    detectedAyat = `${numbers[0]}-${numbers[1]}`;
  } else if (numbers && numbers.length === 1) {
    detectedAyat = `${numbers[0]}`;
  } else {
    // Parser kata bilangan sederhana bahasa Indonesia jika diperlukan
    if (cleanText.includes("sampai") || cleanText.includes("semejak") || cleanText.includes("sd")) {
      detectedAyat = "1-4"; // Default umum jika rentang disebut tapi angka tidak terbaca pas
    }
  }

  return {
    surah: detectedSurah,
    ayat: detectedAyat,
    raw: transcript,
  };
}