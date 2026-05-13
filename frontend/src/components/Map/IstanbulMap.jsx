import { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { districtsData } from './mapData';

function getDistrictPathIndex(district, mapType) {
  return district.mapPaths?.[mapType] ?? district.pathIndex;
}

function parseMapSvg(svgText, mapType) {
  const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
  const pathTags = [...svgText.matchAll(/<path\b[^>]*>/g)];
  const districtByPathIndex = new Map(
    districtsData
      .map((district) => [getDistrictPathIndex(district, mapType), district])
      .filter(([pathIndex]) => Number.isInteger(pathIndex))
  );

  return {
    viewBox: viewBoxMatch?.[1] || '0 0 1094 577',
    paths: pathTags
      .map((match, index) => ({
        index,
        d: match[0].match(/\sd="([^"]+)"/)?.[1] || '',
        district: districtByPathIndex.get(index) || null,
      }))
      .filter((path) => path.d),
  };
}

export default function IstanbulMap() {
  const [svgMap, setSvgMap] = useState({ viewBox: '0 0 1094 577', paths: [] });
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
          {mapType === 'smallMap.svg' ? 'Küçük Harita' : 'Büyük Harita'}
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
          <rect width="1094" height="577" fill="white" />
          {svgMap.paths.map((path) => {
            const district = path.district;
            const districtStatus = district ? mapState[district.id] : null;
            const isReachable = district ? possibleMoves.includes(district.id) : false;
            const isOwned = Boolean(districtStatus?.ownerId);

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
                  district && isReachable ? 'cursor-pointer' : district ? 'cursor-default' : 'pointer-events-none'
                }`}
                fill={
                  district && isReachable
                    ? '#FF5A5F'
                    : isOwned
                      ? '#7C3AED'
                      : district
                        ? '#D6D6D6'
                        : '#D6D6D6'
                }
                fillOpacity={district && isReachable ? 0.92 : isOwned ? 0.78 : 0.82}
                stroke={district && isReachable ? '#D32F2F' : district ? '#FFFFFF' : '#A7A7A7'}
                strokeWidth={district && isReachable ? 4 : 1.4}
              >
                {district && <title>{district.name}</title>}
              </path>
            );
          })}

          {districtsData.map((district) => {
            const occupiedPlayers = playersByDistrict[district.id] || [];
            const districtStatus = mapState[district.id];
            const isReachable = possibleMoves.includes(district.id);

            if (occupiedPlayers.length === 0 && !districtStatus?.remainingTurns && !isReachable) return null;

            return (
              <g key={district.id} transform={`translate(${(district.x / 100) * 1094} ${(district.y / 100) * 577})`}>
                {districtStatus?.type === 'blocked' ? (
                  <>
                    <circle r="13" fill="#ef4444" opacity="0.92" />
                    <text y="4" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">
                      ⛔
                    </text>
                  </>
                ) : districtStatus?.remainingTurns > 0 ? (
                  <>
                    <circle r="13" fill="#111827" opacity="0.92" />
                    <text y="4" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">
                      {districtStatus.remainingTurns}
                    </text>
                  </>
                ) : null}
                {occupiedPlayers.map((player, index) => (
                  <g key={player.id} transform={`translate(${index * 15 - (occupiedPlayers.length - 1) * 7.5} -22)`}>
                    <circle r="11" fill="#2563EB" stroke="white" strokeWidth="3" />
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
