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
];

const playableDistrictIds = new Set(districts.map((district) => district.id));

const edges = [
  ['kadikoy', 'uskudar'],
  ['kadikoy', 'atasehir'],
  ['kadikoy', 'maltepe'],
  ['kadikoy', 'fatih'],
  ['uskudar', 'atasehir'],
  ['uskudar', 'umraniye'],
  ['uskudar', 'beykoz'],
  ['uskudar', 'besiktas'],
  ['uskudar', 'beyoglu'],
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
];

const graph = new Map();
districts.forEach((district) => graph.set(district.id, []));

edges.forEach(([first, second]) => {
  if (graph.has(first) && graph.has(second)) {
    graph.get(first).push(second);
    graph.get(second).push(first);
  }
});

function findReachableDistricts(startDistrictId, steps) {
  const distances = new Map([[startDistrictId, 0]]);
  const queue = [startDistrictId];

  while (queue.length > 0) {
    const current = queue.shift();
    const currentDistance = distances.get(current);
    if (currentDistance >= steps) continue;

    for (const neighbor of graph.get(current) || []) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDistance + 1);
        queue.push(neighbor);
      }
    }
  }

  return Array.from(distances.entries())
    .filter(([districtId, distance]) => districtId !== startDistrictId && distance === steps && playableDistrictIds.has(districtId))
    .map(([districtId]) => districtId);
}

module.exports = {
  districts,
  graph,
  edges,
  playableDistrictIds,
  findReachableDistricts,
};
