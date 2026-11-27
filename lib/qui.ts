// Labels for question cards, in the language of the question pane (a Hindi question reads fully in Hindi).
// Shared by the server-rendered card and the client panes, so no label strings travel in page payloads.
const UI = {
  en: { view: 'View answer & solution', full: 'Answer & step-by-step solution', ans: 'Correct answer', quick: 'Quick explanation', formula: 'Key formula', tip: 'Exam tip', more: 'Full step-by-step solution', diagram: ' with diagram', detailIn: 'Detailed solution (in the paper’s original language)', steps: 'Step-by-step solution', diagramAlt: 'Solution diagram', retry: 'Could not load the solution. Check your connection, then close and open this panel again.' },
  hi: { view: 'उत्तर और हल देखें', full: 'उत्तर और चरणबद्ध हल', ans: 'सही उत्तर', quick: 'संक्षिप्त व्याख्या', formula: 'मुख्य सूत्र', tip: 'परीक्षा टिप', more: 'पूरा चरणबद्ध हल', diagram: ' चित्र सहित', detailIn: 'विस्तृत हल (मूल भाषा में)', steps: 'चरणबद्ध हल', diagramAlt: 'हल का चित्र', retry: 'हल लोड नहीं हो सका। इंटरनेट जाँचें, फिर इसे बंद करके दोबारा खोलें।' },
  gu: { view: 'જવાબ અને ઉકેલ જુઓ', full: 'જવાબ અને પગલાવાર ઉકેલ', ans: 'સાચો જવાબ', quick: 'ટૂંકી સમજૂતી', formula: 'મુખ્ય સૂત્ર', tip: 'પરીક્ષા ટિપ', more: 'સંપૂર્ણ પગલાવાર ઉકેલ', diagram: ' આકૃતિ સાથે', detailIn: 'વિગતવાર ઉકેલ (મૂળ ભાષામાં)', steps: 'પગલાવાર ઉકેલ', diagramAlt: 'ઉકેલની આકૃતિ', retry: 'ઉકેલ લોડ ન થયો. ઇન્ટરનેટ તપાસો, પછી આ બંધ કરીને ફરી ખોલો.' },
} as const;
export type QUIText = { [K in keyof (typeof UI)['en']]: string };
export const qui = (l: string): QUIText => (UI as unknown as Record<string, QUIText>)[l] ?? UI.en;
