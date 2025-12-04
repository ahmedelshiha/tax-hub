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
    return UAE_DEPARTMENTS.find(dept => dept.id === id)
}

/**
 * Get department count
 */
export const DEPARTMENT_COUNT = UAE_DEPARTMENTS.length
