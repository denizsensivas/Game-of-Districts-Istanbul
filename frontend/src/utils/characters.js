export const characterOptions = [
  {
    id: 'OgrenciKadin',
    type: 'ogrenci',
    label: 'Öğrenci',
    variant: 'Kadın',
    bonus: 'Bilet alımlarında %10 indirim',
    icon: '/characters/ogrenci_kadın.png',
    selectionImage: '/characters/karakter_secimi/ogrenci_kadın_ks.png',
  },
  {
    id: 'OgrenciErkek',
    type: 'ogrenci',
    label: 'Öğrenci',
    variant: 'Erkek',
    bonus: 'Bilet alımlarında %10 indirim',
    icon: '/characters/ogrenci_erkek.png',
    selectionImage: '/characters/karakter_secimi/ogrenci_erkek_ks.png',
  },
  {
    id: 'EsnafKadin',
    type: 'esnaf',
    label: 'Esnaf',
    variant: 'Kadın',
    bonus: 'Dükkanlardan 2 kat kira alır',
    icon: '/characters/esnaf_kadın.png',
    selectionImage: '/characters/karakter_secimi/esnaf_kadın_ks.png',
  },
  {
    id: 'EsnafErkek',
    type: 'esnaf',
    label: 'Esnaf',
    variant: 'Erkek',
    bonus: 'Dükkanlardan 2 kat kira alır',
    icon: '/characters/esnaf_erkek.png',
    selectionImage: '/characters/karakter_secimi/esnaf_erkek_ks.png',
  },
  {
    id: 'TuristKadin',
    type: 'turist',
    label: 'Turist',
    variant: 'Kadın',
    bonus: 'Taksilerde %20 başarı şansı',
    icon: '/characters/turist_kadın.png',
    selectionImage: '/characters/karakter_secimi/turist_kadın_ks.png',
  },
  {
    id: 'TuristErkek',
    type: 'turist',
    label: 'Turist',
    variant: 'Erkek',
    bonus: 'Taksilerde %20 başarı şansı',
    icon: '/characters/turist_erkek.png',
    selectionImage: '/characters/karakter_secimi/turist_erkek_ks.png',
  },
  {
    id: 'BeyazYakaliKadin',
    type: 'beyazyakali',
    label: 'Beyaz Yakalı',
    variant: 'Kadın',
    bonus: 'Hafta sonu zar x2',
    icon: '/characters/beyazyaka_kadın.png',
    selectionImage: '/characters/karakter_secimi/beyazyaka_kadın_ks.png',
  },
  {
    id: 'BeyazYakaliErkek',
    type: 'beyazyakali',
    label: 'Beyaz Yakalı',
    variant: 'Erkek',
    bonus: 'Hafta sonu zar x2',
    icon: '/characters/beyazyaka_erkek.png',
    selectionImage: '/characters/karakter_secimi/beyazyaka_erkek_ks.png',
  },
];

function getCharacterKey(character = '') {
  return character
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z]/g, '');
}

export function getCharacterMeta(character) {
  const characterKey = getCharacterKey(character);
  return characterOptions.find((option) => option.id === character) ||
    characterOptions.find((option) => characterKey.startsWith(option.type)) ||
    characterOptions[0];
}
