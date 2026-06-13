const fs = require('fs');
const svgPathBbox = require('svg-path-bounding-box');

function fixSvg(filePath) {
  let svg = fs.readFileSync(filePath, 'utf8');

  const textRegex = /<text[^>]*transform="translate\(([^ ]+)\s+([^\)]+)\)"[^>]*>.*?<tspan[^>]*>([^<]+)<\/tspan>.*?<\/text>/gs;
  const texts = [...svg.matchAll(textRegex)].map(match => ({
    fullMatch: match[0],
    x: parseFloat(match[1]),
    y: parseFloat(match[2]),
    text: match[3].toLowerCase().replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
  }));

  const paths = [...svg.matchAll(/<path\b([^>]*)d="([^"]+)"([^>]*)>/g)];
  
  let newSvg = svg;
  
  paths.forEach((p, idx) => {
    try {
      const bbox = svgPathBbox(p[2]);
      // find closest text inside bbox
      let matchedText = null;
      for (const t of texts) {
        if (t.x >= bbox.minX && t.x <= bbox.maxX && t.y >= bbox.minY && t.y <= bbox.maxY) {
          matchedText = t;
          break;
        }
      }
      
      // If we didn't find exactly inside, find closest by distance to center
      if (!matchedText) {
        let minDist = Infinity;
        const cx = (bbox.minX + bbox.maxX) / 2;
        const cy = (bbox.minY + bbox.maxY) / 2;
        for (const t of texts) {
          const dist = Math.sqrt(Math.pow(t.x - cx, 2) + Math.pow(t.y - cy, 2));
          if (dist < minDist) {
            minDist = dist;
            matchedText = t;
          }
        }
      }

      if (matchedText) {
        console.log(`Matched path ${idx} to ${matchedText.text}`);
        let districtId = matchedText.text.trim();
        // custom mappings if needed
        if (districtId.includes('besiktas')) districtId = 'besiktas';
        if (districtId.includes('beyoglu')) districtId = 'beyoglu';
        if (districtId.includes('uskudar')) districtId = 'uskudar';
        if (districtId.includes('kadikoy')) districtId = 'kadikoy';
        if (districtId.includes('maltepe')) districtId = 'maltepe';
        if (districtId.includes('kartal')) districtId = 'kartal';
        if (districtId.includes('pendik')) districtId = 'pendik';
        if (districtId.includes('tuzla')) districtId = 'tuzla';
        if (districtId.includes('sile')) districtId = 'sile';
        if (districtId.includes('beykoz')) districtId = 'beykoz';
        if (districtId.includes('umraniye')) districtId = 'umraniye';
        if (districtId.includes('sultanbeyl')) districtId = 'sultanbeyli'; // fixed
        if (districtId.includes('fatih')) districtId = 'fatih';
        if (districtId.includes('sancaktepe')) districtId = 'sancaktepe';
        if (districtId.includes('cekmekoy')) districtId = 'cekmekoy';
        if (districtId.includes('bayrampasa')) districtId = 'bayrampasa';
        if (districtId.includes('sisli')) districtId = 'sisli';
        if (districtId.includes('kagithane')) districtId = 'kagithane';
        if (districtId.includes('eyup')) districtId = 'eyup';
        if (districtId.includes('sariyer')) districtId = 'sariyer';
        if (districtId.includes('catalca')) districtId = 'catalca';
        if (districtId.includes('arnavutkoy')) districtId = 'arnavutkoy';
        if (districtId.includes('basakseh')) districtId = 'basaksehir';
        if (districtId.includes('esenler')) districtId = 'esenler';
        if (districtId.includes('gungoren')) districtId = 'gungoren';
        if (districtId.includes('bahcel')) districtId = 'bahcelievler';
        if (districtId.includes('zeyt')) districtId = 'zeytinburnu';
        if (districtId.includes('bakirkoy')) districtId = 'bakirkoy';
        if (districtId.includes('kucukcekmece')) districtId = 'kucukcekmece';
        if (districtId.includes('ataseh')) districtId = 'atasehir';
        if (districtId.includes('bagcilar')) districtId = 'bagcilar';
        if (districtId.includes('gaz')) districtId = 'gaziosmanpasa'; // partial match
        if (districtId.includes('sultangaz')) districtId = 'sultangazi';
        if (districtId.includes('buyukcekmece')) districtId = 'buyukcekmece';
        if (districtId.includes('esenyurt')) districtId = 'esenyurt';
        if (districtId.includes('avcilar')) districtId = 'avcilar';
        if (districtId.includes('beyl')) districtId = 'beylikduzu';
        if (districtId.includes('s')) districtId = 'silivri'; // fallback?

        // Make sure it matches our 18 ids if possible.
        // But for all 39 districts, we'll just add the id attribute
        // Remove existing id if any
        let newTag = `<path id="${districtId}" ${p[1]}d="${p[2]}"${p[3]}>`;
        newSvg = newSvg.replace(p[0], newTag);
      }
    } catch(e) {}
  });

  fs.writeFileSync(filePath, newSvg);
  console.log(`Updated ${filePath}`);
}

fixSvg('frontend/public/Kucuk.svg');
fixSvg('frontend/public/buyuk.svg');
