export type SubsystemKey =
  | 'payload' | 'rf' | 'adcs' | 'eps' | 'thermal'
  | 'ttc' | 'propulsion' | 'solar' | 'obc';

export interface SubsystemData {
  id: SubsystemKey;
  label: string;
  shortLabel: string;
  color: string;
  glowColor: string;
  icon: string;
  tagline: string;
  overview: string;
  specs: { label: string; value: string; unit?: string }[];
  details: string[];
  signals?: SignalStep[];
  funFact: string;
}

export interface SignalStep {
  label: string;
  description: string;
  frequency?: string;
}

export const SUBSYSTEMS: Record<SubsystemKey, SubsystemData> = {
  payload: {
    id: 'payload',
    label: 'Communications Payload',
    shortLabel: 'Payload',
    color: '#C8A44A',
    glowColor: 'rgba(200,164,74,0.4)',
    icon: '📡',
    tagline: 'The revenue-generating heart of the satellite',
    overview:
      'The communications payload is the primary mission equipment of a GEO HTS satellite. It receives uplink signals from Earth, processes them through a complex transponder chain, amplifies them to high power, and retransmits them as downlink signals with precise beam shaping. A modern Ku/Ka-band HTS satellite can carry 100–150 Gbps of aggregate capacity.',
    specs: [
      { label: 'Frequency Band', value: 'Ku (12–18 GHz) + Ka (26.5–40 GHz)' },
      { label: 'Transponders', value: '24–48', unit: 'units' },
      { label: 'Bandwidth per transponder', value: '36–500', unit: 'MHz' },
      { label: 'Total Capacity', value: '100–250', unit: 'Gbps' },
      { label: 'EIRP', value: '50–58', unit: 'dBW' },
      { label: 'G/T (Receive Figure)', value: '3–8', unit: 'dB/K' },
      { label: 'Spot Beams', value: '50–200', unit: 'beams' },
    ],
    details: [
      'Low Noise Amplifiers (LNA) at input: noise figure 1–2 dB',
      'High Power Amplifiers (HPA): TWTA or SSPA, 40–100W per channel',
      'Frequency conversion using local oscillators',
      'Input Multiplexers (IMUX) separate frequency channels',
      'Output Multiplexers (OMUX) recombine channels post-amplification',
      'Digital payload processing enables flexible bandwidth allocation',
      'Phased array antennas enable beam hopping and dynamic coverage',
    ],
    signals: [
      { label: 'User Uplink', description: 'Ku-band 14.0–14.5 GHz or Ka-band 28–30 GHz from user terminals on Earth', frequency: '14–30 GHz' },
      { label: 'LNA Chain', description: 'Low-Noise Amplifier boosts weak signal, maintains sub-2dB noise figure', frequency: 'input' },
      { label: 'Frequency Downconversion', description: 'Mixer + Local Oscillator shifts frequency to IF band for processing', frequency: 'L-band IF' },
      { label: 'IMUX Filtering', description: 'Input multiplexer separates channels into individual transponder bandwidth slots', frequency: 'per channel' },
      { label: 'HPA Amplification', description: 'Traveling Wave Tube Amplifier or SSPA boosts signal to 40–100W for downlink', frequency: 'pre-output' },
      { label: 'User Downlink', description: 'Ku-band 10.7–12.75 GHz or Ka-band 17.3–21.2 GHz to user dishes and VSAT terminals', frequency: '10.7–21 GHz' },
    ],
    funFact: 'A single modern GEO HTS satellite like ViaSat-3 can provide broadband to over 2 million simultaneous users across the Americas.',
  },

  rf: {
    id: 'rf',
    label: 'RF Systems',
    shortLabel: 'RF',
    color: '#5B9CF6',
    glowColor: 'rgba(91,156,246,0.4)',
    icon: '🔊',
    tagline: 'Precision electromagnetic engineering at 40,000 km',
    overview:
      'RF systems encompass the entire electromagnetic signal chain from antenna aperture to first amplifier stage. The antenna subsystem includes deployable mesh reflectors, feed array assemblies, and precise thermal stability mechanisms. Rain fade attenuation in tropical regions (2–10 dB at Ka-band) is compensated through adaptive coding and modulation (ACM) and power control uplink.',
    specs: [
      { label: 'Uplink Freq (Ku)', value: '14.0–14.5', unit: 'GHz' },
      { label: 'Downlink Freq (Ku)', value: '10.7–12.75', unit: 'GHz' },
      { label: 'Main Reflector Diameter', value: '1.5–3.5', unit: 'm' },
      { label: 'Antenna Gain (Rx)', value: '42–50', unit: 'dBi' },
      { label: 'Pointing Accuracy', value: '< 0.05', unit: '° 3σ' },
      { label: 'Rain Attenuation (Ka)', value: '2–30', unit: 'dB (tropical)' },
      { label: 'Cross-Polarization Isolation', value: '> 30', unit: 'dB' },
    ],
    details: [
      'Frequency reuse via dual circular polarization (RHCP/LHCP) doubles capacity',
      'Multi-beam antennas create spot beams for geographic frequency reuse',
      'TWT linearizers (LIN) reduce intermodulation products',
      'Antenna pointing mechanisms compensate for spacecraft attitude error',
      'Ground-based adaptive power control compensates rain fade in real-time',
      'VSAT terminals typically use 75cm–1.2m antennas for Ku-band service',
    ],
    signals: [
      { label: 'Ground Station Uplink', description: 'Gateway Earth station transmits at 250W–500W EIRP in C or Ka gateway band', frequency: '29.5–30 GHz' },
      { label: 'Receive Antenna', description: 'Large mesh reflector collects weak signal, ~10⁻¹² watts at input', frequency: 'receive' },
      { label: 'Polarization Separator', description: 'OMT (Orthomode Transducer) splits RHCP/LHCP polarizations', frequency: '' },
      { label: 'HPA Output', description: 'TWTA driven to saturation for maximum RF power efficiency', frequency: 'transmit' },
      { label: 'Beam Forming', description: 'Feed network shapes beam pattern to desired coverage footprint', frequency: 'output' },
    ],
    funFact: 'GEO satellite signals take 240–280 ms round-trip, which is why real-time voice works but online gaming has noticeable lag over satellite links.',
  },

  adcs: {
    id: 'adcs',
    label: 'Attitude & Orbit Control',
    shortLabel: 'ADCS',
    color: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.4)',
    icon: '🎯',
    tagline: 'Holding Earth at knife-edge precision for 15 years',
    overview:
      'The ADCS maintains the spacecraft within incredibly tight pointing tolerances — antenna beams must stay on target to within 0.05°. This is equivalent to holding a laser pointer steady on a coin from 3 km away, for 15 years, while the spacecraft flexes, thermally distorts, and experiences solar pressure torques. Momentum wheels spin at 4,000–6,000 RPM to store angular momentum, periodically desaturated by firing RCS thrusters.',
    specs: [
      { label: 'Pointing Accuracy', value: '< 0.05', unit: '° (3σ)' },
      { label: 'Reaction Wheels', value: '4', unit: 'units (tetrahedral)' },
      { label: 'Wheel Speed', value: '4,000–6,000', unit: 'RPM' },
      { label: 'Star Trackers', value: '2', unit: 'units' },
      { label: 'Star Tracker Accuracy', value: '3–5', unit: 'arcsec' },
      { label: 'Earth Sensor', value: 'Static IR horizon sensor' },
      { label: 'Sun Sensors', value: '6', unit: 'coarse + 2 fine' },
    ],
    details: [
      'Reaction wheels absorb external torques (solar pressure, gravity gradient)',
      'Wheel desaturation every 1–3 days using RCS thrusters',
      'Magnetic torquers used for low-energy attitude correction',
      'Kalman filter fuses star tracker + gyro data for attitude estimate',
      'Gyroscopes: fiber optic or hemispherical resonator type',
      'N-S stationkeeping burns every 2 weeks with 10N thrusters',
      'E-W stationkeeping maintains longitude within ±0.05° box',
    ],
    funFact: 'GEO satellites drift east or west due to the unequal distribution of Earth\'s mass (geopotential harmonics). Without regular stationkeeping, a GEO satellite would drift to one of four "graveyard valleys" at 75°E, 105°W, 165°E, or 15°W.',
  },

  eps: {
    id: 'eps',
    label: 'Electrical Power System',
    shortLabel: 'EPS',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
    icon: '⚡',
    tagline: 'Solar energy harvested 40,000 km from Earth',
    overview:
      'The EPS harvests solar energy via triple-junction GaAs photovoltaic cells, stores it in lithium-ion batteries, and distributes regulated power to all spacecraft subsystems. At GEO, the solar constant is ~1,361 W/m², and modern solar cells achieve ~30–32% conversion efficiency. The satellite experiences two eclipse seasons per year (spring/fall equinox), each lasting up to 72 minutes per day for 42 days.',
    specs: [
      { label: 'Solar Array Power (BOL)', value: '18,000–25,000', unit: 'W' },
      { label: 'Solar Array Power (EOL)', value: '14,000–20,000', unit: 'W' },
      { label: 'Cell Technology', value: 'Triple-junction InGaP/GaAs/Ge' },
      { label: 'Cell Efficiency', value: '30–32', unit: '%' },
      { label: 'Battery Type', value: 'Lithium-Ion' },
      { label: 'Battery Capacity', value: '150–300', unit: 'Ah' },
      { label: 'Bus Voltage', value: '50V regulated (28V secondary)' },
    ],
    details: [
      'Solar array degradation: ~3.5% per year from radiation and UV',
      'EOL power budget sized to meet payload demand during eclipse at end of 15-year life',
      'Battery depth of discharge (DoD): 30–50% during eclipse periods',
      'Shunt regulators dissipate excess solar power as heat',
      'Power Control and Distribution Unit (PCDU) provides centralized switching',
      'Battery heaters maintain Li-Ion cells above -5°C minimum operating temp',
      'Solar array drive assembly (SADA) rotates panels 1 revolution per day to track Sun',
    ],
    funFact: 'A large GEO satellite\'s solar arrays span about 40 meters — wider than a Boeing 737 — to generate enough power for 5,000 homes worth of electricity.',
  },

  thermal: {
    id: 'thermal',
    label: 'Thermal Control System',
    shortLabel: 'Thermal',
    color: '#EF4444',
    glowColor: 'rgba(239,68,68,0.4)',
    icon: '🌡️',
    tagline: 'Surviving –150°C to +120°C in the harshest environment',
    overview:
      'Thermal control is the unsung engineering hero of spacecraft design. Without it, electronics would freeze on the shadow side and cook on the sun side. The TCS uses a combination of passive and active techniques: Multi-Layer Insulation (MLI) blankets wrap the bus like a golden cocoon, heat pipes distribute thermal loads, north/south-facing radiators dissipate waste heat into deep space, and thermostat-controlled heaters keep batteries and propellant warm.',
    specs: [
      { label: 'Operating Range (electronics)', value: '–20 to +70', unit: '°C' },
      { label: 'Radiator Area (N+S panels)', value: '15–25', unit: 'm²' },
      { label: 'Radiator Temperature', value: '40–80', unit: '°C' },
      { label: 'MLI Emissivity', value: '< 0.03', unit: '(outer layer)' },
      { label: 'Heat Pipe Conductance', value: '3,000–10,000', unit: 'W·m⁻¹' },
      { label: 'Heater Power (total)', value: '500–1,200', unit: 'W' },
      { label: 'Space Environment Temp', value: '–270 to +150', unit: '°C (shadowed/sunlit)' },
    ],
    details: [
      'MLI blankets consist of 20–30 alternating layers of aluminized Kapton and Dacron mesh',
      'Variable conductance heat pipes (VCHP) with ammonia working fluid',
      'Diode heat pipes prevent reverse heat flow during eclipse',
      'North/south radiators chosen because they see cold space, not Sun',
      'Thermoelectric coolers (TEC) used for detector cooling in optical payloads',
      'Surface finishes critical: OSR (Optical Surface Reflector) on radiators, black paint for internal surfaces',
      'Thermal vacuum testing validates design over –180°C to +120°C range',
    ],
    funFact: 'The gold-colored blankets you see on satellites aren\'t for looks — they\'re MLI blankets with polished aluminum outer layers chosen specifically to reflect 97% of solar radiation while also preventing internal heat from escaping to cold space.',
  },

  ttc: {
    id: 'ttc',
    label: 'Telemetry, Tracking & Command',
    shortLabel: 'TT&C',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
    icon: '📻',
    tagline: 'The spacecraft\'s lifeline to Earth',
    overview:
      'TT&C is the nervous system connecting the satellite to its ground control team. It provides a continuous, robust communications link even when the spacecraft is in emergency (survival) mode, tumbling, or experiencing anomalies. The S-band frequencies penetrate the ionosphere reliably and provide hemispherical coverage via omnidirectional biconical antennas — ensuring command uplink is always available regardless of spacecraft attitude.',
    specs: [
      { label: 'Frequency Band', value: 'S-band (2–2.7 GHz)' },
      { label: 'Telemetry Downlink Rate', value: '4–64', unit: 'kbps' },
      { label: 'Command Uplink Rate', value: '2–16', unit: 'kbps' },
      { label: 'Ranging Accuracy', value: '< 1', unit: 'm' },
      { label: 'Antenna Coverage', value: '360°', unit: 'omnidirectional' },
      { label: 'Modulation', value: 'BPSK / QPSK' },
      { label: 'Coding', value: 'Convolutional + Reed-Solomon / Turbo' },
    ],
    details: [
      'Biconical antenna provides hemispherical coverage for all-attitude link',
      'LEOP (Launch and Early Orbit Phase) relies exclusively on TT&C for control',
      'Encrypted command uplink prevents unauthorized control',
      'Pseudo-random ranging codes measure precise satellite range',
      'Doppler tracking provides radial velocity for orbit determination',
      'Transponders kept warm (powered) at all times — autonomous operation on-orbit',
      'Ground stations at 3 sites globally for 24/7 visibility to GEO position',
    ],
    funFact: 'When a satellite anomaly occurs and controllers lose contact, the spacecraft autonomously enters "safe mode" — pointing solar arrays at the Sun, activating beacon transmitters, and awaiting recovery commands from ground for weeks if needed.',
  },

  propulsion: {
    id: 'propulsion',
    label: 'Propulsion System',
    shortLabel: 'Propulsion',
    color: '#F97316',
    glowColor: 'rgba(249,115,22,0.4)',
    icon: '🚀',
    tagline: 'Station-keeping across the orbital graveyard',
    overview:
      'The propulsion system performs two critical mission phases: orbit raising from GTO to GEO (if chemical), and 15-year on-orbit stationkeeping. Modern spacecraft use bipropellant or electric propulsion (Hall thrusters / ion engines). Electric propulsion achieves 10× better specific impulse (Isp ~3,000 s vs 320 s) but takes months to raise orbit. Hybrid designs use chemical for initial orbit insertion and electric for stationkeeping.',
    specs: [
      { label: 'Main Engine Thrust', value: '490', unit: 'N (biprop)' },
      { label: 'Main Engine Isp', value: '315–320', unit: 's' },
      { label: 'Propellant', value: 'MMH / MON-3 (bipropellant)' },
      { label: 'RCS Thrusters', value: '8–10 × 10N' },
      { label: 'Total ΔV (GEO lifecycle)', value: '2,000–2,500', unit: 'm/s' },
      { label: 'Electric Prop Option', value: 'Xenon Hall Thruster, 80–200 mN' },
      { label: 'Electric Isp', value: '1,600–3,000', unit: 's' },
    ],
    details: [
      'Bipropellant (MMH + MON-3) requires hermetically sealed pressurant system',
      'Attitude control thrusters positioned at body corners for torque authority',
      'N-S stationkeeping requires ~45–50 m/s ΔV per year at GEO',
      'E-W stationkeeping requires ~2 m/s ΔV per year (gravity harmonics)',
      'Deorbit at end-of-life requires 11–14 m/s to reach graveyard orbit (GEO+300 km)',
      'Electric propulsion satellites (e.g., Boeing 702SP) carry xenon tanks at bus center',
      'Thruster firing events cause small attitude disturbances compensated by ADCS',
    ],
    funFact: 'An all-electric propulsion satellite saves 3,000–4,000 kg of propellant vs chemical, allowing either a smaller, cheaper launch vehicle or doubling the payload capacity on the same rocket.',
  },

  solar: {
    id: 'solar',
    label: 'Solar Array System',
    shortLabel: 'Solar Arrays',
    color: '#EAB308',
    glowColor: 'rgba(234,179,8,0.4)',
    icon: '☀️',
    tagline: 'Harvesting 1,361 W/m² for 15 years without refueling',
    overview:
      'Solar arrays are the power plant of the spacecraft. Triple-junction gallium arsenide cells — InGaP/GaAs/Ge stacked junctions — capture sunlight across three wavelength ranges simultaneously, achieving ~30% efficiency versus 20% for silicon. Arrays are articulated by Solar Array Drive Assemblies (SADA) to track the Sun with 0.1° accuracy, rotating one full revolution per 24 hours throughout the mission lifetime.',
    specs: [
      { label: 'Cell Technology', value: 'InGaP/GaAs/Ge Triple-Junction' },
      { label: 'Cell Efficiency', value: '30–32', unit: '%' },
      { label: 'Total Array Area', value: '60–100', unit: 'm²' },
      { label: 'Array Span (deployed)', value: '30–40', unit: 'm' },
      { label: 'Mass per wing', value: '80–150', unit: 'kg' },
      { label: 'Degradation rate', value: '~3.5', unit: '% per year' },
      { label: 'Operating voltage', value: '~100', unit: 'V (open circuit)' },
    ],
    details: [
      'Bypass diodes protect individual cells from shadowing cascade failure',
      'AR (anti-reflective) coating applied to each cell surface',
      'Adhesive bonding to carbon fiber substrate for low CTE',
      'Launch stowage: panels fold into compact package, deploy with spring hinges',
      'SADA slip rings provide continuous electrical connection during rotation',
      'Radiation shielding: coverglass thickness optimized for 15-year GEO radiation dose',
      'End-of-life power sizing: BOL × 0.55 typically covers EOL requirements',
    ],
    funFact: 'The solar constant at Earth\'s distance from the Sun is 1,361 W/m². Because GEO is still within 1 Earth-radius of Earth\'s distance from the Sun, the solar irradiance is virtually identical to what you\'d measure on the ground (ignoring atmosphere).',
  },

  obc: {
    id: 'obc',
    label: 'On-Board Computer',
    shortLabel: 'OBC',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.4)',
    icon: '💻',
    tagline: 'A radiation-hardened brain 40,000 km from the nearest repair shop',
    overview:
      'The OBC is the autonomous intelligence of the spacecraft — executing flight software, managing subsystem health, storing telemetry, and responding to ground commands. Every component is radiation-hardened (Rad-Hard) to survive 100 krad total ionizing dose over 15 years in the GEO radiation belt. Triple Modular Redundancy (TMR) logic catches and corrects single-event upsets (SEU) from cosmic ray particles.',
    specs: [
      { label: 'Processor', value: 'LEON3FT / RAD750 RISC' },
      { label: 'Clock Speed', value: '50–200', unit: 'MHz' },
      { label: 'TID Tolerance', value: '100–300', unit: 'krad(Si)' },
      { label: 'Mass Storage', value: '64–256', unit: 'GB solid-state' },
      { label: 'SRAM (scrubbed)', value: '256 MB – 1 GB' },
      { label: 'Software Lines of Code', value: '2–10 million' },
      { label: 'FDIR Response Time', value: '< 1', unit: 'second' },
    ],
    details: [
      'Fault Detection, Isolation, and Recovery (FDIR) handles 200+ anomaly scenarios',
      'Memory scrubbing every 60 seconds clears radiation-induced bit flips',
      'Watchdog timer triggers reboot if software hangs for > 10 seconds',
      'Time-tagged command queue holds 7 days of pre-loaded operations',
      'SpaceWire network (200 Mbps) connects payload, ADCS, and power subsystems',
      'MIL-STD-1553 bus for legacy compatibility with older subsystem interfaces',
      'Autonomous Safe Mode entry on power or attitude anomaly detection',
    ],
    funFact: 'The RAD750 processor used in many space missions is based on the PowerPC G3 chip from 1997 (same family as early iMacs). Its radiation hardness and heritage make it preferred over modern faster chips that haven\'t been space-qualified.',
  },
};

export type MissionScenario = {
  id: string;
  label: string;
  description: string;
  icon: string;
  severity: 'nominal' | 'warning' | 'critical';
  effects: {
    batteryLevel: number;
    solarGeneration: number;
    busVoltage: number;
    thermalState: number;
    rfPower: number;
    throughput: number;
    attitudeError: number;
  };
};

export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    id: 'nominal',
    label: 'Normal Operations',
    description: 'All systems nominal. Full commercial service at rated capacity.',
    icon: '✅',
    severity: 'nominal',
    effects: { batteryLevel: 95, solarGeneration: 18200, busVoltage: 50.2, thermalState: 42, rfPower: 98, throughput: 148, attitudeError: 0.012 },
  },
  {
    id: 'eclipse',
    label: 'Eclipse Period',
    description: 'Earth shadow blocks sunlight. Batteries supply all spacecraft power. Duration: 72 minutes.',
    icon: '🌑',
    severity: 'warning',
    effects: { batteryLevel: 68, solarGeneration: 0, busVoltage: 48.8, thermalState: 28, rfPower: 82, throughput: 120, attitudeError: 0.015 },
  },
  {
    id: 'solar_storm',
    label: 'Solar Storm',
    description: 'Class X solar flare. Increased radiation flux. Memory scrubbing rate elevated 10x.',
    icon: '☀️',
    severity: 'warning',
    effects: { batteryLevel: 90, solarGeneration: 19800, busVoltage: 50.6, thermalState: 65, rfPower: 75, throughput: 95, attitudeError: 0.045 },
  },
  {
    id: 'antenna_misalign',
    label: 'Antenna Misalignment',
    description: 'Payload antenna pointing mechanism fault. Beam 3 off-axis by 0.8°. Service degradation in affected region.',
    icon: '📡',
    severity: 'warning',
    effects: { batteryLevel: 93, solarGeneration: 18100, busVoltage: 50.1, thermalState: 43, rfPower: 60, throughput: 78, attitudeError: 0.82 },
  },
  {
    id: 'battery_degradation',
    label: 'Battery Degradation',
    description: 'Year 13 end-of-life simulation. Battery capacity degraded to 65% nominal. Eclipse operations critical.',
    icon: '🔋',
    severity: 'critical',
    effects: { batteryLevel: 52, solarGeneration: 14800, busVoltage: 47.2, thermalState: 38, rfPower: 70, throughput: 88, attitudeError: 0.025 },
  },
  {
    id: 'momentum_saturation',
    label: 'Momentum Wheel Saturation',
    description: 'Reaction wheel approaching saturation limit. RCS desaturation burn imminent.',
    icon: '🌀',
    severity: 'warning',
    effects: { batteryLevel: 91, solarGeneration: 17900, busVoltage: 50.0, thermalState: 51, rfPower: 95, throughput: 140, attitudeError: 0.18 },
  },
];

export const NAV_SECTIONS = [
  {
    title: 'Explore',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
      { id: '3d-explorer', label: '3D Explorer', icon: '◈' },
      { id: 'subsystems', label: 'Subsystems', icon: '◉' },
    ],
  },
  {
    title: 'Systems',
    items: [
      { id: 'payload', label: 'Payload', icon: '📡' },
      { id: 'rf', label: 'RF Systems', icon: '〜' },
      { id: 'thermal', label: 'Thermal', icon: '◑' },
      { id: 'eps', label: 'Power (EPS)', icon: '⚡' },
      { id: 'adcs', label: 'ADCS', icon: '⊕' },
      { id: 'ttc', label: 'TT&C', icon: '⊙' },
      { id: 'propulsion', label: 'Propulsion', icon: '▲' },
      { id: 'solar', label: 'Solar Arrays', icon: '◈' },
      { id: 'obc', label: 'OBC', icon: '▣' },
    ],
  },
  {
    title: 'Simulate',
    items: [
      { id: 'orbit', label: 'Orbit Simulator', icon: '○' },
      { id: 'coverage', label: 'Coverage Maps', icon: '◎' },
      { id: 'mission', label: 'Mission Builder', icon: '◆' },
    ],
  },
  {
    title: 'Learn',
    items: [
      { id: 'lessons', label: 'Lessons', icon: '◧' },
      { id: 'quizzes', label: 'Quizzes', icon: '◪' },
      { id: 'ai-tutor', label: 'AI Tutor', icon: '◫' },
      { id: 'library', label: 'Data Library', icon: '▦' },
    ],
  },
];
