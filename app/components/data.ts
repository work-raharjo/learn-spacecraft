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

// ─── BRISat (Bank Rakyat Indonesia Satellite) ───────────────────────────────
// Operator   : Bank Rakyat Indonesia (BRI) — state-owned, world's largest
//              microfinance bank
// Bus        : Space Systems/Loral (SSL) SSL-1300
// Launch     : 18 June 2016, Ariane-5 ECA VA230, Kourou (co-passenger EchoStar-18)
// Position   : 150.5°E GEO
// Mass       : ~3,500 kg at launch
// Transponders: 45 total — 27 C-band + 18 Ku-band
// Coverage   : Indonesia (primary), ASEAN, NE Asia, Pacific, West Australia
// Design life: 15+ years (to ~2031+)
// First satellite ever owned and operated by a bank
// ────────────────────────────────────────────────────────────────────────────

export const SUBSYSTEMS: Record<SubsystemKey, SubsystemData> = {
  payload: {
    id: 'payload',
    label: 'C/Ku-Band Communications Payload',
    shortLabel: 'Payload',
    color: '#C8A44A',
    glowColor: 'rgba(200,164,74,0.4)',
    icon: '📡',
    tagline: 'The world\'s first bank-owned satellite payload',
    overview:
      'BRISat carries 45 active transponders — 27 C-band and 18 Ku-band — making it unique as the only GEO satellite owned and operated by a financial institution. C-band transponders handle mission-critical banking transactions across BRI\'s 11,000+ branch network spanning Indonesia\'s 17,000 islands. Ku-band transponders support broadband backhaul and non-financial enterprise services. C-band was chosen as the primary band because its 4–6 GHz frequencies experience far less rain attenuation than Ku-band in Indonesia\'s equatorial climate, ensuring reliable uptime for ATM and teller systems even during tropical downpours.',
    specs: [
      { label: 'Frequency Bands', value: 'C-band + Ku-band' },
      { label: 'Total Transponders', value: '45', unit: 'active' },
      { label: 'C-band Transponders', value: '27', unit: 'units (banking)' },
      { label: 'Ku-band Transponders', value: '18', unit: 'units (broadband)' },
      { label: 'C-band Uplink', value: '5.925–6.425', unit: 'GHz' },
      { label: 'C-band Downlink', value: '3.625–4.200', unit: 'GHz' },
      { label: 'Ku-band Uplink', value: '14.0–14.5', unit: 'GHz' },
      { label: 'Ku-band Downlink', value: '10.7–12.75', unit: 'GHz' },
    ],
    details: [
      'C-band primary mission: real-time banking transactions, ATM networks, inter-branch VSAT, BRI mobile banking',
      'Ku-band secondary mission: enterprise broadband, point-to-point links, VSAT hubs',
      'C-band advantages in tropical Indonesia: ~0.5 dB typical rain fade vs 2–8 dB for Ku-band in Borneo/Papua',
      'High Power Amplifiers (HPA): Travelling Wave Tube Amplifiers (TWTA) per transponder',
      'C-band dish antennas are larger (1.5–3 m) to compensate for lower frequency gain',
      'Frequency reuse via dual circular polarisation extends spectrum efficiency',
      'SSL-1300 platform supports flexible payload power allocation between C and Ku bands',
      'Secure encrypted links for financial data comply with Bank Indonesia cybersecurity regulations',
    ],
    signals: [
      { label: 'BRI Branch Uplink', description: 'VSAT terminal at BRI branch transmits at C-band uplink: 5.925–6.425 GHz toward BRISat at 150.5°E', frequency: '5.925–6.425 GHz' },
      { label: 'BRISat Receive Antenna', description: 'Large C-band dish reflector (~2 m diameter) collects signal from thousands of simultaneous VSAT terminals across Indonesia', frequency: 'C-band Rx' },
      { label: 'LNA & Downconversion', description: 'Low-Noise Amplifier (noise figure < 2 dB) amplifies received signal; mixer downconverts to IF for processing', frequency: 'L-band IF' },
      { label: 'IMUX Channelisation', description: 'Input Multiplexer separates 27 C-band channels (36 MHz each) into individual transponder slots', frequency: 'per channel' },
      { label: 'TWTA Amplification', description: 'Travelling Wave Tube Amplifier boosts each channel to rated output power for downlink', frequency: 'C-band Tx' },
      { label: 'Downlink to BRI Hub', description: 'C-band downlink 3.625–4.200 GHz reaches BRI gateway hub stations and all branch VSAT terminals simultaneously in broadcast mode', frequency: '3.625–4.2 GHz' },
    ],
    funFact: 'BRISat is the world\'s first satellite owned and operated by a bank. Before its launch in 2016, BRI paid tens of millions of dollars annually leasing transponder capacity from other operators. Within a few years BRISat had paid for itself while providing BRI complete control over its banking communications infrastructure.',
  },

  rf: {
    id: 'rf',
    label: 'RF & Antenna Systems',
    shortLabel: 'RF',
    color: '#5B9CF6',
    glowColor: 'rgba(91,156,246,0.4)',
    icon: '🔊',
    tagline: 'Dual-band coverage from Indonesia to the Pacific',
    overview:
      'BRISat\'s RF system comprises multiple reflector antennas on the Earth-facing deck tailored for C-band and Ku-band service areas. The C-band antennas produce a wide national beam covering all of Indonesia plus ASEAN and parts of Northeast Asia and the Pacific, reaching West Australia. Ku-band antennas produce tighter regional beams optimised for Indonesia and the ASEAN region. The sub-satellite point at 150.5°E means BRISat sits over the Pacific Ocean, providing an eastward look angle ideal for Eastern Indonesia coverage.',
    specs: [
      { label: 'C-band Tx Power (per Ch)', value: '~40–60', unit: 'W (TWTA)' },
      { label: 'C-band EIRP (Indonesia)', value: '~38–42', unit: 'dBW' },
      { label: 'Ku-band EIRP (Indonesia)', value: '~46–50', unit: 'dBW' },
      { label: 'C-band G/T', value: '~0 to 3', unit: 'dB/K' },
      { label: 'C-band Main Reflector Ø', value: '~2.0–2.4', unit: 'm' },
      { label: 'Ku-band Reflector Ø', value: '~1.0–1.5', unit: 'm' },
      { label: 'Antenna Pointing Accuracy', value: '< 0.05', unit: '° (3σ)' },
    ],
    details: [
      'C-band national beam covers all 17,000 Indonesian islands from a single footprint',
      'C-band wide-area beam extends to ASEAN, NE Asia (Japan, Korea), Pacific Islands, and West Australia',
      'Ku-band spot beams focus on Indonesia and ASEAN for higher EIRP',
      'Tropical Indonesia rain fade: C-band ~0.3–0.5 dB typical vs Ku ~2–8 dB — key design driver',
      'Antenna feed horns co-located on Earth-deck for combined C/Ku aperture usage',
      'Circular polarisation (RHCP/LHCP) provides 30 dB cross-pol isolation for frequency reuse',
      'Phased-array steering not used; fixed reflectors with APM (Antenna Pointing Mechanism) for fine alignment',
      'Link margins designed for 99.5% annual availability in Indonesia equatorial climate',
    ],
    signals: [
      { label: 'C-band National Uplink', description: 'C-band gateway at BRI headquarters Jakarta transmits at 500W EIRP on 5.9–6.4 GHz to BRISat', frequency: '5.925–6.425 GHz' },
      { label: 'C-band Wide-Area Downlink', description: 'National beam footprint covering Indonesia to ASEAN, NE Asia, and West Australia at 3.625–4.2 GHz', frequency: '3.625–4.2 GHz' },
      { label: 'Ku-band Regional Uplink', description: 'Ku uplink from enterprise gateway: 14.0–14.5 GHz, targeting Indonesia and ASEAN', frequency: '14.0–14.5 GHz' },
      { label: 'Ku-band Spot Downlink', description: 'Higher-EIRP Ku-band beam over Indonesia and ASEAN: 10.7–12.75 GHz', frequency: '10.7–12.75 GHz' },
    ],
    funFact: 'At 150.5°E, BRISat sits over the Pacific Ocean just east of Papua New Guinea. This eastward position gives it excellent visibility over all of Indonesia\'s far-eastern islands (Papua, Maluku) which are the hardest to reach with terrestrial infrastructure — exactly where BRI\'s rural microfinance branches need connectivity most.',
  },

  adcs: {
    id: 'adcs',
    label: 'Attitude Determination & Control',
    shortLabel: 'ADCS',
    color: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.4)',
    icon: '🎯',
    tagline: 'Holding 150.5°E for 15 years, 0.05° at a time',
    overview:
      'BRISat uses 3-axis stabilisation on the SSL-1300 bus, maintaining the C-band and Ku-band antennas pointed at Indonesia and ASEAN to within 0.05° accuracy. At 150.5°E, the satellite must resist solar radiation pressure torques and gravitational perturbations while reaction wheels absorb continuous disturbances. North–South stationkeeping (N/S SK) burns fire every 10–14 days to counteract inclination growth from lunar/solar gravity; East–West stationkeeping holds the ±0.05° longitude box at 150.5°E.',
    specs: [
      { label: 'Stabilisation', value: '3-axis body stabilised' },
      { label: 'Pointing Accuracy', value: '< 0.05', unit: '° (3σ)' },
      { label: 'Reaction Wheels', value: '4', unit: 'units (tetrahedral)' },
      { label: 'Star Trackers', value: '2', unit: 'units' },
      { label: 'Star Tracker Accuracy', value: '3–5', unit: 'arcsec' },
      { label: 'Earth Sensor', value: 'Static IR horizon sensor' },
      { label: 'N/S SK ΔV/year', value: '~45–50', unit: 'm/s' },
      { label: 'E/W SK ΔV/year', value: '~2', unit: 'm/s' },
    ],
    details: [
      'Reaction wheels spin at 4,000–6,000 RPM absorbing solar pressure and gravity gradient torques',
      'Wheel desaturation every 10–14 days using bipropellant RCS thrusters (momentum dumping)',
      'Kalman filter fuses star tracker + hemispherical resonator gyro (HRG) data for attitude estimate',
      'Earth sensor provides coarse Earth direction reference as backup to star trackers',
      '6 coarse Sun sensors + 2 fine Sun sensors for solar array drive pointing accuracy',
      'Solar Array Drive Assembly (SADA) rotates arrays ±180° to track Sun throughout the year',
      'N/S stationkeeping: bipropellant 22N thrusters or Hall thruster NSSK burns at dawn/dusk',
      'At 150.5°E, geopotential harmonics cause modest eastward drift — minimal E/W SK propellant needed',
    ],
    funFact: 'The 150.5°E orbital slot is near one of the four stable "gravity wells" of GEO (around 75°E, 105°W, 15°W, 160°E) where satellites naturally drift. Being near 160°E means BRISat has relatively low E/W stationkeeping propellant consumption compared to satellites in unstable longitude zones.',
  },

  eps: {
    id: 'eps',
    label: 'Electrical Power System',
    shortLabel: 'EPS',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
    icon: '⚡',
    tagline: 'SSL-1300 100V power bus — reliable for 15+ years',
    overview:
      'BRISat\'s power system is based on the SSL-1300 heritage 100-volt regulated bus — a design first pioneered by SSL for high-power direct-to-home satellites. Triple-junction GaAs solar cells generate ~14 kW beginning-of-life power; lithium-ion batteries bridge the two annual eclipse seasons (spring/fall equinox) when Earth\'s shadow falls on the satellite for up to 72 minutes per day. The 100V bus allows more efficient power distribution to C-band and Ku-band TWTAs than lower-voltage designs.',
    specs: [
      { label: 'Bus Voltage', value: '100V regulated (SSL-1300)' },
      { label: 'Solar Array Power (BOL)', value: '~14,000', unit: 'W' },
      { label: 'Solar Array Power (EOL)', value: '~11,000', unit: 'W' },
      { label: 'Cell Technology', value: 'Triple-junction GaAs (InGaP/GaAs/Ge)' },
      { label: 'Cell Efficiency', value: '28–30', unit: '%' },
      { label: 'Battery Type', value: 'Lithium-Ion (Li-Ion)' },
      { label: 'Eclipse Duration (max)', value: '72', unit: 'min (equinox)' },
    ],
    details: [
      'SSL-1300 was the first satellite bus to use a 100V regulated power bus, enabling efficient TWTA operation',
      'Two solar array wings (East + West) with 1-axis solar array drive assemblies for daily Sun tracking',
      'Li-Ion battery depth of discharge (DoD): ≤ 50% at BOL, growing to ~65% at EOL after 15 years',
      'Battery heaters maintain Li-Ion cells above 0°C minimum during eclipse cooling',
      'Shunt regulators dump excess solar power as heat on the North/South radiators during daylight',
      'Power Control and Distribution Unit (PCDU) provides switched power to all subsystems',
      'Solar array degradation: ~3% per year from radiation in GEO Van Allen belts',
      'Two eclipse seasons per year: ~42 days each in spring and autumn around the equinoxes',
    ],
    funFact: 'The SSL-1300 100V bus design originates from the direct-to-home TV satellite era — high-power TWTAs for DTH require more current-efficient voltage. For BRISat, the 100V bus means each C-band TWTA gets clean, stable power for the financial transactions of 53 million BRI customers.',
  },

  thermal: {
    id: 'thermal',
    label: 'Thermal Control System',
    shortLabel: 'Thermal',
    color: '#EF4444',
    glowColor: 'rgba(239,68,68,0.4)',
    icon: '🌡️',
    tagline: 'Gold blankets protecting critical banking infrastructure',
    overview:
      'BRISat\'s thermal system manages heat across an extreme range: the Sun-facing solar arrays can reach +120°C while the shadowed anti-solar panels cool to –150°C in eclipse. The SSL-1300 uses passive thermal control — Multi-Layer Insulation (MLI) blankets (the gold foil seen on satellite photographs), heat pipes embedded in the North and South radiator panels, and optical surface reflectors. Electronics must remain within –20°C to +70°C for reliable operation across the 15-year mission.',
    specs: [
      { label: 'Electronics Op. Range', value: '–20 to +70', unit: '°C' },
      { label: 'Battery Op. Range', value: '0 to +30', unit: '°C' },
      { label: 'N/S Radiator Temp', value: '30 to 75', unit: '°C (operational)' },
      { label: 'MLI Blanket Layers', value: '20–30', unit: 'layers' },
      { label: 'Heat Pipe Working Fluid', value: 'Ammonia' },
      { label: 'Radiator Surface', value: 'OSR (Optical Surface Reflector)' },
      { label: 'Heater Power', value: '400–800', unit: 'W total' },
    ],
    details: [
      'Gold-coloured outer layer is actually aluminized Kapton film reflecting 97% of solar radiation',
      'North and South radiator panels face deep space (< 4K), providing the coldest heat sink available',
      'Ammonia heat pipes carry waste heat from TWTAs and electronics to the N/S radiators passively',
      'Variable conductance heat pipes (VCHP) automatically regulate thermal load as power varies',
      'OSR tiles on radiators have 0.12 emissivity / 0.18 absorptivity for optimal radiator performance',
      'Battery pack heaters activate automatically during eclipse to prevent cold-soak degradation',
      'C-band TWTA waste heat is the largest thermal load — each amplifier dissipates 20–40 W as heat',
      'Thermal vacuum testing at SSL Palo Alto facility validated design over –180°C to +120°C range',
    ],
    funFact: 'The gold appearance of BRISat (visible in SSL press photos) is the 20-layer MLI thermal blanket. Each layer is aluminized Kapton polyimide film — a material developed by DuPont that can withstand the extreme thermal cycling of GEO orbit while being light enough to not significantly impact launch mass budget.',
  },

  ttc: {
    id: 'ttc',
    label: 'Telemetry, Tracking & Command',
    shortLabel: 'TT&C',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
    icon: '📻',
    tagline: 'BRISat\'s lifeline from JKTGND to 150.5°E',
    overview:
      'BRISat\'s TT&C system maintains a continuous communications link with SSL\'s satellite control facility and BRI\'s dedicated mission control in Jakarta (JKTGND). The S-band omnidirectional antennas provide hemispherical coverage ensuring command uplink is always available regardless of spacecraft attitude — critical during Launch and Early Orbit Phase (LEOP) when the satellite was tumbling in GTO before apogee motor firing. SSL operated LEOP before handing over control to BRI\'s own ground team.',
    specs: [
      { label: 'Frequency Band', value: 'S-band (2.025–2.110 GHz)' },
      { label: 'Telemetry Downlink', value: '4–64', unit: 'kbps' },
      { label: 'Command Uplink', value: '2–16', unit: 'kbps' },
      { label: 'Ranging Accuracy', value: '< 1', unit: 'm (two-way)' },
      { label: 'Antenna Coverage', value: '360° / 4π steradians' },
      { label: 'TT&C Stations', value: 'Jakarta (primary) + 2 international' },
      { label: 'Modulation', value: 'BPSK / residual carrier' },
    ],
    details: [
      'Biconical omnidirectional antennas at opposite corners of the satellite bus ensure full sky coverage',
      'SSL conducted 10-day LEOP operations from Palo Alto before transferring to BRI Jakarta ground team',
      'SSL\'s GMV flight dynamics software handles orbit determination and manoeuvre planning',
      'Pseudo-random code ranging (PN code) measures satellite-to-station range to ±1 m accuracy',
      'Doppler shift tracking provides radial velocity for orbit determination alongside TLE updates',
      'Encrypted command uplink prevents spoofing — critical for a financial services satellite',
      'Telemetry: 2,000+ parameters downlinked every 30 seconds for health monitoring',
      'Emergency transmitter activates in safe mode — operates on battery power alone for weeks',
    ],
    funFact: 'After LEOP completion in August 2016, BRI became the first bank in the world with its own satellite operations control room. BRI engineers trained by SSL now conduct all stationkeeping manoeuvres, payload switching, and anomaly resolution — a complete in-house satellite operations capability unprecedented for a financial institution.',
  },

  propulsion: {
    id: 'propulsion',
    label: 'Propulsion System',
    shortLabel: 'Propulsion',
    color: '#F97316',
    glowColor: 'rgba(249,115,22,0.4)',
    icon: '🚀',
    tagline: 'From GTO apogee kick to 15 years of stationkeeping',
    overview:
      'BRISat uses the SSL-1300\'s bipropellant propulsion system for all mission phases: apogee engine firing to circularise orbit from GTO to GEO, North–South stationkeeping (NSSK) every ~10–14 days to counteract lunar/solar perturbations, East–West stationkeeping (EWSK) to hold 150.5°E, and deorbit to graveyard orbit at end of mission (~2031+). The dual-mode system uses Monomethylhydrazine (MMH) fuel and Mixed Oxides of Nitrogen (MON-3) oxidiser for bipropellant burns; NSSK may also use Hall-effect electric thrusters for efficiency.',
    specs: [
      { label: 'Apogee Engine Thrust', value: '~490', unit: 'N (bipropellant)' },
      { label: 'Apogee Engine Isp', value: '~315', unit: 's' },
      { label: 'Propellants', value: 'MMH / MON-3 (bipropellant)' },
      { label: 'RCS Thrusters', value: '8–12 × 22 N' },
      { label: 'Total ΔV (GEO mission)', value: '~2,200–2,500', unit: 'm/s' },
      { label: 'NSSK ΔV/year', value: '~47', unit: 'm/s' },
      { label: 'EOL Deorbit ΔV', value: '~11', unit: 'm/s (graveyard)' },
    ],
    details: [
      'Apogee engine fired 2–3 times over 10 days post-launch to raise orbit from GTO (~35,786 km apogee) to GEO circular',
      'MMH/MON-3 bipropellant: hypergolic (ignite on contact), no igniter required — reliable for 15 years',
      'Hall-effect thrusters (if equipped) provide efficient NSSK: Isp ~1,600 s vs ~315 s for bipropellant',
      'Pressurant system: inert helium gas pressurises propellant tanks for feed to engine',
      'Propellant tanks: two spherical MMH tanks + two MON-3 tanks at bus centre of mass',
      '8 × 22N RCS bi-prop thrusters at bus corners for attitude control and small ΔV manoeuvres',
      'Deorbit reserve: ~11 m/s ΔV to raise perigee from GEO to graveyard orbit (GEO + 300 km)',
      'Propellant mass at launch: ~1,700 kg (approximately half the satellite\'s total launch mass of ~3,500 kg)',
    ],
    funFact: 'BRISat\'s launch mass of ~3,500 kg means roughly 1,700 kg was propellant — nearly half the satellite\'s weight at launch. By end of life, after 15 years of stationkeeping, almost all that propellant has been expended and the dry spacecraft mass (~1,800 kg) is all that remains before disposal to graveyard orbit.',
  },

  solar: {
    id: 'solar',
    label: 'Solar Array System',
    shortLabel: 'Solar Arrays',
    color: '#EAB308',
    glowColor: 'rgba(234,179,8,0.4)',
    icon: '☀️',
    tagline: 'SSL-1300 deployable wings powering 53 million customers',
    overview:
      'BRISat\'s two deployable solar array wings extend from the East and West faces of the SSL-1300 bus, each consisting of multiple GaAs panel sections. Triple-junction InGaP/GaAs/Ge cells achieve ~28–30% efficiency converting sunlight to electricity at GEO\'s 1,361 W/m² solar constant. Solar Array Drive Assemblies (SADAs) rotate the wings continuously to track the Sun\'s apparent annual motion, ensuring maximum power generation throughout the year. At 150.5°E, BRISat experiences two annual eclipse seasons (spring/fall equinox) where Earth shadow interrupts generation for up to 72 minutes per day.',
    specs: [
      { label: 'Cell Technology', value: 'InGaP/GaAs/Ge Triple-Junction' },
      { label: 'Cell Efficiency', value: '28–30', unit: '%' },
      { label: 'Power Output (BOL)', value: '~14,000', unit: 'W' },
      { label: 'Power Output (EOL)', value: '~11,000', unit: 'W' },
      { label: 'Array Wings', value: '2 (East + West)' },
      { label: 'SADA Rotation', value: '1-axis, ±180°' },
      { label: 'Radiation Degradation', value: '~3', unit: '% per year' },
    ],
    details: [
      'SSL-1300 solar arrays are among the most heritage-proven in commercial GEO — over 100 satellites on this platform',
      'Triple-junction cells capture blue (InGaP junction), visible (GaAs junction), and near-IR (Ge junction) light',
      'Coverglass thickness optimised for 15-year GEO radiation dose (~25 krad/year)',
      'Bypass diodes prevent shadowed cell strings from degrading the output of illuminated cells',
      'Each array panel section independently tested; overall wing assembled and folded for launch',
      'SADA slip rings maintain electrical continuity during continuous 360° Sun-tracking rotation',
      'Solar panels stowed parallel to bus during launch; deployment springs extend them on first command post-separation',
      'EOL power sized to meet full payload demand during worst-case eclipse at year 15 of mission',
    ],
    funFact: 'BRISat\'s solar array efficiency advantage over silicon cells means fewer and smaller panels compared to older satellites — yet generates enough power to run 4,000–5,000 average Indonesian households. Every watt of efficiency improvement allows SSL to either shrink the array or add more transponder capacity.',
  },

  obc: {
    id: 'obc',
    label: 'On-Board Computer',
    shortLabel: 'OBC',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.4)',
    icon: '💻',
    tagline: 'Radiation-hardened brain managing banking\'s critical infrastructure',
    overview:
      'BRISat\'s on-board computer (OBC) runs SSL flight software on radiation-hardened processors designed to survive 100 krad total ionising dose over 15 years in the GEO radiation belts. The OBC handles all spacecraft health management, executes stored command sequences (up to 7 days of time-tagged operations), and autonomously responds to anomalies via its Fault Detection, Isolation and Recovery (FDIR) algorithms. For a satellite whose uptime directly affects millions of banking customers, the OBC\'s reliable autonomous operations capability is mission-critical.',
    specs: [
      { label: 'Processor', value: 'RAD-hardened RISC (SSL heritage)' },
      { label: 'TID Tolerance', value: '100–200', unit: 'krad(Si)' },
      { label: 'Mass Memory', value: '64–128', unit: 'GB solid-state' },
      { label: 'Memory Scrubbing', value: 'Every 60 s (elevated 6 s during SEP events)' },
      { label: 'FDIR Response Time', value: '< 1', unit: 's' },
      { label: 'Software Size', value: '2–5', unit: 'million lines of code' },
      { label: 'Uptime Requirement', value: '> 99.9', unit: '%' },
    ],
    details: [
      'Triple Modular Redundancy (TMR) logic votes across 3 independent computation paths to correct SEU errors',
      'Watchdog timer triggers controlled reboot if flight software hangs for > 10 seconds',
      'Safe mode: enters automatically on power or attitude anomaly — maintains Sun pointing on batteries',
      'Time-tagged command queue stores 7+ days of pre-planned operations — critical for unmanned banking infrastructure',
      'MIL-STD-1553 bus connects OBC to ADCS, EPS, and payload management units',
      'SpaceWire links (200 Mbps) handle high-bandwidth payload data streams',
      'FDIR handles 200+ defined fault scenarios autonomously without ground intervention',
      'Software updates can be uplinked and validated on redundant OBC before committing to primary',
    ],
    funFact: 'BRISat\'s OBC must maintain > 99.9% availability because a single extended outage could affect ATM networks, mobile banking, and teller operations for 53 million BRI customers across Indonesia. SSL\'s heritage OBC design on the 1300 platform has demonstrated 15+ year lifetimes without software reloads on many previous satellites.',
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
    description: 'All systems nominal. Full C-band and Ku-band service at rated capacity. BRI banking network fully operational.',
    icon: '✅',
    severity: 'nominal',
    effects: { batteryLevel: 95, solarGeneration: 14200, busVoltage: 100.4, thermalState: 44, rfPower: 98, throughput: 45, attitudeError: 0.012 },
  },
  {
    id: 'eclipse',
    label: 'Eclipse Period',
    description: 'Earth shadow blocks sunlight. Li-Ion batteries supply all spacecraft power for up to 72 min. C-band banking services maintained at reduced capacity.',
    icon: '🌑',
    severity: 'warning',
    effects: { batteryLevel: 68, solarGeneration: 0, busVoltage: 96.2, thermalState: 29, rfPower: 80, throughput: 36, attitudeError: 0.015 },
  },
  {
    id: 'tropical_rain',
    label: 'Indonesian Monsoon',
    description: 'Heavy tropical rainfall over Java and Sumatra. Ku-band links experiencing 4–8 dB rain fade. C-band banking links unaffected — key advantage of C-band choice.',
    icon: '🌧️',
    severity: 'warning',
    effects: { batteryLevel: 93, solarGeneration: 13800, busVoltage: 100.1, thermalState: 46, rfPower: 75, throughput: 28, attitudeError: 0.013 },
  },
  {
    id: 'antenna_misalign',
    label: 'Antenna Pointing Fault',
    description: 'C-band APM (Antenna Pointing Mechanism) fault. National beam 2 off-axis by 0.6°. ATM service degradation reported across eastern Indonesia.',
    icon: '📡',
    severity: 'warning',
    effects: { batteryLevel: 94, solarGeneration: 14100, busVoltage: 100.3, thermalState: 45, rfPower: 62, throughput: 22, attitudeError: 0.62 },
  },
  {
    id: 'battery_eol',
    label: 'End-of-Life Battery',
    description: 'Year 14 EOL simulation. Li-Ion capacity degraded to 62% of BOL. Eclipse period now critical — load shedding of Ku-band transponders required.',
    icon: '🔋',
    severity: 'critical',
    effects: { batteryLevel: 48, solarGeneration: 11200, busVoltage: 93.8, thermalState: 36, rfPower: 68, throughput: 20, attitudeError: 0.025 },
  },
  {
    id: 'momentum_saturation',
    label: 'Momentum Wheel Saturation',
    description: 'Reaction wheel #2 approaching saturation. RCS desaturation burn scheduled in 45 min. Temporary attitude disturbance expected.',
    icon: '🌀',
    severity: 'warning',
    effects: { batteryLevel: 91, solarGeneration: 14000, busVoltage: 100.2, thermalState: 52, rfPower: 95, throughput: 43, attitudeError: 0.19 },
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
