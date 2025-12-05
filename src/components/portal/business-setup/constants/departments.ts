/**
 * UAE Economic Departments and Free Zones Data
 * 
 * Comprehensive list of economic departments and free zones across the UAE
 * for business registration and setup.
 * 
 * @module business-setup/constants/departments
 * @version 1.0.0
 */

export interface EconomicDepartment {
    id: string
    name: string
    shortName?: string
    country: 'AE' | 'SA' | 'EG'
    emirate?: 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Ajman' | 'Fujairah' | 'Ras Al Khaimah' | 'Umm Al Quwain'
    category: 'free_zone' | 'mainland' | 'offshore'
    keywords: string[] // For search optimization
    website?: string
    isPopular?: boolean
}

/**
 * Complete list of UAE Economic Departments and Free Zones
 * Sorted alphabetically by name
 */
export const UAE_DEPARTMENTS: EconomicDepartment[] = [
    {
        id: 'adafz',
        name: 'Abu Dhabi Airports Free Zone',
        shortName: 'ADAFZ',
        country: 'AE',
        emirate: 'Abu Dhabi',
        category: 'free_zone',
        keywords: ['airport', 'aviation', 'cargo', 'logistics', 'abu dhabi'],
        website: 'https://www.adafz.ae',
        isPopular: true
    },
    {
        id: 'adgm',
        name: 'Abu Dhabi Global Market',
        shortName: 'ADGM',
        country: 'AE',
        emirate: 'Abu Dhabi',
        category: 'free_zone',
        keywords: ['financial', 'banking', 'fintech', 'global market', 'abu dhabi'],
        website: 'https://www.adgm.com',
        isPopular: true
    },
    {
        id: 'adgm-fsra',
        name: 'ADGM Financial Services',
        shortName: 'ADGM FSRA',
        country: 'AE',
        emirate: 'Abu Dhabi',
        category: 'free_zone',
        keywords: ['financial services', 'fsra', 'banking', 'finance', 'abu dhabi'],
        website: 'https://www.adgm.com'
    },
    {
        id: 'ajman-fz',
        name: 'Ajman Free Zone',
        shortName: 'AFZ',
        country: 'AE',
        emirate: 'Ajman',
        category: 'free_zone',
        keywords: ['ajman', 'free zone', 'trade', 'business'],
        website: 'https://www.afz.ae',
        isPopular: false
    },
    {
        id: 'ajman-media',
        name: 'Ajman Media City Free Zone',
        shortName: 'Ajman Media City',
        country: 'AE',
        emirate: 'Ajman',
        category: 'free_zone',
        keywords: ['media', 'creative', 'ajman', 'advertising'],
        website: 'https://www.ajmanmediacityfz.ae'
    },
    {
        id: 'dafz',
        name: 'Dubai Airport Free Zone',
        shortName: 'DAFZ',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['airport', 'dubai', 'logistics', 'cargo', 'aviation'],
        website: 'https://www.dafz.ae',
        isPopular: true
    },
    {
        id: 'dafza',
        name: 'Dubai Auto Zone',
        shortName: 'DAFZA',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['automotive', 'auto', 'car', 'dubai', 'vehicles'],
        website: 'https://www.dafza.ae'
    },
    {
        id: 'dem',
        name: 'Dubai Department of Economy and Tourism',
        shortName: 'DET',
        country: 'AE',
        emirate: 'Dubai',
        category: 'mainland',
        keywords: ['mainland', 'dubai economy', 'tourism', 'det', 'dld'],
        isPopular: true
    },
    {
        id: 'dfsa',
        name: 'Dubai Financial Services Authority',
        shortName: 'DFSA',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['financial', 'difc', 'banking', 'finance', 'dubai'],
        website: 'https://www.dfsa.ae',
        isPopular: true
    },
    {
        id: 'difc',
        name: 'Dubai International Financial Centre',
        shortName: 'DIFC',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['financial', 'banking', 'fintech', 'investment', 'dubai'],
        website: 'https://www.difc.ae',
        isPopular: true
    },
    {
        id: 'dmcc',
        name: 'Dubai Multi Commodities Centre',
        shortName: 'DMCC',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['commodities', 'gold', 'diamond', 'trade', 'dubai', 'jlt'],
        website: 'https://www.dmcc.ae',
        isPopular: true
    },
    {
        id: 'dso',
        name: 'Dubai Silicon Oasis',
        shortName: 'DSO',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['technology', 'tech', 'silicon', 'innovation', 'dubai'],
        website: 'https://www.dsoa.ae',
        isPopular: true
    },
    {
        id: 'dtec',
        name: 'Dubai Technology Entrepreneur Campus',
        shortName: 'DTEC',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['startup', 'tech', 'entrepreneur', 'innovation', 'dubai', 'dtec'],
        website: 'https://www.dtec.ae',
        isPopular: true
    },
    {
        id: 'dwtc',
        name: 'Dubai World Trade Centre',
        shortName: 'DWTC',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['trade', 'exhibitions', 'events', 'business', 'dubai'],
        website: 'https://www.dwtc.com'
    },
    {
        id: 'fujairah-fz',
        name: 'Fujairah Free Zone',
        shortName: 'FFZ',
        country: 'AE',
        emirate: 'Fujairah',
        category: 'free_zone',
        keywords: ['fujairah', 'free zone', 'port', 'logistics'],
        website: 'https://www.fujairahfreezone.com'
    },
    {
        id: 'hamriyah-fz',
        name: 'Hamriyah Free Zone',
        shortName: 'HFZ',
        country: 'AE',
        emirate: 'Sharjah',
        category: 'free_zone',
        keywords: ['sharjah', 'hamriyah', 'industrial', 'manufacturing'],
        website: 'https://www.hfza.ae'
    },
    {
        id: 'ifza',
        name: 'International Free Zone Authority',
        shortName: 'IFZA',
        country: 'AE',
        emirate: 'Fujairah',
        category: 'free_zone',
        keywords: ['international', 'fujairah', 'free zone', 'offshore'],
        website: 'https://www.ifza.com',
        isPopular: false
    },
    {
        id: 'jafza',
        name: 'Jebel Ali Free Zone',
        shortName: 'JAFZA',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['jebel ali', 'port', 'logistics', 'trade', 'dubai', 'largest'],
        website: 'https://www.jafza.ae',
        isPopular: true
    },
    {
        id: 'kizad',
        name: 'Khalifa Industrial Zone Abu Dhabi',
        shortName: 'KIZAD',
        country: 'AE',
        emirate: 'Abu Dhabi',
        category: 'free_zone',
        keywords: ['industrial', 'manufacturing', 'khalifa', 'abu dhabi'],
        website: 'https://www.kizad.ae',
        isPopular: true
    },
    {
        id: 'meydan-fz',
        name: 'Meydan Free Zone',
        shortName: 'Meydan FZ',
        country: 'AE',
        emirate: 'Dubai',
        category: 'free_zone',
        keywords: ['meydan', 'racing', 'sports', 'business', 'dubai'],
        website: 'https://www.meydanfz.ae'
    },
    {
        id: 'rakez',
        name: 'Ras Al Khaimah Economic Zone',
        shortName: 'RAKEZ',
        country: 'AE',
        emirate: 'Ras Al Khaimah',
        category: 'free_zone',
        keywords: ['rak', 'ras al khaimah', 'economic zone', 'free zone'],
        website: 'https://www.rakez.com',
        isPopular: true
    },
    {
        id: 'saif-zone',
        name: 'Sharjah Airport International Free Zone',
        shortName: 'SAIF Zone',
        country: 'AE',
        emirate: 'Sharjah',
        category: 'free_zone',
        keywords: ['sharjah', 'airport', 'saif', 'free zone', 'logistics'],
        website: 'https://www.saif-zone.com',
        isPopular: true
    },
    {
        id: 'spc-fz',
        name: 'Sharjah Publishing City',
        shortName: 'SPC',
        country: 'AE',
        emirate: 'Sharjah',
        category: 'free_zone',
        keywords: ['publishing', 'media', 'books', 'sharjah', 'creative'],
        website: 'https://www.spcfreezone.com'
    },
    {
        id: 'shams',
        name: 'Sharjah Media City (Shams)',
        shortName: 'Shams',
        country: 'AE',
        emirate: 'Sharjah',
        category: 'free_zone',
        keywords: ['media', 'shams', 'sharjah', 'creative', 'advertising'],
        website: 'https://www.shams.ae',
        isPopular: true
    },
    {
        id: 'tasheel',
        name: 'Tasheel (DED Partner)',
        shortName: 'Tasheel',
        country: 'AE',
        emirate: 'Dubai',
        category: 'mainland',
        keywords: ['tasheel', 'ded', 'mainland', 'dubai', 'government'],
        isPopular: false
    },
    {
        id: 'twofour54',
        name: 'twofour54 Abu Dhabi',
        shortName: 'twofour54',
        country: 'AE',
        emirate: 'Abu Dhabi',
        category: 'free_zone',
        keywords: ['media', 'entertainment', 'creative', '254', 'abu dhabi'],
        website: 'https://www.twofour54.com',
        isPopular: true
    },
    {
        id: 'uaq-fz',
        name: 'Umm Al Quwain Free Trade Zone',
        shortName: 'UAQ FTZ',
        country: 'AE',
        emirate: 'Umm Al Quwain',
        category: 'free_zone',
        keywords: ['umm al quwain', 'uaq', 'free trade', 'zone'],
        website: 'https://www.uaqftz.com'
    }
]

/**
 * Get popular/recommended departments (used for quick suggestions)
 */
export const POPULAR_DEPARTMENTS = UAE_DEPARTMENTS.filter(dept => dept.isPopular)

/**
 * Get departments by category
 */
export const getDepartmentsByCategory = (category: EconomicDepartment['category']) => {
    return UAE_DEPARTMENTS.filter(dept => dept.category === category)
}

/**
 * Get departments by emirate
 */
export const getDepartmentsByEmirate = (emirate: EconomicDepartment['emirate']) => {
    return UAE_DEPARTMENTS.filter(dept => dept.emirate === emirate)
}

/**
 * Search departments by query string
 * Searches in name, shortName, and keywords
 */
export const searchDepartments = (query: string): EconomicDepartment[] => {
    if (!query || query.trim().length === 0) {
        return UAE_DEPARTMENTS
    }

    const lowerQuery = query.toLowerCase().trim()

    return UAE_DEPARTMENTS.filter(dept => {
        const nameMatch = dept.name.toLowerCase().includes(lowerQuery)
        const shortNameMatch = dept.shortName?.toLowerCase().includes(lowerQuery)
        const keywordMatch = dept.keywords.some(keyword =>
            keyword.toLowerCase().includes(lowerQuery)
        )
        const emirateMatch = dept.emirate?.toLowerCase().includes(lowerQuery)

        return nameMatch || shortNameMatch || keywordMatch || emirateMatch
    })
}

/**
 * Get department by ID
 */
export const getDepartmentById = (id: string): EconomicDepartment | undefined => {
    return ALL_DEPARTMENTS.find(dept => dept.id === id)
}

/**
 * Saudi Arabia Departments and Authorities
 */
export const SA_DEPARTMENTS: EconomicDepartment[] = [
    {
        id: 'sa-mci',
        name: 'Ministry of Commerce',
        shortName: 'MCI',
        country: 'SA',
        category: 'mainland',
        keywords: ['commerce', 'ministry', 'saudi', 'trade', 'cr'],
        website: 'https://mc.gov.sa',
        isPopular: true
    },
    {
        id: 'sa-misa',
        name: 'Ministry of Investment',
        shortName: 'MISA',
        country: 'SA',
        category: 'mainland',
        keywords: ['investment', 'foreign', 'sagia', 'invest saudi'],
        website: 'https://misa.gov.sa',
        isPopular: true
    },
    {
        id: 'sa-kaec',
        name: 'King Abdullah Economic City',
        shortName: 'KAEC',
        country: 'SA',
        category: 'free_zone',
        keywords: ['economic city', 'jeddah', 'port', 'industrial'],
        website: 'https://www.kaec.net',
        isPopular: true
    },
    {
        id: 'sa-neom',
        name: 'NEOM',
        shortName: 'NEOM',
        country: 'SA',
        category: 'free_zone',
        keywords: ['neom', 'future', 'tech', 'tabuk', 'mega project'],
        website: 'https://www.neom.com',
        isPopular: true
    },
    {
        id: 'sa-modon',
        name: 'Saudi Industrial Property Authority',
        shortName: 'MODON',
        country: 'SA',
        category: 'mainland',
        keywords: ['industrial', 'manufacturing', 'factory', 'modon'],
        website: 'https://www.modon.gov.sa'
    },
    {
        id: 'sa-rcrc',
        name: 'Royal Commission for Riyadh City',
        shortName: 'RCRC',
        country: 'SA',
        category: 'mainland',
        keywords: ['riyadh', 'capital', 'development'],
        website: 'https://www.rcrc.gov.sa'
    },
    {
        id: 'sa-rcjy',
        name: 'Royal Commission for Jubail and Yanbu',
        shortName: 'RCJY',
        country: 'SA',
        category: 'free_zone',
        keywords: ['jubail', 'yanbu', 'industrial', 'petrochemical'],
        website: 'https://www.rcjy.gov.sa',
        isPopular: true
    },
    {
        id: 'sa-sez-jazan',
        name: 'Jazan Economic City',
        shortName: 'JEC',
        country: 'SA',
        category: 'free_zone',
        keywords: ['jazan', 'economic city', 'industrial', 'port'],
        website: 'https://jazancity.com.sa'
    },
    {
        id: 'sa-riyadh-chamber',
        name: 'Riyadh Chamber of Commerce',
        shortName: 'RCC',
        country: 'SA',
        category: 'mainland',
        keywords: ['riyadh', 'chamber', 'commerce', 'business'],
        website: 'https://www.riyadhchamber.com'
    },
    {
        id: 'sa-jeddah-chamber',
        name: 'Jeddah Chamber of Commerce',
        shortName: 'JCC',
        country: 'SA',
        category: 'mainland',
        keywords: ['jeddah', 'chamber', 'commerce', 'business'],
        website: 'https://www.jcci.org.sa'
    },
    {
        id: 'sa-dammam-chamber',
        name: 'Eastern Province Chamber of Commerce',
        shortName: 'EPCC',
        country: 'SA',
        category: 'mainland',
        keywords: ['dammam', 'eastern', 'chamber', 'commerce', 'oil'],
        website: 'https://www.chamber.org.sa'
    },
    {
        id: 'sa-zatca',
        name: 'Zakat, Tax and Customs Authority',
        shortName: 'ZATCA',
        country: 'SA',
        category: 'mainland',
        keywords: ['tax', 'zakat', 'customs', 'vat', 'gazt'],
        website: 'https://zatca.gov.sa',
        isPopular: true
    },
    {
        id: 'sa-sagia',
        name: 'Saudi Arabian General Investment Authority',
        shortName: 'SAGIA',
        country: 'SA',
        category: 'mainland',
        keywords: ['investment', 'foreign', 'license', 'sagia'],
        website: 'https://investsaudi.sa'
    },
    {
        id: 'sa-sfda',
        name: 'Saudi Food and Drug Authority',
        shortName: 'SFDA',
        country: 'SA',
        category: 'mainland',
        keywords: ['food', 'drug', 'pharmaceutical', 'medical', 'cosmetics'],
        website: 'https://www.sfda.gov.sa'
    },
    {
        id: 'sa-knowledge-city',
        name: 'King Abdullah University Science and Technology',
        shortName: 'KAUST',
        country: 'SA',
        category: 'free_zone',
        keywords: ['university', 'research', 'tech', 'science', 'innovation'],
        website: 'https://www.kaust.edu.sa'
    }
]

/**
 * Egypt Departments and Authorities
 */
export const EG_DEPARTMENTS: EconomicDepartment[] = [
    {
        id: 'eg-gafi',
        name: 'General Authority for Investment and Free Zones',
        shortName: 'GAFI',
        country: 'EG',
        category: 'mainland',
        keywords: ['investment', 'gafi', 'foreign', 'one stop shop'],
        website: 'https://www.gafi.gov.eg',
        isPopular: true
    },
    {
        id: 'eg-sczone',
        name: 'Suez Canal Economic Zone',
        shortName: 'SCZONE',
        country: 'EG',
        category: 'free_zone',
        keywords: ['suez', 'canal', 'port', 'industrial', 'logistics'],
        website: 'https://www.sczone.eg',
        isPopular: true
    },
    {
        id: 'eg-cra',
        name: 'Commercial Registry Authority',
        shortName: 'CRA',
        country: 'EG',
        category: 'mainland',
        keywords: ['commercial', 'registry', 'company', 'registration'],
        website: 'https://www.cairo.gov.eg',
        isPopular: true
    },
    {
        id: 'eg-eta',
        name: 'Egyptian Tax Authority',
        shortName: 'ETA',
        country: 'EG',
        category: 'mainland',
        keywords: ['tax', 'vat', 'income', 'eta'],
        website: 'https://www.eta.gov.eg',
        isPopular: true
    },
    {
        id: 'eg-smart-village',
        name: 'Smart Village Cairo',
        shortName: 'Smart Village',
        country: 'EG',
        category: 'free_zone',
        keywords: ['tech', 'it', 'smart', 'cairo', 'technology park'],
        website: 'https://www.smart-villages.com',
        isPopular: true
    },
    {
        id: 'eg-alex-fz',
        name: 'Alexandria Free Zone',
        shortName: 'Alex FZ',
        country: 'EG',
        category: 'free_zone',
        keywords: ['alexandria', 'port', 'free zone', 'trade'],
        website: 'https://www.gafi.gov.eg'
    },
    {
        id: 'eg-nasr-city-fz',
        name: 'Nasr City Free Zone',
        shortName: 'Nasr City FZ',
        country: 'EG',
        category: 'free_zone',
        keywords: ['nasr city', 'cairo', 'free zone', 'industrial'],
        website: 'https://www.gafi.gov.eg'
    },
    {
        id: 'eg-port-said-fz',
        name: 'Port Said Free Zone',
        shortName: 'Port Said FZ',
        country: 'EG',
        category: 'free_zone',
        keywords: ['port said', 'suez', 'canal', 'port', 'shipping'],
        website: 'https://www.gafi.gov.eg'
    },
    {
        id: 'eg-itida',
        name: 'Information Technology Industry Development Agency',
        shortName: 'ITIDA',
        country: 'EG',
        category: 'mainland',
        keywords: ['it', 'software', 'tech', 'outsourcing', 'digital'],
        website: 'https://www.itida.gov.eg',
        isPopular: true
    },
    {
        id: 'eg-fedcoc',
        name: 'Federation of Egyptian Chambers of Commerce',
        shortName: 'FEDCOC',
        country: 'EG',
        category: 'mainland',
        keywords: ['chamber', 'commerce', 'trade', 'business'],
        website: 'https://www.fedcoc.org.eg'
    },
    {
        id: 'eg-cairo-chamber',
        name: 'Cairo Chamber of Commerce',
        country: 'EG',
        category: 'mainland',
        keywords: ['cairo', 'chamber', 'commerce', 'business'],
        website: 'https://www.cairochamber.org.eg'
    },
    {
        id: 'eg-ida',
        name: 'Industrial Development Authority',
        shortName: 'IDA',
        country: 'EG',
        category: 'mainland',
        keywords: ['industrial', 'manufacturing', 'factory', 'license'],
        website: 'https://www.ida.gov.eg'
    },
    {
        id: 'eg-new-capital',
        name: 'New Administrative Capital',
        shortName: 'NAC',
        country: 'EG',
        category: 'mainland',
        keywords: ['new capital', 'cairo', 'government', 'business district'],
        website: 'https://www.acud.eg'
    },
    {
        id: 'eg-ain-sokhna',
        name: 'Ain Sokhna Industrial Zone',
        shortName: 'Ain Sokhna',
        country: 'EG',
        category: 'free_zone',
        keywords: ['ain sokhna', 'red sea', 'industrial', 'port'],
        website: 'https://www.sczone.eg'
    },
    {
        id: 'eg-10th-ramadan',
        name: '10th of Ramadan City Industrial Zone',
        shortName: '10th Ramadan',
        country: 'EG',
        category: 'mainland',
        keywords: ['10th ramadan', 'industrial', 'manufacturing', 'cairo'],
        website: 'https://www.newcities.gov.eg'
    }
]

/**
 * All departments combined
 */
export const ALL_DEPARTMENTS: EconomicDepartment[] = [
    ...UAE_DEPARTMENTS,
    ...SA_DEPARTMENTS,
    ...EG_DEPARTMENTS,
]

/**
 * Get departments by country
 */
export const getDepartmentsByCountry = (country: 'AE' | 'SA' | 'EG'): EconomicDepartment[] => {
    switch (country) {
        case 'AE': return UAE_DEPARTMENTS
        case 'SA': return SA_DEPARTMENTS
        case 'EG': return EG_DEPARTMENTS
        default: return UAE_DEPARTMENTS
    }
}

/**
 * Search all departments
 */
export const searchAllDepartments = (query: string, country?: 'AE' | 'SA' | 'EG'): EconomicDepartment[] => {
    const departments = country ? getDepartmentsByCountry(country) : ALL_DEPARTMENTS

    if (!query || query.trim().length === 0) {
        return departments
    }

    const lowerQuery = query.toLowerCase().trim()

    return departments.filter(dept => {
        const nameMatch = dept.name.toLowerCase().includes(lowerQuery)
        const shortNameMatch = dept.shortName?.toLowerCase().includes(lowerQuery)
        const keywordMatch = dept.keywords.some(keyword =>
            keyword.toLowerCase().includes(lowerQuery)
        )

        return nameMatch || shortNameMatch || keywordMatch
    })
}

/**
 * Get popular departments by country
 */
export const getPopularDepartments = (country: 'AE' | 'SA' | 'EG'): EconomicDepartment[] => {
    return getDepartmentsByCountry(country).filter(dept => dept.isPopular)
}

/**
 * Get department count by country
 */
export const DEPARTMENT_COUNTS = {
    AE: UAE_DEPARTMENTS.length,
    SA: SA_DEPARTMENTS.length,
    EG: EG_DEPARTMENTS.length,
    TOTAL: UAE_DEPARTMENTS.length + SA_DEPARTMENTS.length + EG_DEPARTMENTS.length,
}

