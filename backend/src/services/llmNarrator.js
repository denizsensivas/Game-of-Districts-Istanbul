const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 6000);
const MAX_EVENT_LENGTH = 90;
const TIMED_OUT = Symbol('timed_out');
const TICKET_ROLES = {
  red: 'Kırmızı bilet masa kapatma, mekan rezervasyonu, çay/ayakbastı ödemesi ekonomisidir.',
  blue: 'Mavi bilet zabıta, denetim, sabotaj ve rakip masasını dağıtma gücüdür.',
  green: 'Yeşil bilet kahve falı, taksi, vapur ve ulaşım/karşı yaka hareketidir.',
};

let genAiClientPromise = null;
let thinkingLevel = null;

function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

async function getGenAiClient() {
  if (!hasGeminiKey()) return null;
  if (!genAiClientPromise) {
    genAiClientPromise = import('@google/genai')
      .then(({ GoogleGenAI, ThinkingLevel }) => {
        thinkingLevel = ThinkingLevel;
        return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
      })
      .catch((err) => {
        genAiClientPromise = null;
        throw err;
      });
  }
  return genAiClientPromise;
}

function sanitizeEventText(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/["'`*_#>\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_EVENT_LENGTH)
    .trim();
}

function buildPrompt(context) {
  const payload = {
    eventType: context.eventType,
    staticEvent: context.staticEvent,
    player: context.player
      ? {
          character: context.player.character,
          position: context.player.position,
        }
      : null,
    targetDistrictId: context.targetDistrictId || null,
    ticketRates: context.ticketRates || null,
    ticketRoles: TICKET_ROLES,
    outcome: context.outcome || null,
    winner: context.winner || null,
  };

  const eventInstructions = {
    fortuneCoffee: [
      'Kahve falı formatında yaz.',
      'Şehirde olan komik bir sebep söyle ve kur sonucunu doğal dille bağla.',
      'Kur değişen biletin rolüne uygun sebep seç.',
      'Kırmızı değişirse masa kapatma, mekan hesabı, çay/ayakbastı veya esnaf hesabı teması kullan.',
      'Mavi değişirse zabıta, denetim, sabotaj, ceza veya masa dağıtma teması kullan.',
      'Yeşil değişirse kahve falı, taksi, vapur, lodos, köprü/karşı yaka veya ulaşım teması kullan.',
      'Örnek tonlar: Lodos çıktı, vapur seferleri iptal; Köprüde kaza oldu, yeşil bilet zamlandı; Zabıta denetimi arttı, mavi bilet değerlendi.',
      'Statik olay yükseldi diyorsa zamlandı/değerlendi; düştü diyorsa ucuzladı/değer kaybetti.',
    ],
    sabotageDistrict: [
      'Zabıta denetimi formatında yaz.',
      'Masayı dağıtma sonucunu esnaf denetimi, ceza veya mühürleme şakası gibi anlat.',
      'Örnek ton: Zabıta esnafı denetledi, masa mühürlendi.',
      'Sadece masanın dağıldığını anlat; gerçek bilet cezası uydurma.',
    ],
    useTaxi: [
      'Taksi olayı formatında yaz.',
      'outcome success ise taksici oyuncuyu hedefe götürmüş gibi yaz.',
      'outcome cancelled veya noRoute ise sadece şu fikri anlat: Değişim saati abla, o yöne gitmiyorum; bilet yandı.',
      'Taksi için üçüncü bir sonuç uydurma.',
    ],
    endGame: [
      'Final anonsu formatında yaz.',
      'Kazananı İstanbul temalı kısa bir kapanışla duyur.',
    ],
  }[context.eventType] || ['Kısa ve tematik bir olay anonsu yaz.'];

  return [
    'Game of Districts: Istanbul için aktif olay panosu metni yaz.',
    'Kurallar:',
    '- Sadece Türkçe yaz.',
    '- Tek satır, en fazla 90 karakter.',
    '- Markdown, tırnak, JSON, emoji ve açıklama kullanma.',
    '- İstanbul temalı, komik ama hızlı okunur bir kutu oyunu anonsu olsun.',
    '- Verilen statik olayın anlamını koru.',
    '- Olay verisindeki outcome dışında yeni mekanik sonuç uydurma.',
    ...eventInstructions.map((instruction) => `- ${instruction}`),
    '',
    `Olay verisi: ${JSON.stringify(payload)}`,
  ].join('\n');
}

function withTimeout(promise, timeoutMs) {
  let timeout;
  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(() => resolve(TIMED_OUT), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

async function narrateActiveEvent(context) {
  if (!hasGeminiKey()) return null;

  try {
    const ai = await getGenAiClient();
    if (!ai) return null;

    console.info(`Gemini narration requested: ${context.eventType}`);
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildPrompt(context),
        config: {
          maxOutputTokens: 40,
          temperature: 0.9,
          thinkingConfig: thinkingLevel ? { thinkingLevel: thinkingLevel.MINIMAL } : undefined,
        },
      }),
      GEMINI_TIMEOUT_MS
    );

    if (response === TIMED_OUT) {
      console.warn(`Gemini narration skipped: timed out after ${GEMINI_TIMEOUT_MS}ms`);
      return null;
    }

    const text = sanitizeEventText(response?.text);
    if (!text) return null;
    console.info(`Gemini narration returned: ${context.eventType}`);
    return text;
  } catch (err) {
    console.warn('Gemini narration skipped:', err.message);
    return null;
  }
}

module.exports = {
  narrateActiveEvent,
};
