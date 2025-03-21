const satelliteParts: { [key: string]: any[] } = {};

const initialParts = [
  { name: "Eps Storage", temperature: -40 },
  { name: "Obc + Transceptor", temperature: 0 },
  { name: "Lomoboard", temperature: 30 },
  { name: "Pyl Controller", temperature: 70 },
];

const nameToPart = [
  { name: "Eps Storage", part: "21_06_050v2_-_epsstorage1" },
  { name: "Obc + Transceptor", part: "21_03_000v2_-_obc_+_transceptor1" },
  { name: "Lomoboard", part: "21_08_010v2_-lomoboard1" },
  { name: "Pyl Controller", part: "21_01_030v2_-_pylcontroller1" },
]

export { satelliteParts, initialParts, nameToPart };