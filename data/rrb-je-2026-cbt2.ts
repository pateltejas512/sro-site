import type { Difficulty, OptionKey, Question, QuestionText } from '@/lib/types';

// Imported from the live SRO question pages (sarkariresultout.com/pyq/question/...).
// Slugs are kept identical so old URLs can 301 to /question/{slug}/ without losing rankings.

const EXAM = 'rrb-je';
const PAPER = '2026-cbt-2-electrical-shift-1';

function q(
  qNo: number,
  slug: string,
  chapter: string,
  topic: string,
  difficulty: Difficulty,
  answer: OptionKey,
  en: QuestionText,
  extra: Partial<Question> = {}
): Question {
  return {
    id: `SRO-RRBJE-2026-C2S1-Q${String(qNo).padStart(3, '0')}`,
    slug,
    examSlug: EXAM,
    paperSlug: PAPER,
    qNo,
    section: 'Technical Abilities',
    subject: 'Electrical Engineering',
    chapter,
    topic,
    difficulty,
    answer,
    verifiedBy: 'SRO Electrical desk',
    primaryLang: 'en',
    text: { en },
    ...extra,
  };
}

export const rrbJeCbt2Questions: Question[] = [
  q(1, 'rrb-je-cbt-2-electrical-q1-induction-furnace-energy-input', 'Utilisation & Building Services', 'Electric Heating', 'Moderate', 'A', {
    stem: 'An induction furnace operates at 10 kHz and is used to melt 100 kg of steel. If the efficiency is 60% and the energy required to melt steel is 1500 kWh/ton, what is the minimum energy input needed?',
    options: ['250 kWh', '150 kWh', '180 kWh', '90 kWh'],
    quick: 'The 100 kg charge is 0.1 ton, so the steel needs 0.1 × 1500 = 150 kWh of useful melting energy. At 60% efficiency, the electrical input must be 150 / 0.60 = 250 kWh.',
    formula: ['m = 100 kg = 0.1 ton', 'E_useful = 0.1 × 1500 = 150 kWh', 'η = E_useful / E_input', 'E_input = 150 / 0.60 = 250 kWh'],
    detailed: '### Energy balance of an induction furnace\nThe furnace must first supply the thermal energy actually required by the steel. The requirement is given per ton, so convert the mass first: 100 kg = 0.1 ton, giving 0.1 × 1500 = 150 kWh of useful energy.\n\n### Applying furnace efficiency\nA 60% efficient furnace converts only 0.60 of its input into useful melting energy, so the input must be larger than 150 kWh: E_input = 150 / 0.60 = 250 kWh.\n\n### What about 10 kHz?\nThe operating frequency affects penetration depth and coupling, but it is not needed here because the energy per ton and the efficiency are already given.',
    tip: 'When efficiency is below 100%, input energy must be larger than the useful energy delivered to the load.',
  }),
  q(2, 'rrb-je-cbt-2-electrical-q2-bjt-ce-input-characteristic', 'Analog Electronics', 'BJT', 'Easy', 'C', {
    stem: 'The curve obtained in the input characteristics of a BJT in common-emitter (CE) configuration is _______.',
    options: ['Similar to a reverse breakdown curve', 'Linear for all voltages', 'Similar to a forward diode curve', 'A horizontal straight line'],
    quick: 'In CE configuration the input junction is the forward-biased base-emitter PN junction, so I_B rises non-linearly with V_BE exactly like a forward-biased diode.',
    formula: ['Input characteristic: I_B versus V_BE at constant V_CE', 'I ≈ I_S (e^(V/ηV_T) − 1)'],
    detailed: '### What the CE input characteristic represents\nIn a common-emitter BJT the input is applied between base and emitter, so the input characteristic is I_B plotted against V_BE for a fixed V_CE.\n\n### Why the curve is diode-shaped\nThe base-emitter junction is a PN junction operated in forward bias. Current stays tiny at low voltage and then rises rapidly after the knee (about 0.6–0.7 V for silicon) — the same behaviour as a forward-biased diode.\n\n### Reading the graph in the exam\nThe curve is neither linear nor horizontal, and it is not a reverse-breakdown curve. The visual clue is the non-linear rising forward-junction shape.',
  }),
  q(3, 'rrb-je-cbt-2-electrical-q3-rupturing-breaking-capacity', 'Switchgear & Protection', 'Fuses', 'Easy', 'D', {
    stem: 'A protective device with high rupturing capacity can:',
    options: [
      'Reduce transmission line inductance during balanced load operation only',
      'Improve voltage regulation of transformers during overload conditions',
      'Increase insulation resistance during normal system operating conditions',
      'Safely interrupt heavy fault currents without equipment damage occurrence',
    ],
    quick: 'Rupturing (breaking) capacity is the largest prospective short-circuit current a device can interrupt safely. It is a fault-interruption rating — it does not change regulation, inductance or insulation resistance.',
    detailed: '### Rupturing capacity\nThe maximum prospective fault current a protective device can interrupt safely at its rated voltage, usually stated in kA.\n\n### Why high fault current is hard to interrupt\nA short-circuit current can be many times the load current. When a fuse melts or breaker contacts part, an arc forms; a device rated below the fault level may fail violently.\n\n### What a high-rupturing-capacity device does\nAn HRC fuse or a suitably rated breaker controls and extinguishes that arc, clearing severe faults without damage to surrounding equipment.',
  }),
  q(4, 'rrb-je-cbt-2-electrical-q4-series-capacitor-voltage-ratio', 'Basic Electrical Engineering', 'Electrostatics & Capacitors', 'Moderate', 'D', {
    stem: 'A 12 μF capacitor and a 4 μF capacitor are connected in series. The ratio of voltages across them will be:',
    options: ['4:1', '1:4', '3:1', '1:3'],
    quick: 'Series capacitors carry the same charge. Since V = Q/C, voltage is inversely proportional to capacitance: V(12 μF) : V(4 μF) = 4 : 12 = 1 : 3.',
    formula: ['Q₁ = Q₂ = Q', 'V = Q / C', 'V₁₂ : V₄ = (Q/12) : (Q/4) = 1 : 3'],
    detailed: '### Voltage division in series capacitors\nCapacitors in series store the same charge Q.\n\n### Use V = Q/C\nFor a fixed charge, the smaller capacitor develops the larger voltage. V₁₂ / V₄ = (Q/12) / (Q/4) = 4/12 = 1/3.\n\n### Physical check\nThe 4 μF capacitor has one-third the capacitance, so it must hold three times the voltage. In the order asked, the ratio is 1:3.',
    tip: 'Series capacitors: same charge, voltage inversely proportional to capacitance.',
  }),
  q(5, 'rrb-je-cbt-2-electrical-q5-buchholz-relay-transformer-protection', 'Switchgear & Protection', 'Generator & Transformer Protection', 'Easy', 'A', {
    stem: 'What is the purpose of a Buchholz relay in transformer protection?',
    options: ['To detect internal faults such as short circuits and arcing in oil', 'To detect overvoltage', 'To measure core flux', 'To measure temperature rise'],
    quick: 'A Buchholz relay is a gas- and oil-surge-operated relay on oil-immersed transformers with a conservator. It alarms on slow internal faults and trips on severe internal faults.',
    detailed: '### Where it sits\nIn the pipe between the main tank and the conservator of an oil-immersed transformer.\n\n### Incipient faults\nLocal overheating or minor arcing decomposes oil; the gas collects in the relay chamber and operates the alarm contact.\n\n### Severe faults\nA major internal short circuit produces a sudden oil surge toward the conservator, operating the trip element and opening the breaker.\n\n### Not for\nMeasuring core flux, temperature rise or system overvoltage.',
  }),
  q(6, 'rrb-je-cbt-2-electrical-q6-series-rc-phase-angle', 'Network Theory', 'AC Circuits', 'Moderate', 'C', {
    stem: 'In a series R-C circuit supplied with sinusoidal AC voltage, the current leads the applied voltage by an angle φ. Which of the following correctly expresses this phase angle?',
    options: ['tan φ = R/X_C', 'tan φ = −R/X_C', 'tan φ = −X_C/R', 'tan φ = X_C·R'],
    quick: 'The paper uses the signed impedance angle: Z = R − jX_C, so tan φ = −X_C/R. (As a pure magnitude, the current leads by tan⁻¹(X_C/R).)',
    formula: ['Z = R − jX_C', 'tan φ_Z = −X_C / R', '|lead angle| = tan⁻¹(X_C / R)'],
    detailed: '### Phase angle of a series R-C circuit\nCapacitive reactance lies on the negative imaginary axis, so Z = R − jX_C and tan φ_Z = −X_C/R.\n\n### Meaning of the negative sign\nThe negative impedance angle shows capacitive behaviour. Because I = V/Z, the current leads the voltage by tan⁻¹(X_C/R).\n\n### Wording issue in the source\nIf φ meant only the positive size of the lead, one would write tan φ = X_C/R. The official key treats φ as the signed impedance angle, so option C is the intended answer.',
    tip: 'A capacitive circuit has a negative impedance angle even though current leads voltage by a positive magnitude.',
  }),
  q(7, 'rrb-je-cbt-2-electrical-q7-moving-iron-air-friction-damping', 'Measurements & Instruments', 'Analog Instruments', 'Easy', 'A', {
    stem: 'Which of the following statements about damping in moving-iron instruments is correct?',
    options: [
      'Damping in MI instruments is usually provided by air friction',
      'Damping in MI instruments is usually provided by eddy currents in an aluminium disc',
      'Damping in MI instruments is usually not required because the pointer is very light',
      'Damping in MI instruments is usually provided by a permanent magnet',
    ],
    quick: 'Moving-iron instruments use air-friction damping. Eddy-current damping needs a permanent magnet, whose field would disturb the MI instrument’s own operating field.',
    detailed: '### Why damping is needed\nWithout damping the pointer oscillates around its final value; damping torque lets it settle quickly without changing the reading.\n\n### Method used in MI instruments\nA light vane or piston moves in a closed air chamber; air resistance absorbs the oscillation energy.\n\n### Why not eddy-current damping\nIt needs a permanent magnet, which would interact with the instrument’s working magnetic field and cause error.',
  }),
  q(8, 'rrb-je-cbt-2-electrical-q8-reduce-earth-resistance', 'Installation, Earthing & Safety', 'Earthing', 'Easy', 'C', {
    stem: 'Which method is commonly used to reduce earth resistance in an electrical installation?',
    options: ['Increasing the supply voltage', 'Reducing the size of the earth conductor', 'Increasing the number of earth electrodes', 'Using a higher-rated fuse'],
    quick: 'More properly spaced earth electrodes, bonded together, give fault current more paths into the soil and lower the overall earth resistance.',
    detailed: '### What creates earth resistance\nMostly the resistance met as current spreads from the electrode into the soil — set by soil resistivity, moisture, electrode size, depth and contact area.\n\n### Why extra electrodes help\nSeveral bonded electrodes with enough spacing enlarge the current-dispersal area, so resistance falls.\n\n### Why the other options fail\nSupply voltage and fuse rating do not change the earthing system; a smaller conductor makes it worse.',
  }),
  q(9, 'rrb-je-cbt-2-electrical-q9-magnetic-field-current-relation', 'Basic Electrical Engineering', 'Magnetism & Magnetic Circuits', 'Easy', 'B', {
    stem: 'What happens to the magnetic field around a straight current-carrying conductor when the current through it is increased?',
    options: ['Magnetic field disappears', 'Magnetic field strength increases', 'Magnetic field strength remains the same', 'Magnetic field strength decreases'],
    quick: 'Around a long straight conductor B = μI / (2πr). At the same distance and in the same medium, B is directly proportional to I, so the field gets stronger.',
    formula: ['B = μI / (2πr)', 'At fixed r and μ: B ∝ I'],
    detailed: '### Field of a straight conductor\nField lines are concentric circles; direction by the right-hand thumb rule.\n\n### Relation to current\nB = μI/(2πr). With r and μ fixed, raising I raises B proportionally.',
  }),
  q(10, 'rrb-je-cbt-2-electrical-q10-parallel-rlc-phase-angle', 'Network Theory', 'AC Circuits', 'Moderate', 'D', {
    stem: 'How is the phase angle between voltage V and total current I_S in a parallel RLC circuit determined?',
    options: ['By comparing voltage drops across each element', 'From the angle between V and I_R', 'By subtracting I_L from I_C', 'From the angle between V and the vector sum of I_R, I_L, and I_C'],
    quick: 'In a parallel RLC circuit the source current is the phasor sum of I_R, I_L and I_C. The phase angle is the angle between the common voltage and that resultant current.',
    formula: ['I_S = I_R + j(I_C − I_L)', 'tan φ = (I_C − I_L) / I_R'],
    detailed: '### Branch phasors\nAll branches share V. I_R is in phase with V, I_L lags by 90°, I_C leads by 90°.\n\n### Source current\nThe supply current is the vector sum: I_S = I_R + j(I_C − I_L), so tan φ = (I_C − I_L)/I_R.\n\n### Sign of the angle\nI_C > I_L → current leads; I_L > I_C → it lags; at resonance they cancel and current is in phase.',
    tip: 'In parallel AC circuits add branch currents as phasors, not as plain numbers.',
  }),
  q(11, 'rrb-je-cbt-2-electrical-q11-synchronous-motor-torque-statements', 'Electrical Machines', 'Synchronous Machines', 'Hard', 'D', {
    stem: 'Consider the following statements about torque in synchronous motors.\nStatement I: The torque in a synchronous motor is produced only when the rotor is locked into synchronism.\nStatement II: The torque is directly proportional to the sine of the load angle (δ).\nStatement III: Synchronous motor develops starting torque proportional to the power input.\nStatement IV: Maximum torque occurs at δ = 180°.\nWhich of the above statements are correct?',
    options: ['Statements II, III & IV only', 'Statements II & IV only', 'Statements I, II & III only', 'Statements I & II only'],
    quick: 'Steady torque exists only in synchronism, and for the basic cylindrical-rotor model T ∝ sin δ. A conventional synchronous motor has no inherent starting torque, and maximum torque occurs near δ = 90°, not 180°.',
    formula: ['P = (3VE / X_s) sin δ', 'T = P / ω_s ∝ sin δ', 'T_max at δ ≈ 90°'],
    tip: 'Maximum torque of the basic synchronous-motor model is near δ = 90° because torque follows sin δ.',
  }),
  q(12, 'rrb-je-cbt-2-electrical-q12-faraday-law-induced-emf', 'Basic Electrical Engineering', 'Electromagnetic Induction', 'Easy', 'B', {
    stem: 'Which Law illustrates the relationship between induced electromotive force (EMF) and the time variation of magnetic flux in a coil?',
    options: ['Ampere Circuital Law', 'Faraday Law of Induction', "Lenz's Law", "Coulomb's Law"],
    quick: 'Faraday’s law relates induced EMF to the rate of change of flux linkage: e = −N dΦ/dt. The negative sign is Lenz’s law.',
    formula: ['e = −dλ/dt', 'λ = NΦ', 'e = −N (dΦ/dt)'],
  }),
  q(13, 'rrb-je-cbt-2-electrical-q13-atomic-hydrogen-welding', 'Utilisation & Building Services', 'Electric Welding', 'Moderate', 'B', {
    stem: 'Which of the following statements about the atomic hydrogen arc welding process is correct?',
    options: [
      'It works with a consumable iron electrode in a hydrogen atmosphere.',
      'It employs two non-consumable tungsten electrodes to create an arc in a hydrogen atmosphere.',
      'It requires two non-consumable tungsten electrodes and an oxygen-rich atmosphere.',
      'It utilizes a single carbon electrode to generate heat in hydrogen atmosphere.',
    ],
    quick: 'Atomic hydrogen welding strikes an arc between two non-consumable tungsten electrodes in hydrogen. H₂ splits in the arc and recombines at the workpiece, releasing intense heat.',
    formula: ['H₂ + energy → 2H', '2H → H₂ + heat'],
  }),
  q(14, 'rrb-je-cbt-2-electrical-q14-hays-bridge-high-q-inductor', 'Measurements & Instruments', 'AC & DC Bridges', 'Moderate', 'A', {
    stem: "For accurate measurement of inductors using Hay's bridge, which characteristic should the inductor primarily possess?",
    options: ['High Q-factor', 'Medium Q-factor', 'High resistance', 'Low Q-factor'],
    quick: 'Hay’s bridge is designed for high-Q inductors (Q = ωL/R large, typically above about 10).',
    formula: ['Q = X_L / R = ωL / R', 'High Q ⇒ ωL ≫ R'],
    tip: 'Hay’s bridge → high-Q coil; Maxwell bridge → medium-Q coil.',
  }),
  q(15, 'rrb-je-cbt-2-electrical-q15-induction-motor-input-power-factor', 'Electrical Machines', 'Induction Motors', 'Easy', 'C', {
    stem: 'In a three-phase induction motor, the phasor diagram shows an angle between the applied stator voltage and the resulting stator current. This angle primarily indicates:',
    options: ['Rotor frequency', 'Synchronous speed', 'Input power factor', 'Rotor slip'],
    quick: 'The angle φ between stator voltage and stator current is the power-factor angle; input power factor = cos φ.',
    formula: ['Power factor = cos φ', 'P_in = √3 V_L I_L cos φ'],
  }),
  q(17, 'rrb-je-cbt-2-electrical-q17-seam-welding-electrode-material', 'Utilisation & Building Services', 'Electric Welding', 'Easy', 'D', {
    stem: 'In seam welding, the electrodes are made of _______.',
    options: ['aluminium', 'brass', 'tungsten', 'copper alloys'],
    quick: 'Seam-welding wheel electrodes must carry very high current, remove heat quickly and resist wear, so copper-based alloys are used.',
  }),
  q(18, 'rrb-je-cbt-2-electrical-q18-oscilloscope-rise-time', 'Measurements & Instruments', 'Oscilloscope (CRO)', 'Moderate', 'B', {
    stem: 'An oscilloscope displays a measured rise time of 10 ns when observing a fast pulse. If the oscilloscope itself has a specified rise time of 6 ns, then what is the approximate actual rise time of the signal being measured?',
    options: ['4 ns', '8 ns', '6 ns', '12 ns'],
    quick: 'Rise times combine by root-sum-square, so t_signal = √(10² − 6²) = √64 = 8 ns.',
    formula: ['t_measured² ≈ t_signal² + t_scope²', 't_signal = √(10² − 6²) = 8 ns'],
    tip: 'Never subtract rise times directly; use root-sum-square.',
  }),
  q(19, 'rrb-je-cbt-2-electrical-q19-power-factor-tariff-capacitor', 'Power Systems', 'Load Curves & Tariffs', 'Easy', 'B', {
    stem: 'Which strategy reduces electricity charges under a power factor tariff system for a manufacturing plant with predominantly inductive loads?',
    options: [
      'Switching to higher voltage transformers without changing load characteristics',
      'Installing capacitors to improve the power factor of inductive loads',
      'Operating all equipment at full load constantly',
      'Increasing lighting hours during low demand periods',
    ],
    quick: 'Shunt capacitors supply leading reactive power locally, offset the lagging VAr of inductive loads, raise power factor and cut kVA-based tariff penalties.',
    formula: ['Q_c = P (tan φ₁ − tan φ₂)'],
  }),
  q(20, 'rrb-je-cbt-2-electrical-q20-squirrel-cage-starting-torque', 'Electrical Machines', 'Induction Motors', 'Moderate', 'B', {
    stem: 'Why does a squirrel cage induction motor not develop maximum starting torque?',
    options: ['Slip is less than unity at starting', 'Rotor resistance is fixed and low', 'Rotor reactance is zero at starting', 'Rotor resistance can be externally varied at starting'],
    quick: 'Maximum torque at start (s = 1) needs R₂ = X₂. A cage rotor’s resistance is fixed and low, and no external resistance can be added, so its maximum torque occurs at a slip below 1.',
    formula: ['T ∝ sR₂ / [R₂² + (sX₂)²]', 's_Tmax = R₂ / X₂'],
    tip: 'At start s = 1. A slip-ring motor can add rotor resistance; a cage motor cannot.',
  }),
  q(21, 'rrb-je-cbt-2-electrical-q21-earth-electrode-contact-area', 'Installation, Earthing & Safety', 'Earthing', 'Easy', 'B', {
    stem: 'Which modification in an earthing system most directly reduces earth resistance by improving the contact area between the electrode and surrounding soil?',
    options: [
      'Connecting the earth conductor to the neutral wire only',
      'Increasing the effective contact area by using multiple or larger earth electrodes',
      'Using a higher supply voltage in the installation',
      'Increasing the rating of the protective fuse',
    ],
    quick: 'Multiple or larger electrodes increase electrode–soil contact and current-spreading area, lowering earth resistance.',
  }),
  q(22, 'rrb-je-cbt-2-electrical-q22-power-station-capacity-planning', 'Power Systems', 'Load Curves & Tariffs', 'Easy', 'C', {
    stem: 'Which consideration is important while deciding the capacity of a power station?',
    options: [
      'Type of paint applied on generating station external building surfaces',
      'Number of ceiling fans installed inside administrative office sections',
      'Expected maximum electrical demand and future load growth requirements',
      'Shape of fencing structure surrounding the generating station premises',
    ],
    quick: 'Station capacity is set by expected maximum demand, reserve margin and future load growth.',
  }),
  q(24, 'rrb-je-cbt-2-electrical-q24-power-work-time-relation', 'Basic Electrical Engineering', 'Basic Concepts', 'Easy', 'A', {
    stem: 'A machine delivers power that is three times its original value, while the duration of operation stays unchanged. How does the work done by the machine change?',
    options: ['It becomes three times larger.', 'It becomes one-third of the original.', 'It remains unchanged.', 'It becomes nine times larger.'],
    quick: 'W = P × t. With t unchanged, tripling P triples the work.',
    formula: ['P = W / t', 'W = P t', 'P₂ = 3P₁, t₂ = t₁ ⇒ W₂ = 3W₁'],
  }),
  q(25, 'rrb-je-cbt-2-electrical-q25-magnetic-flux-si-unit', 'Basic Electrical Engineering', 'Magnetism & Magnetic Circuits', 'Moderate', 'B', {
    stem: 'Which statement about magnetic flux is false?',
    options: [
      'Magnetic flux density unit is Tesla or weber per meter square (Wb/m²).',
      'Magnetic flux does not have any SI unit.',
      'Magnetic flux is analogous to current in electric circuit.',
      'Magnetic flux density is the magnetic flux passing through per unit cross-section area.',
    ],
    quick: 'Magnetic flux Φ has an SI unit — the weber (Wb). Flux density B is in tesla (T) = Wb/m².',
    formula: ['Φ in weber (Wb)', 'B = Φ / A', '1 T = 1 Wb/m²'],
    tip: 'Flux Φ → weber; flux density B → tesla.',
  }),
  q(26, 'rrb-je-cbt-2-electrical-q26-pull-out-breakdown-torque', 'Electrical Machines', 'Induction Motors', 'Moderate', 'D', {
    stem: 'Which point or region represents the Pull-out Torque in the shown torque-speed characteristic of a 3-phase induction motor?',
    options: ['Point b', 'Point a', 'Anywhere between point a and b', 'Point c'],
    quick: 'Pull-out (breakdown, maximum) torque is the peak of the torque-speed curve; in the paper’s figure the peak is labelled c.',
    formula: ['s_m = R₂ / X₂'],
    tip: 'Pull-out, breakdown and maximum torque all mean the peak of the curve.',
  }, { figureMissing: true }),
  q(27, 'rrb-je-cbt-2-electrical-q27-synchronous-motor-speed-torque-statements', 'Electrical Machines', 'Synchronous Machines', 'Hard', 'C', {
    stem: 'Which set of statements correctly describes the steady state speed-torque characteristics of a three-phase synchronous motor?\n(i) Runs at constant synchronous speed\n(ii) Starting torque is zero\n(iii) Torque increases significantly with slip\n(iv) Not suitable for variable speed drives\n(v) Maintains speed under varying loads',
    options: ['(i), (iii), (iv) and (v) only', '(i), (ii), (iii) and (v) only', '(i), (ii), and (v) only', '(i), (ii), (iii) and (iv) only'],
    quick: 'A synchronous motor runs at synchronous speed, has zero inherent starting torque and holds speed as load changes. Torque depends on load angle, not slip, and converter-fed synchronous motors are used in variable-speed drives.',
    formula: ['N_s = 120f / P', 'Steady slip s = 0'],
  }),
  q(28, 'rrb-je-cbt-2-electrical-q28-spring-control-torque', 'Measurements & Instruments', 'Analog Instruments', 'Easy', 'D', {
    stem: 'Identify the correct equation for controlling torque (T_C) in a spring-controlled moving iron instrument, where K is the spring constant and θ is the deflection angle.',
    options: ['T_C = K/θ', 'T_C = K + θ', 'T_C = K − θ', 'T_C = Kθ'],
    quick: 'A control spring produces restoring torque proportional to deflection: T_C = Kθ. At the final reading, deflecting torque equals controlling torque.',
    formula: ['T_C = Kθ', 'At equilibrium: T_D = T_C'],
  }),
  q(29, 'rrb-je-cbt-2-electrical-q29-kirchhoff-voltage-law', 'Network Theory', "Kirchhoff's Laws", 'Easy', 'B', {
    stem: 'In a closed electrical loop supplied by 10 V, two resistors produce voltage drops of 6 V and 4 V, respectively. Which statement correctly expresses Kirchhoff’s Voltage Law for this loop?',
    options: ['The current through the two resistors is different', 'The algebraic sum of all voltages around the loop is zero', 'The source voltage is greater than the total voltage drop', 'The source voltage is less than the total voltage drop'],
    quick: 'KVL: the algebraic sum of voltages around a closed loop is zero. Here +10 − 6 − 4 = 0 V.',
    formula: ['ΣV = 0', '+10 − 6 − 4 = 0 V'],
  }),
  q(30, 'rrb-je-cbt-2-electrical-q30-slip-ring-vs-squirrel-cage-motor', 'Electrical Machines', 'Induction Motors', 'Moderate', 'C', {
    stem: 'A three-phase slip ring induction motor is preferred over a squirrel cage induction motor for which of the following application scenarios?',
    options: ['When highest efficiency is the only concern', 'When constant speed under all load conditions is needed', 'When variable speed and high starting torque are required', 'When reduced maintenance is the top priority'],
    quick: 'External rotor resistance can be added through the slip rings, giving high starting torque and limited speed control — so slip-ring motors suit those duties.',
    formula: ['s_Tmax = R₂ / X₂ — raising R₂ moves maximum torque toward s = 1'],
  }),
  q(43, 'rrb-je-cbt-2-electrical-q43-cable-conductor-splicing', 'Installation, Earthing & Safety', 'Cables', 'Easy', 'B', {
    stem: 'Which of the following is used to join two cable conductors?',
    options: ['Cable marking', 'Splicing', 'Surface coating', 'Insulation taping'],
    quick: 'A splice makes a mechanically secure, electrically continuous joint between two conductor ends; insulation is then restored over it.',
  }),
];
