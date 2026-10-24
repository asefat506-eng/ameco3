export interface RegionalZoneOption {
  value: string;
  label: string;
}

export interface RegionOption {
  value: string;
  label: string;
  type: 'region' | 'city' | 'custom';
}

export const ETHIOPIAN_REGIONS: RegionOption[] = [
  // Chartered Cities
  { value: 'Addis Abeba', label: 'Addis Abeba (City Administration)', type: 'city' },
  { value: 'Dire Dawa', label: 'Dire Dawa (City Administration)', type: 'city' },

  // 12 National Regional States of Ethiopia
  { value: 'Amhara Region', label: 'Amhara Region (አማራ ክልል)', type: 'region' },
  { value: 'Oromia Region', label: 'Oromia Region (ኦሮሚያ ክልል)', type: 'region' },
  { value: 'Tigray Region', label: 'Tigray Region (ትግራይ ክልል)', type: 'region' },
  { value: 'Sidama Region', label: 'Sidama Region (ሲዳማ ክልል)', type: 'region' },
  { value: 'Central Ethiopia Region', label: 'Central Ethiopia Region (ማዕከላዊ ኢትዮጵያ)', type: 'region' },
  { value: 'South Ethiopia Region', label: 'South Ethiopia Region (ደቡብ ኢትዮጵያ)', type: 'region' },
  { value: 'South West Ethiopia Peoples Region', label: "South West Ethiopia Peoples' Region (SWEPR)", type: 'region' },
  { value: 'Somali Region', label: 'Somali Region (ሶማሌ ክልል)', type: 'region' },
  { value: 'Afar Region', label: 'Afar Region (አፋር ክልል)', type: 'region' },
  { value: 'Benishangul-Gumuz Region', label: 'Benishangul-Gumuz Region (ቤኒሻንጉል ጉሙዝ)', type: 'region' },
  { value: 'Gambella Region', label: 'Gambella Region (ጋምቤላ ክልል)', type: 'region' },
  { value: 'Harari Region', label: 'Harari Region (ሐረሪ ክልል)', type: 'region' },

  // Custom & Diaspora Fallback
  { value: 'Others...', label: 'Others... (Specify Custom Region/City/Diaspora)', type: 'custom' },
];

export const REGION_ZONES_MAP: Record<string, string[]> = {
  'Addis Abeba': [
    'Bole Sub-City',
    'Yeka Sub-City',
    'Kirkos Sub-City',
    'Arada Sub-City',
    'Lideta Sub-City',
    'Addis Ketema Sub-City',
    'Gullele Sub-City',
    'Kolfe Keranio Sub-City',
    'Nifas Silk-Lafto Sub-City',
    'Akaki-Kality Sub-City',
    'Lemi Kura Sub-City',
    'Others... (Specify Sub-City/Woreda)',
  ],
  'Dire Dawa': [
    'Sabian Sub-City',
    'Gende Kore Sub-City',
    'Melka Jebdu Sub-City',
    'Dechatu Sub-City',
    'Legehare Sub-City',
    'B-Zone (Rural Dire Dawa Cluster)',
    'Others... (Specify Sub-City/Woreda)',
  ],
  'Amhara Region': [
    'Bahir Dar Special Zone',
    'Central Gondar Zone (Gondar)',
    'North Gondar Zone (Debark)',
    'South Gondar Zone (Debre Tabor)',
    'West Gondar Zone (Gendawuha)',
    'East Gojjam Zone (Debre Markos)',
    'West Gojjam Zone (Finote Selam)',
    'Awi Administrative Zone (Injibara)',
    'North Wollo Zone (Woldiya)',
    'South Wollo Zone (Dessie)',
    'Wag Hemra Zone (Sekota)',
    'North Shewa Zone (Debre Berhan)',
    'Oromia Special Zone (Kemise)',
    'Argobba Special Woreda',
    'Others... (Specify Zone/Woreda)',
  ],
  'Oromia Region': [
    'Sheger City Administration',
    'Finfinne Special Zone',
    'East Shewa Zone (Adama/Bishoftu)',
    'West Shewa Zone (Ambo)',
    'North Shewa Zone (Fiche)',
    'South West Shewa Zone (Waliso)',
    'Arsi Zone (Asella)',
    'West Arsi Zone (Shashemene)',
    'Bale Zone (Robe)',
    'East Bale Zone (Ginnir)',
    'Borena Zone (Yabelo)',
    'West Guji Zone (Bule Hora)',
    'East Guji Zone (Negele Borana)',
    'East Hararghe Zone (Harar/Aweday)',
    'West Hararghe Zone (Chiro)',
    'Jimma Zone (Jimma)',
    'Ilu Aba Bora Zone (Mettu)',
    'Buno Bedele Zone (Bedele)',
    'East Wollega Zone (Nekemte)',
    'West Wollega Zone (Gimbi)',
    'Kelam Wollega Zone (Dembidolo)',
    'Horo Guduru Wollega Zone (Shambu)',
    'Others... (Specify Zone/Woreda)',
  ],
  'Tigray Region': [
    'Mekelle Special Zone',
    'Central Tigray Zone (Axum / Adwa)',
    'Eastern Tigray Zone (Adigrat)',
    'North Western Tigray Zone (Shire Inda Selassie)',
    'South Eastern Tigray Zone',
    'Southern Tigray Zone (Maychew / Alamata)',
    'Western Tigray Zone (Humera)',
    'Others... (Specify Zone/Woreda)',
  ],
  'Sidama Region': [
    'Hawassa City Administration',
    'Northern Sidama Zone',
    'Central Sidama Zone',
    'Southern Sidama Zone',
    'Eastern Sidama Zone',
    'Aleta Chuko Cluster',
    'Yirgalem Special Administration',
    'Boricha Cluster',
    'Others... (Specify Zone/Woreda)',
  ],
  'Central Ethiopia Region': [
    'Gurage Zone (Wolkite)',
    'Silte Zone (Worabe)',
    'Hadiya Zone (Hosaena)',
    'Kembata Zone (Durame)',
    'Halaba Zone (Kulito)',
    'Yem Zone (Saja)',
    'Kebena Special Woreda',
    'Mareko Special Woreda',
    'Tembaro Special Woreda',
    'Others... (Specify Zone/Woreda)',
  ],
  'South Ethiopia Region': [
    'Wolayita Zone (Sodo)',
    'Gamo Zone (Arba Minch)',
    'Gofa Zone (Sawla)',
    'South Omo Zone (Jinka)',
    'Ari Zone',
    'Konso Zone (Karat)',
    'Gedeo Zone (Dilla)',
    'Basketo Zone (Laska)',
    'Dirashe Zone (Gidole)',
    'Burji Zone (Soyama)',
    'Amaro Zone (Kelle)',
    'Ale Zone (Kolango)',
    'Others... (Specify Zone/Woreda)',
  ],
  'South West Ethiopia Peoples Region': [
    'Keffa Zone (Bonga)',
    'Sheka Zone (Tepi)',
    'Bench Sheko Zone (Mizan Teferi)',
    'Dawro Zone (Tarcha)',
    'West Omo Zone (Jemu)',
    'Konta Zone (Ameya)',
    'Others... (Specify Zone/Woreda)',
  ],
  'Somali Region': [
    'Fafan Zone (Jijiga)',
    'Siti Zone (Shinile)',
    'Jarar Zone (Degehabur)',
    'Nogob Zone (Fik)',
    'Erer Zone',
    'Dollo Zone (Warder)',
    'Korahe Zone (Kebri Dahar)',
    'Shabelle Zone (Gode)',
    'Afder Zone (Hargele)',
    'Liben Zone (Filtu)',
    'Daawa Zone',
    'Others... (Specify Zone/Woreda)',
  ],
  'Afar Region': [
    'Awsi Rasu (Zone 1 - Asaita / Semera)',
    'Kilbet Rasu (Zone 2 - Abala)',
    'Gabi Rasu (Zone 3 - Awash)',
    'Fantena Rasu (Zone 4 - Kelewan)',
    'Hari Rasu (Zone 5 - Dalifage)',
    'Others... (Specify Zone/Woreda)',
  ],
  'Benishangul-Gumuz Region': [
    'Assosa Zone (Assosa)',
    'Metekel Zone (Gilgel Beles)',
    'Kamashi Zone (Kamashi)',
    'Mao-Komo Special Woreda',
    'Pawe Special Woreda',
    'Others... (Specify Zone/Woreda)',
  ],
  'Gambella Region': [
    'Anywaa / Anuak Zone',
    'Nuer Zone',
    'Majang Zone',
    'Gambella Special Woreda (Gambella City)',
    'Itang Special Woreda',
    'Others... (Specify Zone/Woreda)',
  ],
  'Harari Region': [
    'Amir Nur Sub-City (Harar Jugol)',
    'Abadir Sub-City',
    'Shenkor Sub-City',
    'Hakim Sub-City',
    'Jin\'Eala Sub-City',
    'Aboker Sub-City',
    'Erer Rural Woreda',
    'Dire Teyara Rural Woreda',
    'Sofi Rural Woreda',
    'Others... (Specify Sub-City/Woreda)',
  ],
  'Others...': [
    'Federal Jurisdiction / National Level',
    'International / Diaspora Community',
    'Others... (Specify Custom Location)',
  ],
};

// Helper: Retrieve all zones belonging to a given Region
export function getZonesForRegion(regionName: string): string[] {
  if (!regionName) return REGION_ZONES_MAP['Amhara Region'] || [];
  
  // Normalization match
  if (REGION_ZONES_MAP[regionName]) {
    return REGION_ZONES_MAP[regionName];
  }

  // Fuzzy match
  const matchingKey = Object.keys(REGION_ZONES_MAP).find(
    (key) =>
      key.toLowerCase() === regionName.toLowerCase() ||
      key.toLowerCase().includes(regionName.toLowerCase()) ||
      regionName.toLowerCase().includes(key.toLowerCase())
  );

  return matchingKey ? REGION_ZONES_MAP[matchingKey] : REGION_ZONES_MAP['Others...'];
}

// Helper: Guess region from a given zone
export function getRegionForZone(zoneName: string): string {
  if (!zoneName) return 'Amhara Region';
  for (const [region, zones] of Object.entries(REGION_ZONES_MAP)) {
    if (zones.some((z) => z.toLowerCase() === zoneName.toLowerCase() || zoneName.toLowerCase().includes(z.toLowerCase()))) {
      return region;
    }
  }
  return 'Amhara Region';
}

// Legacy list for backwards compatibility
export const REGIONAL_ZONES: RegionalZoneOption[] = ETHIOPIAN_REGIONS.map((r) => ({
  value: r.value,
  label: r.label,
}));
