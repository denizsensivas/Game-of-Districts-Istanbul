export const characterThemes = {
  ogrenci: {
    label: 'Öğrenci',
    fill: '#FF5A5F',
    stroke: '#D32F2F',
    soft: '#FFE3E5',
    text: '#9F1239',
    className: 'bg-red-100 border-red-500 text-red-700',
  },
  turist: {
    label: 'Turist',
    fill: '#F59E0B',
    stroke: '#B45309',
    soft: '#FEF3C7',
    text: '#92400E',
    className: 'bg-orange-100 border-orange-500 text-orange-700',
  },
  esnaf: {
    label: 'Esnaf',
    fill: '#10B981',
    stroke: '#047857',
    soft: '#D1FAE5',
    text: '#065F46',
    className: 'bg-emerald-100 border-emerald-500 text-emerald-700',
  },
  beyazyakali: {
    label: 'Beyaz Yakalı',
    fill: '#3B82F6',
    stroke: '#1D4ED8',
    soft: '#DBEAFE',
    text: '#1E3A8A',
    className: 'bg-blue-100 border-blue-500 text-blue-700',
  },
};

export function getCharacterKey(character = '') {
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

export function getCharacterTheme(character) {
  return characterThemes[getCharacterKey(character)] || characterThemes.ogrenci;
}
