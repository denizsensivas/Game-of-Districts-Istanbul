import { useEffect, useMemo, useRef, useState } from 'react';
import { Hourglass, Minus, Plus } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { districtsData } from './mapData';
import { getCharacterTheme } from '../../utils/characterColors';
import { getCharacterMeta } from '../../utils/characters';

const STATUS_DARK = '#111827';
const BIG_MAP_LANDMARK_EDITS_KEY = 'bigMapLandmarkEdits:buyuk_idli:v2';

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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPathNodeBounds(pathNode, viewBoxParts) {
  if (typeof document === 'undefined') return null;

  const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  tempSvg.setAttribute(
    'viewBox',
    `${viewBoxParts.minX} ${viewBoxParts.minY} ${viewBoxParts.width} ${viewBoxParts.height}`
  );
  tempSvg.setAttribute('width', '0');
  tempSvg.setAttribute('height', '0');
  tempSvg.style.position = 'absolute';
  tempSvg.style.visibility = 'hidden';
  tempSvg.style.pointerEvents = 'none';

  const clone = pathNode.cloneNode(false);
  tempSvg.appendChild(clone);
  document.body.appendChild(tempSvg);

  try {
    const box = clone.getBBox();
    if (!Number.isFinite(box.x) || box.width <= 0 || box.height <= 0) return null;
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      centerX: box.x + (box.width / 2),
      centerY: box.y + (box.height / 2),
    };
  } catch {
    return null;
  } finally {
    tempSvg.remove();
  }
}

function getLabelMetrics(district, path, svgMap) {
  const bounds = path?.bounds;
  const fallbackPoint = getMapPoint(district, svgMap);
  const isBigMap = svgMap.mapType === 'buyuk.svg';
  const point = district.labelPoints?.[svgMap.mapType] || (isBigMap
    ? fallbackPoint
    : bounds ? { x: bounds.centerX, y: bounds.centerY } : fallbackPoint);
  const name = district.name.toLocaleUpperCase('tr-TR');
  const baseFontSize = district.labelSizeByMap?.[svgMap.mapType] || district.labelSize || getLabelFontSize(district.name);
  const labelWidth = district.labelWidthByMap?.[svgMap.mapType] || district.labelWidth;

  if (!bounds) {
    return {
      ...point,
      fontSize: baseFontSize,
      textLength: labelWidth,
      name,
    };
  }

  const widthRatio = isBigMap ? 0.86 : 0.72;
  const heightRatio = isBigMap ? 0.46 : 0.3;
  const minWidth = isBigMap ? 58 : 42;
  const maxWidth = clamp(bounds.width * widthRatio, minWidth, labelWidth || bounds.width * widthRatio);
  const widthFitFontSize = maxWidth / Math.max(name.length * 0.54, 1);
  const heightFitFontSize = bounds.height * heightRatio;
  const fontSize = clamp(Math.min(baseFontSize, widthFitFontSize, heightFitFontSize), 9, baseFontSize);

  return {
    ...point,
    fontSize: Number(fontSize.toFixed(1)),
    textLength: Number(maxWidth.toFixed(1)),
    name,
  };
}

function getMapPoint(item, svgMap) {
  const mapPoint = item.mapPoints?.[svgMap.mapType];
  if (mapPoint) return mapPoint;

  return {
    x: svgMap.minX + (item.x / 100) * svgMap.width,
    y: svgMap.minY + (item.y / 100) * svgMap.height,
  };
}

function getPlayerMarkerPoint(district, path, svgMap) {
  const markerPoint = district.markerPoints?.[svgMap.mapType];
  if (markerPoint) return markerPoint;

  const labelPoint = getLabelMetrics(district, path, svgMap);
  if (!path?.bounds) return labelPoint;

  const { bounds } = path;
  const markerRadius = 17;
  const isBigMap = svgMap.mapType === 'buyuk.svg';
  const xOffset = isBigMap
    ? Math.min(Math.max(bounds.width * 0.22, 22), 42)
    : Math.min(Math.max(bounds.width * 0.2, 18), 30);
  const yOffset = isBigMap
    ? Math.min(Math.max(bounds.height * 0.2, 18), 34)
    : -Math.min(Math.max(bounds.height * 0.22, 16), 28);

  return {
    x: clamp(labelPoint.x + xOffset, bounds.x + markerRadius, bounds.x + bounds.width - markerRadius),
    y: clamp(labelPoint.y + yOffset, bounds.y + markerRadius, bounds.y + bounds.height - markerRadius),
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

const bigMapLandmarkPointOverrides = {
  ortakoy: { x: 807, y: 501 },
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

function getMapAssetName(mapType) {
  return mapType === 'buyuk.svg' ? 'buyuk_idli.svg' : mapType;
}

function getDefaultZoom(mapType) {
  return mapType === 'buyuk.svg' ? 1 : 1.5;
}

function getDefaultPan(mapType) {
  return mapType === 'buyuk.svg' ? { x: 0, y: 0 } : { x: -100, y: -100 };
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

function projectBigMapLandmarks(svgNode) {
  svgNode.querySelectorAll('image').forEach((imageNode) => {
    const smallMapPoint = smallMapLandmarkPoints[imageNode.id];
    const transform = imageNode.getAttribute('transform');
    if (smallMapPoint && transform?.includes('translate(')) {
      imageNode.setAttribute('transform', replaceTranslate(transform, projectSmallMapPointToBigMap(smallMapPoint)));
    }
  });
}

function getLandmarksMarkup(svgText, mapType, serializer) {
  const normalizedSvgText = svgText.replaceAll(/xlink:href="([^"]+)"/g, 'xlink:href="/$1" href="/$1"');
  const parser = new window.DOMParser();
  const documentNode = parser.parseFromString(normalizedSvgText, 'image/svg+xml');
  const landmarksNode = documentNode.querySelector('#landmarks');

  if (!landmarksNode) return '';
  if (mapType === 'buyuk.svg') projectBigMapLandmarks(landmarksNode);

  return serializer.serializeToString(landmarksNode);
}

function parseLandmarkItems(svgText, mapType) {
  if (!svgText || mapType !== 'buyuk.svg') return [];

  const normalizedSvgText = svgText.replaceAll(/xlink:href="([^"]+)"/g, 'xlink:href="/$1" href="/$1"');
  const parser = new window.DOMParser();
  const documentNode = parser.parseFromString(normalizedSvgText, 'image/svg+xml');
  const landmarksNode = documentNode.querySelector('#landmarks');
  if (!landmarksNode) return [];

  return Array.from(landmarksNode.querySelectorAll('image')).map((imageNode) => {
    const id = imageNode.id;
    const href = imageNode.getAttribute('href') || imageNode.getAttribute('xlink:href') || '';

    const transform = imageNode.getAttribute('transform') || '';
    const correctedTransform = bigMapLandmarkPointOverrides[id] && transform.includes('translate(')
      ? replaceTranslate(transform, bigMapLandmarkPointOverrides[id])
      : transform;

    return {
      id,
      href,
      width: imageNode.getAttribute('width') || '1254',
      height: imageNode.getAttribute('height') || '1254',
      transform: correctedTransform,
    };
  });
}

function parseMapSvg(svgText, mapType, landmarkSvgText = '') {
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
  let pathBoundsByIndex = [];

  if (typeof window !== 'undefined' && window.DOMParser && window.XMLSerializer) {
    const parser = new window.DOMParser();
    const documentNode = parser.parseFromString(normalizedSvgText, 'image/svg+xml');
    const svgNode = documentNode.querySelector('svg');

    if (svgNode) {
      pathBoundsByIndex = Array.from(svgNode.querySelectorAll('path')).map((pathNode) => (
        getPathNodeBounds(pathNode, viewBoxParts)
      ));
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
        svgNode.querySelectorAll('text').forEach((textNode) => {
          const labelGroup = textNode.closest('g[id$="_x5F_label"]');
          if (labelGroup) labelGroup.remove();
          else textNode.remove();
        });
      }
      if (mapType === 'buyuk.svg') projectBigMapLandmarks(svgNode);
      hasSvgLabels = Boolean(svgNode.querySelector('text'));

      const serializer = new window.XMLSerializer();
      const landmarksNode = svgNode.querySelector('#landmarks');
      const landmarksMarkup = mapType === 'buyuk.svg' ? '' : landmarksNode
        ? serializer.serializeToString(landmarksNode)
        : landmarkSvgText ? getLandmarksMarkup(landmarkSvgText, mapType, serializer) : '';
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
      .map((match, index) => {
        const id = getSvgAttribute(match[0], 'id');
        return {
          index,
          id,
          d: getSvgAttribute(match[0], 'd'),
          fill: getPathFill(match[0], styleFills),
          stroke: getSvgAttribute(match[0], 'stroke') || 'white',
          strokeWidth: Number(getSvgAttribute(match[0], 'stroke-width')) || 1,
          district: districtBySvgId.get(normalizeSvgId(id)) || districtByPathIndex.get(index) || null,
          bounds: pathBoundsByIndex[index] || null,
        };
      })
      .filter((path) => isPathInViewBox(path.d, viewBoxParts))
      .filter((path) => path.d),
    backgroundFill,
    decorationMarkup,
    hasSvgLabels,
    landmarks: parseLandmarkItems(landmarkSvgText, mapType),
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
    landmarks: [],
  });
  const [landmarkEdits, setLandmarkEdits] = useState(() => {
    if (typeof window === 'undefined') return {};

    try {
      return JSON.parse(window.localStorage.getItem(BIG_MAP_LANDMARK_EDITS_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [zoomByMapType, setZoomByMapType] = useState({});
  const [panByMapType, setPanByMapType] = useState({});
  const constraintsRef = useRef(null);
  const mapLayerRef = useRef(null);
  const svgRef = useRef(null);
  const activeLandmarkRef = useRef(null);
  const dragPanRef = useRef(null);
  const suppressMapClickRef = useRef(false);
  const lastMoveSyncRef = useRef(null);

  const {
    possibleMoves,
    possibleMoveDetails,
    movePlayer,
    players,
    mapState,
    mapType,
    diceValue,
    currentTurnUserId,
    getActiveUserId,
    room,
    syncGameState,
  } = useGameStore();
  const zoom = zoomByMapType[mapType] || getDefaultZoom(mapType);
  const pan = panByMapType[mapType] || getDefaultPan(mapType);
  const landmarkEditorActive =
    mapType === 'buyuk.svg' &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('landmarkEditor') === '1';

  useEffect(() => {
    let isMounted = true;

    fetch(`/${getMapAssetName(mapType)}`)
      .then((response) => response.text())
      .then((svgText) => {
        if (isMounted) setSvgMap(parseMapSvg(svgText, mapType, svgText));
      });

    return () => {
      isMounted = false;
    };
  }, [mapType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BIG_MAP_LANDMARK_EDITS_KEY, JSON.stringify(landmarkEdits));
  }, [landmarkEdits]);

  useEffect(() => {
    const activeUserId = getActiveUserId();
    const syncKey = `${room?.id || ''}:${currentTurnUserId || ''}:${diceValue || ''}`;
    if (
      room?.id &&
      diceValue &&
      activeUserId === currentTurnUserId &&
      possibleMoves.length === 0 &&
      lastMoveSyncRef.current !== syncKey
    ) {
      lastMoveSyncRef.current = syncKey;
      syncGameState();
    }
  }, [currentTurnUserId, diceValue, getActiveUserId, possibleMoves.length, room?.id, syncGameState]);

  const playersByDistrict = useMemo(() => {
    return players.reduce((acc, player) => {
      if (!acc[player.position]) acc[player.position] = [];
      acc[player.position].push(player);
      return acc;
    }, {});
  }, [players]);
  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const pathsByDistrictId = useMemo(() => {
    return new Map(svgMap.paths.filter((path) => path.district).map((path) => [path.district.id, path]));
  }, [svgMap.paths]);

  const updateZoom = (nextZoom, anchorPoint = null) => {
    const nextClampedZoom = Math.min(2.8, Math.max(0.8, Number(nextZoom.toFixed(2))));

    setZoomByMapType((current) => ({
      ...current,
      [mapType]: nextClampedZoom,
    }));

    if (!anchorPoint || nextClampedZoom === zoom || !constraintsRef.current || !mapLayerRef.current) return;

    const containerRect = constraintsRef.current.getBoundingClientRect();
    const layerNode = mapLayerRef.current;
    const layerCenter = {
      x: layerNode.offsetLeft + (layerNode.offsetWidth / 2),
      y: layerNode.offsetTop + (layerNode.offsetHeight / 2),
    };
    const pointer = {
      x: anchorPoint.clientX - containerRect.left,
      y: anchorPoint.clientY - containerRect.top,
    };
    const zoomRatio = nextClampedZoom / zoom;

    setPanByMapType((current) => {
      const currentPan = current[mapType] || pan;
      return {
        ...current,
        [mapType]: {
          x: pointer.x - layerCenter.x - (zoomRatio * (pointer.x - layerCenter.x - currentPan.x)),
          y: pointer.y - layerCenter.y - (zoomRatio * (pointer.y - layerCenter.y - currentPan.y)),
        },
      };
    });
  };

  const updatePan = (nextPan) => {
    setPanByMapType((current) => ({
      ...current,
      [mapType]: nextPan,
    }));
  };

  const applyMapTransform = (nextPan, nextZoom = zoom) => {
    if (!mapLayerRef.current) return;
    mapLayerRef.current.style.transform = `translate3d(${nextPan.x}px, ${nextPan.y}px, 0) scale(${nextZoom})`;
  };

  const finishMapDrag = (event) => {
    const dragState = dragPanRef.current;
    if (!dragState) return;

    dragPanRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = '';

    if (dragState.didDrag) {
      updatePan(dragState.lastPan);
      window.setTimeout(() => {
        suppressMapClickRef.current = false;
      }, 0);
    }
  };

  const handleMapPointerDown = (event) => {
    if (landmarkEditorActive || event.button !== 0) return;

    dragPanRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPan: pan,
      lastPan: pan,
      didDrag: false,
    };
  };

  const handleMapPointerMove = (event) => {
    const dragState = dragPanRef.current;
    if (!dragState) return;

    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    if (!dragState.didDrag && Math.hypot(dx, dy) < 4) return;

    if (!dragState.didDrag) {
      event.currentTarget.setPointerCapture?.(dragState.pointerId);
      event.currentTarget.style.cursor = 'grabbing';
    }
    dragState.didDrag = true;
    suppressMapClickRef.current = true;
    dragState.lastPan = {
      x: dragState.startPan.x + dx,
      y: dragState.startPan.y + dy,
    };
    applyMapTransform(dragState.lastPan);
    event.preventDefault();
  };

  const handleMapPointerCancel = (event) => {
    const dragState = dragPanRef.current;
    dragPanRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = '';

    if (dragState) applyMapTransform(pan);
    suppressMapClickRef.current = false;
  };

  const exportLandmarkEdits = () => {
    const exportText = JSON.stringify(landmarkEdits, null, 2);
    window.navigator.clipboard?.writeText(exportText);
    console.log('bigMapLandmarkEdits', exportText);
  };

  const getSvgEventPoint = (event) => {
    const svgNode = svgRef.current;
    if (!svgNode) return null;

    const point = svgNode.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svgNode.getScreenCTM().inverse());
  };

  const moveActiveLandmark = (event) => {
    const landmarkId = activeLandmarkRef.current;
    if (!landmarkId || !svgRef.current) return;

    const point = getSvgEventPoint(event);
    if (!point) return;

    const nextPoint = {
      x: Number(point.x.toFixed(2)),
      y: Number(point.y.toFixed(2)),
    };
    const imageNode = svgRef.current.querySelector(`.big-map-landmark-image[id="${landmarkId}"]`);
    if (imageNode) {
      const baseTransform = imageNode.dataset.baseTransform || imageNode.getAttribute('transform') || '';
      imageNode.dataset.baseTransform = baseTransform;
      imageNode.setAttribute('transform', replaceTranslate(baseTransform, nextPoint));
    }

    setLandmarkEdits((current) => ({
      ...current,
      [landmarkId]: nextPoint,
    }));
  };

  const handleLandmarkPointerDown = (event) => {
    if (!landmarkEditorActive) return;

    activeLandmarkRef.current = event.currentTarget.id;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
    moveActiveLandmark(event);
  };

  const handleLandmarkPointerUp = () => {
    activeLandmarkRef.current = null;
  };

  return (
    <div
      className="game-map w-full h-full relative bg-[#dbf2fe] overflow-hidden select-none"
      ref={constraintsRef}
      onWheel={(event) => {
        event.preventDefault();
        updateZoom(zoom + (event.deltaY > 0 ? -0.12 : 0.12), {
          clientX: event.clientX,
          clientY: event.clientY,
        });
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

      {landmarkEditorActive && (
        <div className="absolute bottom-28 right-4 z-30 flex gap-2 bg-white/90 p-2 rounded-xl shadow pointer-events-auto">
          <button
            onClick={exportLandmarkEdits}
            className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-black game-btn"
          >
            Kopyala
          </button>
          <button
            onClick={() => setLandmarkEdits({})}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 text-xs font-black game-btn"
          >
            Sıfırla
          </button>
        </div>
      )}

      <div
        ref={mapLayerRef}
        key={mapType}
        onPointerDown={handleMapPointerDown}
        onPointerMove={handleMapPointerMove}
        onPointerUp={finishMapDrag}
        onPointerCancel={handleMapPointerCancel}
        tabIndex={-1}
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          touchAction: 'none',
        }}
        className={`absolute origin-center cursor-grab flex items-center justify-center pointer-events-auto outline-none will-change-transform ${
          mapType === 'buyuk.svg' ? 'w-full h-full' : 'w-[150%] h-[150%]'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={svgMap.viewBox}
          className="w-full h-full outline-none"
          role="img"
          aria-label="İstanbul oyun haritası"
          onPointerMove={landmarkEditorActive ? moveActiveLandmark : undefined}
          onPointerUp={landmarkEditorActive ? handleLandmarkPointerUp : undefined}
          onPointerCancel={landmarkEditorActive ? handleLandmarkPointerUp : undefined}
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
                onClick={(event) => {
                  if (suppressMapClickRef.current) {
                    event.preventDefault();
                    return;
                  }
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

          {svgMap.landmarks.map((landmark) => {
            const editedPoint = landmarkEdits[landmark.id];
            const transform = editedPoint ? replaceTranslate(landmark.transform, editedPoint) : landmark.transform;

            return (
              <image
                key={landmark.id}
                id={landmark.id}
                className="big-map-landmark-image"
                href={landmark.href}
                xlinkHref={landmark.href}
                width={landmark.width}
                height={landmark.height}
                transform={transform}
                data-base-transform={landmark.transform}
                pointerEvents={landmarkEditorActive ? 'auto' : 'none'}
                style={landmarkEditorActive ? { cursor: 'move' } : undefined}
                onPointerDown={handleLandmarkPointerDown}
              />
            );
          })}

          {!svgMap.hasSvgLabels && districtsData.map((district) => {
            const labelMetrics = getLabelMetrics(district, pathsByDistrictId.get(district.id), svgMap);

            return (
              <text
                key={`${district.id}-label`}
                x={labelMetrics.x}
                y={labelMetrics.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Baloo 2', ui-rounded, system-ui, sans-serif"
                fontSize={labelMetrics.fontSize}
                fontWeight="800"
                letterSpacing="0"
                textLength={labelMetrics.textLength}
                lengthAdjust={labelMetrics.textLength ? 'spacingAndGlyphs' : undefined}
                fill="#3B2417"
                stroke="#FFF4D7"
                strokeWidth={svgMap.mapType === 'buyuk.svg' ? '4' : '7'}
                paintOrder="stroke"
                style={{ filter: 'drop-shadow(0 3px 0 rgba(40, 29, 20, 0.28))' }}
                pointerEvents="none"
              >
                {labelMetrics.name}
              </text>
            );
          })}

          {districtsData.map((district) => {
            const occupiedPlayers = playersByDistrict[district.id] || [];
            const districtStatus = mapState[district.id];
            const isReachable = possibleMoves.includes(district.id);
            const moveDetail = possibleMoveDetails[district.id];
            const districtPath = pathsByDistrictId.get(district.id);
            const mapPoint = getMapPoint(district, svgMap);
            const playerMarkerPoint = getPlayerMarkerPoint(district, districtPath, svgMap);
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
                  <g
                    key={player.id}
                    transform={`translate(${playerMarkerPoint.x - mapPoint.x + index * 18 - (occupiedPlayers.length - 1) * 9} ${playerMarkerPoint.y - mapPoint.y})`}
                  >
                    <circle r="13" fill={getCharacterTheme(player.character).fill} stroke="white" strokeWidth="4" />
                    <clipPath id={`player-avatar-clip-${player.id}`}>
                      <circle r="12" />
                    </clipPath>
                    <image
                      href={getCharacterMeta(player.character).icon}
                      x="-22"
                      y="-22"
                      width="44"
                      height="44"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath={`url(#player-avatar-clip-${player.id})`}
                      pointerEvents="none"
                    />
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
      </div>
    </div>
  );
}
