import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function IstanbulMap() {
  const [mapType, setMapType] = useState('bigMap.svg');
  const constraintsRef = useRef(null);
  
  // A configuration object to map SVG paths to districts later when paths get IDs.
  // This makes the map highly flexible as requested.
  const mapConfig = {
    districts: [
      { id: 'kadikoy', name: 'Kadıköy', color: 'var(--color-ticket-red)' },
      { id: 'besiktas', name: 'Beşiktaş', color: 'var(--color-ticket-blue)' }
      // Future mappings go here
    ]
  };

  return (
    <div className="w-full h-full relative bg-[#A8DADC] overflow-hidden" ref={constraintsRef}>
      
      {/* Map Switcher (For Debug / Development as requested) */}
      <div className="absolute top-28 right-4 z-20 flex flex-col gap-2 bg-white/80 p-2 rounded-xl shadow">
        <button 
          onClick={() => setMapType('bigMap.svg')}
          className={`px-3 py-1 text-xs font-bold rounded-lg ${mapType === 'bigMap.svg' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Büyük Harita
        </button>
        <button 
          onClick={() => setMapType('smallMap.svg')}
          className={`px-3 py-1 text-xs font-bold rounded-lg ${mapType === 'smallMap.svg' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Küçük Harita
        </button>
      </div>

      {/* Draggable Map Area */}
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        initial={{ scale: 1.5, x: -100, y: -100 }}
        className="w-[150%] h-[150%] absolute origin-center cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        <object 
          data={`/${mapType}`} 
          type="image/svg+xml"
          className="w-full h-full drop-shadow-2xl pointer-events-none"
        >
          İstanbul Haritası
        </object>
        
        {/* Placeholder Nodes for UI demonstration (Later replaced by actual SVG path highlights) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
}
