// ============================================
// ========== YOUR STORY IDLE - GAME ENGINE ==========
// ============================================
// هذا الملف يحتوي على جميع دوال منطق اللعبة
// يتعامل مع localStorage ويستخدم state.js و event-bus.js

import { 
    slots, 
    currentSlotIndex, 
    currentSlot,
    createNewSlot,
    getSlot,
    setSlot,
    setCurrentSlot,
    clearCurrentSlot,
    deleteSlotFromMemory,
    isSlotUsed,
    initSlots
} from './state.js';
import { 
    GAME_CONFIG, 
    SPAWN_POINTS,
    SEASONS, 
    WEATHER_TYPES, 
    MOON_PHASES,
    LUNAR_CYCLE_DAYS,
    DAYS_PER_MONTH,
    MONTHS_PER_YEAR,
    WEATHER_SETTINGS,
    NAV,
    ITEMS,
    SKILLS
} from './constants.js';
import { eventBus } from './event-bus.js';

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ============================================
// 1. دوال التخزين (localStorage)
// ============================================

/**
 * تحميل فتحة من localStorage
 * @param {number} slotNum - رقم الفتحة (1, 2, 3)
 * @returns {Object|null} بيانات الفتحة أو null إذا لم تكن موجودة
 */
function loadSlotFromStorage(slotNum) {
    try {
        const saved = localStorage.getItem(`ys_slot_${slotNum}`);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error(`Failed to load slot ${slotNum} from storage:`, error);
    }
    return null;
}

/**
 * حفظ فتحة إلى localStorage
 * @param {number} slotNum - رقم الفتحة (1, 2, 3)
 */
function saveSlotToStorage(slotNum) {
    try {
        const slot = getSlot(slotNum);
        if (slot) {
            localStorage.setItem(`ys_slot_${slotNum}`, JSON.stringify(slot));
        }
    } catch (error) {
        console.error(`Failed to save slot ${slotNum} to storage:`, error);
    }
}

/**
 * حذف فتحة من localStorage
 * @param {number} slotNum - رقم الفتحة (1, 2, 3)
 */
function deleteSlotFromStorage(slotNum) {
    try {
        localStorage.removeItem(`ys_slot_${slotNum}`);
    } catch (error) {
        console.error(`Failed to delete slot ${slotNum} from storage:`, error);
    }
}

/**
 * تحميل جميع الفتحات من localStorage إلى الذاكرة
 */
function loadAllSlotsFromStorage() {
    for (let i = 1; i <= 3; i++) {
        const savedData = loadSlotFromStorage(i);
        if (savedData) {
            setSlot(i, savedData);
        }
    }
}

// ============================================
// 2. دوال إدارة اللعبة (بدء، تحميل، حفظ، حذف)
// ============================================

/**
 * بدء لعبة جديدة في فتحة معينة
 * @param {number} slotNum - رقم الفتحة (1, 2, 3)
 * @param {string} mode - صعوبة اللعبة ('Easy' أو 'Hardcore')
 * @param {string} spawn - نقطة البداية (مثلاً 'Alden_Village')
 */
export function startNewGame(slotNum, mode, spawn) {
    // 1. إنشاء فتحة جديدة من القالب
    const newSlot = createNewSlot();
    
    // 2. تعيين القيم الأساسية
    newSlot.exists = true;
    newSlot.mode = mode;
    newSlot.spawn = spawn;
    
    // 3. تعيين الحدث الابتدائي من نقطة البداية
    const spawnData = SPAWN_POINTS[spawn];
    if (spawnData) {
        newSlot.currentEventId = spawnData.startEvent;
    }
    
    // 4. جعل الموارد ممتلئة
    newSlot.healthVal = newSlot.baseMaxHealth;
    newSlot.stamina = newSlot.baseMaxStamina;
    newSlot.hungerVal = newSlot.baseMaxHunger;
    newSlot.focusVal = newSlot.baseMaxFocus;
    newSlot.aetherVal = newSlot.baseMaxAether;
    
    // 5. وضع الفتحة في الذاكرة
    setSlot(slotNum, newSlot);
    
    // 6. جعلها الفتحة النشطة
    setCurrentSlot(slotNum);
    
    // 7. حفظ في localStorage
    saveSlotToStorage(slotNum);
    
    // 8. إرسال حدث
    eventBus.emit('game:started', { slotIndex: slotNum, mode, spawn });
    
    return newSlot;
}

/**
 * تحميل لعبة محفوظة
 * @param {number} slotNum - رقم الفتحة (1, 2, 3)
 * @returns {boolean} true إذا تم التحميل بنجاح
 */
export function loadGame(slotNum) {
    // 1. التأكد من أن الفتحة موجودة في الذاكرة
    let slot = getSlot(slotNum);
    
    // 2. إذا لم تكن موجودة أو غير مستخدمة، حاول تحميلها من localStorage
    if (!slot || !slot.exists) {
        const savedData = loadSlotFromStorage(slotNum);
        if (savedData && savedData.exists) {
            setSlot(slotNum, savedData);
            slot = savedData;
        } else {
            console.error(`Slot ${slotNum} is empty or corrupted.`);
            return false;
        }
    }
    
    // 3. جعلها الفتحة النشطة
    setCurrentSlot(slotNum);
    
    // 4. التأكد من أن الموارد لا تتجاوز القيم القصوى
    clampResources();
    
    // 5. إرسال حدث
    eventBus.emit('game:loaded', { slotIndex: slotNum });
    
    return true;
}

/**
 * حفظ اللعبة الحالية
 * @returns {boolean} true إذا تم الحفظ بنجاح
 */
export function saveGame() {
    if (currentSlotIndex === null || !currentSlot) {
        console.error('No active slot to save.');
        return false;
    }
    
    // 1. التأكد من أن الفتحة موجودة في المصفوفة
    setSlot(currentSlotIndex, currentSlot);
    
    // 2. حفظ في localStorage
    saveSlotToStorage(currentSlotIndex);
    
    // 3. إرسال حدث
    eventBus.emit('game:saved', { slotIndex: currentSlotIndex });
    
    return true;
}

/**
 * حذف لعبة محفوظة
 * @param {number} slotNum - رقم الفتحة (1, 2, 3)
 */
export function deleteGame(slotNum) {
    // 1. حذف من localStorage
    deleteSlotFromStorage(slotNum);
    
    // 2. حذف من الذاكرة
    deleteSlotFromMemory(slotNum);
    
    // 3. إذا كانت الفتحة المحذوفة هي النشطة، امسح المؤشر
    if (currentSlotIndex === slotNum) {
        clearCurrentSlot();
    }
    
    // 4. إرسال حدث
    eventBus.emit('slot:deleted', { slotIndex: slotNum });
}

/**
 * تهيئة جميع الفتحات عند بدء اللعبة لأول مرة
 */
export function initializeSlots() {
    // 1. تهيئة الذاكرة بقوالب فارغة
    initSlots();
    
    // 2. محاولة تحميل البيانات المحفوظة من localStorage
    loadAllSlotsFromStorage();
}

/**
 * التحقق مما إذا كان هناك أي لعبة محفوظة
 * @returns {boolean} true إذا كان هناك فتحة واحدة على الأقل محفوظة
 */
export function hasAnySavedGame() {
    for (let i = 1; i <= 3; i++) {
        if (isSlotUsed(i)) {
            return true;
        }
        // تحقق من localStorage مباشرة أيضاً
        const saved = loadSlotFromStorage(i);
        if (saved && saved.exists) {
            return true;
        }
    }
    return false;
}

// ============================================
// 3. دوال مساعدة للموارد
// ============================================

/**
 * التأكد من أن الموارد لا تتجاوز القيم القصوى
 */
function clampResources() {
    if (!currentSlot) return;
    
    currentSlot.healthVal = Math.min(currentSlot.healthVal, currentSlot.baseMaxHealth);
    currentSlot.stamina = Math.min(currentSlot.stamina, currentSlot.baseMaxStamina);
    currentSlot.hungerVal = Math.min(currentSlot.hungerVal, currentSlot.baseMaxHunger);
    currentSlot.focusVal = Math.min(currentSlot.focusVal, currentSlot.baseMaxFocus);
    currentSlot.aetherVal = Math.min(currentSlot.aetherVal, currentSlot.baseMaxAether);
}

// ============================================
// 4. تصدير الدوال الداخلية للاستخدام الخارجي (إذا لزم)
// ============================================

export const Storage = {
    loadSlotFromStorage,
    saveSlotToStorage,
    deleteSlotFromStorage,
    loadAllSlotsFromStorage
};

// ============================================
// ========== قسم الوقت والتاريخ والطقس ==========
// ============================================

// ============================================
// 1. متغيرات داخلية للتحكم بالطقس
// ============================================

/** آخر ساعة تم فيها تغيير الطقس - لمنع التكرار */
let lastWeatherChangeHour = 8;

// ============================================
// 2. دوال الوقت الأساسية
// ============================================

/**
 * تقدم الوقت بمقدار معين من الدقائق
 * هذه هي الدالة الأساسية التي تعتمد عليها جميع أنظمة الوقت
 * @param {number} minutes - عدد الدقائق للتقدم (افتراضي: 1)
 */
export function advanceTime(minutes = 1) {
    if (!currentSlot) {
        console.error('No current slot to advance time.');
        return;
    }
    
    let minutesPassed = 0;
    let hoursPassed = 0;
    let daysPassed = 0;
    
    // تقدم دقيقة بدقيقة لتتبع التغييرات بدقة
    for (let i = 0; i < minutes; i++) {
        currentSlot.gameMinutes++;
        minutesPassed++;
        
        // التحقق من تجاوز 60 دقيقة
        if (currentSlot.gameMinutes >= 60) {
            currentSlot.gameMinutes = 0;
            currentSlot.gameHours++;
            hoursPassed++;
            
            // التحقق من تجاوز 24 ساعة
            if (currentSlot.gameHours >= 24) {
                currentSlot.gameHours = 0;
                currentSlot.gameDays++;
                daysPassed++;
                
                // إرسال حدث يوم جديد
                eventBus.emit('time:day', {
                    days: currentSlot.gameDays,
                    months: currentSlot.gameMonths,
                    years: currentSlot.gameYears
                });
                
                // التحقق من تجاوز 30 يوم
                if (currentSlot.gameDays > DAYS_PER_MONTH) {
                    currentSlot.gameDays = 1;
                    currentSlot.gameMonths++;
                    
                    // التحقق من تجاوز 4 شهور (سنة)
                    if (currentSlot.gameMonths > MONTHS_PER_YEAR) {
                        currentSlot.gameMonths = 1;
                        currentSlot.gameYears++;
                        
                        // إرسال حدث سنة جديدة
                        eventBus.emit('time:year', {
                            years: currentSlot.gameYears
                        });
                    }
                    
                    // إرسال حدث شهر جديد
                    eventBus.emit('time:month', {
                        months: currentSlot.gameMonths,
                        season: getCurrentSeason()
                    });
                }
            }
            
            // إرسال حدث ساعة جديدة
            eventBus.emit('time:hour', {
                hours: currentSlot.gameHours,
                days: currentSlot.gameDays
            });
            
            // التحقق من تغير الطقس (كل 8 ساعات)
            checkWeatherChange();
        }
    }
    
    // إرسال حدث دقيقة (مع عدد الدقائق المتراكمة إذا أردت)
    eventBus.emit('time:minute', {
        minutes: currentSlot.gameMinutes,
        hours: currentSlot.gameHours,
        days: currentSlot.gameDays,
        passed: minutes
    });
    
    // إرسال حدث عام بتغير الوقت
    eventBus.emit('time:advanced', {
        minutes: minutesPassed,
        hours: hoursPassed,
        days: daysPassed,
        currentTime: getCurrentTime()
    });
}

/**
 * الحصول على الوقت الحالي ككائن
 * @returns {Object} الوقت الحالي
 */
export function getCurrentTime() {
    if (!currentSlot) return null;
    
    return {
        minutes: currentSlot.gameMinutes,
        hours: currentSlot.gameHours,
        days: currentSlot.gameDays,
        months: currentSlot.gameMonths,
        years: currentSlot.gameYears,
        season: getCurrentSeason(),
        weather: currentSlot.weather,
        moonPhase: getMoonPhase(),
        lunarDay: getLunarDay()
    };
}

/**
 * تنسيق الوقت للعرض
 * @param {boolean} includeSeconds - هل نضيف الثواني (للتأثيرات البصرية)
 * @returns {string} الوقت منسقاً
 */
export function formatTime(includeSeconds = false) {
    if (!currentSlot) return '';
    
    const hours = String(currentSlot.gameHours).padStart(2, '0');
    const minutes = String(currentSlot.gameMinutes).padStart(2, '0');
    
    if (includeSeconds) {
        return `${hours}:${minutes}:00`;
    }
    return `${hours}:${minutes}`;
}

/**
 * الحصول على الفترة الزمنية الحالية (فجر، نهار، غسق، ليل)
 * @returns {string} الفترة الزمنية
 */
export function getCurrentPeriod() {
    if (!currentSlot) return 'day';
    
    const hour = currentSlot.gameHours;
    
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'dusk';
    return 'night';
}

/**
 * الحصول على إجمالي الأيام منذ بداية اللعبة
 * @returns {number} إجمالي الأيام
 */
export function getTotalDays() {
    if (!currentSlot) return 0;
    
    let total = 0;
    total += (currentSlot.gameYears - 1) * MONTHS_PER_YEAR * DAYS_PER_MONTH;
    total += (currentSlot.gameMonths - 1) * DAYS_PER_MONTH;
    total += currentSlot.gameDays;
    
    return total;
}

// ============================================
// 3. دوال المواسم
// ============================================

/**
 * الحصول على الموسم الحالي
 * @returns {string} اسم الموسم
 */
export function getCurrentSeason() {
    if (!currentSlot) return SEASONS[0];
    
    const month = currentSlot.gameMonths;
    
    // الشهر 1 = ربيع، 2 = صيف، 3 = خريف، 4 = شتاء
    if (month === 1) return SEASONS[0]; // SPRING
    if (month === 2) return SEASONS[1]; // SUMMER
    if (month === 3) return SEASONS[2]; // AUTUMN
    return SEASONS[3]; // WINTER
}

// ============================================
// 4. دوال الطقس
// ============================================

/**
 * التحقق مما إذا كان يجب تغيير الطقس
 */
function checkWeatherChange() {
    if (!currentSlot) return;
    
    const currentHour = currentSlot.gameHours;
    
    // تغيير الطقس عند الساعات 0, 8, 16
    if (currentHour === 0 || currentHour === 8 || currentHour === 16) {
        // منع التكرار في نفس الساعة
        if (lastWeatherChangeHour !== currentHour) {
            lastWeatherChangeHour = currentHour;
            updateWeather();
        }
    }
}

/**
 * تحديث الطقس بناءً على الموسم الحالي
 */
export function updateWeather() {
    if (!currentSlot) return;
    
    const season = getCurrentSeason();
    const oldWeather = currentSlot.weather;
    const newWeather = getRandomWeather(season);
    
    if (newWeather !== oldWeather) {
        currentSlot.weather = newWeather;
        
        // إرسال حدث تغير الطقس
        eventBus.emit('weather:changed', {
            weather: newWeather,
            previous: oldWeather,
            season: season
        });
    }
}

/**
 * اختيار طقس عشوائي بناءً على الموسم
 * @param {string} season - اسم الموسم
 * @returns {string} اسم الطقس
 */
function getRandomWeather(season) {
    const chances = WEATHER_SETTINGS.seasons[season];
    if (!chances) return WEATHER_TYPES[0]; // CLEAR
    
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const [weather, chance] of Object.entries(chances)) {
        cumulative += chance;
        if (rand < cumulative) {
            return weather;
        }
    }
    
    return WEATHER_TYPES[0]; // CLEAR كاحتياط
}

/**
 * تغيير الطقس يدوياً (للاستخدام في الأحداث الخاصة)
 * @param {string} weather - اسم الطقس الجديد
 */
export function setWeather(weather) {
    if (!currentSlot) return;
    
    if (!WEATHER_TYPES.includes(weather)) {
        console.error(`Invalid weather type: ${weather}`);
        return;
    }
    
    const oldWeather = currentSlot.weather;
    currentSlot.weather = weather;
    
    eventBus.emit('weather:changed', {
        weather: weather,
        previous: oldWeather,
        manual: true
    });
}

// ============================================
// 5. دوال القمر
// ============================================

/**
 * حساب اليوم القمري الحالي
 * @returns {number} اليوم القمري (1-29.53)
 */
export function getLunarDay() {
    const totalDays = getTotalDays();
    return ((totalDays - 1) % LUNAR_CYCLE_DAYS) + 1;
}

/**
 * حساب طور القمر الحالي
 * @returns {number} مؤشر طور القمر (0-7)
 */
export function getMoonPhase() {
    const totalDays = getTotalDays();
    const moonAge = (totalDays - 1) % LUNAR_CYCLE_DAYS;
    
    if (moonAge < 1.5) return 0;        // NEW MOON
    if (moonAge < 7.5) return 1;        // WAXING CRESCENT
    if (moonAge < 8.5) return 2;        // FIRST QUARTER
    if (moonAge < 14.5) return 3;       // WAXING GIBBOUS
    if (moonAge < 15.5) return 4;       // FULL MOON
    if (moonAge < 21.5) return 5;       // WANING GIBBOUS
    if (moonAge < 22.5) return 6;       // LAST QUARTER
    return 7;                            // WANING CRESCENT
}

/**
 * الحصول على اسم طور القمر الحالي
 * @returns {string} اسم طور القمر مع الإيموجي
 */
export function getMoonPhaseName() {
    const phase = getMoonPhase();
    return MOON_PHASES[phase];
}

// ============================================
// 6. دوال مفيدة للأنظمة الأخرى
// ============================================

/**
 * هل هو وقت الليل؟
 * @returns {boolean}
 */
export function isNightTime() {
    if (!currentSlot) return false;
    const hour = currentSlot.gameHours;
    return hour >= 19 || hour < 5;
}

/**
 * هل هو وقت النهار؟
 * @returns {boolean}
 */
export function isDayTime() {
    return !isNightTime();
}

/**
 * تقدم الوقت بسرعة (للنوم مثلاً)
 * @param {number} hours - عدد الساعات
 */
export function fastForwardHours(hours) {
    const minutes = hours * 60;
    advanceTime(minutes);
}

/**
 * تقدم حتى وقت محدد في اليوم التالي أو نفس اليوم
 * @param {number} targetHour - الساعة المستهدفة (0-23)
 * @param {number} targetMinute - الدقيقة المستهدفة (0-59)
 */
export function advanceToTime(targetHour, targetMinute = 0) {
    if (!currentSlot) return;
    
    let currentTotalMinutes = currentSlot.gameHours * 60 + currentSlot.gameMinutes;
    let targetTotalMinutes = targetHour * 60 + targetMinute;
    
    let minutesToAdvance;
    if (targetTotalMinutes > currentTotalMinutes) {
        // نفس اليوم
        minutesToAdvance = targetTotalMinutes - currentTotalMinutes;
    } else {
        // اليوم التالي
        minutesToAdvance = (24 * 60 - currentTotalMinutes) + targetTotalMinutes;
    }
    
    advanceTime(minutesToAdvance);
}

// ============================================
// 7. دوال Game Loop والتحكم في الوقت
// ============================================

let curr_xpNeeded = 100;

/** هل اللعبة متوقفة مؤقتاً؟ */
let isPaused = false;

/** مؤقت حلقة اللعبة الرئيسية */
let gameLoopInterval = null;

export function startGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    gameLoopInterval = setInterval(() => {
        if (!isPaused && currentSlot) {
            advanceTime(1);
        }
    }, 1000);
    eventBus.emit('game:loopStarted');
}

export function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    eventBus.emit('game:loopStopped');
}

export function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        eventBus.emit('game:paused');
    } else {
        eventBus.emit('game:resumed');
    }
    return isPaused;
}

export function isGamePaused() { return isPaused; }

export function setPaused(paused) {
    if (isPaused !== paused) {
        isPaused = paused;
        if (isPaused) {
            eventBus.emit('game:paused');
        } else {
            eventBus.emit('game:resumed');
        }
    }
}

export function isGameLoopRunning() { return gameLoopInterval !== null; }

// ============================================
// 8. دوال الإحصاءات والتقدم (Stats & Progression)
// ============================================

export function recalculateMaxStats() {
    if (!currentSlot) return;
    
    const s = currentSlot.baseStats;
    
    // استخدام القيم الأساسية من SLOT_BASE_TEMPLATE مباشرة
    currentSlot.baseMaxHealth = Math.floor(10 + s.fortitude * 1);
    currentSlot.baseMaxStamina = Math.floor(10 + s.fortitude * 1);
    currentSlot.baseMaxHunger = Math.floor(100 + s.fortitude * 1);
    currentSlot.baseMaxFocus = Math.floor(100 + s.think * 1);
    currentSlot.baseMaxAether = Math.floor(10 + s.think * 1);
    
    clampResources();
    
    eventBus.emit('player:maxStatsChanged', {
        maxHealth: currentSlot.baseMaxHealth,
        maxStamina: currentSlot.baseMaxStamina,
        maxHunger: currentSlot.baseMaxHunger,
        maxFocus: currentSlot.baseMaxFocus,
        maxAether: currentSlot.baseMaxAether
    });
}

export function updateXPNeeded() {
    if (!currentSlot) return;
    curr_xpNeeded = currentSlot.baseXPNeeded * currentSlot.baseLevel;
}

export function addXP(amount) {
    if (!currentSlot) return;
    currentSlot.baseXP += amount;
    while (currentSlot.baseXP >= curr_xpNeeded) {
        levelUp();
    }
    eventBus.emit('player:xpChanged', {
        current: currentSlot.baseXP,
        needed: curr_xpNeeded,
        level: currentSlot.baseLevel
    });
    saveGame();
}

export function levelUp() {
    if (!currentSlot) return;
    currentSlot.baseXP -= curr_xpNeeded;
    currentSlot.baseLevel++;
    
    // زيادة الإحصاءات
    currentSlot.baseStats.will += 1;
    currentSlot.baseStats.think += 0.5;
    currentSlot.baseStats.practical += 0.5;
    currentSlot.baseStats.social += 0.5;
    currentSlot.baseStats.strength += 1;
    currentSlot.baseStats.agility += 1;
    currentSlot.baseStats.fortitude += 1;
    
    updateXPNeeded();
    recalculateMaxStats();
    
    currentSlot.healthVal = currentSlot.baseMaxHealth;
    currentSlot.stamina = currentSlot.baseMaxStamina;
    currentSlot.focusVal = currentSlot.baseMaxFocus;
    
    eventBus.emit('player:levelUp', {
        level: currentSlot.baseLevel,
        stats: currentSlot.baseStats
    });
    saveGame();
}

export function increaseStat(statName, amount = 1) {
    if (!currentSlot) return;
    if (currentSlot.baseStats.hasOwnProperty(statName)) {
        currentSlot.baseStats[statName] += amount;
        recalculateMaxStats();
        eventBus.emit('player:statChanged', {
            stat: statName,
            value: currentSlot.baseStats[statName]
        });
        saveGame();
    }
}

export function getXPNeeded() { return curr_xpNeeded; }

export function getLevelProgress() {
    if (!currentSlot) return 0;
    return (currentSlot.baseXP / curr_xpNeeded) * 100;
}

// ============================================
// 9. دوال المخزون (Inventory)
// ============================================

/**
 * إنشاء نسخة جديدة من عنصر
 * @param {string} itemId - معرف العنصر
 * @param {string} category - فئة العنصر (weapons, armor, tools, consumables, materials)
 * @returns {Object|null} نسخة من العنصر أو null إذا لم يوجد
 */
export function createItemInstance(itemId, category) {
    const template = ITEMS[category]?.[itemId];
    if (!template) {
        console.error(`Item ${itemId} in ${category} not found.`);
        return null;
    }
    
    const instance = deepCopy(template);
    instance.masteryLevel = 1;
    instance.masteryXP = 0;
    instance.currentMasteryThreshold = template.baseMasteryXP || 3;
    instance.quantity = template.stackable ? 1 : undefined;
    
    return instance;
}

/**
 * إضافة عنصر للمخزون
 * @param {Object} item - العنصر المراد إضافته
 * @returns {boolean} true إذا تمت الإضافة بنجاح
 */
export function addItem(item) {
    if (!currentSlot || !item) return false;
    
    // إذا كان العنصر قابل للتكديس، حاول تجميعه مع عنصر موجود
    if (item.stackable) {
        const existingItem = currentSlot.inventory.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
            eventBus.emit('item:stacked', { item: existingItem });
            saveGame();
            return true;
        }
    }
    
    // إضافة العنصر الجديد
    currentSlot.inventory.push(item);
    
    // إرسال حدث
    eventBus.emit('item:added', { item });
    eventBus.emit('inventory:changed', { inventory: currentSlot.inventory });
    
    saveGame();
    return true;
}

/**
 * حذف عنصر من المخزون
 * @param {number} index - موقع العنصر في المصفوفة
 * @returns {boolean} true إذا تم الحذف بنجاح
 */
export function removeItem(index) {
    if (!currentSlot) return false;
    if (index < 0 || index >= currentSlot.inventory.length) return false;
    
    const removedItem = currentSlot.inventory.splice(index, 1)[0];
    
    // إرسال حدث
    eventBus.emit('item:removed', { item: removedItem, index });
    eventBus.emit('inventory:changed', { inventory: currentSlot.inventory });
    
    saveGame();
    return true;
}

/**
 * استخدام عنصر من المخزون
 * @param {number} index - موقع العنصر في المصفوفة
 * @returns {boolean} true إذا تم الاستخدام بنجاح
 */
export function useItem(index) {
    if (!currentSlot) return false;
    if (index < 0 || index >= currentSlot.inventory.length) return false;
    
    const item = currentSlot.inventory[index];
    
    // التحقق من نوع العنصر
    if (item.category !== 'consumables') {
        eventBus.emit('message:added', { text: `Cannot use ${item.name}.` });
        return false;
    }
    
    // تطبيق تأثيرات العنصر (سيتم توسيعها لاحقاً)
    if (item.effects) {
        if (item.effects.heal) {
			currentSlot.healthVal = Math.min(currentSlot.baseMaxHealth, currentSlot.healthVal + item.effects.heal);
		}
		if (item.effects.stamina) {
			currentSlot.stamina = Math.min(currentSlot.baseMaxStamina, currentSlot.stamina + item.effects.stamina);
		}
		if (item.effects.hunger) {
			currentSlot.hungerVal = Math.min(currentSlot.baseMaxHunger, currentSlot.hungerVal + item.effects.hunger);
		}
    }
    
    // إنقاص الكمية أو حذف العنصر
    if (item.stackable && item.quantity > 1) {
        item.quantity--;
    } else {
        currentSlot.inventory.splice(index, 1);
    }
    
    // إرسال أحداث
    eventBus.emit('item:used', { item });
    eventBus.emit('inventory:changed', { inventory: currentSlot.inventory });
    eventBus.emit('player:resourcesChanged');
    
    saveGame();
    return true;
}

/**
 * تجهيز عنصر من المخزون
 * @param {number} index - موقع العنصر في المصفوفة
 * @returns {boolean} true إذا تم التجهيز بنجاح
 */
export function equipItem(index) {
    if (!currentSlot) return false;
    if (index < 0 || index >= currentSlot.inventory.length) return false;
    
    const item = currentSlot.inventory[index];
    const slotType = item.slotType;
    
    if (!slotType) {
        eventBus.emit('message:added', { text: `${item.name} cannot be equipped.` });
        return false;
    }
    
    // التحقق مما إذا كانت الفتحة مشغولة
    const existingEquipped = currentSlot.equippedItems[slotType];
    
    // إزالة العنصر من المخزون
    currentSlot.inventory.splice(index, 1);
    
    // إذا كانت الفتحة مشغولة، أعد العنصر القديم للمخزون
    if (existingEquipped) {
        currentSlot.inventory.push(existingEquipped);
        eventBus.emit('item:unequipped', { item: existingEquipped, slot: slotType });
    }
    
    // تجهيز العنصر الجديد
    currentSlot.equippedItems[slotType] = item;
    
    // إعادة حساب الإحصاءات إذا كان للعنصر تأثير
    recalculateMaxStats();
    
    // إرسال أحداث
    eventBus.emit('item:equipped', { item, slot: slotType });
    eventBus.emit('inventory:changed', { inventory: currentSlot.inventory });
    eventBus.emit('equipment:changed', { equippedItems: currentSlot.equippedItems });
    
    saveGame();
    return true;
}

/**
 * إزالة عنصر من فتحة التجهيز
 * @param {string} slotType - نوع فتحة التجهيز (mainhand, head, body, etc.)
 * @returns {boolean} true إذا تمت الإزالة بنجاح
 */
export function unequipItem(slotType) {
    if (!currentSlot) return false;
    
    const item = currentSlot.equippedItems[slotType];
    if (!item) return false;
    
    // إزالة من التجهيزات
    delete currentSlot.equippedItems[slotType];
    
    // إضافة للمخزون
    currentSlot.inventory.push(item);
    
    // إعادة حساب الإحصاءات
    recalculateMaxStats();
    
    // إرسال أحداث
    eventBus.emit('item:unequipped', { item, slot: slotType });
    eventBus.emit('inventory:changed', { inventory: currentSlot.inventory });
    eventBus.emit('equipment:changed', { equippedItems: currentSlot.equippedItems });
    
    saveGame();
    return true;
}

/**
 * الحصول على عنصر من فتحة التجهيز
 * @param {string} slotType - نوع فتحة التجهيز
 * @returns {Object|null} العنصر المجهز أو null
 */
export function getEquippedItem(slotType) {
    if (!currentSlot) return null;
    return currentSlot.equippedItems[slotType] || null;
}

/**
 * التحقق مما إذا كانت فتحة التجهيز مشغولة
 * @param {string} slotType - نوع فتحة التجهيز
 * @returns {boolean}
 */
export function isSlotEquipped(slotType) {
    return !!getEquippedItem(slotType);
}

/**
 * الحصول على جميع العناصر المجهزة
 * @returns {Object} كائن العناصر المجهزة
 */
export function getAllEquippedItems() {
    if (!currentSlot) return {};
    return { ...currentSlot.equippedItems };
}

/**
 * التحقق مما إذا كان المخزون ممتلئاً
 * @param {number} maxSize - الحجم الأقصى للمخزون
 * @returns {boolean}
 */
export function isInventoryFull(maxSize = 50) {
    if (!currentSlot) return true;
    return currentSlot.inventory.length >= maxSize;
}

/**
 * الحصول على عدد العناصر في المخزون
 * @returns {number}
 */
export function getInventorySize() {
    if (!currentSlot) return 0;
    return currentSlot.inventory.length;
}

/**
 * ترتيب المخزون
 * @param {string} sortBy - نوع الترتيب (type, name, rarity)
 * @param {string} direction - اتجاه الترتيب (asc, desc)
 */
export function sortInventory(sortBy = 'type', direction = 'asc') {
    if (!currentSlot) return;
    
    currentSlot.inventory.sort((a, b) => {
        let result = 0;
        
        if (sortBy === 'name') {
            result = a.name.localeCompare(b.name);
        } else if (sortBy === 'rarity') {
            result = (a.rarity || 0) - (b.rarity || 0);
        } else {
            result = (a.type || '').localeCompare(b.type || '');
        }
        
        return direction === 'asc' ? result : -result;
    });
    
    eventBus.emit('inventory:changed', { inventory: currentSlot.inventory });
    saveGame();
}

// ============================================
// 10. دوال الأحداث والتنقل (Event Manager)
// ============================================

/** معرف الحدث الحالي */
let currentEventId = 'VILLAGE';

/**
 * الانتقال إلى حدث جديد
 * @param {string} eventId - معرف الحدث
 */
export function setEvent(eventId) {
    const event = NAV[eventId];
    if (!event) {
        console.error(`Event ${eventId} not found!`);
        return;
    }
    
    currentEventId = eventId;
    if (currentSlot) {
        currentSlot.currentEventId = eventId;
    }
    
    // إرسال حدث تغير الموقع
    eventBus.emit('event:changed', {
        eventId,
        event,
        display: event.display,
        description: event.description,
        choices: event.choices
    });
    
    // تحديث موقع العرض إذا لم يكن سرير
    if (eventId !== 'BED' && eventId !== 'BED_SLEEPING') {
        eventBus.emit('location:changed', { location: event.display });
    }
    
    saveGame();
}

/**
 * الحصول على الحدث الحالي
 * @returns {Object} الحدث الحالي
 */
export function getCurrentEvent() {
    return NAV[currentEventId] || null;
}

/**
 * الحصول على معرف الحدث الحالي
 * @returns {string} معرف الحدث
 */
export function getCurrentEventId() {
    return currentEventId;
}

/**
 * تنفيذ إجراء من NAV
 * @param {Object} action - كائن الإجراء { type, payload }
 */
export function executeAction(action) {
    if (!action) return;
    
    switch (action.type) {
        case 'NAVIGATE':
            // الانتقال لحدث آخر
            if (action.eventId) {
                setEvent(action.eventId);
            }
            break;
            
        case 'MESSAGE':
            // عرض رسالة
            if (action.text) {
                eventBus.emit('message:added', { text: action.text });
            }
            break;
            
        case 'FUNCTION':
            // استدعاء دالة
            if (action.name) {
                executeFunctionAction(action.name, action.params);
            }
            break;
            
        case 'CONDITION':
            // إجراء شرطي
            executeConditionalAction(action);
            break;
            
        default:
            console.warn(`Unknown action type: ${action.type}`);
    }
}

/**
 * تنفيذ إجراء من نوع FUNCTION
 * @param {string} functionName - اسم الدالة
 * @param {Object} params - المعاملات
 */
function executeFunctionAction(functionName, params = {}) {
    switch (functionName) {
        case 'leaveBed':
            leaveBed();
            break;
        case 'startSleeping':
            startSleeping();
            break;
        case 'wakeUp':
            wakeUp();
            break;
        case 'takeDamage':
            takeDamage(params.amount || 10);
            break;
        case 'heal':
            heal(params.amount || 10);
            break;
        case 'addItem':
            if (params.itemId && params.category) {
                const item = createItemInstance(params.itemId, params.category);
                if (item) addItem(item);
            }
            break;
        case 'addXP':
            addXP(params.amount || 10);
            break;
        case 'addCoins':
			if (currentSlot) {
				currentSlot.baseCoins = (currentSlot.baseCoins || 0) + (params.amount || 0);
				eventBus.emit('player:coinsChanged', { coins: currentSlot.baseCoins });
				saveGame();
			}
			break;
        case 'setWeather':
            setWeather(params.weather);
            break;
        case 'advanceTime':
            advanceTime(params.minutes || 60);
            break;
        default:
            console.warn(`Unknown function: ${functionName}`);
    }
}

let isSleeping = false;
let sleepInterval = null;

export function startSleeping() {
    if (isSleeping) return;
    isSleeping = true;
    
    eventBus.emit('message:added', { text: 'You lie down and close your eyes...' });
    eventBus.emit('game:sleepingStarted');
    
    // تسريع الوقت أثناء النوم
    sleepInterval = setInterval(() => {
        if (isSleeping && !isPaused) {
            advanceTime(GAME_CONFIG.sleepMultiplier || 5);
            heal(1);
            restoreStamina(1);
        }
    }, GAME_CONFIG.sleepIntervalMs || 200);
    
    setEvent('BED_SLEEPING');
}

export function wakeUp() {
    if (sleepInterval) {
        clearInterval(sleepInterval);
        sleepInterval = null;
    }
    isSleeping = false;
    
    eventBus.emit('message:added', { text: 'You wake up feeling refreshed!' });
    eventBus.emit('game:sleepingEnded');
    
    setEvent('BED');
}

export function leaveBed() {
    wakeUp();
    setEvent('HOME');
}

/**
 * تنفيذ إجراء شرطي
 * @param {Object} action - كائن الإجراء الشرطي
 */
function executeConditionalAction(action) {
    const { condition, trueAction, falseAction } = action;
    
    let result = false;
    
    // تقييم الشرط
    switch (condition.type) {
        case 'hasItem':
            result = currentSlot?.inventory.some(item => item.id === condition.itemId);
            break;
        case 'hasSkill':
            result = currentSlot?.activeSkills[condition.skillId] || 
                     currentSlot?.passiveSkills[condition.skillId] ||
                     currentSlot?.generalSkills[condition.skillId];
            break;
        case 'statCheck':
            if (currentSlot?.stats) {
                const statValue = currentSlot.baseStats[condition.stat];
                result = condition.operator === '>=' ? statValue >= condition.value :
                         condition.operator === '>' ? statValue > condition.value :
                         condition.operator === '<=' ? statValue <= condition.value :
                         condition.operator === '<' ? statValue < condition.value :
                         statValue === condition.value;
            }
            break;
        case 'levelCheck':
			result = currentSlot?.baseLevel >= condition.level;
			break;
		case 'coinsCheck':
			result = (currentSlot?.baseCoins || 0) >= condition.amount;
			break;
        case 'timeCheck':
            result = isNightTime() === condition.isNight;
            break;
        case 'weatherCheck':
            result = currentSlot?.weather === condition.weather;
            break;
        default:
            console.warn(`Unknown condition type: ${condition.type}`);
    }
    
    // تنفيذ الإجراء المناسب
    if (result && trueAction) {
        executeAction(trueAction);
    } else if (!result && falseAction) {
        executeAction(falseAction);
    }
}

/**
 * إضافة خيار ديناميكي للحدث الحالي
 * @param {Object} choice - الخيار المراد إضافته { text, action }
 */
export function addChoice(choice) {
    const event = getCurrentEvent();
    if (event) {
        event.choices.push(choice);
        eventBus.emit('event:choicesUpdated', { choices: event.choices });
    }
}

/**
 * إزالة خيار من الحدث الحالي
 * @param {number} index - موقع الخيار
 */
export function removeChoice(index) {
    const event = getCurrentEvent();
    if (event && event.choices[index]) {
        event.choices.splice(index, 1);
        eventBus.emit('event:choicesUpdated', { choices: event.choices });
    }
}

/**
 * استبدال جميع خيارات الحدث الحالي
 * @param {Array} choices - مصفوفة الخيارات الجديدة
 */
export function setChoices(choices) {
    const event = getCurrentEvent();
    if (event) {
        event.choices = choices;
        eventBus.emit('event:choicesUpdated', { choices });
    }
}

/**
 * التحقق مما إذا كان الحدث الحالي يسمح بالحفظ
 * @returns {boolean}
 */
export function canSaveInCurrentEvent() {
    const restrictedEvents = ['BED_SLEEPING', 'COMBAT'];
    return !restrictedEvents.includes(currentEventId);
}

/**
 * الحصول على جميع المواقع المكتشفة
 * @returns {Array} مصفوفة المواقع المكتشفة
 */
export function getDiscoveredLocations() {
    return currentSlot?.discoveredLocations || [];
}

/**
 * إضافة موقع للقائمة المكتشفة
 * @param {string} locationId - معرف الموقع
 */
export function discoverLocation(locationId) {
    if (!currentSlot) return;
    
    if (!currentSlot.discoveredLocations.includes(locationId)) {
        currentSlot.discoveredLocations.push(locationId);
        eventBus.emit('location:discovered', { locationId });
        saveGame();
    }
}

// ============================================
// 11. دوال الموارد (Resources)
// ============================================

/**
 * خسارة صحة
 * @param {number} amount - كمية الضرر
 * @param {string} source - مصدر الضرر (اختياري)
 * @returns {number} الصحة المتبقية
 */
export function takeDamage(amount, source = 'unknown') {
    if (!currentSlot) return 0;
    const oldHealth = currentSlot.healthVal;
    currentSlot.healthVal = Math.max(0, currentSlot.healthVal - amount);
    const actualDamage = oldHealth - currentSlot.healthVal;
    
    eventBus.emit('player:healthChanged', {
        current: currentSlot.healthVal,
        max: currentSlot.baseMaxHealth,
        previous: oldHealth,
        damage: actualDamage,
        source
    });
    
    if (currentSlot.healthVal <= 0) {
        handleDeath(source);
    }
    saveGame();
    return currentSlot.healthVal;
}

export function heal(amount, source = 'unknown') {
    if (!currentSlot) return 0;
    const oldHealth = currentSlot.healthVal;
    currentSlot.healthVal = Math.min(currentSlot.baseMaxHealth, currentSlot.healthVal + amount);
    const actualHeal = currentSlot.healthVal - oldHealth;
    
    eventBus.emit('player:healthChanged', {
        current: currentSlot.healthVal,
        max: currentSlot.baseMaxHealth,
        previous: oldHealth,
        heal: actualHeal,
        source
    });
    saveGame();
    return currentSlot.healthVal;
}

/**
 * استهلاك Stamina
 * @param {number} amount - الكمية المستهلكة
 * @returns {boolean} true إذا كان هناك Stamina كافٍ وتم الاستهلاك
 */
export function consumeStamina(amount) {
    if (!currentSlot) return false;
    
    if (currentSlot.stamina >= amount) {
        const oldStamina = currentSlot.stamina;
        currentSlot.stamina -= amount;
        
        eventBus.emit('player:staminaChanged', {
            current: currentSlot.stamina,
            max: currentSlot.baseMaxStamina,
            previous: oldStamina,
            consumed: amount
        });
        
        saveGame();
        return true;
    }
    
    eventBus.emit('message:added', { text: 'Not enough stamina!' });
    return false;
}

/**
 * استعادة Stamina
 * @param {number} amount - كمية الاستعادة
 */
export function restoreStamina(amount) {
    if (!currentSlot) return;
    
    const oldStamina = currentSlot.stamina;
    currentSlot.stamina = Math.min(currentSlot.baseMaxStamina, currentSlot.stamina + amount);
    
    eventBus.emit('player:staminaChanged', {
        current: currentSlot.stamina,
        max: currentSlot.baseMaxStamina,
        previous: oldStamina,
        restored: currentSlot.stamina - oldStamina
    });
    
    saveGame();
}

/**
 * استهلاك Focus
 * @param {number} amount - الكمية المستهلكة
 * @returns {boolean} true إذا كان هناك Focus كافٍ
 */
export function consumeFocus(amount) {
    if (!currentSlot) return false;
    
    if (currentSlot.focusVal >= amount) {
        const oldFocus = currentSlot.focusVal;
        currentSlot.focusVal -= amount;
        
        eventBus.emit('player:focusChanged', {
            current: currentSlot.focusVal,
            max: currentSlot.baseMaxFocus,
            previous: oldFocus,
            consumed: amount
        });
        
        saveGame();
        return true;
    }
    
    eventBus.emit('message:added', { text: 'Not enough focus!' });
    return false;
}

/**
 * استعادة Focus
 * @param {number} amount - كمية الاستعادة
 */
export function restoreFocus(amount) {
    if (!currentSlot) return;
    
    const oldFocus = currentSlot.focusVal;
    currentSlot.focusVal = Math.min(currentSlot.baseMaxFocus, currentSlot.focusVal + amount);
    
    eventBus.emit('player:focusChanged', {
        current: currentSlot.focusVal,
        max: currentSlot.baseMaxFocus,
        previous: oldFocus,
        restored: currentSlot.focusVal - oldFocus
    });
    
    saveGame();
}

/**
 * استهلاك Aether
 * @param {number} amount - الكمية المستهلكة
 * @returns {boolean} true إذا كان هناك Aether كافٍ
 */
export function consumeAether(amount) {
    if (!currentSlot) return false;
    
    if (currentSlot.aetherVal >= amount) {
        const oldAether = currentSlot.aetherVal;
        currentSlot.aetherVal -= amount;
        
        eventBus.emit('player:aetherChanged', {
            current: currentSlot.aetherVal,
            max: currentSlot.baseMaxAether,
            previous: oldAether,
            consumed: amount
        });
        
        saveGame();
        return true;
    }
    
    eventBus.emit('message:added', { text: 'Not enough aether!' });
    return false;
}

/**
 * استعادة Aether
 * @param {number} amount - كمية الاستعادة
 */
export function restoreAether(amount) {
    if (!currentSlot) return;
    
    const oldAether = currentSlot.aetherVal;
    currentSlot.aetherVal = Math.min(currentSlot.baseMaxAether, currentSlot.aetherVal + amount);
    
    eventBus.emit('player:aetherChanged', {
        current: currentSlot.aetherVal,
        max: currentSlot.baseMaxAether,
        previous: oldAether,
        restored: currentSlot.aetherVal - oldAether
    });
    
    saveGame();
}

/**
 * استهلاك جوع (يستخدم في المؤقتات)
 * @param {number} amount - الكمية المستهلكة
 */
export function consumeHunger(amount) {
    if (!currentSlot) return;
    
    const oldHunger = currentSlot.hungerVal;
    currentSlot.hungerVal = Math.max(0, currentSlot.hungerVal - amount);
    
    eventBus.emit('player:hungerChanged', {
        current: currentSlot.hungerVal,
        max: currentSlot.baseMaxHunger,
        previous: oldHunger,
        consumed: oldHunger - currentSlot.hungerVal
    });
    
    // إذا وصل الجوع لصفر، ابدأ خسارة صحة
    if (currentSlot.hungerVal <= 0) {
        takeDamage(1, 'starvation');
    }
    
    saveGame();
}

/**
 * استعادة جوع (تناول طعام)
 * @param {number} amount - كمية الاستعادة
 */
export function restoreHunger(amount) {
    if (!currentSlot) return;
    
    const oldHunger = currentSlot.hungerVal;
    currentSlot.hungerVal = Math.min(currentSlot.baseMaxHunger, currentSlot.hungerVal + amount);
    
    eventBus.emit('player:hungerChanged', {
        current: currentSlot.hungerVal,
        max: currentSlot.baseMaxHunger,
        previous: oldHunger,
        restored: currentSlot.hungerVal - oldHunger
    });
    
    saveGame();
}

/**
 * إضافة عملات
 * @param {number} amount - الكمية
 */
export function addCoins(amount) {
    if (!currentSlot) return;
    const oldCoins = currentSlot.baseCoins || 0;
    currentSlot.baseCoins = oldCoins + amount;
    eventBus.emit('player:coinsChanged', {
        current: currentSlot.baseCoins,
        previous: oldCoins,
        added: amount
    });
    saveGame();
}

export function spendCoins(amount) {
    if (!currentSlot) return false;
    if ((currentSlot.baseCoins || 0) >= amount) {
        const oldCoins = currentSlot.baseCoins;
        currentSlot.baseCoins -= amount;
        eventBus.emit('player:coinsChanged', {
            current: currentSlot.baseCoins,
            previous: oldCoins,
            spent: amount
        });
        saveGame();
        return true;
    }
    eventBus.emit('message:added', { text: 'Not enough coins!' });
    return false;
}

/**
 * الحصول على قيمة مورد معين
 * @param {string} resource - اسم المورد (health, stamina, focus, hunger, aether, coins)
 * @returns {number} قيمة المورد
 */
export function getResource(resource) {
    if (!currentSlot) return 0;
    switch (resource) {
        case 'health': return currentSlot.healthVal;
        case 'maxHealth': return currentSlot.baseMaxHealth;
        case 'stamina': return currentSlot.stamina;
        case 'maxStamina': return currentSlot.baseMaxStamina;
        case 'focus': return currentSlot.focusVal;
        case 'maxFocus': return currentSlot.baseMaxFocus;
        case 'hunger': return currentSlot.hungerVal;
        case 'maxHunger': return currentSlot.baseMaxHunger;
        case 'aether': return currentSlot.aetherVal;
        case 'maxAether': return currentSlot.baseMaxAether;
        case 'coins': return currentSlot.baseCoins || 0;
        default: return 0;
    }
}

/**
 * التحقق مما إذا كان اللاعب على قيد الحياة
 * @returns {boolean}
 */
export function isAlive() {
    return currentSlot && currentSlot.healthVal > 0;
}

/**
 * الحصول على نسبة مورد معين (0-100)
 * @param {string} resource - اسم المورد
 * @returns {number} النسبة المئوية
 */
export function getResourcePercent(resource) {
    if (!currentSlot) return 0;
    switch (resource) {
        case 'health': return (currentSlot.healthVal / currentSlot.baseMaxHealth) * 100;
        case 'stamina': return (currentSlot.stamina / currentSlot.baseMaxStamina) * 100;
        case 'focus': return (currentSlot.focusVal / currentSlot.baseMaxFocus) * 100;
        case 'hunger': return (currentSlot.hungerVal / currentSlot.baseMaxHunger) * 100;
        case 'aether': return (currentSlot.aetherVal / currentSlot.baseMaxAether) * 100;
        default: return 0;
    }
}

// ============================================
// 13. دوال المقدمة (Intro)
// ============================================

/** حالة المقدمة */
let introActive = false;
let introTypingInterval = null;
let currentIntroCharIndex = 0;
let introFullText = '';

/**
 * عرض المقدمة (نص تمهيدي يظهر حرف بحرف)
 */
export function showIntro() {
    if (!currentSlot) return;
    
    // الحصول على نص المقدمة من نقطة البداية
    const spawnData = SPAWN_POINTS[currentSlot.spawn] || SPAWN_POINTS.Alden_Village;
    introFullText = spawnData.introText;
    introActive = true;
    
    // إيقاف أي كتابة سابقة
    if (introTypingInterval) {
        clearInterval(introTypingInterval);
    }
    
    // إرسال حدث بدء المقدمة
    eventBus.emit('intro:started', { text: introFullText });
    
    // بدء الكتابة حرف بحرف
    currentIntroCharIndex = 0;
    introTypingInterval = setInterval(() => {
        if (currentIntroCharIndex < introFullText.length) {
            const currentText = introFullText.substring(0, currentIntroCharIndex + 1);
            currentIntroCharIndex++;
            
            eventBus.emit('intro:typing', {
                text: currentText,
                progress: currentIntroCharIndex,
                total: introFullText.length
            });
        } else {
            // انتهاء الكتابة
            clearInterval(introTypingInterval);
            introTypingInterval = null;
            
            eventBus.emit('intro:completed');
            
            // إغلاق تلقائي بعد ثانية ونصف
            setTimeout(() => {
                closeIntro();
            }, 1500);
        }
    }, 45); // سرعة الكتابة
}

/**
 * إغلاق المقدمة
 */
export function closeIntro() {
    if (!introActive) return;
    
    // إيقاف المؤقت
    if (introTypingInterval) {
        clearInterval(introTypingInterval);
        introTypingInterval = null;
    }
    
    introActive = false;
    currentIntroCharIndex = 0;
    
    // تحديث حالة اللاعب
    if (currentSlot) {
        currentSlot.hasPlayedIntro = true;
        saveGame();
    }
    
    // إرسال حدث إغلاق المقدمة
    eventBus.emit('intro:closed');
}

/**
 * تخطي المقدمة
 */
export function skipIntro() {
    if (!introActive) return;
    
    // إيقاف المؤقت
    if (introTypingInterval) {
        clearInterval(introTypingInterval);
        introTypingInterval = null;
    }
    
    // إرسال النص كاملاً
    eventBus.emit('intro:typing', {
        text: introFullText,
        progress: introFullText.length,
        total: introFullText.length
    });
    
    // إغلاق المقدمة
    closeIntro();
}

/**
 * التحقق مما إذا كانت المقدمة نشطة
 * @returns {boolean}
 */
export function isIntroActive() {
    return introActive;
}

/**
 * الحصول على النص الحالي للمقدمة
 * @returns {string}
 */
export function getIntroText() {
    return introFullText;
}

/**
 * الحصول على تقدم المقدمة (0-100)
 * @returns {number}
 */
export function getIntroProgress() {
    if (!introFullText.length) return 0;
    return (currentIntroCharIndex / introFullText.length) * 100;
}

function handleDeath(source) {
    if (!currentSlot) return;
    
    currentSlot.heartsVal--;
    
    if (currentSlot.heartsVal > 0) {
        currentSlot.healthVal = currentSlot.baseMaxHealth;
        currentSlot.stamina = currentSlot.baseMaxStamina;
        eventBus.emit('message:added', { text: `You lost a heart! ${currentSlot.heartsVal} hearts remaining.` });
        setEvent('HOME');
    } else {
        if (currentSlot.mode === 'Hardcore') {
            eventBus.emit('message:added', { text: 'PERMADEATH! Your story ends here.' });
            stopGameLoop();
            deleteGame(currentSlotIndex);
            eventBus.emit('ui:showDeathScreen', { slotIndex: currentSlotIndex });
        } else {
            currentSlot.baseCoins = Math.floor(currentSlot.baseCoins / 2);
            currentSlot.inventory = currentSlot.inventory.filter(() => Math.random() > 0.5);
            currentSlot.heartsVal = 1;
            currentSlot.healthVal = currentSlot.baseMaxHealth;
            currentSlot.stamina = currentSlot.baseMaxStamina;
            eventBus.emit('message:added', { text: 'You died! Lost half your coins and items.' });
            setEvent('HOME');
        }
    }
    saveGame();
}