import type { Country, Opportunity, Entity, Article, Trace, QueryHistory } from './types';

export const mockCountries: Country[] = [
  {
    id: 'kenya',
    name: 'Kenya',
    flag: '🇰🇪',
    region: 'East Africa',
    gdp: '$118.1B',
    gdp_growth: '+5.4%',
    population: '54.0M',
    currency: 'Kenyan Shilling (KES)',
    leader: 'President William Ruto',
    capital: 'Nairobi',
    area: '580,367 km²',
    language: 'Swahili, English',
    overview:
      'Kenya is East Africa\'s largest economy, serving as a regional hub for trade, finance, and technology. The country benefits from a well-developed financial sector, a growing tech ecosystem centered in Nairobi, and strategic positioning along Indian Ocean trade routes. Mombasa port handles over 30% of East African imports, reinforcing Kenya\'s logistics dominance.',
    trade_intel: [
      'Mombasa Port handles 32M+ tonnes annually, gateway to Uganda, Rwanda, DRC',
      'SGR (Standard Gauge Railway) reduces Nairobi-Mombasa transit time to 4 hours',
      'Agricultural exports: tea ($1.4B), coffee ($280M), horticulture ($700M)',
      'Kenya Revenue Authority launched Single Window System for trade facilitation',
      'AfCFTA implementation reducing tariffs on 90% of goods traded within continent',
      'Nairobi ranked top African fintech hub; M-Pesa processes $50B+ annually',
    ],
    risks: [
      'Political instability following 2022 election disputes creates regulatory uncertainty',
      'Currency depreciation — KES lost 25% value against USD in 2023',
      'High public debt at 68% of GDP limits infrastructure investment capacity',
      'Climate vulnerability: drought impacts on agricultural supply chains',
    ],
  },
  {
    id: 'tanzania',
    name: 'Tanzania',
    flag: '🇹🇿',
    region: 'East Africa',
    gdp: '$84.0B',
    gdp_growth: '+5.1%',
    population: '63.0M',
    currency: 'Tanzanian Shilling (TZS)',
    leader: 'President Samia Suluhu Hassan',
    capital: 'Dodoma',
    area: '945,087 km²',
    language: 'Swahili, English',
    overview:
      'Tanzania is experiencing a period of economic transformation under President Hassan, with increased openness to foreign investment and private sector engagement. Dar es Salaam serves as a major port city and commercial hub, while the country\'s vast mineral reserves and emerging energy sector present significant opportunities.',
    trade_intel: [
      'Dar es Salaam Port undergoing $500M expansion to handle 28M+ tonnes by 2026',
      'Natural gas reserves estimated at 57 trillion cubic feet — LNG export terminal planned',
      'Mining sector: gold, diamonds, tanzanite contributing 12% of GDP',
      'SGR Phase 1 connecting Dar es Salaam to Dodoma operational since 2023',
      'Tanzania-Zambia TAZARA railway revival under negotiation with Chinese partners',
    ],
    risks: [
      'Regulatory unpredictability in mining sector; recent license revocations',
      'Limited skilled labor pool constrains manufacturing expansion',
      'Infrastructure gaps outside major urban corridors increase logistics costs',
      'Foreign exchange restrictions on profit repatriation deter some investors',
    ],
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    flag: '🇳🇬',
    region: 'West Africa',
    gdp: '$477.4B',
    gdp_growth: '+3.1%',
    population: '218.5M',
    currency: 'Nigerian Naira (NGN)',
    leader: 'President Bola Tinubu',
    capital: 'Abuja',
    area: '923,768 km²',
    language: 'English (official), Hausa, Yoruba, Igbo',
    overview:
      'Nigeria is Africa\'s largest economy by nominal GDP and most populous nation. Despite recent currency devaluation and fuel subsidy removal challenges, Nigeria\'s large consumer market, oil wealth, and growing tech sector continue to attract significant foreign direct investment. Lagos remains one of Africa\'s top financial centers.',
    trade_intel: [
      'Dangote Refinery operational: 650,000 bbl/day capacity reduces fuel import bill by $18B annually',
      'Apapa and Tin Can Island ports handle 85% of Nigeria\'s import/export traffic',
      'Nigeria\'s tech sector attracted $2.1B in venture capital in 2023',
      'ECOWAS trade zone provides preferential access to 400M+ West African consumers',
      'Nigeria-Morocco gas pipeline project: 5,660km, $25B investment under final approval',
    ],
    risks: [
      'Naira devaluation — currency lost 70% value following 2023 FX unification',
      'Security concerns in Niger Delta impact oil production levels',
      'High inflation (28%+) eroding consumer purchasing power',
      'Power supply reliability: grid at 30% capacity creates operational challenges',
    ],
  },
  {
    id: 'ghana',
    name: 'Ghana',
    flag: '🇬🇭',
    region: 'West Africa',
    gdp: '$76.4B',
    gdp_growth: '+2.9%',
    population: '32.4M',
    currency: 'Ghanaian Cedi (GHS)',
    leader: 'President John Mahama',
    capital: 'Accra',
    area: '238,533 km²',
    language: 'English (official)',
    overview:
      'Ghana has historically been praised for its democratic stability and business-friendly environment. Currently navigating IMF-supported debt restructuring, the country is implementing fiscal reforms to restore macroeconomic stability. The Tema Port expansion and Ghana\'s oil production position it as a key West African trade hub.',
    trade_intel: [
      'Tema Port expansion: new 3.5M TEU container terminal operational',
      'Cocoa exports generate $2.2B annually — Ghana is world\'s second largest producer',
      'Ghana has signed 44 Bilateral Investment Treaties (BITs)',
      'Ghana Revenue Authority modernizing customs via GCNet system',
      'Free Zones Authority: 300+ companies operating in designated zones',
    ],
    risks: [
      'IMF debt restructuring program limits government spending capacity',
      'Cedi depreciation impacts import costs across supply chains',
      'Gold sector faces artisanal mining (galamsey) regulatory challenges',
      'Energy sector debt impacting power reliability for manufacturers',
    ],
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia',
    flag: '🇪🇹',
    region: 'East Africa',
    gdp: '$156.1B',
    gdp_growth: '+6.1%',
    population: '126.5M',
    currency: 'Ethiopian Birr (ETB)',
    leader: 'Prime Minister Abiy Ahmed',
    capital: 'Addis Ababa',
    area: '1,104,300 km²',
    language: 'Amharic (official)',
    overview:
      'Ethiopia is the second most populous African nation and among the fastest-growing economies globally. The Addis Ababa-Djibouti railway links the landlocked country to maritime trade routes. Industrial parks and manufacturing zones are attracting significant FDI, particularly in textiles and garments.',
    trade_intel: [
      'Addis Ababa-Djibouti Electric Railway: 756km, reduces transit time by 80%',
      'Hawassa Industrial Park: 25,000 jobs, $250M annual export revenue',
      'Ethiopian Airlines: largest African carrier, facilitating $8B+ in cargo annually',
      'Coffee exports: $1.4B — Ethiopia is birthplace and top African producer',
      'Renewable energy: 60%+ electricity from hydropower, lowest industrial energy costs in region',
    ],
    risks: [
      'Tigray conflict aftermath: ongoing ethnic tensions create security risks in northern regions',
      'Foreign exchange shortage limiting import capacity for industrial inputs',
      'Landlocked status creates dependency on Djibouti port corridor',
      'Birr depreciation — 30%+ devaluation in 2024 following IMF agreement',
    ],
  },
  {
    id: 'rwanda',
    name: 'Rwanda',
    flag: '🇷🇼',
    region: 'East Africa',
    gdp: '$13.3B',
    gdp_growth: '+8.2%',
    population: '14.1M',
    currency: 'Rwandan Franc (RWF)',
    leader: 'President Paul Kagame',
    capital: 'Kigali',
    area: '26,338 km²',
    language: 'Kinyarwanda, French, English',
    overview:
      'Rwanda consistently ranks as one of Africa\'s most business-friendly and least corrupt environments. Despite its small size, the country has positioned itself as a regional service hub and is rapidly developing its MICE (Meetings, Incentives, Conferences, Exhibitions) economy. Kigali is increasingly a continental HQ for multinational organizations.',
    trade_intel: [
      'Doing Business Index: ranked 2nd in Sub-Saharan Africa',
      'Kigali International Airport expansion: new terminal targeting 3M passengers/year',
      'Rwanda Development Board: 7-day business registration process',
      'AfCFTA Secretariat hosted in Accra; Rwanda is lead advocate',
      'Specialty coffee and tea exports: $130M; premium market positioning strategy',
    ],
    risks: [
      'Small domestic market limits consumer-facing investment returns',
      'Regional tensions with DRC affect cross-border trade flows',
      'High reliance on aid (15% of budget) creates fiscal vulnerability',
      'Limited natural resources require services-led growth model',
    ],
  },
  {
    id: 'uganda',
    name: 'Uganda',
    flag: '🇺🇬',
    region: 'East Africa',
    gdp: '$49.3B',
    gdp_growth: '+5.7%',
    population: '47.1M',
    currency: 'Ugandan Shilling (UGX)',
    leader: 'President Yoweri Museveni',
    capital: 'Kampala',
    area: '241,038 km²',
    language: 'English (official), Swahili',
    overview:
      'Uganda is landlocked but benefits from EAC membership and connections to Mombasa port. The anticipated oil production from Albertine Graben fields and the East African Crude Oil Pipeline (EACOP) project are expected to transform the economy. Agriculture remains the backbone, employing 70% of the workforce.',
    trade_intel: [
      'EACOP: 1,443km pipeline to Tanga port; $3.5B FDI, first oil exports expected 2026',
      'Uganda-Kenya Standard Gauge Railway extension under feasibility study',
      'Coffee sector: $800M export revenue; second largest Robusta producer globally',
      'Bujagali Hydropower Dam: 250MW, powering industrial expansion',
      'Kampala Industrial and Business Park: 600+ manufacturers operating',
    ],
    risks: [
      'EACOP controversy: international banks withdrawing financing due to ESG concerns',
      'Anti-Homosexuality Act (2023) triggering donor sanctions and investment pullback',
      'Landlocked position increases transport costs by 30-40% versus coastal peers',
      'Currency volatility linked to commodity price swings',
    ],
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    flag: '🇿🇦',
    region: 'Southern Africa',
    gdp: '$403.0B',
    gdp_growth: '+1.1%',
    population: '60.4M',
    currency: 'South African Rand (ZAR)',
    leader: 'President Cyril Ramaphosa',
    capital: 'Pretoria (administrative)',
    area: '1,221,037 km²',
    language: 'isiZulu, English, Afrikaans (+9 official languages)',
    overview:
      'South Africa is the continent\'s most industrialized economy and a gateway for regional trade, anchored by deep capital markets, a diversified manufacturing base, and the SADC\'s largest logistics network. Ongoing energy constraints and a coalition government following the 2024 elections shape the near-term investment climate, while mining, financial services, and automotive manufacturing remain structural strengths.',
    trade_intel: [
      'Durban Port is Africa\'s busiest container terminal, handling 2.9M+ TEUs annually',
      'Johannesburg Stock Exchange is Africa\'s largest by market capitalization ($1.1T+)',
      'Automotive sector: BMW, VW, Toyota, and Ford plants export 60%+ of vehicles produced',
      'Mining sector: world\'s largest platinum group metals reserves, top-5 gold and chrome producer',
      'Renewable energy IPP program has procured 6GW+ of wind and solar capacity since 2011',
      'SACU and AfCFTA membership provide preferential access to regional consumer markets',
    ],
    risks: [
      'Load-shedding legacy: Eskom generation constraints continue to raise operating costs',
      'Structural unemployment exceeding 32%, concentrated among youth',
      'Government of National Unity coalition (post-2024) creates policy negotiation friction',
      'Freight rail and port inefficiencies at Transnet limit export logistics capacity',
    ],
  },
  {
    id: 'zimbabwe',
    name: 'Zimbabwe',
    flag: '🇿🇼',
    region: 'Southern Africa',
    gdp: '$26.7B',
    gdp_growth: '+3.4%',
    population: '16.7M',
    currency: 'Zimbabwe Gold (ZiG) / US Dollar (multi-currency)',
    leader: 'President Emmerson Mnangagwa',
    capital: 'Harare',
    area: '390,757 km²',
    language: 'English, Shona, Ndebele (16 official languages)',
    overview:
      'Zimbabwe holds some of the region\'s richest mineral endowments — including the Great Dyke\'s platinum and lithium reserves — alongside a fertile agricultural base historically centered on tobacco. The 2024 introduction of the gold-backed ZiG currency aims to break a cycle of hyperinflation, while mining sector FDI, particularly in battery metals, is driving renewed investor interest despite lingering sanctions-related friction.',
    trade_intel: [
      'Great Dyke: world-class platinum group metals belt, 2nd largest global reserve',
      'Lithium exports surging — 23M+ tonne reserve base attracting Chinese battery-metal investment',
      'Tobacco exports generate $1B+ annually; Zimbabwe is Africa\'s top flue-cured producer',
      'Kariba Dam supplies 1,050MW of hydropower, the region\'s largest single hydro asset',
      'Special Economic Zones offering tax incentives for mineral beneficiation projects',
    ],
    risks: [
      'ZiG currency stabilization still fragile after decades of hyperinflation',
      'US and EU targeted sanctions on select officials complicate correspondent banking',
      'Land reform legacy continues to affect agricultural title and financing access',
      'Drought exposure tied to El Niño cycles threatens maize output and Kariba generation',
    ],
  },
  {
    id: 'zambia',
    name: 'Zambia',
    flag: '🇿🇲',
    region: 'Southern Africa',
    gdp: '$28.2B',
    gdp_growth: '+4.7%',
    population: '20.6M',
    currency: 'Zambian Kwacha (ZMW)',
    leader: 'President Hakainde Hichilema',
    capital: 'Lusaka',
    area: '752,618 km²',
    language: 'English (official), Bemba, Nyanja',
    overview:
      'Zambia is Africa\'s second-largest copper producer, with an economy tightly linked to global battery-metal demand. Following a landmark 2020 Eurobond default, the country completed a G20 Common Framework debt restructuring, restoring some investor confidence. The Lobito Corridor rail revival, connecting Zambia\'s Copperbelt to Angola\'s Atlantic coast, is reshaping regional export logistics.',
    trade_intel: [
      'Copper accounts for 70%+ of export earnings; Zambia produces 800,000+ tonnes annually',
      'Lobito Corridor rail rehabilitation cuts Copperbelt-to-Atlantic transit time significantly',
      'Agriculture diversification: maize and soybean output expanding under Farmer Input Support',
      'Zambia-DRC border crossing at Kasumbalesa is a critical copper-cobalt belt trade artery',
      'Lower Kafue Gorge and Kariba hydro assets anchor regional power trading via Southern Africa Power Pool',
    ],
    risks: [
      'Copper price volatility directly drives fiscal revenue and currency swings',
      'Post-restructuring debt service still consumes a significant share of government revenue',
      'Kariba Dam water levels tied to drought cycles threaten hydropower-dependent grid',
      'Landlocked geography raises logistics costs 25-30% versus coastal peers',
    ],
  },
  {
    id: 'botswana',
    name: 'Botswana',
    flag: '🇧🇼',
    region: 'Southern Africa',
    gdp: '$20.4B',
    gdp_growth: '+1.6%',
    population: '2.5M',
    currency: 'Botswana Pula (BWP)',
    leader: 'President Duma Boko',
    capital: 'Gaborone',
    area: '581,730 km²',
    language: 'English (official), Setswana',
    overview:
      'Botswana is a diamond-driven upper-middle-income economy with one of Africa\'s strongest governance and fiscal management track records. The 2024 change in government ended nearly six decades of single-party rule, bringing renewed focus on economic diversification as global demand for natural diamonds softens against lab-grown competition.',
    trade_intel: [
      'Debswana joint venture with De Beers accounts for 80%+ of diamond export value',
      'Beef exports to the EU under longstanding preferential quota arrangements',
      'Okavango Delta and Chobe tourism follow a high-value, low-volume conservation model',
      'Botswana Stock Exchange serves as a regional listing venue for SADC-linked issuers',
      'Sovereign wealth fund (Pula Fund) provides fiscal buffer against diamond price cycles',
    ],
    risks: [
      'Natural diamond demand softening amid lab-grown substitution and reduced De Beers sales',
      'Narrow economic base with limited manufacturing diversification to date',
      'Recurrent drought reduces cattle herd productivity and rural incomes',
      'New government transition (2024) creates near-term policy continuity questions',
    ],
  },
  {
    id: 'namibia',
    name: 'Namibia',
    flag: '🇳🇦',
    region: 'Southern Africa',
    gdp: '$12.8B',
    gdp_growth: '+3.7%',
    population: '3.0M',
    currency: 'Namibian Dollar (NAD, pegged to ZAR)',
    leader: 'President Netumbo Nandi-Ndaitwah',
    capital: 'Windhoek',
    area: '825,615 km²',
    language: 'English (official), Afrikaans, Oshiwambo',
    overview:
      'Namibia is emerging as a frontier oil and gas province following major offshore discoveries in the Orange Basin, alongside its established position as one of the world\'s top uranium producers. The government is pursuing an ambitious green hydrogen strategy to leverage abundant solar and wind resources, positioning Walvis Bay as a key regional export gateway.',
    trade_intel: [
      'Orange Basin discoveries (Venus, Graff fields) by Shell and TotalEnergies target first oil by 2030',
      'Husab mine ranks among the world\'s 3rd largest uranium operations',
      'Walvis Bay port serves as the primary maritime gateway for landlocked SADC states',
      'Green hydrogen hub project targets multi-billion dollar investment in Southern Namibia',
      'Diamond marine mining (Debmarine) contributes significant offshore export revenue',
    ],
    risks: [
      'Offshore oil project execution and timeline risk before first production',
      'Severe and recurrent drought strains water security and livestock farming',
      'Small domestic market limits consumer-facing investment scale',
      'High income inequality (among world\'s highest Gini coefficients) creates social risk',
    ],
  },
  {
    id: 'mozambique',
    name: 'Mozambique',
    flag: '🇲🇿',
    region: 'Southern Africa',
    gdp: '$21.2B',
    gdp_growth: '+4.0%',
    population: '34.6M',
    currency: 'Mozambican Metical (MZN)',
    leader: 'President Daniel Chapo',
    capital: 'Maputo',
    area: '801,590 km²',
    language: 'Portuguese (official)',
    overview:
      'Mozambique\'s economy is increasingly shaped by the Cabo Delgado LNG projects, among the largest FDI commitments in African history, alongside its role as the primary port corridor for landlocked neighbors including Zimbabwe, Malawi, and Zambia. Security stabilization in the north has allowed a phased restart of stalled gas developments.',
    trade_intel: [
      'TotalEnergies and ExxonMobil LNG projects represent $20B+ in committed investment',
      'Maputo Corridor is the principal trade route linking South Africa\'s Gauteng province to the coast',
      'Beira and Nacala corridors carry coal exports from Tete province coal basins',
      'Mozal aluminum smelter is one of the largest industrial exporters in the country',
      'Port of Maputo container throughput has grown steadily on regional transshipment demand',
    ],
    risks: [
      'Cabo Delgado insurgency remains a security risk to LNG project execution',
      'High cyclone and flood vulnerability along the Indian Ocean coastline',
      'Legacy of the 2016 hidden debt scandal continues to affect creditor relations',
      'Metical currency stability dependent on donor and IMF program support',
    ],
  },
  {
    id: 'angola',
    name: 'Angola',
    flag: '🇦🇴',
    region: 'Southern Africa',
    gdp: '$92.0B',
    gdp_growth: '+2.6%',
    population: '36.7M',
    currency: 'Angolan Kwanza (AOA)',
    leader: 'President João Lourenço',
    capital: 'Luanda',
    area: '1,246,700 km²',
    language: 'Portuguese (official)',
    overview:
      'Angola remains one of Africa\'s largest oil producers, with an economy still heavily weighted toward hydrocarbons despite active diversification efforts. The Lobito Atlantic Railway, backed by US and EU infrastructure financing, is repositioning Angola as a critical minerals export corridor for the DRC-Zambia copper-cobalt belt, reducing reliance on oil revenue over the medium term.',
    trade_intel: [
      'Oil exports account for 90%+ of export revenue and roughly a third of GDP',
      'Lobito Atlantic Railway links the DRC/Zambia copper-cobalt belt to the Port of Lobito',
      'Angola LNG facility adds a second hydrocarbon export stream beyond crude oil',
      'Catoca diamond mine is among the world\'s top-5 producers by carat volume',
      'US Development Finance Corporation and EU Global Gateway financing back corridor infrastructure',
    ],
    risks: [
      'Oil price dependency drives fiscal revenue and kwanza exchange rate volatility',
      'High public debt-to-GDP ratio constrains non-oil infrastructure spending',
      'Economic diversification outside energy and mining remains at an early stage',
      'Subsidy reform (fuel) has triggered periodic social unrest',
    ],
  },
  {
    id: 'malawi',
    name: 'Malawi',
    flag: '🇲🇼',
    region: 'Southern Africa',
    gdp: '$13.1B',
    gdp_growth: '+1.8%',
    population: '21.2M',
    currency: 'Malawian Kwacha (MWK)',
    leader: 'President Peter Mutharika',
    capital: 'Lilongwe',
    area: '118,484 km²',
    language: 'English (official), Chichewa',
    overview:
      'Malawi\'s agriculture-dependent economy remains among the world\'s least diversified, with tobacco exports historically underpinning foreign exchange earnings. A 44% currency devaluation in late 2023 under an IMF-backed program aims to correct chronic FX shortages, while recurring cyclones and drought continue to strain food security and rural livelihoods.',
    trade_intel: [
      'Tobacco exports generate 50%+ of total export earnings',
      'Shire-Zambezi Waterway project aims to cut landlocked logistics costs to coastal ports',
      'Macadamia and tea exports are expanding as diversification priorities',
      'Kangankunde rare earth deposit attracting early-stage mining investment interest',
      'IMF Extended Credit Facility program supports ongoing fiscal and FX reforms',
    ],
    risks: [
      'Recurrent cyclone and drought damage (Cyclone Freddy, 2023) disrupts agricultural output',
      'Heavy dependence on tobacco exports and donor aid limits fiscal flexibility',
      '2023 kwacha devaluation (44%) continues to work through import price pass-through',
      'Persistent foreign exchange shortages constrain fuel and input imports',
    ],
  },
  {
    id: 'lesotho',
    name: 'Lesotho',
    flag: '🇱🇸',
    region: 'Southern Africa',
    gdp: '$2.3B',
    gdp_growth: '+2.3%',
    population: '2.3M',
    currency: 'Lesotho Loti (LSL, pegged to ZAR)',
    leader: 'Prime Minister Sam Matekane',
    capital: 'Maseru',
    area: '30,355 km²',
    language: 'Sesotho, English (official)',
    overview:
      'Lesotho is fully enclaved within South Africa, giving it an economy deeply intertwined with its neighbor through SACU revenue sharing, labor migration, and the Lesotho Highlands Water Project, which exports water to South Africa\'s industrial heartland for royalty income. AGOA-linked garment manufacturing remains the country\'s largest formal-sector employer.',
    trade_intel: [
      'AGOA-driven garment exports to the US supply denim and apparel for major retail brands',
      'Lesotho Highlands Water Project generates ongoing royalty revenue from water exports to Gauteng',
      'Letšeng diamond mine is renowned for producing exceptionally large, high-value stones',
      'SACU customs revenue sharing provides a substantial share of the national budget',
    ],
    risks: [
      'Near-total economic dependence on the South African economy and rand peg',
      'AGOA renewal uncertainty threatens the garment sector\'s primary export market',
      'Narrow export base concentrated in textiles, water, and diamonds',
      'High HIV prevalence continues to affect workforce productivity and health spending',
    ],
  },
  {
    id: 'eswatini',
    name: 'Eswatini',
    flag: '🇸🇿',
    region: 'Southern Africa',
    gdp: '$4.7B',
    gdp_growth: '+4.7%',
    population: '1.2M',
    currency: 'Lilangeni (SZL, pegged to ZAR)',
    leader: 'King Mswati III (Prime Minister Russell Dlamini)',
    capital: 'Mbabane (administrative), Lobamba (legislative)',
    area: '17,364 km²',
    language: 'siSwati, English (official)',
    overview:
      'Eswatini, Africa\'s last remaining absolute monarchy, runs a small but stable SACU-linked economy anchored by sugar production, soft drink concentrate manufacturing, and AGOA-eligible textile exports. Coca-Cola\'s concentrate plant in Eswatini is among the largest outside the United States and the country\'s single biggest formal employer.',
    trade_intel: [
      'Coca-Cola Eswatini concentrate plant is the largest employer and a major export earner',
      'Sugar exports benefit from preferential quota access to EU and US markets',
      'SACU customs revenue sharing funds roughly 40%+ of the national government budget',
      'Textile and apparel exports under AGOA supply regional and US retail markets',
    ],
    risks: [
      'AGOA eligibility faces periodic scrutiny over political and labor rights conditions',
      'Absolute monarchy governance model carries political risk following 2021 pro-democracy protests',
      'SACU revenue volatility tied to regional trade cycles affects fiscal planning',
      'Narrow economic base concentrated in sugar, concentrate manufacturing, and textiles',
    ],
  },
  {
    id: 'madagascar',
    name: 'Madagascar',
    flag: '🇲🇬',
    region: 'Southern Africa',
    gdp: '$16.9B',
    gdp_growth: '+4.5%',
    population: '30.3M',
    currency: 'Malagasy Ariary (MGA)',
    leader: 'Transitional Government (following 2025 political transition)',
    capital: 'Antananarivo',
    area: '587,041 km²',
    language: 'Malagasy, French (official)',
    overview:
      'Madagascar, the world\'s fourth-largest island, combines exceptional biodiversity — over 90% of species found nowhere else — with global leadership in vanilla exports and a growing mining sector anchored by the Ambatovy nickel-cobalt operation. Recurring political instability, including a 2025 transition, continues to weigh on longer-term investment planning.',
    trade_intel: [
      'World\'s largest vanilla producer, supplying roughly 80% of global vanilla exports',
      'Ambatovy nickel-cobalt mine is among the world\'s largest laterite mining operations',
      'Ecotourism growth around Andasibe and Isalo national parks draws premium visitor spend',
      'Textile and apparel exports have historically leveraged AGOA preferential access when eligible',
    ],
    risks: [
      'Recurring political instability and transitions create persistent policy uncertainty',
      'High exposure to Indian Ocean cyclones causes recurrent infrastructure and crop damage',
      'Deforestation pressure threatens biodiversity assets central to ecotourism revenue',
      'AGOA eligibility has historically been sensitive to political transitions',
    ],
  },
  {
    id: 'mauritius',
    name: 'Mauritius',
    flag: '🇲🇺',
    region: 'Southern Africa',
    gdp: '$16.6B',
    gdp_growth: '+5.0%',
    population: '1.3M',
    currency: 'Mauritian Rupee (MUR)',
    leader: 'Prime Minister Navin Ramgoolam',
    capital: 'Port Louis',
    area: '2,040 km²',
    language: 'English (official), French, Mauritian Creole',
    overview:
      'Mauritius is consistently ranked as one of Africa\'s most business-friendly economies, having transitioned from a sugar and textile base toward financial services, fintech, and high-value tourism. Its International Financial Centre hosts a dense network of global business entities, leveraging an extensive double taxation treaty network to channel investment across Africa and Asia.',
    trade_intel: [
      'Mauritius International Financial Centre hosts 1,000+ global business companies',
      'Tourism receipts exceed $1.8B annually, anchored by a luxury resort market positioning',
      'Double taxation treaty network with India and African states attracts structured investment flows',
      'Textile sector has shifted toward higher-value garment manufacturing and design services',
    ],
    risks: [
      'Narrow economic base concentrated in tourism and financial services',
      'Small island climate exposure to cyclones and rising sea levels',
      'Periodic OECD/EU tax transparency scrutiny affects financial services reputation',
      'Rising regional labor cost competition from lower-cost manufacturing hubs',
    ],
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'OPP-002',
    title: 'Agricultural Machinery Export to East Africa',
    subtitle: 'Mechanization of smallholder farming through precision equipment distribution',
    markets: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia'],
    value: '$42M',
    duration: '18 months',
    status: 'active',
    validation_score: '92%',
    transaction_perimeter:
      'Export of mid-range agricultural machinery (tractors, planters, harvesters) from manufacturing hubs in India and China to smallholder farming cooperatives across East Africa. Distribution via established agrodealer networks in Kenya and Tanzania, with last-mile logistics partnerships for Ethiopia and Uganda corridors. Financing facilitated through AGRA SmallHolder Initiative grants and development finance institution (DFI) co-investment mechanisms.',
    operational_roadmap: [
      { phase: 'Phase 1', duration: '0–3 months', milestone: 'Regulatory approvals: KEBS type-testing, TBS certifications for all equipment models' },
      { phase: 'Phase 2', duration: '3–6 months', milestone: 'Distribution partnership agreements with top 3 agrodealer networks in Kenya and Tanzania' },
      { phase: 'Phase 3', duration: '6–12 months', milestone: 'First shipment: 500 units, Mombasa port clearance, inland distribution activation' },
      { phase: 'Phase 4', duration: '12–18 months', milestone: 'Scale to Ethiopia and Uganda corridors; DFI financing facility operational' },
    ],
    direct_action_matrix: [
      'Obtain KEBS import type-approval certificate for all tractor models',
      'Register with TBS (Tanzania Bureau of Standards) for equipment certification',
      'Negotiate MOU with Kenya Farmers Association for pilot distribution',
      'Engage AGRA for SmallHolder Mechanization Fund co-investment terms',
      'Source DFI letters of credit from AfDB or IFC for buyer financing',
      'Establish bonded warehouse at Mombasa port for inventory staging',
      'Recruit 2 regional sales managers (Nairobi + Dar es Salaam)',
      'Complete phytosanitary compliance documentation for all markets',
    ],
  },
  {
    id: 'OPP-003',
    title: 'Cross-Border Logistics Network Expansion',
    subtitle: 'Last-mile freight consolidation across the EAC corridor',
    markets: ['Kenya', 'Rwanda', 'Uganda'],
    value: '$28M',
    duration: '24 months',
    status: 'active',
    validation_score: '87%',
    transaction_perimeter:
      'Development of an integrated cross-border logistics platform serving the Northern Corridor (Mombasa-Nairobi-Kampala-Kigali). Services include freight consolidation, bonded trucking, customs brokerage, and real-time cargo tracking. Target clientele: SME importers and exporters who currently rely on fragmented spot-market logistics. Revenue model combines per-shipment margins with monthly subscription SaaS components for tracking and compliance.',
    operational_roadmap: [
      { phase: 'Phase 1', duration: '0–4 months', milestone: 'Incorporate EAC regional entity; obtain freight forwarder licenses in Kenya, Uganda, Rwanda' },
      { phase: 'Phase 2', duration: '4–8 months', milestone: 'Platform build: TMS (Transport Management System) integration with KESWS and Rwanda Revenue Authority APIs' },
      { phase: 'Phase 3', duration: '8–16 months', milestone: 'Launch bonded trucking service: 20 vehicles, Mombasa–Kigali primary corridor' },
      { phase: 'Phase 4', duration: '16–24 months', milestone: 'Expand to secondary corridors (Nairobi–Addis Ababa, Mombasa–Bujumbura)' },
    ],
    direct_action_matrix: [
      'Apply for EAC One Area Network Operator License',
      'Register as Customs Agent with KRA (Kenya Revenue Authority)',
      'Integrate with KESWS (Kenya Electronic Single Window System)',
      'Negotiate fleet lease agreements with 3 truck operators in Nairobi, Kampala, Kigali',
      'Obtain COMESA Yellow Card insurance coverage for cross-border fleet',
      'Set up bonded warehouse facilities at Malaba and Gatuna border posts',
      'Build API integrations: RRA, URA, KRA customs portals',
      'Hire regional compliance officers (3 FTE across corridors)',
    ],
  },
  {
    id: 'OPP-004',
    title: 'Renewable Energy Grid Modernization',
    subtitle: 'Solar-storage hybrid deployment for industrial and commercial consumers',
    markets: ['Nigeria', 'Ghana', 'Kenya'],
    value: '$85M',
    duration: '30 months',
    status: 'active',
    validation_score: '78%',
    transaction_perimeter:
      'Engineering, Procurement and Construction (EPC) contracts for solar-battery hybrid microgrids serving industrial parks and commercial complexes in Nigeria, Ghana, and Kenya. Project targets facilities consuming 500kW–5MW with unreliable grid connections. Financing structured as a blend of equity (30%), green bonds (40%), and DFI concessional debt (30%). Carbon credit monetization through Gold Standard VER certification provides ancillary revenue stream.',
    operational_roadmap: [
      { phase: 'Phase 1', duration: '0–6 months', milestone: 'Site assessments: 50 sites across 3 countries; bankable feasibility studies completed' },
      { phase: 'Phase 2', duration: '6–12 months', milestone: 'EPC contracts signed for Pilot Phase (5 sites); Green bond prospectus issued' },
      { phase: 'Phase 3', duration: '12–24 months', milestone: 'Construction and commissioning: Pilot Phase sites; Gold Standard application filed' },
      { phase: 'Phase 4', duration: '24–30 months', milestone: 'Scale Phase: 20 additional sites; VER credits begin generating revenue' },
    ],
    direct_action_matrix: [
      'Obtain NERC EPC contractor license (Nigeria)',
      'Register with PURC (Ghana) as Independent Power Producer',
      'File Energy Storage System approval with EPRA (Kenya)',
      'Engage SunFunder and RE:Finance Africa for green bond structuring',
      'Apply for IFC EDGE green building certification for qualifying sites',
      'Negotiate Power Purchase Agreements (PPAs) with anchor industrial clients',
      'Source lithium iron phosphate (LFP) battery modules: 3 competing bids',
      'Apply for AfDB Sustainable Energy Fund for Africa (SEFA) grant',
    ],
  },
  {
    id: 'OPP-005',
    title: 'Pharmaceutical Distribution Network',
    subtitle: 'Cold-chain logistics infrastructure for essential medicines across West Africa',
    markets: ['Nigeria', 'Ghana', 'Rwanda'],
    value: '$31M',
    duration: '20 months',
    status: 'pending',
    validation_score: '83%',
    transaction_perimeter:
      'Establishment of a temperature-controlled pharmaceutical distribution network connecting WHO-prequalified manufacturers to last-mile healthcare facilities. Network covers 3 hub cities (Lagos, Accra, Kigali) with 12 spoke distribution points. Compliance with WHO GDP (Good Distribution Practice) and each country\'s medicine regulatory authority standards is mandatory. Revenue from distribution margin (12–18%) plus government procurement facilitation fees.',
    operational_roadmap: [
      { phase: 'Phase 1', duration: '0–4 months', milestone: 'Regulatory submissions: NAFDAC (Nigeria), FDA Ghana, Rwanda FDA licensing applications' },
      { phase: 'Phase 2', duration: '4–10 months', milestone: 'Cold chain infrastructure: 3 GDP-compliant hub warehouses; temperature monitoring IoT deployment' },
      { phase: 'Phase 3', duration: '10–16 months', milestone: 'Pilot distribution: first 5 pharmaceutical manufacturers onboarded; government tender applications' },
      { phase: 'Phase 4', duration: '16–20 months', milestone: 'Network at full capacity: 12 spoke points active; government supply chain contracts secured' },
    ],
    direct_action_matrix: [
      'File NAFDAC wholesale distribution license application',
      'Obtain FDA Ghana authorization for pharmaceutical distributor',
      'Apply for Rwanda FDA Good Distribution Practice certification',
      'Source WHO GDP-compliant cold storage units from Aucma or Haier',
      'Engage UNICEF Supply Division for preferred distributor listing',
      'Negotiate master distribution agreements with 3 anchor manufacturers',
      'Install IoT temperature monitoring: AWS IoT integration for real-time alerts',
      'Hire Qualified Person (QP) regulatory officer for each hub city',
    ],
  },
];

export const mockEntities: Entity[] = [
  {
    id: 'ENT-001',
    name: 'Kenya Bureau of Standards (KEBS)',
    type: 'regulatory',
    country: 'Kenya',
    description: 'National standards body responsible for product type-testing and certification. All agricultural machinery and consumer goods require KEBS certification before market entry. Processing time: 45–90 days.',
  },
  {
    id: 'ENT-002',
    name: 'Tanzania Bureau of Standards (TBS)',
    type: 'regulatory',
    country: 'Tanzania',
    description: 'Equivalent to KEBS for Tanzanian market. Oversees quality certification, conformity assessment, and mandatory standards compliance for imported goods. Key partner for OPP-002 certification pathway.',
  },
  {
    id: 'ENT-003',
    name: 'EAC Secretariat',
    type: 'infrastructure',
    country: 'Rwanda',
    description: 'Governing body for the East African Community trade bloc. Administers the EAC Common External Tariff, the One-Stop Border Post initiative, and cross-border transport protocols. Headquarters: Arusha, Tanzania.',
  },
  {
    id: 'ENT-004',
    name: 'Nigerian Electricity Regulatory Commission (NERC)',
    type: 'regulatory',
    country: 'Nigeria',
    description: 'Federal regulator for Nigeria\'s electricity sector. Issues licenses for Independent Power Producers (IPPs), mini-grid operators, and EPC contractors. Critical gatekeeper for OPP-004 Nigeria activities.',
  },
  {
    id: 'ENT-005',
    name: 'National Agency for Food and Drug Administration (NAFDAC)',
    type: 'regulatory',
    country: 'Nigeria',
    description: 'Regulatory authority for pharmaceuticals, food, and medical devices in Nigeria. Issues wholesale distribution licenses required for OPP-005. Known for rigorous inspection processes with 6–12 month approval timelines.',
  },
  {
    id: 'ENT-006',
    name: 'Ghana Standards Authority (GSA)',
    type: 'regulatory',
    country: 'Ghana',
    description: 'National standards body and quality infrastructure organization for Ghana. Manages product certification, metrology, and conformity assessment. Increasingly aligned with ISO standards for regional integration.',
  },
];

export const mockArticles: Article[] = [
  {
    id: 'ART-001',
    slug: 'kenya-mechanization-revolution',
    title: 'Kenya\'s Smallholder Mechanization Revolution: How Agricultural Machinery Is Reshaping the Rift Valley',
    subtitle: 'Government subsidies and AGRA partnerships are accelerating tractor adoption among cooperative farmers',
    content: `The Rift Valley's red soils have always been fertile ground for Kenya's agricultural ambitions. But until recently, the majority of the 5.7 million smallholder farmers who cultivate them relied on hand tools and animal traction — methods unchanged for generations.

That is beginning to change. A confluence of government policy, development finance, and private sector investment is driving a mechanization wave that industry observers are calling transformational.

**The Scale of the Opportunity**

Kenya's Ministry of Agriculture estimates that mechanization coverage — defined as the percentage of arable land cultivated using motorized equipment — stands at just 28%. The target set under the Agricultural Sector Transformation and Growth Strategy (ASTGS) is 60% by 2030.

The gap represents a market opportunity estimated at KES 85 billion ($580 million) in equipment demand over the next six years. Mid-range tractors in the 35–60 horsepower range are considered the sweet spot for cooperative farming models, balancing affordability with productive capacity.

**Regulatory Pathways**

All agricultural machinery entering Kenya must obtain KEBS (Kenya Bureau of Standards) type-approval certification. The process involves laboratory testing at the KEBS facility in Nairobi and typically takes 45–90 days for new applicants. Established importers with pre-certified models can expedite through a simplified re-certification pathway.

The Kenya Revenue Authority has updated the East African Community Common External Tariff to zero-rate most agricultural equipment, removing duties that previously added 15–25% to import costs.

**Distribution Networks**

The agrodealer ecosystem is the key infrastructure for last-mile distribution. Kenya's top three agrodealer networks — Elgon Kenya, MEA Limited, and Farmers Choice — collectively operate 2,400+ distribution points nationwide. Securing exclusive or preferred supplier agreements with these networks is considered the critical path for any new market entrant.`,
    hero_image: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    category_country: 'Kenya',
    category_sector: 'Agriculture',
    tags: ['mechanization', 'smallholder', 'KEBS', 'tractors', 'AGRA'],
    author: 'Dr. Amina Osei-Kofi',
    published_at: '2026-07-10',
    related_opportunities: ['OPP-002'],
    is_hero: true,
  },
  {
    id: 'ART-002',
    slug: 'northern-corridor-logistics',
    title: 'The Northern Corridor Reborn: EAC Trade Infrastructure and the Race for Last-Mile Logistics',
    subtitle: 'How a $2.4B infrastructure investment is opening new freight corridors from Mombasa to Kigali',
    content: `The 1,700-kilometer Northern Corridor stretching from Mombasa port through Nairobi, Kampala, and on to Kigali represents East Africa's economic spine. For decades, poor road conditions, cumbersome customs procedures, and fragmented carrier networks made the journey a logistical nightmare — with trucks averaging just 200 kilometers per day.

That reality is being dismantled, piece by piece, through a coordinated program of infrastructure investment and regulatory reform that promises to transform the corridor into a genuine trade superhighway.

**Infrastructure Transformation**

The Standard Gauge Railway (SGR) now handles freight from Mombasa to Nairobi in 8–10 hours, compared to 3–4 days by road. While full extension to Kampala and Kigali remains under financing negotiation, the existing segment has already cut Northern Corridor transit times significantly.

At the borders, the One-Stop Border Post (OSBP) program has transformed Malaba and Busia — the primary Uganda-Kenya crossing points — from chaotic bottlenecks to streamlined single-administration checkpoints. Average clearance times have fallen from 4–6 hours to under 90 minutes.

**The Digital Layer**

Kenya's Electronic Single Window System (KESWS) now integrates with the Uganda Revenue Authority's customs portal, enabling pre-clearance documentation to be filed before goods reach the border. Rwanda's Revenue Authority system (RRA) is scheduled to join the integration by Q3 2026.

For logistics operators, this digital infrastructure creates the foundation for a genuinely integrated cross-border offering — one that can provide consignors with real-time visibility from port of origin to final delivery.`,
    hero_image: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1e 100%)',
    category_country: 'Kenya',
    category_sector: 'Logistics',
    tags: ['Northern Corridor', 'SGR', 'OSBP', 'EAC', 'freight'],
    author: 'Marcus Odhiambo',
    published_at: '2026-07-08',
    related_opportunities: ['OPP-003'],
    is_hero: false,
  },
  {
    id: 'ART-003',
    slug: 'nigeria-energy-crisis-opportunity',
    title: 'Nigeria\'s Energy Crisis Is Its Biggest Business Opportunity: A Guide to the Solar Microgrid Market',
    subtitle: 'With grid reliability at 30%, independent power is no longer optional for Nigerian manufacturers',
    content: `Lagos Industrial Zone, 6 AM. The national grid goes dark for the third time this week. At the Apapa Quays, refrigerated containers lose temperature control. In Ogun State, textile factories run diesel generators at $0.45 per kWh — triple the global average industrial electricity cost.

This is the daily reality for Nigerian manufacturers, and it is increasingly untenable. The good news: it has created one of Africa's most attractive renewable energy markets.

**The Numbers**

Nigeria's power generation capacity stands at approximately 12,500 MW, but actual available capacity rarely exceeds 4,000 MW — serving a population of 218 million. Industrial and commercial consumers, who make up approximately 40% of electricity demand, suffer the most from load shedding.

The market for behind-the-meter solar-plus-storage solutions for industrial and commercial consumers is estimated at $3.2 billion over the next five years, according to the Rocky Mountain Institute's 2025 Nigeria Energy Report.

**Regulatory Environment**

NERC (Nigerian Electricity Regulatory Commission) has progressively liberalized the independent power market. Captive power plants under 1MW no longer require NERC licensing. Systems between 1–5MW require a simplified "mini-grid license" with 60-day processing. Above 5MW, full IPP licensing applies.

The Electricity Act 2023 introduced key reforms: elimination of the exclusive distribution license monopoly, enabling direct wheeling of power to industrial consumers, and establishing a framework for energy storage registration.`,
    hero_image: 'linear-gradient(135deg, #1c1c1e 0%, #111111 100%)',
    category_country: 'Nigeria',
    category_sector: 'Energy',
    tags: ['solar', 'microgrid', 'NERC', 'IPP', 'industrial power'],
    author: 'Chisom Nwachukwu',
    published_at: '2026-07-05',
    related_opportunities: ['OPP-004'],
    is_hero: false,
  },
  {
    id: 'ART-004',
    slug: 'ghana-pharmaceutical-market',
    title: 'Ghana\'s Pharmaceutical Sector: Why West Africa\'s Most Transparent Market Is Attracting Global Distributors',
    subtitle: 'FDA Ghana reforms and universal health coverage expansion are reshaping the medicine supply chain',
    content: `Accra's pharmaceutical sector has undergone a quiet revolution over the past three years. What was once characterized by fragmented informal distribution, unreliable cold chain infrastructure, and opaque procurement processes is transforming into a regulated, technology-enabled supply chain attracting serious international investment.

The catalyst: Ghana's National Health Insurance Scheme (NHIS) expansion, which added 4.2 million covered lives in 2024 alone, and the FDA Ghana's 2024 Good Distribution Practice (GDP) regulatory framework — bringing Ghana's pharmaceutical logistics standards into alignment with WHO and EU GMP/GDP requirements.

**The Distribution Gap**

Despite Ghana's regulatory advances, the distribution infrastructure remains underdeveloped. The country currently has fewer than 40 GDP-certified wholesale distributors, serving a market of 32 million people with growing pharmaceutical demand. Industry consultants estimate the sector requires at least 120 certified distribution points to meet WHO-recommended access standards.

The gap represents both a challenge and a commercial opportunity. First-mover advantage in establishing a GDP-compliant distribution network with genuine cold chain capability could position a new entrant as the preferred logistics partner for global pharmaceutical manufacturers seeking West African market access.

**Government Procurement**

The Ghana Health Service (GHS) procurement budget for medicines and medical supplies stood at GHS 2.4 billion ($160 million) in FY2025. Suppliers registered on the GHS Preferred Supplier List receive automatic consideration for procurement tenders without additional qualification rounds — making registration a strategic priority.`,
    hero_image: 'linear-gradient(135deg, #111111 0%, #1c1c1e 100%)',
    category_country: 'Ghana',
    category_sector: 'Manufacturing',
    tags: ['pharmaceuticals', 'FDA Ghana', 'cold chain', 'NHIS', 'GDP'],
    author: 'Abena Mensah-Bonsu',
    published_at: '2026-07-03',
    related_opportunities: ['OPP-005'],
    is_hero: false,
  },
  {
    id: 'ART-005',
    slug: 'ethiopia-industrial-parks',
    title: 'Ethiopia\'s Industrial Park Ecosystem: Manufacturing Hub or Cautionary Tale?',
    subtitle: 'Hawassa and Bole Lemi offer extraordinary cost advantages — but geopolitical risk requires careful assessment',
    content: `When Hawassa Industrial Park opened in 2017, it was heralded as Africa's manufacturing future. A purpose-built, 130-hectare special economic zone powered entirely by renewable hydroelectric energy, offering factory space at $3/m² per month — a fraction of comparable costs in Bangladesh or Vietnam.

Seven years later, the park's trajectory offers lessons both inspiring and sobering for investors evaluating Ethiopia's industrial opportunity.

**The Cost Advantage Case**

The numbers remain compelling. Ethiopia offers Africa's lowest industrial energy costs (approximately $0.04/kWh versus $0.12 average in sub-Saharan Africa), a large and trainable labor pool with minimum wages under $100/month, and government-provided factory shells with 10-year tax holidays.

The Addis Ababa-Djibouti Electric Railway has reduced logistics time from factory to ship by 80%, addressing the landlocked disadvantage that historically deterred manufacturers.

**The Risk Picture**

The 2020–2022 Tigray conflict demonstrated the vulnerability of Ethiopia's stability assumption. Several major tenants — including H&M and PVH Corp — suspended or reduced operations following the outbreak of conflict. Insurance premiums for Ethiopian operations remain elevated, and some ESG-conscious investors continue to screen Ethiopia as a restricted market.

The post-conflict period has seen gradual recovery, with occupancy at Hawassa now back above 70%. But investors must price political risk into any Ethiopian manufacturing thesis.`,
    hero_image: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1e 100%)',
    category_country: 'Ethiopia',
    category_sector: 'Manufacturing',
    tags: ['industrial parks', 'SEZ', 'Hawassa', 'manufacturing', 'FDI'],
    author: 'Tigist Haile',
    published_at: '2026-06-28',
    related_opportunities: [],
    is_hero: false,
  },
  {
    id: 'ART-006',
    slug: 'rwanda-kigali-hub-strategy',
    title: 'The Kigali Hypothesis: Rwanda\'s Bet on Being Africa\'s Singapore',
    subtitle: 'How a landlocked nation of 14 million is becoming the preferred African HQ for multinationals',
    content: `In a continent where "ease of doing business" rankings often feel disconnected from operational reality, Rwanda stands as a genuine outlier. The country has spent two decades systematically dismantling the bureaucratic friction that plagues neighboring markets, and the results are measurable.

**The Governance Premium**

Rwanda's Transparency International Corruption Perceptions Index score of 53 (2024) makes it the least corrupt nation in East Africa by a significant margin — Kenya scores 31, Tanzania 37, Uganda 26. For multinationals evaluating regional headquarters locations, this premium on governance predictability translates directly into reduced operational risk and compliance costs.

The Rwanda Development Board (RDB) offers a genuinely streamlined business environment: company incorporation in 24 hours, single-window trade facilitation, and a business court that handles commercial disputes in a median 30 days versus 800+ days in neighboring jurisdictions.

**The Services Strategy**

Unable to compete with coastal neighbors on manufacturing logistics, Rwanda has built its economic model on high-value services: finance, technology, MICE (Meetings, Incentives, Conferences, Exhibitions), and increasingly, pharmaceutical manufacturing.

The Kigali International Financial Centre (KIFC) has attracted 87 financial institutions since 2020. The government's target: 150 by 2030, positioning Rwanda as the gateway for capital flows serving the Great Lakes region.`,
    hero_image: 'linear-gradient(135deg, #1c1c1e 0%, #0a0a0a 100%)',
    category_country: 'Rwanda',
    category_sector: 'Technology',
    tags: ['governance', 'RDB', 'KIFC', 'regional HQ', 'services'],
    author: 'Jean-Pierre Munyaneza',
    published_at: '2026-06-25',
    related_opportunities: ['OPP-003'],
    is_hero: false,
  },
  {
    id: 'ART-007',
    slug: 'tanzania-gas-opportunity',
    title: 'Tanzania\'s Natural Gas Window: Why the LNG Decision Is Africa\'s Most Important Trade Story',
    subtitle: 'With 57 trillion cubic feet in reserves, Tanzania\'s final investment decision will reshape East African energy',
    content: `The Tanzanian natural gas sector has been stuck in a prolonged holding pattern since the initial discoveries of 57 trillion cubic feet in offshore reserves. Multiple attempted Final Investment Decisions (FIDs) for the proposed $30 billion LNG export terminal have been delayed, rescheduled, and revisited.

But 2026 may be the year the log jam finally breaks.

**The Case for Now**

Global LNG demand dynamics have shifted fundamentally since the 2022 European energy crisis. Long-term offtake agreements from European utilities — previously locked into pipeline gas — are now available at volumes and prices that could underwrite an East African LNG project.

Japan and South Korea, traditional LNG price-setters, are competing aggressively for new long-term supply agreements as they seek to diversify away from Australian and Qatari dependence. Tanzania's offshore blocks, operated by Shell and Equinor, would represent a significant new supply source.

**The Infrastructure Picture**

The proposed terminal at Lindi would require 56km of onshore pipeline, a 600-acre LNG plant, and marine loading facilities capable of handling Q-Flex vessels. Total project cost estimates range from $28–32 billion — making it one of the largest private investments in African history.

For downstream logistics and services, the construction phase alone would create $8–12 billion in procurement opportunities for equipment, materials, professional services, and local content requirements.`,
    hero_image: 'linear-gradient(135deg, #111111 0%, #0a0a0a 100%)',
    category_country: 'Tanzania',
    category_sector: 'Energy',
    tags: ['LNG', 'natural gas', 'FID', 'Shell', 'Equinor', 'infrastructure'],
    author: 'Samson Makweta',
    published_at: '2026-06-20',
    related_opportunities: ['OPP-004'],
    is_hero: false,
  },
  {
    id: 'ART-008',
    slug: 'uganda-oil-pipeline-eacop',
    title: 'EACOP: The Pipeline That Divides Africa\'s Investment Community',
    subtitle: 'Uganda\'s crude oil ambitions face international ESG headwinds — but regional capital is stepping in',
    content: `The East African Crude Oil Pipeline (EACOP) — 1,443 kilometers stretching from Uganda's Albertine Graben oilfields to Tanzania's Tanga port — is the most contested infrastructure project in Africa today.

On one side: a coalition of international banks, including BNP Paribas, Deutsche Bank, and Standard Chartered, who have declined to finance the project citing climate and human rights concerns. On the other: TotalEnergies (45% stake), CNOOC (33%), and the governments of Uganda and Tanzania, who argue that African nations have the right to monetize their natural resources.

**The Financial Architecture**

The project's $3.5 billion capital requirement has been partially restructured following European bank withdrawals. AFDB (African Development Bank) has declined to provide direct financing but has not imposed restrictions on African commercial banks.

Stanbic Bank Uganda, Equity Bank, and KCB Group have indicated willingness to participate in a syndicated local currency financing tranche, representing a significant shift toward African financial institution leadership on continental infrastructure.

**The Local Content Opportunity**

EACOP's construction phase creates substantial procurement opportunities for Ugandan and Tanzanian businesses: civil works, catering, logistics, professional services, and material supply. The Uganda National Oil Company (UNOC) has mandated 30% local content requirements for all project contracts — the highest such threshold in the region.`,
    hero_image: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
    category_country: 'Uganda',
    category_sector: 'Energy',
    tags: ['EACOP', 'pipeline', 'TotalEnergies', 'oil', 'local content'],
    author: 'Grace Nabirye',
    published_at: '2026-06-15',
    related_opportunities: [],
    is_hero: false,
  },
];

export const mockTraces: Trace[] = [
  // OPP-002 Traces
  {
    id: 'TRC-001',
    opportunity_id: 'OPP-002',
    source: 'KEBS Gazette 2026, Vol. 14',
    badge: 'validated',
    relationship: 'REG:KEBS → IMPORT:AGRI-MECH → CERTIFICATION:TYPE-APPROVAL',
    fact: 'KEBS mandates type-approval for all agricultural machinery above 15kW engine power before import authorization. Certificate valid for 3 years with annual compliance audits.',
    justification: 'Confirmed via KEBS Kenya Standards Catalogue entry #KS 1840:2022 and cross-referenced with KRA import classification codes HS 8701.92 and 8432.29.',
  },
  {
    id: 'TRC-002',
    opportunity_id: 'OPP-002',
    source: 'AGRA SmallHolder Mechanization Report 2025',
    badge: 'validated',
    relationship: 'FUNDING:AGRA → PROGRAM:SMHF → MARKET:EAST-AFRICA',
    fact: 'AGRA\'s SmallHolder Mechanization Fund has disbursed $34M to agrodealer networks across Kenya, Tanzania, and Uganda since 2023. Average subsidy is 25% of equipment cost for cooperative-affiliated buyers.',
    justification: 'AGRA Annual Report 2025, pg. 47. Cross-validated with Kenya Ministry of Agriculture mechanization program expenditure data FY2025/26.',
  },
  {
    id: 'TRC-003',
    opportunity_id: 'OPP-002',
    source: 'EAC Trade & Tariff Portal',
    badge: 'validated',
    relationship: 'POLICY:EAC-CET → TARIFF:ZERO → CATEGORY:AGRI-EQUIPMENT',
    fact: 'EAC Common External Tariff applies 0% import duty to agricultural machinery under HS Chapter 84 and 87. Effective since 2019 EAC Gazette Notice No. 11 of 2019.',
    justification: 'Verified on EAC Customs portal, confirmed with KRA tariff classification desk (ref: KRA-2025-0441).',
  },
  {
    id: 'TRC-004',
    opportunity_id: 'OPP-002',
    source: 'Local Partner Interview — Elgon Kenya Ltd.',
    badge: 'external',
    relationship: 'PARTNER:ELGON-KENYA → NETWORK:AGRODEALER → COVERAGE:RIFT-VALLEY',
    fact: 'Elgon Kenya operates 340 active agrodealer points with an exclusive distribution agreement for John Deere expiring Q4 2026. Management has indicated openness to non-competing brand partnerships.',
    justification: 'Interview conducted June 2026 with Elgon Kenya Commercial Director. Not independently verified — subject to due diligence.',
  },
  {
    id: 'TRC-005',
    opportunity_id: 'OPP-002',
    source: 'TBS Certification Database',
    badge: 'gap',
    relationship: 'REG:TBS → CERTIFICATION:UNKNOWN → STATUS:UNVERIFIED',
    fact: 'TBS certification pathway for 40–60hp tractors from Indian manufacturers (Mahindra, TAFE) is not documented in publicly available TBS product certification list. Certification may require full testing rather than mutual recognition.',
    justification: 'Gap identified: no documented EAC mutual recognition agreement covering agricultural machinery with India. Legal opinion required on COMESA CVQS applicability.',
  },
  // OPP-003 Traces
  {
    id: 'TRC-006',
    opportunity_id: 'OPP-003',
    source: 'KESWS Integration Guide v3.2',
    badge: 'validated',
    relationship: 'SYSTEM:KESWS → API:INTEGRATION → PROCESS:PRE-CLEARANCE',
    fact: 'KESWS (Kenya Electronic Single Window System) exposes REST API for customs pre-clearance. API documentation available to licensed customs agents. Integration enables electronic submission of all import/export declarations 48 hours before goods arrive at border.',
    justification: 'Confirmed by KRA ICT Department documentation and tested by local customs agent partner (Siginon Global Logistics).',
  },
  {
    id: 'TRC-007',
    opportunity_id: 'OPP-003',
    source: 'Northern Corridor Transit Agreement 2024',
    badge: 'validated',
    relationship: 'TREATY:NCTA → TRANSIT:FACILITATION → CORRIDOR:MOMBASA-KIGALI',
    fact: 'The 2024 Northern Corridor Transit Agreement reduces mandatory convoy requirements and introduces the EAC Single Customs Territory (SCT) for bonded carriers with certified status. Processing time at Malaba OSBP reduced to average 67 minutes.',
    justification: 'Official NCTTCA report Q1 2026. Cross-referenced with World Bank Logistics Performance Index East Africa chapter.',
  },
  {
    id: 'TRC-008',
    opportunity_id: 'OPP-003',
    source: 'Rwanda Revenue Authority API Docs',
    badge: 'gap',
    relationship: 'SYSTEM:RRA → API:STATUS → INTEGRATION:PENDING',
    fact: 'Rwanda Revenue Authority API for customs integration is documented but currently in closed beta. Public release scheduled Q3 2026. No confirmed timeline for Northern Corridor multi-country integration.',
    justification: 'Gap: RRA confirmed planned API release but no SLA commitment. KESWS-RRA bilateral integration requires separate MOU between tax authorities — current status unclear.',
  },
  {
    id: 'TRC-009',
    opportunity_id: 'OPP-003',
    source: 'COMESA Yellow Card Scheme',
    badge: 'validated',
    relationship: 'INSURANCE:COMESA-YC → COVERAGE:CROSS-BORDER → FLEET:COMMERCIAL',
    fact: 'COMESA Yellow Card provides third-party liability motor insurance valid in 14 COMESA member states including Kenya, Uganda, Rwanda, Tanzania. Annual premium for commercial trucks: $180–240 per vehicle. Available through Jubilee Insurance Kenya.',
    justification: 'COMESA Yellow Card Scheme official documentation. Verified premium quotes from Jubilee Insurance Kenya commercial fleet desk.',
  },
  // OPP-004 Traces
  {
    id: 'TRC-010',
    opportunity_id: 'OPP-004',
    source: 'NERC Licensing Framework 2024',
    badge: 'validated',
    relationship: 'REG:NERC → LICENSE:MINI-GRID → THRESHOLD:1-5MW',
    fact: 'NERC\'s 2024 Mini-Grid Regulation establishes a simplified licensing track for solar-battery systems between 1–5MW. License processing target: 60 working days. Application fee: ₦2.5 million. EPC contractors require separate COREN registration.',
    justification: 'NERC Regulation Order No. NERC-R-2024-001. Verified with NERC Lagos office. COREN requirement confirmed with Council for the Regulation of Engineering in Nigeria.',
  },
  {
    id: 'TRC-011',
    opportunity_id: 'OPP-004',
    source: 'Rocky Mountain Institute — Nigeria Energy Report 2025',
    badge: 'external',
    relationship: 'ANALYSIS:RMI → MARKET-SIZE:$3.2B → SEGMENT:C&I-SOLAR',
    fact: 'Commercial & Industrial (C&I) solar market in Nigeria estimated at $3.2B over 5 years, with annual addressable market of $640M. Sectors with highest demand: manufacturing, cold storage, telecom. Average IRR for Nigerian solar C&I projects: 18–24%.',
    justification: 'Third-party research report. Not independently validated. Methodology note: RMI uses system cost data from 2023; actual 2026 costs likely 15% lower due to module price declines.',
  },
  {
    id: 'TRC-012',
    opportunity_id: 'OPP-004',
    source: 'Ghana Energy Commission',
    badge: 'gap',
    relationship: 'REG:PURC → STATUS:UNCLEAR → PROCESS:IPP-REGISTRATION',
    fact: 'PURC (Public Utilities Regulatory Commission) Ghana does not have a publicly documented registration pathway for sub-5MW battery storage systems as of Q2 2026. Solar-only systems are covered under the Net Metering Policy (2024) but hybrid storage is a regulatory gray area.',
    justification: 'Gap: Multiple industry contacts could not confirm a clear path. Recommendation: Engage Energy Commission Ghana directly for formal opinion before committing capex to Ghana sites.',
  },
  // OPP-005 Traces
  {
    id: 'TRC-013',
    opportunity_id: 'OPP-005',
    source: 'NAFDAC Wholesale License Guidelines 2025',
    badge: 'validated',
    relationship: 'REG:NAFDAC → LICENSE:WHOLESALE-PHARMA → TIMELINE:6-12M',
    fact: 'NAFDAC wholesale pharmaceutical distribution license requires: pre-inspection of GDP-compliant warehouse, temperature mapping studies, documented SOPs, qualified pharmacist as Responsible Person. Processing time: 6–12 months. Annual renewal.',
    justification: 'NAFDAC Gazette Notice 2025/003 on Pharmaceutical Distribution Licensing Requirements. Confirmed by Lagos-based pharmaceutical regulatory consultant.',
  },
  {
    id: 'TRC-014',
    opportunity_id: 'OPP-005',
    source: 'WHO GDP Guidelines — Annex 5, 2024',
    badge: 'validated',
    relationship: 'STANDARD:WHO-GDP → REQUIREMENT:COLD-CHAIN → SPEC:+2-+8C',
    fact: 'WHO Good Distribution Practice requires temperature-sensitive medicines to be maintained at +2°C to +8°C throughout the distribution chain. Continuous monitoring with calibrated data loggers required. Excursion management SOP mandatory.',
    justification: 'WHO Technical Report Series No. 1049, 2024. Applicable in all three target markets (Nigeria, Ghana, Rwanda) which have incorporated WHO GDP into national regulations.',
  },
  {
    id: 'TRC-015',
    opportunity_id: 'OPP-005',
    source: 'Rwanda FDA Inspection Report 2025',
    badge: 'external',
    relationship: 'MARKET:RWANDA → REGULATION:RFDA → CAPACITY:LIMITED',
    fact: 'Rwanda FDA conducted 12 GDP compliance inspections in 2025, approving 8 facilities. Current inspection capacity reportedly limited to 2–3 per quarter, creating potential bottleneck for new entrants seeking certification.',
    justification: 'Information sourced from industry association (Rwanda Pharmaceutical Federation) — not confirmed directly with RFDA. Verification recommended before committing Rwanda as Phase 1 market.',
  },
];

export const mockQueryHistory: QueryHistory[] = [
  {
    id: 'QH-001',
    query: 'What are the regulatory requirements for importing agricultural machinery into Kenya?',
    summary: 'KEBS type-approval mandatory for all machinery >15kW. Zero-duty under EAC-CET. 45–90 day certification window. Key partners: Elgon Kenya (agrodealer), AGRA (funding). Gap: TBS mutual recognition status unconfirmed.',
    stats: { traces: 14, nodes: 8, concepts: 12, entities: 5, validated: '78%' },
    created_at: '2026-07-12T09:14:22Z',
  },
  {
    id: 'QH-002',
    query: 'Show me cross-border logistics opportunities in the EAC corridor',
    summary: 'Northern Corridor transit time reduced 65% post-OSBP. KESWS API available for customs pre-clearance. RRA integration pending Q3 2026. COMESA Yellow Card covers 14 states. OPP-003 validation at 87% — primary bottleneck is RRA digital integration.',
    stats: { traces: 9, nodes: 6, concepts: 8, entities: 4, validated: '85%' },
    created_at: '2026-07-11T14:32:05Z',
  },
  {
    id: 'QH-003',
    query: 'Validate OPP-002 data and identify gaps',
    summary: 'OPP-002 overall validation 92%. Key confirmed facts: KEBS type-approval process, EAC zero-tariff, AGRA $34M fund disbursement. Critical gap: TBS certification pathway for Indian-manufactured tractors undocumented. Recommend legal opinion on COMESA CVQS applicability.',
    stats: { traces: 18, nodes: 10, concepts: 15, entities: 7, validated: '92%' },
    created_at: '2026-07-10T11:05:33Z',
  },
  {
    id: 'QH-004',
    query: 'What are the risks in Nigerian energy sector investments?',
    summary: 'NERC licensing framework now investor-friendly for C&I solar. Naira devaluation (70%) is primary financial risk. Grid instability creates opportunity. Ghana storage regulation is a gap. IRR on solar C&I: 18–24% per RMI. Recommend direct PURC engagement before Ghana sites.',
    stats: { traces: 11, nodes: 7, concepts: 9, entities: 6, validated: '72%' },
    created_at: '2026-07-09T16:48:12Z',
  },
  {
    id: 'QH-005',
    query: 'Pharmaceutical distribution network feasibility in West Africa',
    summary: 'NAFDAC timeline 6–12 months is principal constraint. Ghana GDP framework strong — NHIS expansion positive demand signal. Rwanda FDA inspection bottleneck a risk (2–3 inspections/quarter). WHO GDP cold chain requirements uniform across markets. Recommend Nigeria + Ghana Phase 1, Rwanda Phase 2.',
    stats: { traces: 16, nodes: 9, concepts: 11, entities: 8, validated: '83%' },
    created_at: '2026-07-08T10:22:44Z',
  },
];
