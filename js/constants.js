// ============================================
// ========== YOUR STORY IDLE - CONSTANTS ==========
// ============================================
// هذا الملف يحتوي على جميع الثوابت والبيانات المرجعية للعبة
// لا يحتوي على أي دوال أو منطق - بيانات فقط

// ============================================
// 1. الوقت والفلك (Time & Astronomy)
// ============================================
export const WEEK_DAYS = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
];

export const SEASONS = [
    'SPRING',
    'SUMMER',
    'AUTUMN',
    'WINTER'
];

export const WEATHER_TYPES = [
    'CLEAR',
    'CLOUDY',
    'RAIN',
    'STORM',
    'SNOW',
    'FOG'
];

export const MOON_PHASES = [
    '🌑 NEW MOON',
    '🌒 WAXING CRESCENT',
    '🌓 FIRST QUARTER',
    '🌔 WAXING GIBBOUS',
    '🌕 FULL MOON',
    '🌖 WANING GIBBOUS',
    '🌗 LAST QUARTER',
    '🌘 WANING CRESCENT'
];

// ثوابت فلكية
export const LUNAR_CYCLE_DAYS = 29.53;
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 4;

// ============================================
// 2. إعدادات السماء والطقس (Sky & Weather Settings)
// ============================================
export const SKY_SETTINGS = {
    periods: {
        dawn: { start: 5, end: 7 },
        day: { start: 7, end: 17 },
        dusk: { start: 17, end: 19 },
        night: { start: 19, end: 5 }
    },
    colors: {
        dawn: 'linear-gradient(to bottom, #a8d8ea 0%, #a8d8ea 60%, #ff9a56 80%, #e85d26 100%)',
        day: 'radial-gradient(circle at 50% 50%, #ffffff, #3a6ea5)',
        dusk: 'linear-gradient(to bottom, #a8d8ea 0%, #a8d8ea 60%, #ff9a56 80%, #e85d26 100%)',
        night: 'radial-gradient(circle at 50% 50%, #4a6a8a, #050a14)'
    }
};

export const WEATHER_SETTINGS = {
    changeIntervalHours: 8,
    seasons: {
        SPRING: { CLEAR: 60, FOG: 20, RAIN: 10, CLOUDY: 10 },
        SUMMER: { CLEAR: 70, FOG: 20, CLOUDY: 10 },
        AUTUMN: { CLEAR: 30, FOG: 20, CLOUDY: 25, RAIN: 25 },
        WINTER: { RAIN: 20, STORM: 20, SNOW: 20, CLOUDY: 20, FOG: 10, CLEAR: 10 }
    }
};

// ============================================
// 3. إعدادات اللعبة الأساسية (Core Game Configuration)
// ============================================
export const GAME_CONFIG = {
    // إعدادات الحفظ التلقائي
    autoSaveIntervalMs: 20000,
    
    // إعدادات النوم
    sleepMultiplier: 5,
    sleepIntervalMs: 200,
    
    // إعدادات سجل الرسائل
    defaultMaxMessages: 20,
    maxMessagesMin: 1,
    maxMessagesMax: 50
};

// ============================================
// 4. قالب الفتحة الأساسي (Slot Base Template)
// ============================================
export const SLOT_BASE_TEMPLATE = {
    exists: false,
    mode: 'Easy',
    spawn: 'Alden_Village',
    
    // معلومات أساسية
    basePlayerName: 'Player',
    basePlayerAge: 10,
    baseLevel: 1,
	baseXP: 0,
    baseCoins: 0,
	baseXPNeeded: 100,
    
    // إحصاءات
    baseStats: {
        will: 1,
		think: 1,
		practical: 1,
		social: 1,
		strength: 1,
		agility: 1,
		fortitude: 1,
    },
    
    // موارد
    baseMaxHealth: 10,
    baseMaxStamina: 10,
    baseMaxFocus: 100,
    baseMaxHunger: 100,
    baseMaxAether: 10,
    baseMaxHearts: 1,
    
    // مخزون وتجهيزات
    inventory: [],
    equippedItems: {},
    
    // مهارات
    generalSkills: {},
    passiveSkills: {},
    activeSkills: {},
    
    // فتحات الحركة (1-9)
    actionSlots: {
        1: { type: 'active', name: null, item: null, displayName: 'SKILL 1' },
        2: { type: 'active', name: null, item: null, displayName: 'SKILL 2' },
        3: { type: 'active', name: null, item: null, displayName: 'SKILL 3' },
        4: { type: 'active', name: null, item: null, displayName: 'SKILL 4' },
        5: { type: 'active', name: null, item: null, displayName: 'SKILL 5' },
        6: { type: 'active', name: null, item: null, displayName: 'SKILL 6' },
        7: { type: 'consumable', name: null, item: null, displayName: 'FOOD' },
        8: { type: 'consumable', name: null, item: null, displayName: 'POTION 1' },
        9: { type: 'consumable', name: null, item: null, displayName: 'POTION 2' }
    },
    
    // الزمن والطقس
    gameMinutes: 0,
    gameHours: 8,
    gameDays: 1,
    gameMonths: 1,
    gameYears: 456,
    weather: 'CLEAR',
    
    // تقدم القصة
    currentEventId: 'VILLAGER_1',
    messageLog: [],
    hasPlayedIntro: false,
};

// ============================================
// 5. نقاط البداية (Spawn Points)
// ============================================
export const SPAWN_POINTS = {
    Alden_Village: {
        id: 'ALDEN_VILLAGE',
        name: 'Alden Village',
        introText: `It all began at the tender age of ten. The night monsters stole everything you held dear, leaving behind only ashes and an echoing scream. Blinded by fury, you vowed a deadly revenge.
		You rushed into the treacherous forest, a mere child seeking blood. But fate had other plans. In your recklessness, you collapsed, lost to consciousness before the beasts could claim you.
A kind villager found you and carried you back to the safety of your home. As you healed, the path of reckless vengeance seemed closed, but a new, deeper fire was lit within you.
You swore from that day forward to become strong. Not just to fight, but to survive. Not to save the world, but to protect the people who truly matter to you. Your real story begins now.`,
        startEvent: 'VILLAGER_1'
    }
};

// ============================================
// 6. قاعدة بيانات التنقل والأحداث (NAV)
// ============================================
export const NAV = {
    VILLAGE: {
        display: 'Village Center',
        description: 'The heart of the community. From here, you can explore various streets and facilities.',
        choices: [
            { text: 'Go Home', action: { type: 'NAVIGATE', eventId: 'HOME' } },
            { text: 'Alden Street', action: { type: 'NAVIGATE', eventId: 'ALDEN_STREET' } },
            { text: "Trader's Row", action: { type: 'NAVIGATE', eventId: 'TRADERS_ROW' } },
            { text: 'Ironforge Street', action: { type: 'NAVIGATE', eventId: 'IRONFORGE_STREET' } },
            { text: 'Food Street', action: { type: 'NAVIGATE', eventId: 'FOOD_STREET' } },
            { text: 'The Gate', action: { type: 'NAVIGATE', eventId: 'GATE' } },
            { text: 'Fields', action: { type: 'NAVIGATE', eventId: 'FIELDS' } }
        ]
    },
    
    HOME: {
        display: 'Your Home',
        description: 'A place to rest and store items. The warm hearth reminds you of simpler times.',
        choices: [
            { text: 'Rest in bed', action: { type: 'NAVIGATE', eventId: 'BED' } },
            { text: 'Check Storage', action: { type: 'MESSAGE', text: 'Your storage contains various items you\'ve collected over time.' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    BED: {
        display: 'Your Bed',
        description: 'A comfortable place to rest.',
        choices: [
            { text: 'Get Up', action: { type: 'FUNCTION', name: 'leaveBed' } },
            { text: 'Sleep', action: { type: 'FUNCTION', name: 'startSleeping' } }
        ]
    },
    
    BED_SLEEPING: {
        display: 'Your Bed',
        description: 'You are sleeping peacefully. Time passes faster.',
        choices: [
            { text: 'Wake Up', action: { type: 'FUNCTION', name: 'wakeUp' } }
        ]
    },
    
    ALDEN_STREET: {
        display: 'Alden Street',
        description: 'A bustling street filled with adventurers. The Adventurer\'s Guild stands tall here.',
        choices: [
            { text: 'Adventurer Guild', action: { type: 'MESSAGE', text: 'Adventurer Guild - Coming Soon!' } },
            { text: 'Monument Of Alden', action: { type: 'MESSAGE', text: 'Monument Of Alden - Coming Soon!' } },
            { text: 'Tavern', action: { type: 'MESSAGE', text: 'Tavern - Coming Soon!' } },
            { text: 'Clinic', action: { type: 'MESSAGE', text: 'Clinic - Coming Soon!' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    TRADERS_ROW: {
        display: "Trader's Row",
        description: 'A street filled with merchants and traders. Rare goods can be found here.',
        choices: [
            { text: 'Traveling Merchant', action: { type: 'MESSAGE', text: 'Traveling Merchant - Coming Soon!' } },
            { text: 'Alchemy Workshop', action: { type: 'MESSAGE', text: 'Alchemy Workshop - Coming Soon!' } },
            { text: 'Bank', action: { type: 'MESSAGE', text: 'Bank - Coming Soon!' } },
            { text: 'Auction House', action: { type: 'MESSAGE', text: 'Auction House - Coming Soon!' } },
            { text: 'Black Market', action: { type: 'MESSAGE', text: 'Black Market - Coming Soon!' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    IRONFORGE_STREET: {
        display: 'Ironforge Street',
        description: 'The clang of hammers fills the air. This is where weapons and armor are made.',
        choices: [
            { text: 'Blacksmith', action: { type: 'MESSAGE', text: 'Blacksmith - Coming Soon!' } },
            { text: 'Carpenter', action: { type: 'MESSAGE', text: 'Carpenter - Coming Soon!' } },
            { text: "Tinker's Shop", action: { type: 'MESSAGE', text: "Tinker's Shop - Coming Soon!" } },
            { text: 'Armorer', action: { type: 'MESSAGE', text: 'Armorer - Coming Soon!' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    FOOD_STREET: {
        display: 'Food Street',
        description: 'Delicious aromas waft through the air. Your stomach growls.',
        choices: [
            { text: 'Bakery', action: { type: 'MESSAGE', text: 'Bakery - Coming Soon!' } },
            { text: 'Butcher', action: { type: 'MESSAGE', text: 'Butcher - Coming Soon!' } },
            { text: 'Food Stand', action: { type: 'MESSAGE', text: 'Food Stand - Coming Soon!' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    GATE: {
        display: 'The Gate',
        description: 'The entrance to the outside world. Danger and adventure await beyond these walls.',
        choices: [
            { text: 'Forest', action: { type: 'MESSAGE', text: 'Forest - Coming Soon!' } },
            { text: 'Stable', action: { type: 'MESSAGE', text: 'Stable - Coming Soon!' } },
            { text: 'Cave', action: { type: 'MESSAGE', text: 'Cave - Coming Soon!' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    FIELDS: {
        display: 'Fields',
        description: 'Open fields stretching to the horizon. Peaceful and serene.',
        choices: [
            { text: 'Training Area', action: { type: 'MESSAGE', text: 'Training Area - Coming Soon!' } },
            { text: 'Aether Specialist', action: { type: 'MESSAGE', text: 'Aether Specialist - Coming Soon!' } },
            { text: 'Rice Fields', action: { type: 'MESSAGE', text: 'Rice Fields - Coming Soon!' } },
            { text: 'Back to Village', action: { type: 'NAVIGATE', eventId: 'VILLAGE' } }
        ]
    },
    
    VILLAGER_1: {
        display: 'The Kind Villager',
        description: 'Easy now... You\'re finally awake. Can you hear me?',
        choices: [
            { text: 'Where... where am I?', action: { type: 'NAVIGATE', eventId: 'VILLAGER_2' } },
            { text: 'Was it you? Are you the one who brought me here?', action: { type: 'NAVIGATE', eventId: 'VILLAGER_3' } }
        ]
    },
    
    VILLAGER_2: {
        display: 'The Kind Villager',
        description: 'You\'re safe in your own home. I found you out cold in the forest and brought you back here to tend to your wounds.',
        choices: [
            { text: 'Thank you. I truly appreciate what you\'ve done for me. (speaks while crying)', action: { type: 'NAVIGATE', eventId: 'VILLAGER_4' } },
            { text: 'Why did you interfere? I have a debt to settle... I need my revenge! (speaks with anger)', action: { type: 'NAVIGATE', eventId: 'VILLAGER_5' } }
        ]
    },
    
    VILLAGER_3: {
        display: 'The Kind Villager',
        description: 'It was. Found you collapsed under the trees. You\'re lucky I did; the monsters in those woods don\'t usually leave visitors in one piece.',
        choices: [
            { text: 'Thank you. I truly appreciate what you\'ve done for me. (speaks while crying)', action: { type: 'NAVIGATE', eventId: 'VILLAGER_4' } },
            { text: 'Why did you interfere? I have a debt to settle... I need my revenge! (speaks with anger)', action: { type: 'NAVIGATE', eventId: 'VILLAGER_5' } }
        ]
    },
    
    VILLAGER_4: {
        display: 'The Kind Villager',
        description: 'Don\'t mention it. Just promise me you won\'t go wandering back there—it\'s death for the unprepared. I\'ve patched up your wounds.',
        choices: [
            { text: 'I miss my parents... (speaks sadly)', action: { type: 'NAVIGATE', eventId: 'VILLAGER_6' } }
        ]
    },
    
    VILLAGER_5: {
        display: 'The Kind Villager',
        description: 'Revenge? Look at yourself. You can barely stand, let alone fight. In your current state, you\'d be nothing more than monster food. Stay put, get strong first. I\'ve treated your injuries for now.',
        choices: [
            { text: 'I miss my parents... (speaks sadly)', action: { type: 'NAVIGATE', eventId: 'VILLAGER_6' } }
        ]
    },
    
    VILLAGER_6: {
        display: 'The Kind Villager',
        description: 'Do not dwell in sorrow, child. Life can be cruel, far more than we deserve, but we must learn to endure. You must grow strong—not just for yourself, but so you can protect those who truly matter to you.',
        choices: [
            { text: 'I understand.', action: { type: 'NAVIGATE', eventId: 'VILLAGER_7' } }
        ]
    },
    
    VILLAGER_7: {
        display: 'The Kind Villager',
        description: 'Good. I wish you strength and a swift recovery. I must take my leave now, but remember: if you find yourself in need, do not hesitate to ask. Many in this village are kind souls who will stand by you.',
        choices: [
            { text: 'Thank you.', action: { type: 'NAVIGATE', eventId: 'BED' } }
        ]
    }
};

// ============================================
// 7. قاعدة بيانات العناصر (Items Database)
// ============================================
export const ITEMS = {
    weapons: {},      // أسلحة
    armor: {},        // دروع
    tools: {},        // أدوات
    consumables: {},  // مواد استهلاكية
    materials: {}     // مواد خام
};

// ============================================
// 8. قاعدة بيانات المهارات (Skills Database)
// ============================================
export const SKILLS = {
    general: {},   // مهارات عامة
    passive: {},   // مهارات سلبية
    active: {}     // مهارات نشطة
};
