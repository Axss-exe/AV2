// Realistic mock intelligence stats for monitored countries, organized by
// filterable category. Values are illustrative estimates for the ATIS
// intelligence platform, not live data.

export interface StatMetric {
  label: string;
  value: string;
  note?: string;
}

export interface CountryStatsProfile {
  agriculture: StatMetric[];
  water: StatMetric[];
  climate: StatMetric[];
  languages: StatMetric[];
  population: StatMetric[];
  economy: StatMetric[];
}

export type StatCategoryKey = keyof CountryStatsProfile;

export const STAT_CATEGORIES: { key: StatCategoryKey; label: string }[] = [
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'water', label: 'Water' },
  { key: 'climate', label: 'Climate' },
  { key: 'languages', label: 'Languages' },
  { key: 'population', label: 'Population' },
  { key: 'economy', label: 'Economy' },
];

export const countryStatsMock: Record<string, CountryStatsProfile> = {
  kenya: {
    agriculture: [
      { label: 'Arable Land', value: '9.8%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '21.2%' },
      { label: 'Workforce in Agriculture', value: '54%' },
      { label: 'Leading Exports', value: 'Tea, coffee, cut flowers, horticulture' },
      { label: 'Irrigated Cropland', value: '1.2%', note: 'high rain-fed dependency' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '63%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '20.2 km³/yr' },
      { label: 'Major Basins', value: 'Lake Victoria, Tana River' },
      { label: 'Water Stress Level', value: 'Medium–High' },
      { label: 'Hydropower Share of Grid', value: '32%' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Tropical, arid highlands' },
      { label: 'Avg. Annual Temperature', value: '24°C (75°F)' },
      { label: 'Annual Rainfall', value: '680 mm' },
      { label: 'Dominant Climate Risk', value: 'Drought cycles (3–5 yr)' },
      { label: 'Rainy Seasons', value: 'Mar–May, Oct–Dec' },
    ],
    languages: [
      { label: 'Official Languages', value: 'Swahili, English' },
      { label: 'Widely Spoken', value: 'Kikuyu, Luo, Kalenjin, Luhya' },
      { label: 'Living Languages', value: '68' },
      { label: 'Business Language', value: 'English' },
    ],
    population: [
      { label: 'Total Population', value: '54.0M' },
      { label: 'Urban Population', value: '28%' },
      { label: 'Median Age', value: '20.1 yrs' },
      { label: 'Population Growth', value: '+1.9%/yr' },
      { label: 'Population Density', value: '94/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$118.1B' },
      { label: 'GDP Growth', value: '+5.4%' },
      { label: 'Key Sectors', value: 'Services 43%, Agriculture 21%, Industry 17%' },
      { label: 'Inflation Rate', value: '6.8%' },
      { label: 'FX Reserves', value: '$7.1B' },
    ],
  },
  tanzania: {
    agriculture: [
      { label: 'Arable Land', value: '14.3%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '26.1%' },
      { label: 'Workforce in Agriculture', value: '65%' },
      { label: 'Leading Exports', value: 'Cashew nuts, coffee, cotton, tobacco' },
      { label: 'Irrigated Cropland', value: '2.1%' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '61%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '84.0 km³/yr' },
      { label: 'Major Basins', value: 'Lake Victoria, Lake Tanganyika, Rufiji' },
      { label: 'Water Stress Level', value: 'Low–Medium' },
      { label: 'Hydropower Share of Grid', value: '30%' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Tropical coastal, semi-arid interior' },
      { label: 'Avg. Annual Temperature', value: '25°C (77°F)' },
      { label: 'Annual Rainfall', value: '1,050 mm' },
      { label: 'Dominant Climate Risk', value: 'Flooding, coastal erosion' },
      { label: 'Rainy Seasons', value: 'Mar–May, Nov–Dec' },
    ],
    languages: [
      { label: 'Official Languages', value: 'Swahili, English' },
      { label: 'Widely Spoken', value: 'Sukuma, Chagga, Nyamwezi' },
      { label: 'Living Languages', value: '126' },
      { label: 'Business Language', value: 'Swahili, English' },
    ],
    population: [
      { label: 'Total Population', value: '63.0M' },
      { label: 'Urban Population', value: '36%' },
      { label: 'Median Age', value: '18.0 yrs' },
      { label: 'Population Growth', value: '+3.0%/yr' },
      { label: 'Population Density', value: '67/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$84.0B' },
      { label: 'GDP Growth', value: '+5.1%' },
      { label: 'Key Sectors', value: 'Agriculture 26%, Services 38%, Mining 12%' },
      { label: 'Inflation Rate', value: '3.4%' },
      { label: 'FX Reserves', value: '$5.6B' },
    ],
  },
  nigeria: {
    agriculture: [
      { label: 'Arable Land', value: '37.3%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '25.2%' },
      { label: 'Workforce in Agriculture', value: '35%' },
      { label: 'Leading Exports', value: 'Cocoa, cassava, sesame, rubber' },
      { label: 'Irrigated Cropland', value: '0.9%', note: 'largely rain-fed smallholder' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '68%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '286.2 km³/yr' },
      { label: 'Major Basins', value: 'Niger River, Lake Chad, Benue' },
      { label: 'Water Stress Level', value: 'Low' },
      { label: 'Hydropower Share of Grid', value: '18%' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Tropical south, semi-arid north (Sahel)' },
      { label: 'Avg. Annual Temperature', value: '27°C (81°F)' },
      { label: 'Annual Rainfall', value: '1,150 mm', note: 'varies sharply north–south' },
      { label: 'Dominant Climate Risk', value: 'Flooding, desertification (north)' },
      { label: 'Rainy Seasons', value: 'Apr–Oct (south), Jun–Sep (north)' },
    ],
    languages: [
      { label: 'Official Language', value: 'English' },
      { label: 'Widely Spoken', value: 'Hausa, Yoruba, Igbo' },
      { label: 'Living Languages', value: '520+' },
      { label: 'Business Language', value: 'English' },
    ],
    population: [
      { label: 'Total Population', value: '218.5M' },
      { label: 'Urban Population', value: '53%' },
      { label: 'Median Age', value: '18.1 yrs' },
      { label: 'Population Growth', value: '+2.4%/yr' },
      { label: 'Population Density', value: '237/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$477.4B' },
      { label: 'GDP Growth', value: '+3.1%' },
      { label: 'Key Sectors', value: 'Services 52%, Oil & Gas 6%, Agriculture 25%' },
      { label: 'Inflation Rate', value: '28.9%' },
      { label: 'FX Reserves', value: '$32.9B' },
    ],
  },
  ghana: {
    agriculture: [
      { label: 'Arable Land', value: '20.9%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '19.0%' },
      { label: 'Workforce in Agriculture', value: '30%' },
      { label: 'Leading Exports', value: 'Cocoa, cashew, shea, palm oil' },
      { label: 'Irrigated Cropland', value: '0.5%' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '86%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '53.2 km³/yr' },
      { label: 'Major Basins', value: 'Volta River, Lake Volta' },
      { label: 'Water Stress Level', value: 'Low' },
      { label: 'Hydropower Share of Grid', value: '41%' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Tropical, savanna north' },
      { label: 'Avg. Annual Temperature', value: '26°C (79°F)' },
      { label: 'Annual Rainfall', value: '1,200 mm' },
      { label: 'Dominant Climate Risk', value: 'Coastal erosion, seasonal flooding' },
      { label: 'Rainy Seasons', value: 'Apr–Jul, Sep–Oct' },
    ],
    languages: [
      { label: 'Official Language', value: 'English' },
      { label: 'Widely Spoken', value: 'Twi, Ewe, Ga, Dagbani' },
      { label: 'Living Languages', value: '81' },
      { label: 'Business Language', value: 'English' },
    ],
    population: [
      { label: 'Total Population', value: '32.4M' },
      { label: 'Urban Population', value: '58%' },
      { label: 'Median Age', value: '21.5 yrs' },
      { label: 'Population Growth', value: '+2.1%/yr' },
      { label: 'Population Density', value: '140/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$76.4B' },
      { label: 'GDP Growth', value: '+2.9%' },
      { label: 'Key Sectors', value: 'Services 46%, Industry 34%, Agriculture 19%' },
      { label: 'Inflation Rate', value: '23.2%' },
      { label: 'FX Reserves', value: '$5.9B' },
    ],
  },
  ethiopia: {
    agriculture: [
      { label: 'Arable Land', value: '15.2%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '32.7%' },
      { label: 'Workforce in Agriculture', value: '66%' },
      { label: 'Leading Exports', value: 'Coffee, oilseeds, khat, flowers' },
      { label: 'Irrigated Cropland', value: '2.7%' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '55%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '122.0 km³/yr' },
      { label: 'Major Basins', value: 'Blue Nile, Awash, Omo' },
      { label: 'Water Stress Level', value: 'Medium' },
      { label: 'Hydropower Share of Grid', value: '90%', note: 'GERD dam capacity ramping' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Highland temperate, lowland arid' },
      { label: 'Avg. Annual Temperature', value: '20°C (68°F)', note: 'highland moderation' },
      { label: 'Annual Rainfall', value: '848 mm' },
      { label: 'Dominant Climate Risk', value: 'Drought, highland erosion' },
      { label: 'Rainy Seasons', value: 'Jun–Sep (Kiremt)' },
    ],
    languages: [
      { label: 'Official Language', value: 'Amharic' },
      { label: 'Widely Spoken', value: 'Oromo, Tigrinya, Somali' },
      { label: 'Living Languages', value: '90+' },
      { label: 'Business Language', value: 'Amharic, English' },
    ],
    population: [
      { label: 'Total Population', value: '126.5M' },
      { label: 'Urban Population', value: '22%' },
      { label: 'Median Age', value: '19.5 yrs' },
      { label: 'Population Growth', value: '+2.6%/yr' },
      { label: 'Population Density', value: '115/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$156.1B' },
      { label: 'GDP Growth', value: '+6.1%' },
      { label: 'Key Sectors', value: 'Agriculture 33%, Services 40%, Industry 27%' },
      { label: 'Inflation Rate', value: '19.9%' },
      { label: 'FX Reserves', value: '$1.4B' },
    ],
  },
  rwanda: {
    agriculture: [
      { label: 'Arable Land', value: '47.4%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '24.0%' },
      { label: 'Workforce in Agriculture', value: '58%' },
      { label: 'Leading Exports', value: 'Coffee, tea, minerals, horticulture' },
      { label: 'Irrigated Cropland', value: '1.8%', note: 'terraced hillside farming' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '76%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '5.2 km³/yr' },
      { label: 'Major Basins', value: 'Lake Kivu, Nyabarongo River' },
      { label: 'Water Stress Level', value: 'Medium' },
      { label: 'Hydropower Share of Grid', value: '48%' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Temperate highland ("Land of a Thousand Hills")' },
      { label: 'Avg. Annual Temperature', value: '19°C (66°F)' },
      { label: 'Annual Rainfall', value: '1,150 mm' },
      { label: 'Dominant Climate Risk', value: 'Landslides, hillside soil erosion' },
      { label: 'Rainy Seasons', value: 'Mar–May, Oct–Dec' },
    ],
    languages: [
      { label: 'Official Languages', value: 'Kinyarwanda, English, French' },
      { label: 'Widely Spoken', value: 'Kinyarwanda (near-universal)' },
      { label: 'Living Languages', value: '4' },
      { label: 'Business Language', value: 'English' },
    ],
    population: [
      { label: 'Total Population', value: '13.9M' },
      { label: 'Urban Population', value: '18%' },
      { label: 'Median Age', value: '20.0 yrs' },
      { label: 'Population Growth', value: '+2.3%/yr' },
      { label: 'Population Density', value: '525/km²', note: 'highest in mainland Africa' },
    ],
    economy: [
      { label: 'GDP', value: '$13.3B' },
      { label: 'GDP Growth', value: '+8.2%' },
      { label: 'Key Sectors', value: 'Services 48%, Agriculture 24%, Industry 20%' },
      { label: 'Inflation Rate', value: '4.9%' },
      { label: 'FX Reserves', value: '$1.9B' },
    ],
  },
  uganda: {
    agriculture: [
      { label: 'Arable Land', value: '34.0%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '23.7%' },
      { label: 'Workforce in Agriculture', value: '62%' },
      { label: 'Leading Exports', value: 'Coffee, tea, fish, tobacco' },
      { label: 'Irrigated Cropland', value: '0.2%' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '65%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '39.0 km³/yr' },
      { label: 'Major Basins', value: 'Lake Victoria, Lake Albert, Nile source' },
      { label: 'Water Stress Level', value: 'Low' },
      { label: 'Hydropower Share of Grid', value: '77%' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Tropical, moderated by altitude' },
      { label: 'Avg. Annual Temperature', value: '22°C (72°F)' },
      { label: 'Annual Rainfall', value: '1,300 mm' },
      { label: 'Dominant Climate Risk', value: 'Flooding, landslides in east' },
      { label: 'Rainy Seasons', value: 'Mar–May, Sep–Nov' },
    ],
    languages: [
      { label: 'Official Languages', value: 'English, Swahili' },
      { label: 'Widely Spoken', value: 'Luganda, Runyankole, Luo' },
      { label: 'Living Languages', value: '43' },
      { label: 'Business Language', value: 'English' },
    ],
    population: [
      { label: 'Total Population', value: '48.6M' },
      { label: 'Urban Population', value: '26%' },
      { label: 'Median Age', value: '16.7 yrs', note: 'one of world\'s youngest' },
      { label: 'Population Growth', value: '+3.0%/yr' },
      { label: 'Population Density', value: '253/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$49.3B' },
      { label: 'GDP Growth', value: '+5.7%' },
      { label: 'Key Sectors', value: 'Services 45%, Agriculture 24%, Industry 26%' },
      { label: 'Inflation Rate', value: '3.5%' },
      { label: 'FX Reserves', value: '$3.4B' },
    ],
  },
  zimbabwe: {
    agriculture: [
      { label: 'Arable Land', value: '10.5%', note: 'of total land area' },
      { label: 'Agriculture Share of GDP', value: '17.3%' },
      { label: 'Workforce in Agriculture', value: '60%' },
      { label: 'Leading Exports', value: 'Tobacco, cotton, horticulture, maize' },
      { label: 'Irrigated Cropland', value: '3.1%' },
    ],
    water: [
      { label: 'Access to Clean Water', value: '68%', note: 'of population' },
      { label: 'Renewable Water Resources', value: '12.3 km³/yr' },
      { label: 'Major Basins', value: 'Zambezi River, Lake Kariba' },
      { label: 'Water Stress Level', value: 'Medium' },
      { label: 'Hydropower Share of Grid', value: '54%', note: 'Kariba Dam dependency' },
    ],
    climate: [
      { label: 'Climate Zone', value: 'Subtropical highveld, semi-arid lowveld' },
      { label: 'Avg. Annual Temperature', value: '21°C (70°F)' },
      { label: 'Annual Rainfall', value: '675 mm' },
      { label: 'Dominant Climate Risk', value: 'Recurrent drought, El Niño exposure' },
      { label: 'Rainy Season', value: 'Nov–Mar' },
    ],
    languages: [
      { label: 'Official Languages', value: 'English, Shona, Ndebele (+13 recognized)' },
      { label: 'Widely Spoken', value: 'Shona, Ndebele' },
      { label: 'Living Languages', value: '16' },
      { label: 'Business Language', value: 'English' },
    ],
    population: [
      { label: 'Total Population', value: '16.7M' },
      { label: 'Urban Population', value: '32%' },
      { label: 'Median Age', value: '19.8 yrs' },
      { label: 'Population Growth', value: '+1.5%/yr' },
      { label: 'Population Density', value: '43/km²' },
    ],
    economy: [
      { label: 'GDP', value: '$26.7B' },
      { label: 'GDP Growth', value: '+3.4%' },
      { label: 'Key Sectors', value: 'Services 51%, Agriculture 17%, Mining 12%' },
      { label: 'Inflation Rate', value: '55.6%', note: 'ZiG currency stabilization ongoing' },
      { label: 'FX Reserves', value: '$0.5B' },
    ],
  },
};
