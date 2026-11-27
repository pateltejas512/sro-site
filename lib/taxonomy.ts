// Subject → chapter tree for /mcq/ (the "Practice" section). Questions attach to a chapter through their
// `subject` + `chapter` fields (aliases map old chapter names). Chapters with no questions yet still show,
// marked "Coming soon", so students see the full syllabus map from day one.
import { slugify } from './slug';
import studio from '@/data/studio/export.json';

export interface Chapter { name: string; i3d: string; aliases?: string[]; topics?: string[]; slug?: string; hidden?: boolean }
export interface Subject { slug: string; name: string; short: string; i3d: string; tint: string; group: GroupId; blurb: string; chapters: Chapter[] }
export type GroupId = 'engineering' | 'general' | 'language';

export const GROUPS: { id: GroupId; name: string; blurb: string }[] = [
  { id: 'engineering', name: 'Engineering', blurb: 'JE, AE, SSC JE, RRB JE, state AE/JE and PSU papers' },
  { id: 'general', name: 'General Studies & Aptitude', blurb: 'SSC, Railway, Banking, Police, State exams' },
  { id: 'language', name: 'Languages', blurb: 'English, Hindi and Gujarati sections' },
];

export const SUBJECTS: Subject[] = [
  {
    slug: 'electrical-engineering', name: 'Electrical Engineering', short: 'Electrical', i3d: 'bolt', tint: 'tint-gold', group: 'engineering',
    blurb: 'Power systems, machines, control, measurements and more',
    chapters: [
      { name: 'Basic Electrical Engineering', i3d: 'battery', aliases: ['Basic Electrical', 'Electrical Fundamentals'], topics: ['Basic Concepts', 'DC Circuits', 'AC Fundamentals', 'Power & Power Factor', 'Magnetism & Magnetic Circuits', 'Electromagnetic Induction', 'Electrostatics & Capacitors', 'Batteries & Cells'] },
      { name: 'Network Theory', i3d: 'link', aliases: ['Circuit Theory', 'Electric Circuits', 'Network Theory & Basic Electrical'], topics: ["Kirchhoff's Laws", 'Network Analysis', 'Network Theorems', 'AC Circuits', 'Resonance', 'Three-Phase Circuits', 'Transient Analysis', 'Two-Port Networks'] },
      { name: 'Electrical Machines', i3d: 'gear', topics: ['Transformers', 'DC Machines', 'Induction Motors', 'Synchronous Machines', 'Single-Phase Motors', 'Electromechanical Energy Conversion', 'AC Machine Windings', 'Special Machines'] },
      { name: 'Power Systems', i3d: 'factory', aliases: ['Power Generation', 'Power Plant Engineering'], topics: ['Power Generation', 'Renewable Energy Sources', 'Load Curves & Tariffs', 'Transmission Lines', 'Cables & High Voltage Engineering', 'Distribution Systems', 'Substations', 'Per-Unit System', 'Fault Analysis', 'Load Flow', 'Power System Stability', 'Load Frequency Control', 'Reactive Power Compensation', 'HVDC Transmission', 'FACTS', 'Power Quality'] },
      { name: 'Switchgear & Protection', i3d: 'shield', aliases: ['Power System Protection'], topics: ['Circuit Breakers', 'Protective Relays', 'Fuses', 'Generator & Transformer Protection', 'Feeder & Busbar Protection'] },
      { name: 'Control Systems', i3d: 'knobs', topics: ['Transfer Function & Modelling', 'Controllers & Feedback', 'Time Response', 'Steady-State Error', 'Stability & Routh-Hurwitz', 'Root Locus', 'Frequency Response', 'State-Space Analysis', 'Nonlinear Systems'] },
      { name: 'Power Electronics', i3d: 'plug', topics: ['Power Semiconductor Devices', 'Thyristors (SCR)', 'Rectifiers & Converters', 'Choppers (DC-DC Converters)', 'Inverters', 'AC Voltage Controllers', 'Cycloconverters', 'SMPS'] },
      { name: 'Measurements & Instruments', i3d: 'ruler', aliases: ['Measurement and Instrumentation', 'Electrical Measurements'], topics: ['Analog Instruments', 'AC & DC Bridges', 'Power Measurement', 'Energy Meters', 'Oscilloscope (CRO)', 'Digital Instruments', 'Instrument Transformers'] },
      { name: 'Analog Electronics', i3d: 'radio', aliases: ['Electronic Devices', 'Analog & Digital Electronics'], topics: ['Semiconductor Diodes', 'BJT', 'FET & MOSFET', 'Operational Amplifiers', 'Oscillators & Waveform Generators', 'Power Supplies & Regulators'] },
      { name: 'Digital Electronics', i3d: 'floppy', topics: ['Number Systems & Codes', 'Boolean Algebra & Logic Gates', 'Combinational Circuits', 'Sequential Circuits', 'Logic Families', 'Memories & PLDs', 'Data Converters (ADC & DAC)'] },
      { name: 'Microprocessors & Microcontrollers', i3d: 'computer', topics: ['8085 Microprocessor', '8086 & Advanced Processors', 'Peripheral Interfacing', '8051 Microcontroller', 'Embedded & Real-Time Systems'] },
      { name: 'Signals & Systems', i3d: 'trend', topics: ['Signals & Classification', 'System Properties', 'LTI Systems & Convolution', 'Fourier Series', 'Fourier Transform', 'Laplace Transform', 'Z-Transform', 'Sampling'] },
      { name: 'Electromagnetic Fields', i3d: 'magnet', aliases: ['Electromagnetic Theory'], topics: ['Vector Calculus', 'Electrostatics', 'Magnetostatics', "Maxwell's Equations", 'Electromagnetic Waves'] },
      { name: 'Utilisation & Building Services', i3d: 'bulb', aliases: ['Utilization of Electrical Energy', 'Utilisation of Electrical Energy', 'Building Electrical Services'], topics: ['Illumination', 'Electric Heating', 'Electric Welding', 'Electric Traction', 'Lifts & Escalators', 'HVAC', 'Fire Alarm & Life Safety', 'Standby & Emergency Power', 'Pumps & Water Supply', 'Building Power Distribution', 'Building Automation & ELV'] },
      { name: 'Installation, Earthing & Safety', i3d: 'helmet', aliases: ['Electrical Installation and Safety'], topics: ['Wiring & Installation', 'Earthing', 'Protective Devices (MCB, RCCB, ELCB)', 'Lightning Protection', 'Cables', 'IS Codes & IE Rules', 'Electrical Materials', 'Maintenance & Testing'] },
      { name: 'Energy Management & Electricity Laws', i3d: 'recycle', aliases: ['Energy Management', 'Electrical Laws, Standards and Energy Policy'], topics: ['Electricity Act & Regulation', 'Energy Conservation Act & BEE', 'Energy Audit', 'Energy Efficiency in Utilities', 'Renewable Energy Policy', 'Smart Grid & Demand Side Management', 'Energy & Environment', 'Risk & Quality Management'] },
      { name: 'Industrial Automation & Drives', i3d: 'robot', aliases: ['Industrial Automation'], topics: ['SCADA, PLC & HMI', 'Sensors & Transducers', 'Motor Control Centres', 'Electrical Drives', 'UPS & Power Backup'] },
      { name: 'Estimation & Costing', i3d: 'receipt' },
    ],
  },
  {
    slug: 'civil-engineering', name: 'Civil Engineering', short: 'Civil', i3d: 'construction', tint: 'tint-orange', group: 'engineering',
    blurb: 'Structures, soil, fluids, surveying and transport',
    chapters: [
      { name: 'Building Materials', i3d: 'bricks' },
      { name: 'Strength of Materials', i3d: 'nut' },
      { name: 'Structural Analysis', i3d: 'bridge' },
      { name: 'RCC & Steel Design', i3d: 'office' },
      { name: 'Soil Mechanics', i3d: 'rock' },
      { name: 'Fluid Mechanics & Hydraulics', i3d: 'droplet' },
      { name: 'Irrigation Engineering', i3d: 'rice' },
      { name: 'Surveying', i3d: 'compass' },
      { name: 'Environmental Engineering', i3d: 'recycle' },
      { name: 'Transportation Engineering', i3d: 'motorway' },
      { name: 'Estimation & Construction Management', i3d: 'receipt' },
    ],
  },
  {
    slug: 'mechanical-engineering', name: 'Mechanical Engineering', short: 'Mechanical', i3d: 'gear', tint: 'tint-teal', group: 'engineering',
    blurb: 'Thermal, design, manufacturing and machines',
    chapters: [
      { name: 'Engineering Mechanics', i3d: 'scales' },
      { name: 'Strength of Materials', i3d: 'nut' },
      { name: 'Theory of Machines', i3d: 'wrench' },
      { name: 'Machine Design', i3d: 'setsquare' },
      { name: 'Thermodynamics', i3d: 'thermometer' },
      { name: 'Fluid Mechanics & Machinery', i3d: 'droplet' },
      { name: 'Heat Transfer', i3d: 'fire' },
      { name: 'Refrigeration & Air Conditioning', i3d: 'snowflake' },
      { name: 'IC Engines & Automobile', i3d: 'car' },
      { name: 'Manufacturing & Production', i3d: 'factory' },
      { name: 'Industrial Engineering', i3d: 'barchart' },
    ],
  },
  {
    slug: 'electronics-engineering', name: 'Electronics & Communication', short: 'Electronics', i3d: 'radio', tint: 'tint-sky', group: 'engineering',
    blurb: 'Devices, circuits, signals and communication',
    chapters: [
      { name: 'Electronic Devices', i3d: 'battery' },
      { name: 'Analog Circuits', i3d: 'radio' },
      { name: 'Digital Electronics', i3d: 'floppy' },
      { name: 'Signals & Systems', i3d: 'trend' },
      { name: 'Communication Systems', i3d: 'satellite' },
      { name: 'Microprocessors', i3d: 'computer' },
      { name: 'Control Systems', i3d: 'knobs' },
      { name: 'Electromagnetics', i3d: 'magnet' },
    ],
  },
  {
    slug: 'computer-science', name: 'Computer Science', short: 'Computer', i3d: 'computer', tint: 'tint-violet', group: 'engineering',
    blurb: 'Computer awareness to CS fundamentals',
    chapters: [
      { name: 'Computer Fundamentals', i3d: 'computer' },
      { name: 'MS Office & Internet', i3d: 'memo' },
      { name: 'Programming & Data Structures', i3d: 'keyboard' },
      { name: 'DBMS', i3d: 'floppy' },
      { name: 'Operating Systems', i3d: 'gear' },
      { name: 'Computer Networks', i3d: 'satellite' },
    ],
  },
  {
    slug: 'reasoning', name: 'Reasoning', short: 'Reasoning', i3d: 'brain', tint: 'tint-pink', group: 'general',
    blurb: 'Verbal, non-verbal and analytical reasoning',
    chapters: [
      { name: 'Series', i3d: 'numbers', aliases: ['Logical Reasoning'], topics: ['Number Series', 'Letter Series', 'Missing Number'] },
      { name: 'Analogy & Classification', i3d: 'repeat' },
      { name: 'Coding-Decoding', i3d: 'codelock' },
      { name: 'Blood Relations', i3d: 'family', topics: ['Blood Relations'] },
      { name: 'Direction & Distance', i3d: 'compass' },
      { name: 'Order & Ranking', i3d: 'medal' },
      { name: 'Seating Arrangement', i3d: 'chair' },
      { name: 'Puzzles', i3d: 'puzzle' },
      { name: 'Syllogism', i3d: 'link' },
      { name: 'Statement & Conclusion', i3d: 'chat' },
      { name: 'Data Sufficiency', i3d: 'barchart' },
      { name: 'Venn Diagram', i3d: 'target' },
      { name: 'Mirror & Water Image', i3d: 'mirror' },
      { name: 'Paper Folding & Cutting', i3d: 'scissors' },
      { name: 'Counting Figures', i3d: 'triangle' },
      { name: 'Dice & Cube', i3d: 'dice' },
      { name: 'Clock & Calendar', i3d: 'clock' },
      { name: 'Mathematical Operations', i3d: 'divide' },
    ],
  },
  {
    slug: 'quantitative-aptitude', name: 'Quantitative Aptitude', short: 'Maths', i3d: 'abacus', tint: 'tint-red', group: 'general',
    blurb: 'Arithmetic, advance maths and data interpretation',
    chapters: [
      { name: 'Number System', i3d: 'numbers' },
      { name: 'Simplification', i3d: 'divide' },
      { name: 'Percentage', i3d: 'hundred' },
      { name: 'Ratio & Proportion', i3d: 'scales' },
      { name: 'Average', i3d: 'trend' },
      { name: 'Profit & Loss', i3d: 'money' },
      { name: 'Simple & Compound Interest', i3d: 'bank' },
      { name: 'Time & Work', i3d: 'worker' },
      { name: 'Time, Speed & Distance', i3d: 'train' },
      { name: 'Algebra', i3d: 'abacus' },
      { name: 'Geometry', i3d: 'setsquare' },
      { name: 'Mensuration', i3d: 'ruler' },
      { name: 'Trigonometry', i3d: 'triangle' },
      { name: 'Data Interpretation', i3d: 'barchart' },
      { name: 'Probability & Statistics', i3d: 'dice' },
    ],
  },
  {
    slug: 'general-knowledge', name: 'General Knowledge', short: 'GK', i3d: 'globe', tint: 'tint-green', group: 'general',
    blurb: 'History, geography, polity, economy and static GK',
    chapters: [
      { name: 'Current Affairs', i3d: 'newspaper', topics: ['National & State News', 'Awards & Honours', 'Indices & Reports', 'Appointments', 'Sports Events'] },
      { name: 'Government Schemes', i3d: 'govt', topics: ['Social Welfare Schemes', 'Women Welfare Schemes', 'Agriculture Schemes', 'Gujarat State Schemes'] },
      { name: 'History', i3d: 'classical' },
      { name: 'Geography', i3d: 'map' },
      { name: 'Indian Polity', i3d: 'scales' },
      { name: 'Indian Economy', i3d: 'economy' },
      { name: 'Static GK', i3d: 'books' },
      { name: 'Art & Culture', i3d: 'sparkles' },
      { name: 'Sports', i3d: 'sports' },
      { name: 'Books, Awards & Days', i3d: 'award' },
    ],
  },
  {
    slug: 'general-science', name: 'General Science', short: 'Science', i3d: 'microscope', tint: 'tint-teal', group: 'general',
    blurb: 'Physics, chemistry and biology for every exam',
    chapters: [
      { name: 'Physics', i3d: 'atom' },
      { name: 'Chemistry', i3d: 'testtube' },
      { name: 'Biology', i3d: 'dna' },
      { name: 'Science & Technology', i3d: 'rocket' },
    ],
  },
  {
    slug: 'english', name: 'English', short: 'English', i3d: 'bookopen', tint: 'tint-sky', group: 'language',
    blurb: 'Grammar, vocabulary and comprehension',
    chapters: [
      { name: 'Reading Comprehension', i3d: 'bookopen' },
      { name: 'Error Spotting', i3d: 'search' },
      { name: 'Fill in the Blanks & Cloze Test', i3d: 'write' },
      { name: 'Synonyms & Antonyms', i3d: 'abc' },
      { name: 'Idioms & One-word Substitution', i3d: 'speech2' },
      { name: 'Voice & Narration', i3d: 'chat' },
      { name: 'Sentence Rearrangement', i3d: 'repeat' },
      { name: 'Grammar & Sentence Transformation', i3d: 'memo', topics: ['Tenses', 'Articles', 'Sentence Transformation', 'Sentence Improvement'] },
    ],
  },
  {
    slug: 'hindi', name: 'Hindi', short: 'Hindi', i3d: 'india', tint: 'tint-orange', group: 'language',
    blurb: 'व्याकरण, शब्द-भंडार और अपठित गद्यांश',
    chapters: [
      { name: 'Vyakaran (Grammar)', i3d: 'write' },
      { name: 'Shabd Bhandar (Vocabulary)', i3d: 'abc' },
      { name: 'Muhavare & Lokoktiyan', i3d: 'speech2' },
      { name: 'Apathit Gadyansh', i3d: 'bookopen' },
    ],
  },
  {
    slug: 'gujarati', name: 'Gujarati', short: 'Gujarati', i3d: 'write', tint: 'tint-violet', group: 'language',
    blurb: 'Grammar and literature for Gujarat state exams',
    chapters: [
      { name: 'Vyakaran (Grammar)', i3d: 'write', aliases: ['ગુજરાતી ભાષા', 'ગુજરાતી વ્યાકરણ', 'વ્યાકરણ', 'Gujarati Language', 'Gujarati Grammar', 'Gujarati Language and Grammar'] },
      { name: 'Sahitya (Literature)', i3d: 'books', aliases: ['ગુજરાતી સાહિત્ય', 'સાહિત્ય', 'Gujarati Literature'] },
      { name: 'Shabd Bhandar (Vocabulary)', i3d: 'abc' },
      { name: 'Rudhiprayog & Kahevat', i3d: 'speech2', topics: ['Rudhiprayog (Idioms)', 'Kahevat (Proverbs)'] },
    ],
  },
];

/* SRO Studio → Library → Syllabus: renamed/added/hidden subjects, chapters and topics (slugs never change). */
type StudioSubject = Omit<Subject, 'chapters'> & { hidden?: boolean; chapters: Chapter[] };
{
  const lib = (studio as unknown as { library?: { subjects?: StudioSubject[] } }).library;
  for (const ss of lib?.subjects ?? []) {
    const i = SUBJECTS.findIndex((x) => x.slug === ss.slug);
    if (ss.hidden) { if (i >= 0) SUBJECTS.splice(i, 1); continue; }
    const base = i >= 0 ? SUBJECTS[i] : undefined;
    const baseCh = new Map((base?.chapters ?? []).map((c) => [c.slug ?? slugify(c.name), c]));
    const chapters: Chapter[] = [];
    for (const c of ss.chapters ?? []) {
      const slug = c.slug || slugify(c.name);
      const old = baseCh.get(slug);
      baseCh.delete(slug);
      if (c.hidden) continue;
      const aliases = [...new Set([...(old?.aliases ?? []), ...(c.aliases ?? []), ...(old && old.name !== c.name ? [old.name] : [])])];
      const topics = [...new Set([...(c.topics ?? []), ...(old?.topics ?? [])])];
      chapters.push({ name: c.name, slug, i3d: c.i3d || old?.i3d || 'book', ...(aliases.length ? { aliases } : {}), ...(topics.length ? { topics } : {}) });
    }
    chapters.push(...baseCh.values());
    const merged: Subject = { ...(base ?? { blurb: '', tint: 'tint-gray', short: ss.name }), ...ss, chapters } as Subject;
    if (i >= 0) SUBJECTS[i] = merged; else SUBJECTS.push(merged);
  }
}

export const getSubject = (slug: string) => SUBJECTS.find((s) => s.slug === slug);
export const chapterSlug = (c: Chapter) => c.slug ?? slugify(c.name);

/** Which taxonomy chapter a question belongs to: exact chapter name first, then by topic, then by an old chapter alias. */
export function chapterOf(subjectSlug: string, chapterName: string, topic: string): Chapter | undefined {
  const s = getSubject(subjectSlug);
  if (!s) return undefined;
  const n = chapterName.toLowerCase();
  const t = topic.toLowerCase();
  return (
    s.chapters.find((c) => c.name.toLowerCase() === n) ??
    s.chapters.find((c) => c.topics?.some((x) => x.toLowerCase() === t)) ??
    s.chapters.find((c) => c.aliases?.some((a) => a.toLowerCase() === n))
  );
}
