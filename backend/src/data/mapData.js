// MVP için seçilmiş İstanbul Merkez İlçeleri ve Koordinatları
// Koordinatlar, harita overlay'i üzerinde % (yüzde) olarak konumlandırmak için kullanılacaktır.
const districts = [
  { id: 'kadikoy', name: 'Kadıköy', x: 60, y: 70 },
  { id: 'uskudar', name: 'Üsküdar', x: 62, y: 55 },
  { id: 'atasehir', name: 'Ataşehir', x: 60, y: 64 },
  { id: 'umraniye', name: 'Ümraniye', x: 63, y: 56 },
  { id: 'maltepe', name: 'Maltepe', x: 62, y: 76 },
  { id: 'kartal', name: 'Kartal', x: 66, y: 82 },
  { id: 'beykoz', name: 'Beykoz', x: 67, y: 40 },
  { id: 'pendik', name: 'Pendik', x: 72, y: 70 },
  { id: 'tuzla', name: 'Tuzla', x: 73, y: 77 },
  { id: 'sile', name: 'Şile', x: 74, y: 36 },
  { id: 'besiktas', name: 'Beşiktaş', x: 50, y: 45 },
  { id: 'beyoglu', name: 'Beyoğlu', x: 45, y: 50 },
  { id: 'sisli', name: 'Şişli', x: 48, y: 40 },
  { id: 'fatih', name: 'Fatih', x: 42, y: 60 },
  { id: 'zeytinburnu', name: 'Zeytinburnu', x: 35, y: 65 },
  { id: 'bakirkoy', name: 'Bakırköy', x: 28, y: 70 },
  { id: 'eyup', name: 'Eyüp', x: 40, y: 35 },
  { id: 'sariyer', name: 'Sarıyer', x: 55, y: 20 },
];

const playableDistrictIds = new Set(districts.map((district) => district.id));
const districtById = new Map(districts.map((district) => [district.id, district]));

const edges = [
  // Anadolu Yakası İçi
  ['kadikoy', 'uskudar'],
  ['kadikoy', 'atasehir'],
  ['kadikoy', 'maltepe'],
  ['uskudar', 'atasehir'],
  ['uskudar', 'umraniye'],
  ['uskudar', 'beykoz'],
  ['atasehir', 'umraniye'],
  ['atasehir', 'maltepe'],
  ['umraniye', 'beykoz'],
  ['maltepe', 'kartal'],
  ['kartal', 'pendik'],
  ['pendik', 'tuzla'],
  ['pendik', 'sile'],
  ['beykoz', 'sile'],
  
  // Avrupa Yakası İçi
  ['besiktas', 'beyoglu'],
  ['besiktas', 'sisli'],
  ['besiktas', 'sariyer'],
  ['beyoglu', 'sisli'],
  ['beyoglu', 'eyup'],
  ['beyoglu', 'fatih'],
  ['sisli', 'eyup'],
  ['sisli', 'sariyer'],
  ['sariyer', 'eyup'],
  ['eyup', 'fatih'],
  ['eyup', 'zeytinburnu'],
  ['eyup', 'bakirkoy'],
  ['fatih', 'zeytinburnu'],
  ['zeytinburnu', 'bakirkoy'],
  
  // Yaka Geçişleri (Boğaz / Köprü / Vapur)
  ['besiktas', 'uskudar'],
  ['sariyer', 'beykoz'],
  ['beyoglu', 'uskudar'],
  ['fatih', 'kadikoy'],
  ['fatih', 'uskudar'],
];

// Grafiği Map yapısına dönüştürme
const graph = new Map();
districts.forEach(d => graph.set(d.id, []));

edges.forEach(([u, v]) => {
  if (graph.has(u) && graph.has(v)) {
    graph.get(u).push(v);
    graph.get(v).push(u);
  }
});

function findReachableDistricts(startDistrictId, steps) {
  const distances = new Map();
  const queue = [startDistrictId];
  distances.set(startDistrictId, 0);

  while (queue.length > 0) {
    const current = queue.shift();
    const currentDist = distances.get(current);

    if (currentDist >= steps) continue;

    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }
  }

  const reachable = [];
  for (const [node, dist] of distances.entries()) {
    if (dist === steps && playableDistrictIds.has(node)) {
      reachable.push(node);
    }
  }
  return reachable;
}

module.exports = {
  districts,
  graph,
  edges,
  playableDistrictIds,
  findReachableDistricts
};
