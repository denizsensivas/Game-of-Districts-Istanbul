import { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Hourglass, Minus, Plus } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { districtsData } from './mapData';
import { getCharacterTheme } from '../../utils/characterColors';

const STATUS_DARK = '#111827';

function getDistrictPathIndex(district, mapType) {
  return district.mapPaths?.[mapType] ?? district.pathIndex;
}

function getViewBoxParts(viewBox) {
  const [minX = 0, minY = 0, width = 1094, height = 577] = viewBox.split(/\s+/).map(Number);
  return { minX, minY, width, height };
}

function getSvgAttribute(tag, attribute) {
  return tag.match(new RegExp(`\\s${attribute}="([^"]+)"`))?.[1] || '';
}

function normalizeSvgId(id) {
  return id
    .replace(/^_x3C_/, '')
    .replace(/_x3E_$/, '')
    .replaceAll('ı', 'i')
    .replace('eyupsultan', 'eyup')
    .replace('bayrmapasa', 'bayrampasa')
    .replace('zeytinburu', 'zeytinburnu')
    .replace('bagcilar', 'bagcilar')
    .replace('bagcılar', 'bagcilar');
}

function getStyleFills(svgText) {
  const fills = new Map();
  const styleText = svgText.match(/<style\b[^>]*>([\s\S]*?)<\/style>/)?.[1] || '';
  styleText.replace(/\.([\w-]+)\s*\{[^}]*fill:\s*([^;}\s]+)[^}]*\}/g, (_, className, fill) => {
    fills.set(className, fill);
    return '';
  });
  return fills;
}

function getPathFill(pathTag, styleFills) {
  const inlineFill = getSvgAttribute(pathTag, 'fill');
  if (inlineFill) return inlineFill;

  const classNames = getSvgAttribute(pathTag, 'class').split(/\s+/).filter(Boolean);
  return classNames.map((className) => styleFills.get(className)).find(Boolean) || '#D6D6D6';
}

function getLabelFontSize(name) {
  if (name.length >= 13) return 22;
  if (name.length >= 10) return 28;
  return 34;
}

function getMapPoint(item, svgMap) {
  const mapPoint = item.mapPoints?.[svgMap.mapType];
  if (mapPoint) return mapPoint;

  return {
    x: svgMap.minX + (item.x / 100) * svgMap.width,
    y: svgMap.minY + (item.y / 100) * svgMap.height,
  };
}

function getPathStartPoint(d) {
  const numberPattern = '[-+]?(?:\\d*\\.\\d+|\\d+)';
  const match = d.match(new RegExp(`[Mm]\\s*(${numberPattern})(?:[,\\s]+|(?=[-+]))(${numberPattern})`));
  if (!match) return null;
  return { x: Number(match[1]), y: Number(match[2]) };
}

function isPathInViewBox(d, viewBoxParts) {
  const point = getPathStartPoint(d);
  if (!point) return true;

  return (
    point.x >= viewBoxParts.minX &&
    point.x <= viewBoxParts.minX + viewBoxParts.width &&
    point.y >= viewBoxParts.minY &&
    point.y <= viewBoxParts.minY + viewBoxParts.height
  );
}

const smallMapLandmarkPoints = {
  yelkenli: { x: 890.83, y: 848.99 },
  gemi: { x: 481.3, y: 724.16 },
  gokdelen: { x: 738.83, y: 370.99 },
  gokdelen1: { x: 1074.6782, y: 633.4616 },
  apartman: { x: 465.1, y: 519.69 },
  apartman1: { x: 560.32, y: 288.86 },
  apartman2: { x: 971.69, y: 431.14 },
  bahceli_x5F_ev: { x: 788.23, y: 727.64 },
  bahceli_x5F_ev1: { x: 1125.2879, y: 142.3728 },
  bahceli_x5F_ev2: { x: 687.75, y: 85.01 },
  galata_x5F_kulesi: { x: 590.63, y: 484.19 },
  sultanahmet: { x: 610.74, y: 640.93 },
  ayasofya: { x: 533.96, y: 578.62 },
  ortakoy: { x: 760.34, y: 429.3 },
  kopru: { x: 779.43, y: 301.29 },
  kopru1: { x: 762.44, y: 174.2 },
  kopru2: { x: 769.11, y: 389.02 },
  kiz_x5F_kulesi: { x: 764.08, y: 483.06 },
  agac: { x: 1071.0463, y: 217.3003 },
  agac1: { x: 398.45, y: 727.12 },
  agac2: { x: 321.54, y: 109.01 },
  agac3: { x: 710.86, y: 187.18 },
  agac4: { x: 890.83, y: 640.84 },
  agac5: { x: 1076.9752, y: 800.4349 },
  vapur: { x: 670.05, y: 718.73 },
  vapur1: { x: 718.11, y: 589.51 },
  ucak: { x: 242.45, y: 134.49 },
  taksi: { x: 922.31, y: 720.95 },
  taksi1: { x: 1098.8979, y: 566.0275 },
  taksi2: { x: 970.04, y: 302.27 },
  taksi3: { x: 566.31, y: 365.55 },
  taksi4: { x: 465.1, y: 632.51 },
  eyupcamii: { x: 447.87, y: 194.99 },
};

const smallToBigLandmarkTransform = {
  xScale: 0.6573141155,
  xSkew: 0.0027723734,
  xOffset: 329.2382452951,
  ySkew: -0.0015843808,
  yScale: 0.6630661834,
  yOffset: 142.1686427123,
};

function projectSmallMapPointToBigMap({ x, y }) {
  return {
    x: (smallToBigLandmarkTransform.xScale * x) + (smallToBigLandmarkTransform.xSkew * y) + smallToBigLandmarkTransform.xOffset,
    y: (smallToBigLandmarkTransform.ySkew * x) + (smallToBigLandmarkTransform.yScale * y) + smallToBigLandmarkTransform.yOffset,
  };
}

function replaceTranslate(transform, point) {
  return transform.replace(/translate\(\s*[-.\d]+[,\s]+[-.\d]+\s*\)/, (
    `translate(${Number(point.x.toFixed(2))} ${Number(point.y.toFixed(2))})`
  ));
}

const svgLabelCorrections = {
  besiktas_x5F_label: 'besiktas',
  beyoglu_x5F_label: 'beyoglu',
  uskudar_x5F_label: 'uskudar',
  kadıkoy_x5F_label: 'kadikoy',
  maltepe_x5F_label: 'maltepe',
  beykoz_x5F_label: 'beykoz',
  umraniye_x5F_label: 'umraniye',
  fatih_x5F_label: 'fatih',
  bayrampasa_x5F_label: 'bayrampasa',
  sisli_x5F_label: 'sisli',
  kagıthane_x5F_label: 'kagithane',
  eyup_x5F_label: 'eyup',
  sariyer_x5F_label: 'sariyer',
  zeyntiburnu_x5F_label: 'zeytinburnu',
  atasehir_x5F_label: 'atasehir',
  gaziosmanpasa_x5F_label: 'gaziosmanpasa',
  sultangazi_x5F_label: 'sultangazi',
};

function correctSvgLabel(labelGroup, district, documentNode, viewBoxParts) {
  if (!district) return;
  const x = viewBoxParts.minX + (district.x / 100) * viewBoxParts.width;
  const y = viewBoxParts.minY + (district.y / 100) * viewBoxParts.height;

  const replacementText = documentNode.createElementNS('http://www.w3.org/2000/svg', 'text');
  replacementText.setAttribute('x', String(Number(x.toFixed(2))));
  replacementText.setAttribute('y', String(Number(y.toFixed(2))));
  replacementText.setAttribute('text-anchor', 'middle');
  replacementText.setAttribute('dominant-baseline', 'middle');
  replacementText.setAttribute('font-family', "'Baloo 2', ui-rounded, system-ui, sans-serif");
  replacementText.setAttribute('font-size', String(district.labelSize || getLabelFontSize(district.name)));
  if (district.labelWidth) {
    replacementText.setAttribute('textLength', String(district.labelWidth));
    replacementText.setAttribute('lengthAdjust', 'spacingAndGlyphs');
  }
  replacementText.setAttribute('isolation', 'isolate');
  replacementText.textContent = district.name.toLocaleUpperCase('tr-TR');

  labelGroup.replaceChildren(replacementText);
}

function parseMapSvg(svgText, mapType) {
  const normalizedSvgText = svgText.replaceAll(/xlink:href="([^"]+)"/g, 'xlink:href="/$1" href="/$1"');
  const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] || '0 0 1094 577';
  const viewBoxParts = getViewBoxParts(viewBox);
  const styleFills = getStyleFills(svgText);
  const pathTags = [...normalizedSvgText.matchAll(/<path\b[^>]*>/g)];
  const firstPathFill = pathTags[0] ? getPathFill(pathTags[0][0], styleFills) : '';
  const backgroundFill =
    svgText.match(/<rect\b[^>]*\sid="marmaradenizi"[^>]*\sfill="([^"]+)"/)?.[1] ||
    svgText.match(/<rect\b[^>]*\sfill="([^"]+)"/)?.[1] ||
    firstPathFill ||
    'white';
  const districtBySvgId = new Map(districtsData.map((district) => [normalizeSvgId(district.svgId || district.id), district]));
  districtBySvgId.set('kagıthane', districtsData.find((district) => district.id === 'kagithane'));
  const districtByPathIndex = new Map(
    districtsData
      .map((district) => [getDistrictPathIndex(district, mapType), district])
      .filter(([pathIndex]) => Number.isInteger(pathIndex))
  );
  const districtSvgIds = new Set(districtsData.map((district) => normalizeSvgId(district.svgId || district.id)));
  let decorationMarkup = '';
  let hasSvgLabels = false;

  if (typeof window !== 'undefined' && window.DOMParser && window.XMLSerializer) {
    const parser = new window.DOMParser();
    const documentNode = parser.parseFromString(normalizedSvgText, 'image/svg+xml');
    const svgNode = documentNode.querySelector('svg');

    if (svgNode) {
      svgNode.querySelector('#marmaradenizi')?.remove();
      Array.from(svgNode.children).forEach((childNode) => {
        if (childNode.tagName.toLowerCase() === 'rect') childNode.remove();
      });
      svgNode.querySelectorAll('path').forEach((pathNode, index) => {
        if (mapType === 'buyuk.svg' || districtSvgIds.has(normalizeSvgId(pathNode.id)) || districtByPathIndex.has(index)) pathNode.remove();
      });
      svgNode.querySelectorAll('text, tspan').forEach((textNode) => {
        textNode.textContent = textNode.textContent.toLocaleUpperCase('tr-TR');
      });
      if (mapType === 'Kucuk_idli.svg') {
        const districtById = new Map(districtsData.map((district) => [district.id, district]));
        Object.entries(svgLabelCorrections).forEach(([labelId, districtId]) => {
          const labelGroup = documentNode.getElementById(labelId);
          if (labelGroup) correctSvgLabel(labelGroup, districtById.get(districtId), documentNode, viewBoxParts);
        });
      }
      if (mapType === 'buyuk.svg') {
        svgNode.querySelectorAll('image').forEach((imageNode) => {
          const smallMapPoint = smallMapLandmarkPoints[imageNode.id];
          const transform = imageNode.getAttribute('transform');
          if (smallMapPoint && transform?.includes('translate(')) {
            imageNode.setAttribute('transform', replaceTranslate(transform, projectSmallMapPointToBigMap(smallMapPoint)));
          }
        });
      }
      hasSvgLabels = Boolean(svgNode.querySelector('text'));

      const serializer = new window.XMLSerializer();
      const landmarksNode = svgNode.querySelector('#landmarks');
      const landmarksMarkup = landmarksNode ? serializer.serializeToString(landmarksNode) : '';
      landmarksNode?.remove();
      const labelAndDecorationMarkup = Array.from(svgNode.childNodes)
        .map((node) => serializer.serializeToString(node))
        .join('');
      decorationMarkup = `${landmarksMarkup}${labelAndDecorationMarkup}`;
    }
  }

  return {
    viewBox,
    ...viewBoxParts,
    mapType,
    paths: pathTags
      .map((match, index) => ({
        index,
        id: getSvgAttribute(match[0], 'id'),
        d: getSvgAttribute(match[0], 'd'),
        fill: getPathFill(match[0], styleFills),
        stroke: getSvgAttribute(match[0], 'stroke') || 'white',
        strokeWidth: Number(getSvgAttribute(match[0], 'stroke-width')) || 1,
        district: districtBySvgId.get(normalizeSvgId(getSvgAttribute(match[0], 'id'))) || districtByPathIndex.get(index) || null,
      }))
      .filter((path) => isPathInViewBox(path.d, viewBoxParts))
      .filter((path) => path.d),
    backgroundFill,
    decorationMarkup,
    hasSvgLabels,
  };
}

export default function IstanbulMap() {
  const [svgMap, setSvgMap] = useState({
    viewBox: '0 0 1094 577',
    minX: 0,
    minY: 0,
    width: 1094,
    height: 577,
    paths: [],
    backgroundFill: 'white',
    decorationMarkup: '',
    hasSvgLabels: false,
  });
  const [zoom, setZoom] = useState(1.5);
  const constraintsRef = useRef(null);

  const { possibleMoves, possibleMoveDetails, movePlayer, players, mapState, mapType } = useGameStore();

  useEffect(() => {
    setZoom(mapType === 'buyuk.svg' ? 1 : 1.5);
  }, [mapType]);

  useEffect(() => {
    let isMounted = true;

    fetch(`/${mapType}`)
      .then((response) => response.text())
      .then((svgText) => {
        if (isMounted) setSvgMap(parseMapSvg(svgText, mapType));
      });

    return () => {
      isMounted = false;
    };
  }, [mapType]);

  const playersByDistrict = useMemo(() => {
    return players.reduce((acc, player) => {
      if (!acc[player.position]) acc[player.position] = [];
      acc[player.position].push(player);
      return acc;
    }, {});
  }, [players]);
  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const updateZoom = (nextZoom) => {
    setZoom(Math.min(2.8, Math.max(0.8, Number(nextZoom.toFixed(2)))));
  };

  return (
    <div
      className="game-map w-full h-full relative bg-[#dbf2fe] overflow-hidden select-none"
      ref={constraintsRef}
      onWheel={(event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          event.preventDefault();
          updateZoom(zoom + (event.deltaY > 0 ? -0.12 : 0.12));
        }
      }}
    >
      <div className="absolute top-28 right-4 z-20 bg-white/80 p-2 rounded-xl shadow pointer-events-none">
        <div className="px-3 py-2 text-xs font-black rounded-lg bg-gray-900 text-white">
          {mapType === 'Kucuk_idli.svg' ? 'Küçük Harita' : 'Büyük Harita'}
        </div>
      </div>

      <div className="absolute top-28 left-4 z-20 flex flex-col gap-2 bg-white/85 p-2 rounded-xl shadow pointer-events-auto">
        <button
          onClick={() => updateZoom(zoom + 0.2)}
          className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center game-btn"
          aria-label="Haritayı büyüt"
          title="Büyüt"
        >
          <Plus size={18} />
        </button>
        <div className="text-[10px] font-black text-gray-600 text-center tabular-nums">{Math.round(zoom * 100)}%</div>
        <button
          onClick={() => updateZoom(zoom - 0.2)}
          className="w-10 h-10 rounded-lg bg-gray-200 text-gray-800 flex items-center justify-center game-btn"
          aria-label="Haritayı küçült"
          title="Küçült"
        >
          <Minus size={18} />
        </button>
      </div>

      <Motion.div
        key={mapType}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        initial={mapType === 'buyuk.svg' ? { x: 0, y: 0 } : { x: -100, y: -100 }}
        animate={{ scale: zoom }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        tabIndex={-1}
        className={`absolute origin-center cursor-default flex items-center justify-center pointer-events-auto outline-none ${
          mapType === 'buyuk.svg' ? 'w-full h-full' : 'w-[150%] h-[150%]'
        }`}
      >
        <svg
          viewBox={svgMap.viewBox}
          className="w-full h-full outline-none"
          role="img"
          aria-label="İstanbul oyun haritası"
        >
          <rect x={svgMap.minX} y={svgMap.minY} width={svgMap.width} height={svgMap.height} fill={svgMap.backgroundFill} />
          <style>
            {`
              .map-reachable-path {
                animation: reachable-flash 1s ease-in-out infinite;
                paint-order: stroke;
              }

              .map-closed-marker {
                filter: drop-shadow(0 3px 0 rgba(17, 24, 39, 0.28));
              }

              @keyframes reachable-flash {
                0%, 100% {
                  fill-opacity: 0.5;
                  stroke-opacity: 0.45;
                  stroke-width: 5;
                }
                50% {
                  fill-opacity: 1;
                  stroke-opacity: 1;
                  stroke-width: 11;
                }
              }
            `}
          </style>
          {svgMap.paths.map((path) => {
            const district = path.district;
            const districtStatus = district ? mapState[district.id] : null;
            const isReachable = district ? possibleMoves.includes(district.id) : false;
            const isOwned = Boolean(districtStatus?.ownerId);
            const ownerTheme = isOwned ? getCharacterTheme(playersById.get(districtStatus.ownerId)?.character) : null;
            const isHighlighted = Boolean(district && (isReachable || isOwned));
            const fill = isOwned ? ownerTheme.fill : path.fill;
            const stroke = district && isReachable
              ? (isOwned ? ownerTheme.stroke : path.fill)
              : isOwned ? ownerTheme.stroke : path.stroke;

            return (
              <path
                key={path.index}
                d={path.d}
                role={district ? 'button' : 'presentation'}
                tabIndex={district && isReachable ? 0 : -1}
                aria-label={district?.name}
                onClick={() => {
                  if (district && isReachable) movePlayer(district.id);
                }}
                onKeyDown={(event) => {
                  if (district && isReachable && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    movePlayer(district.id);
                  }
                }}
                className={`outline-none focus:outline-none transition-colors duration-200 ${
                  district && isReachable ? 'cursor-pointer' : 'pointer-events-none'
                } ${district && isReachable ? 'map-reachable-path' : ''}`}
                fill={
                  fill
                }
                fillOpacity={isOwned ? 0.76 : 1}
                stroke={stroke}
                strokeDasharray={district && isReachable && isOwned ? '14 8' : undefined}
                strokeLinecap={district && isReachable ? 'round' : undefined}
                strokeLinejoin="round"
                strokeWidth={district && isReachable ? 6 : isOwned ? 6 : isHighlighted ? 5 : path.strokeWidth}
                pointerEvents={district && isReachable ? 'auto' : 'none'}
              >
                {district && <title>{district.name}</title>}
              </path>
            );
          })}

          <g
            className="map-decoration-layer"
            pointerEvents="none"
            dangerouslySetInnerHTML={{ __html: svgMap.decorationMarkup }}
          />

          {!svgMap.hasSvgLabels && districtsData.map((district) => (
            <text
              key={`${district.id}-label`}
              x={getMapPoint(district, svgMap).x}
              y={getMapPoint(district, svgMap).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="'Baloo 2', ui-rounded, system-ui, sans-serif"
              fontSize={district.labelSize || getLabelFontSize(district.name)}
              fontWeight="800"
              letterSpacing="0"
              textLength={district.labelWidth}
              lengthAdjust={district.labelWidth ? 'spacingAndGlyphs' : undefined}
              fill="#3B2417"
              stroke="#FFF4D7"
              strokeWidth="7"
              paintOrder="stroke"
              style={{ filter: 'drop-shadow(0 3px 0 rgba(40, 29, 20, 0.28))' }}
              pointerEvents="none"
            >
              {district.name.toLocaleUpperCase('tr-TR')}
            </text>
          ))}

          {districtsData.map((district) => {
            const occupiedPlayers = playersByDistrict[district.id] || [];
            const districtStatus = mapState[district.id];
            const isReachable = possibleMoves.includes(district.id);
            const moveDetail = possibleMoveDetails[district.id];
            const mapPoint = getMapPoint(district, svgMap);
            const isClosed = districtStatus?.type === 'blocked' || Boolean(districtStatus?.ownerId) || districtStatus?.remainingTurns > 0;

            if (occupiedPlayers.length === 0 && !isClosed && !isReachable) return null;

            return (
              <g
                key={district.id}
                transform={`translate(${mapPoint.x} ${mapPoint.y})`}
              >
                {isClosed && (
                  <g className="map-closed-marker" transform="translate(28 -30)" pointerEvents="none">
                    <circle r="17" fill={STATUS_DARK} stroke="#FFF7E8" strokeWidth="4" />
                    <Hourglass x="-10" y="-10" size={20} stroke="#FFF7E8" strokeWidth="3" />
                    {districtStatus?.remainingTurns > 0 && (
                      <>
                        <circle cx="12" cy="-12" r="9" fill="#FFF7E8" stroke={STATUS_DARK} strokeWidth="2" />
                        <text
                          x="12"
                          y="-8"
                          textAnchor="middle"
                          fontFamily="'Baloo 2', ui-rounded, system-ui, sans-serif"
                          fontSize="11"
                          fontWeight="900"
                          fill={STATUS_DARK}
                        >
                          {districtStatus.remainingTurns}
                        </text>
                      </>
                    )}
                  </g>
                )}
                {occupiedPlayers.map((player, index) => (
                  <g key={player.id} transform={`translate(${index * 18 - (occupiedPlayers.length - 1) * 9} 0)`}>
                    <circle r="13" fill={getCharacterTheme(player.character).fill} stroke="white" strokeWidth="4" />
                    <text y="5" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">
                      {player.character.substring(0, 1)}
                    </text>
                  </g>
                ))}
                {isReachable && moveDetail?.ferryRequired && (
                  <g transform="translate(0 -74)" pointerEvents="none">
                    <rect x="-37" y="-10" width="74" height="20" rx="10" fill="#fff8e8" stroke="#2A9D8F" strokeWidth="2" />
                    <text
                      y="4"
                      textAnchor="middle"
                      fontFamily="'Baloo 2', ui-rounded, system-ui, sans-serif"
                      fontSize="10"
                      fontWeight="900"
                      fill="#2A9D8F"
                    >
                      VAPUR 1Y
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </Motion.div>
    </div>
  );
}
