import { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { districtsData } from './mapData';
import { getCharacterTheme } from '../../utils/characterColors';

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

function getLabelFontSize(name) {
  if (name.length >= 13) return 22;
  if (name.length >= 10) return 28;
  return 34;
}

function getMapPoint(item, svgMap) {
  return {
    x: svgMap.minX + (item.x / 100) * svgMap.width,
    y: svgMap.minY + (item.y / 100) * svgMap.height,
  };
}

function parseMapSvg(svgText, mapType) {
  const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] || '0 0 1094 577';
  const viewBoxParts = getViewBoxParts(viewBox);
  const backgroundFill = svgText.match(/<rect\b[^>]*\sid="marmaradenizi"[^>]*\sfill="([^"]+)"/)?.[1] || 'white';
  const pathTags = [...svgText.matchAll(/<path\b[^>]*>/g)];
  const districtBySvgId = new Map(districtsData.map((district) => [district.svgId || district.id, district]));
  const districtByPathIndex = new Map(
    districtsData
      .map((district) => [getDistrictPathIndex(district, mapType), district])
      .filter(([pathIndex]) => Number.isInteger(pathIndex))
  );

  return {
    viewBox,
    ...viewBoxParts,
    paths: pathTags
      .map((match, index) => ({
        index,
        id: getSvgAttribute(match[0], 'id'),
        d: getSvgAttribute(match[0], 'd'),
        fill: getSvgAttribute(match[0], 'fill') || '#D6D6D6',
        stroke: getSvgAttribute(match[0], 'stroke') || 'white',
        strokeWidth: Number(getSvgAttribute(match[0], 'stroke-width')) || 1,
        district: districtBySvgId.get(getSvgAttribute(match[0], 'id')) || districtByPathIndex.get(index) || null,
      }))
      .filter((path) => path.d),
    backgroundFill,
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
  });
  const [zoom, setZoom] = useState(1.5);
  const constraintsRef = useRef(null);

  const { possibleMoves, movePlayer, players, mapState, mapType } = useGameStore();

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
      className="game-map w-full h-full relative bg-[#A8DADC] overflow-hidden select-none"
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
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        initial={{ x: -100, y: -100 }}
        animate={{ scale: zoom }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        tabIndex={-1}
        className="w-[150%] h-[150%] absolute origin-center cursor-default flex items-center justify-center pointer-events-auto outline-none"
      >
        <svg
          viewBox={svgMap.viewBox}
          className="w-full h-full drop-shadow-2xl outline-none"
          role="img"
          aria-label="İstanbul oyun haritası"
        >
          <rect x={svgMap.minX} y={svgMap.minY} width={svgMap.width} height={svgMap.height} fill={svgMap.backgroundFill} />
          {svgMap.paths.map((path) => {
            const district = path.district;
            const districtStatus = district ? mapState[district.id] : null;
            const isReachable = district ? possibleMoves.includes(district.id) : false;
            const isOwned = Boolean(districtStatus?.ownerId);
            const ownerTheme = isOwned ? getCharacterTheme(playersById.get(districtStatus.ownerId)?.character) : null;
            const isHighlighted = Boolean(district && (isReachable || isOwned));

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
                }`}
                fill={
                  isOwned
                    ? ownerTheme.fill
                    : district && isReachable
                      ? '#FF5A5F'
                      : path.fill
                }
                fillOpacity={isOwned ? 0.76 : district && isReachable ? 0.72 : 1}
                stroke={district && isReachable ? '#D32F2F' : isOwned ? ownerTheme.stroke : path.stroke}
                strokeWidth={isHighlighted ? 5 : path.strokeWidth}
                pointerEvents={district && isReachable ? 'auto' : 'none'}
              >
                {district && <title>{district.name}</title>}
              </path>
            );
          })}

          {districtsData.map((district) => (
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
              {district.name}
            </text>
          ))}

          {districtsData.map((district) => {
            const occupiedPlayers = playersByDistrict[district.id] || [];
            const districtStatus = mapState[district.id];
            const isReachable = possibleMoves.includes(district.id);
            const ownerTheme = districtStatus?.ownerId ? getCharacterTheme(playersById.get(districtStatus.ownerId)?.character) : null;

            if (occupiedPlayers.length === 0 && !districtStatus?.remainingTurns && !isReachable) return null;

            return (
              <g
                key={district.id}
                transform={`translate(${getMapPoint(district, svgMap).x} ${getMapPoint(district, svgMap).y})`}
              >
                {districtStatus?.type === 'blocked' ? (
                  <>
                    <circle r="13" fill="#ef4444" opacity="0.92" />
                    <text y="4" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">
                      ⛔
                    </text>
                  </>
                ) : districtStatus?.remainingTurns > 0 ? (
                  <>
                    <circle r="13" fill="#111827" stroke={ownerTheme?.stroke || 'white'} strokeWidth="2" opacity="0.92" />
                    <text y="4" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">
                      {districtStatus.remainingTurns}
                    </text>
                  </>
                ) : null}
                {occupiedPlayers.map((player, index) => (
                  <g key={player.id} transform={`translate(${index * 15 - (occupiedPlayers.length - 1) * 7.5} -22)`}>
                    <circle r="11" fill={getCharacterTheme(player.character).fill} stroke="white" strokeWidth="3" />
                    <text y="4" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">
                      {player.character.substring(0, 1)}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </Motion.div>
    </div>
  );
}
