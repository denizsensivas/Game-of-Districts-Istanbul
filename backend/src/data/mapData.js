const districts = [
  { id: 'kadikoy', name: 'Kadıköy', x: 59.4, y: 70.9 },
  { id: 'uskudar', name: 'Üsküdar', x: 57.8, y: 50.9 },
  { id: 'atasehir', name: 'Ataşehir', x: 73.4, y: 69.8 },
  { id: 'umraniye', name: 'Ümraniye', x: 72.3, y: 51.9 },
  { id: 'maltepe', name: 'Maltepe', x: 70.8, y: 85.5 },
  { id: 'beykoz', name: 'Beykoz', x: 72.8, y: 28.1 },
  { id: 'besiktas', name: 'Beşiktaş', x: 48.9, y: 47.6 },
  { id: 'beyoglu', name: 'Beyoğlu', x: 43.2, y: 55.4 },
  { id: 'sisli', name: 'Şişli', x: 40.8, y: 44.9 },
  { id: 'kagithane', name: 'Kağıthane', x: 45.5, y: 35.8 },
  { id: 'sariyer', name: 'Sarıyer', x: 45.2, y: 25.0 },
  { id: 'eyup', name: 'Eyüp', x: 28.8, y: 19.9 },
  { id: 'sultangazi', name: 'Sultangazi', x: 32.3, y: 34.1 },
  { id: 'gaziosmanpasa', name: 'Gaziosmanpaşa', x: 30.9, y: 40.9 },
  { id: 'bayrampasa', name: 'Bayrampaşa', x: 33.5, y: 52.8 },
  { id: 'fatih', name: 'Fatih', x: 40.9, y: 64.9 },
  { id: 'zeytinburnu', name: 'Zeytinburnu', x: 29.8, y: 70.1 },
  { id: 'arnavutkoy', name: 'Arnavutköy', x: 27.7, y: 26.0, maps: ['buyuk.svg'] },
  { id: 'silivri', name: 'Silivri', x: 6.1, y: 36.9, maps: ['buyuk.svg'] },
  { id: 'catalca', name: 'Çatalca', x: 12.0, y: 19.0, maps: ['buyuk.svg'] },
  { id: 'kartal', name: 'Kartal', x: 80.4, y: 72.7, maps: ['buyuk.svg'] },
  { id: 'pendik', name: 'Pendik', x: 69.4, y: 72.7, maps: ['buyuk.svg'] },
  { id: 'tuzla', name: 'Tuzla', x: 92.0, y: 87.8, maps: ['buyuk.svg'] },
  { id: 'sile', name: 'Şile', x: 89.4, y: 59.7, maps: ['buyuk.svg'] },
  { id: 'sultanbeyli', name: 'Sultanbeyli', x: 81.9, y: 56.2, maps: ['buyuk.svg'] },
  { id: 'sancaktepe', name: 'Sancaktepe', x: 81.8, y: 41.5, maps: ['buyuk.svg'] },
  { id: 'cekmekoy', name: 'Çekmeköy', x: 76.8, y: 60.7, maps: ['buyuk.svg'] },
  { id: 'basaksehir', name: 'Başakşehir', x: 30.8, y: 40.0, maps: ['buyuk.svg'] },
  { id: 'esenler', name: 'Esenler', x: 29.2, y: 48.8, maps: ['buyuk.svg'] },
  { id: 'gungoren', name: 'Güngören', x: 38.3, y: 51.6, maps: ['buyuk.svg'] },
  { id: 'bahcelievler', name: 'Bahçelievler', x: 33.0, y: 46.2, maps: ['buyuk.svg'] },
  { id: 'bakirkoy', name: 'Bakırköy', x: 37.2, y: 47.4, maps: ['buyuk.svg'] },
  { id: 'kucukcekmece', name: 'Küçükçekmece', x: 26.2, y: 54.3, maps: ['buyuk.svg'] },
  { id: 'bagcilar', name: 'Bağcılar', x: 36.8, y: 56.3, maps: ['buyuk.svg'] },
  { id: 'buyukcekmece', name: 'Büyükçekmece', x: 10.6, y: 49.5, maps: ['buyuk.svg'] },
  { id: 'esenyurt', name: 'Esenyurt', x: 18.1, y: 56.3, maps: ['buyuk.svg'] },
  { id: 'avcilar', name: 'Avcılar', x: 18.6, y: 65.2, maps: ['buyuk.svg'] },
  { id: 'beylikduzu', name: 'Beylikdüzü', x: 18.1, y: 41.0, maps: ['buyuk.svg'] },
];

const MAP_TYPES = {
  small: 'Kucuk_idli.svg',
  big: 'buyuk.svg',
};

const smallDistrictIds = new Set(districts.filter((district) => !district.maps).map((district) => district.id));
const playableDistrictIds = new Set(districts.map((district) => district.id));

const FERRY_EDGE_TYPE = 'ferry';

const edges = [
  ['kadikoy', 'uskudar'],
  ['kadikoy', 'atasehir'],
  ['kadikoy', 'maltepe'],
  ['kadikoy', 'fatih', FERRY_EDGE_TYPE],
  ['uskudar', 'atasehir'],
  ['uskudar', 'umraniye'],
  ['uskudar', 'beykoz'],
  ['uskudar', 'besiktas', FERRY_EDGE_TYPE],
  ['uskudar', 'beyoglu', FERRY_EDGE_TYPE],
  ['atasehir', 'umraniye'],
  ['atasehir', 'maltepe'],
  ['umraniye', 'beykoz'],
  ['beykoz', 'sariyer'],
  ['besiktas', 'beyoglu'],
  ['besiktas', 'sisli'],
  ['besiktas', 'kagithane'],
  ['besiktas', 'sariyer'],
  ['beyoglu', 'sisli'],
  ['beyoglu', 'kagithane'],
  ['beyoglu', 'fatih'],
  ['beyoglu', 'bayrampasa'],
  ['sisli', 'kagithane'],
  ['sisli', 'sariyer'],
  ['sisli', 'gaziosmanpasa'],
  ['kagithane', 'sariyer'],
  ['kagithane', 'eyup'],
  ['kagithane', 'gaziosmanpasa'],
  ['sariyer', 'eyup'],
  ['eyup', 'sultangazi'],
  ['eyup', 'gaziosmanpasa'],
  ['eyup', 'bayrampasa'],
  ['eyup', 'fatih'],
  ['sultangazi', 'gaziosmanpasa'],
  ['gaziosmanpasa', 'bayrampasa'],
  ['bayrampasa', 'fatih'],
  ['bayrampasa', 'zeytinburnu'],
  ['fatih', 'zeytinburnu'],
  ['silivri', 'catalca'],
  ['silivri', 'buyukcekmece'],
  ['catalca', 'arnavutkoy'],
  ['catalca', 'buyukcekmece'],
  ['arnavutkoy', 'basaksehir'],
  ['arnavutkoy', 'sariyer'],
  ['buyukcekmece', 'beylikduzu'],
  ['buyukcekmece', 'esenyurt'],
  ['beylikduzu', 'esenyurt'],
  ['beylikduzu', 'avcilar'],
  ['esenyurt', 'avcilar'],
  ['esenyurt', 'basaksehir'],
  ['avcilar', 'kucukcekmece'],
  ['kucukcekmece', 'bakirkoy'],
  ['kucukcekmece', 'bagcilar'],
  ['kucukcekmece', 'basaksehir'],
  ['bakirkoy', 'zeytinburnu'],
  ['bakirkoy', 'bahcelievler'],
  ['bakirkoy', 'gungoren'],
  ['bahcelievler', 'gungoren'],
  ['bahcelievler', 'bagcilar'],
  ['gungoren', 'bagcilar'],
  ['gungoren', 'esenler'],
  ['bagcilar', 'esenler'],
  ['bagcilar', 'basaksehir'],
  ['esenler', 'bayrampasa'],
  ['esenler', 'gaziosmanpasa'],
  ['basaksehir', 'sultangazi'],
  ['basaksehir', 'esenler'],
  ['kartal', 'maltepe'],
  ['kartal', 'pendik'],
  ['pendik', 'tuzla'],
  ['pendik', 'sultanbeyli'],
  ['sultanbeyli', 'sancaktepe'],
  ['sultanbeyli', 'cekmekoy'],
  ['sultanbeyli', 'pendik'],
  ['sancaktepe', 'cekmekoy'],
  ['sancaktepe', 'umraniye'],
  ['sancaktepe', 'atasehir'],
  ['cekmekoy', 'umraniye'],
  ['cekmekoy', 'beykoz'],
  ['cekmekoy', 'sile'],
  ['sile', 'beykoz'],
  ['sile', 'cekmekoy'],
];

const graph = new Map();
districts.forEach((district) => graph.set(district.id, []));

edges.forEach(([first, second, type]) => {
  if (graph.has(first) && graph.has(second)) {
    const connection = { type: type || 'district', ferryRequired: type === FERRY_EDGE_TYPE };
    graph.get(first).push({ districtId: second, ...connection });
    graph.get(second).push({ districtId: first, ...connection });
  }
});

function getMapDistricts(mapType = MAP_TYPES.small) {
  const allowedIds = mapType === MAP_TYPES.big ? playableDistrictIds : smallDistrictIds;
  return districts.filter((district) => allowedIds.has(district.id));
}

function findReachableRouteDetails(startDistrictId, steps, mapType = MAP_TYPES.small) {
  const allowedIds = new Set(getMapDistricts(mapType).map((district) => district.id));
  const seen = new Map([[startDistrictId, { distance: 0, ferryRequired: false }]]);
  const queue = [{ districtId: startDistrictId, distance: 0, ferryRequired: false }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.distance >= steps) continue;

    for (const neighbor of graph.get(current.districtId) || []) {
      const next = {
        districtId: neighbor.districtId,
        distance: current.distance + 1,
        ferryRequired: current.ferryRequired || neighbor.ferryRequired,
      };
      const known = seen.get(next.districtId);

      if (!known || next.distance < known.distance || (next.distance === known.distance && known.ferryRequired && !next.ferryRequired)) {
        seen.set(next.districtId, { distance: next.distance, ferryRequired: next.ferryRequired });
        queue.push(next);
      }
    }
  }

  return Array.from(seen.entries())
    .filter(([districtId, route]) => districtId !== startDistrictId && route.distance === steps && allowedIds.has(districtId))
    .map(([districtId, route]) => ({
      districtId,
      ferryRequired: route.ferryRequired,
    }));
}

function findReachableDistricts(startDistrictId, steps, mapType = MAP_TYPES.small) {
  return findReachableRouteDetails(startDistrictId, steps, mapType).map((route) => route.districtId);
}

module.exports = {
  districts,
  graph,
  edges,
  playableDistrictIds,
  getMapDistricts,
  findReachableRouteDetails,
  findReachableDistricts,
};
