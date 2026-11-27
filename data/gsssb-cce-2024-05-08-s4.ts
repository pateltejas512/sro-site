import type { Question, QuestionText } from '@/lib/types';

// Source: SRO paper-scanner output for "08-05-2024 (CCE - Shift 4).pdf" (Gujarati original).
// Questions with figures (Q1, Q6–Q9) wait for their images; text questions are published.
// Answers solved and cross-checked by the editorial desk; official-key match pending.

const base = {
  examSlug: 'gsssb-cce',
  paperSlug: '2024-05-08-shift-4',
  subject: 'Reasoning',
  chapter: 'Logical Reasoning',
  primaryLang: 'gu' as const,
  verifiedBy: 'SRO Reasoning desk (official key match pending)',
  section: 'Reasoning',
};

const cceBase: Question[] = [
  {
    ...base,
    id: 'SRO-CCE-2024-05-08-S4-Q002',
    slug: 'gsssb-cce-2024-number-series-79-82-87-94-103',
    qNo: 2,
    topic: 'Number Series',
    difficulty: 'Easy',
    answer: 'C',
    text: {
      gu: {
        stem: 'નીચેના પ્રશ્નમાં, આપેલી શ્રેણીમાંથી ખૂટતી સંખ્યા પસંદ કરો.\n79, 82, 87, 94, 103, ?',
        options: ['113', '117', '114', '119'],
        quick: 'ક્રમિક તફાવત 3, 5, 7, 9 છે, એટલે આગળનો તફાવત 11 આવશે. 103 + 11 = 114.',
        formula: ['82 − 79 = 3, 87 − 82 = 5, 94 − 87 = 7, 103 − 94 = 9', 'આગળનો તફાવત = 11 → 103 + 11 = 114'],
        tip: 'તફાવત એકી સંખ્યાઓ (3, 5, 7…) માં વધે ત્યારે આગળની એકી સંખ્યા ઉમેરો.',
      },
      en: {
        stem: 'In the following question, select the missing number from the given series.\n79, 82, 87, 94, 103, ?',
        options: ['113', '117', '114', '119'],
        quick: 'The differences are 3, 5, 7, 9 — consecutive odd numbers — so the next difference is 11. 103 + 11 = 114.',
        formula: ['82 − 79 = 3, 87 − 82 = 5, 94 − 87 = 7, 103 − 94 = 9', 'Next difference = 11 → 103 + 11 = 114'],
        tip: 'When differences grow by consecutive odd numbers, add the next odd number.',
      },
    },
  },
  {
    ...base,
    id: 'SRO-CCE-2024-05-08-S4-Q003',
    slug: 'gsssb-cce-2024-blood-relation-a-mother-of-b-relation-to-e',
    qNo: 3,
    topic: 'Blood Relations',
    difficulty: 'Moderate',
    answer: 'B',
    text: {
      gu: {
        stem: 'A એ B ની માતા છે. B એ C નો ભાઈ છે. C એ D ની બહેન છે. D એ E નો પતિ છે. A નો E સાથે શું સંબંધ છે?',
        options: ['પત્નીના પિતા (સસરા)', 'પતિની માતા (સાસુ)', 'પતિના ભાઇ (દીયર, જેઠ)', 'પત્નીના બહેન (સાળી)'],
        quick: 'B, C અને D ભાઈ-બહેન છે, એટલે A એ D ની પણ માતા છે. D એ E નો પતિ છે, તેથી A એ E ના પતિની માતા એટલે કે સાસુ છે.',
        tip: 'સંબંધ પ્રશ્નમાં પહેલાં એક જ પેઢીના સભ્યો (ભાઈ-બહેન) ને જોડો, પછી લગ્ન સંબંધ ઉમેરો.',
      },
      en: {
        stem: 'A is the mother of B. B is the brother of C. C is the sister of D. D is the husband of E. How is A related to E?',
        options: ["Wife's father (father-in-law)", "Husband's mother (mother-in-law)", "Husband's brother (brother-in-law)", "Wife's sister (sister-in-law)"],
        quick: 'B, C and D are siblings, so A is also the mother of D. D is E’s husband, so A is E’s husband’s mother — her mother-in-law.',
        tip: 'Link same-generation members (siblings) first, then add the marriage link.',
      },
    },
  },
  {
    ...base,
    id: 'SRO-CCE-2024-05-08-S4-Q004',
    slug: 'gsssb-cce-2024-blood-relation-grandfather-of-e',
    qNo: 4,
    topic: 'Blood Relations',
    difficulty: 'Easy',
    answer: 'D',
    text: {
      gu: {
        stem: 'A એ B ના પિતા છે. B એ C નો ભાઈ છે. C એ D ના પિતા છે. D એ E ની બહેન છે. તો E ના દાદા કોણ છે?',
        options: ['B', 'D', 'C', 'A'],
        quick: 'B અને C ભાઈઓ છે, એટલે A એ C ના પણ પિતા છે. C એ D ના પિતા છે અને D એ E ની બહેન છે, એટલે C એ E ના પણ પિતા છે. તેથી A એ E ના દાદા છે.',
      },
      en: {
        stem: 'A is the father of B. B is the brother of C. C is the father of D. D is the sister of E. Who is the grandfather of E?',
        options: ['B', 'D', 'C', 'A'],
        quick: 'B and C are brothers, so A is also C’s father. C is the father of D and of D’s sibling E. Therefore A is E’s grandfather.',
      },
    },
  },
  {
    ...base,
    id: 'SRO-CCE-2024-05-08-S4-Q005',
    slug: 'gsssb-cce-2024-number-series-105-98-91-84-77',
    qNo: 5,
    topic: 'Number Series',
    difficulty: 'Easy',
    answer: 'C',
    text: {
      gu: {
        stem: 'નીચેના પ્રશ્નમાં, આપેલ શ્રેણીમાંથી ખૂટતી સંખ્યા પસંદ કરો.\n105, 98, 91, 84, 77, ?',
        options: ['67', '68', '70', '64'],
        quick: 'દરેક પદ 7 ઘટે છે: 105 → 98 → 91 → 84 → 77 → 70.',
        formula: ['સામાન્ય તફાવત = −7', '77 − 7 = 70'],
      },
      en: {
        stem: 'In the following question, select the missing number from the given series.\n105, 98, 91, 84, 77, ?',
        options: ['67', '68', '70', '64'],
        quick: 'Each term falls by 7: 105 → 98 → 91 → 84 → 77 → 70.',
        formula: ['Common difference = −7', '77 − 7 = 70'],
      },
    },
  },
  {
    ...base,
    id: 'SRO-CCE-2024-05-08-S4-Q010',
    slug: 'gsssb-cce-2024-number-series-155-159-165-173-183',
    qNo: 10,
    topic: 'Number Series',
    difficulty: 'Easy',
    answer: 'A',
    text: {
      gu: {
        stem: 'નીચેના પ્રશ્નમાં, આપેલી શ્રેણીમાંથી ખૂટતી સંખ્યા પસંદ કરો.\n155, 159, 165, 173, 183, ?',
        options: ['195', '199', '197', '193'],
        quick: 'તફાવત 4, 6, 8, 10 છે, એટલે આગળનો તફાવત 12. 183 + 12 = 195.',
        formula: ['તફાવત: 4, 6, 8, 10, 12', '183 + 12 = 195'],
      },
      en: {
        stem: 'In the following question, select the missing number from the given series.\n155, 159, 165, 173, 183, ?',
        options: ['195', '199', '197', '193'],
        quick: 'The differences are 4, 6, 8, 10, so the next difference is 12. 183 + 12 = 195.',
        formula: ['Differences: 4, 6, 8, 10, 12', '183 + 12 = 195'],
      },
    },
  },
];

// Hindi versions (translated and checked by the editorial desk).
const hi: Record<string, QuestionText> = {
  'SRO-CCE-2024-05-08-S4-Q002': {
    stem: 'निम्नलिखित प्रश्न में, दी गई श्रृंखला से लुप्त संख्या चुनिए।\n79, 82, 87, 94, 103, ?',
    options: ['113', '117', '114', '119'],
    quick: 'क्रमागत अंतर 3, 5, 7, 9 हैं, इसलिए अगला अंतर 11 होगा। 103 + 11 = 114.',
    formula: ['82 − 79 = 3, 87 − 82 = 5, 94 − 87 = 7, 103 − 94 = 9', 'अगला अंतर = 11 → 103 + 11 = 114'],
    tip: 'जब अंतर क्रमागत विषम संख्याओं (3, 5, 7…) में बढ़े, तो अगली विषम संख्या जोड़ें।',
  },
  'SRO-CCE-2024-05-08-S4-Q003': {
    stem: 'A, B की माता है। B, C का भाई है। C, D की बहन है। D, E का पति है। A का E से क्या संबंध है?',
    options: ['पत्नी के पिता (ससुर)', 'पति की माता (सास)', 'पति का भाई (देवर/जेठ)', 'पत्नी की बहन (साली)'],
    quick: 'B, C और D भाई-बहन हैं, इसलिए A, D की भी माता है। D, E का पति है, अतः A, E के पति की माता यानी सास है।',
    tip: 'पहले एक ही पीढ़ी के सदस्यों (भाई-बहन) को जोड़ें, फिर विवाह संबंध जोड़ें।',
  },
  'SRO-CCE-2024-05-08-S4-Q004': {
    stem: 'A, B के पिता हैं। B, C का भाई है। C, D के पिता हैं। D, E की बहन है। तो E के दादा कौन हैं?',
    options: ['B', 'D', 'C', 'A'],
    quick: 'B और C भाई हैं, इसलिए A, C के भी पिता हैं। C, D के पिता हैं और D, E की बहन है, इसलिए C, E के भी पिता हैं। अतः A, E के दादा हैं।',
  },
  'SRO-CCE-2024-05-08-S4-Q005': {
    stem: 'निम्नलिखित प्रश्न में, दी गई श्रृंखला से लुप्त संख्या चुनिए।\n105, 98, 91, 84, 77, ?',
    options: ['67', '68', '70', '64'],
    quick: 'हर पद 7 घटता है: 105 → 98 → 91 → 84 → 77 → 70.',
    formula: ['सार्व अंतर = −7', '77 − 7 = 70'],
  },
  'SRO-CCE-2024-05-08-S4-Q010': {
    stem: 'निम्नलिखित प्रश्न में, दी गई श्रृंखला से लुप्त संख्या चुनिए।\n155, 159, 165, 173, 183, ?',
    options: ['195', '199', '197', '193'],
    quick: 'अंतर 4, 6, 8, 10 हैं, इसलिए अगला अंतर 12 होगा। 183 + 12 = 195.',
    formula: ['अंतर: 4, 6, 8, 10, 12', '183 + 12 = 195'],
  },
};

export const cceQuestions: Question[] = cceBase.map((q) => (hi[q.id] ? { ...q, text: { ...q.text, hi: hi[q.id] } } : q));
