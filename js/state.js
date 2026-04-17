// ============================================
// ========== YOUR STORY IDLE - STATE ==========
// ============================================
// هذا الملف يدير حالة اللعبة في الذاكرة فقط (RAM)
// لا يتعامل مع localStorage - التخزين مسؤولية game-engine.js

import { SLOT_BASE_TEMPLATE } from './constants.js';

// ============================================
// 1. دوال مساعدة
// ============================================

/**
 * إنشاء نسخة عميقة من كائن
 * @param {Object} obj - الكائن المراد نسخه
 * @returns {Object} نسخة عميقة من الكائن
 */
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ============================================
// 2. متغيرات الحالة (الذاكرة)
// ============================================

/** مصفوفة الفتحات الثلاث - index 1,2,3 مستخدم، index 0 مهمل */
export const slots = [null, null, null, null];

/** رقم الفتحة النشطة حالياً (1, 2, 3) أو null إذا لم تكن هناك فتحة نشطة */
export let currentSlotIndex = null;

/** مرجع سريع للفتحة النشطة حالياً - أي تعديل عليها يعدل الفتحة الأصلية */
export let currentSlot = null;

// ============================================
// 3. دوال إدارة الفتحات (الذاكرة فقط)
// ============================================

/**
 * إنشاء فتحة جديدة من القالب الأساسي
 * @returns {Object} نسخة جديدة من SLOT_BASE_TEMPLATE
 */
export function createNewSlot() {
    return deepCopy(SLOT_BASE_TEMPLATE);
}

/**
 * تهيئة جميع الفتحات بقوالب فارغة
 * تستخدم عند بدء اللعبة لأول مرة
 */
export function initSlots() {
    for (let i = 1; i <= 3; i++) {
        slots[i] = createNewSlot();
    }
}

/**
 * الحصول على فتحة معينة
 * @param {number} index - رقم الفتحة (1, 2, 3)
 * @returns {Object|null} الفتحة المطلوبة أو null إذا كان الرقم غير صالح
 */
export function getSlot(index) {
    if (index < 1 || index > 3) {
        console.error(`Invalid slot index: ${index}. Must be 1, 2, or 3.`);
        return null;
    }
    return slots[index];
}

/**
 * تعيين بيانات فتحة معينة
 * @param {number} index - رقم الفتحة (1, 2, 3)
 * @param {Object} data - البيانات المراد وضعها
 */
export function setSlot(index, data) {
    if (index < 1 || index > 3) {
        console.error(`Invalid slot index: ${index}. Must be 1, 2, or 3.`);
        return;
    }
    slots[index] = data;
}

/**
 * الحصول على الفتحة النشطة حالياً
 * @returns {Object|null} الفتحة النشطة أو null إذا لم تكن هناك فتحة نشطة
 */
export function getCurrentSlot() {
    return currentSlot;
}

/**
 * تعيين الفتحة النشطة حالياً
 * @param {number} index - رقم الفتحة (1, 2, 3)
 */
export function setCurrentSlot(index) {
    if (index < 1 || index > 3) {
        console.error(`Invalid slot index: ${index}. Must be 1, 2, or 3.`);
        return;
    }
    
    // تأكد من أن الفتحة موجودة
    if (!slots[index]) {
        slots[index] = createNewSlot();
    }
    
    currentSlotIndex = index;
    currentSlot = slots[index];
}

/**
 * مسح مؤشر الفتحة النشطة
 * يستخدم عند الخروج للقائمة الرئيسية أو حذف الفتحة النشطة
 */
export function clearCurrentSlot() {
    currentSlotIndex = null;
    currentSlot = null;
}

/**
 * حذف فتحة من الذاكرة (إعادتها للقالب الفارغ)
 * @param {number} index - رقم الفتحة (1, 2, 3)
 */
export function deleteSlotFromMemory(index) {
    if (index < 1 || index > 3) {
        console.error(`Invalid slot index: ${index}. Must be 1, 2, or 3.`);
        return;
    }
    
    // إنشاء فتحة جديدة فارغة
    slots[index] = createNewSlot();
    
    // إذا كانت هذه هي الفتحة النشطة، امسح المؤشر
    if (currentSlotIndex === index) {
        clearCurrentSlot();
    }
}

/**
 * التحقق مما إذا كانت الفتحة فارغة (غير مستخدمة)
 * @param {number} index - رقم الفتحة (1, 2, 3)
 * @returns {boolean} true إذا كانت الفتحة فارغة
 */
export function isSlotEmpty(index) {
    const slot = getSlot(index);
    return !slot || !slot.exists;
}

/**
 * التحقق مما إذا كانت الفتحة موجودة ومستخدمة
 * @param {number} index - رقم الفتحة (1, 2, 3)
 * @returns {boolean} true إذا كانت الفتحة موجودة ومستخدمة
 */
export function isSlotUsed(index) {
    const slot = getSlot(index);
    return slot && slot.exists === true;
}

/**
 * الحصول على جميع الفتحات
 * @returns {Array} مصفوفة الفتحات (مع null في index 0)
 */
export function getAllSlots() {
    return slots;
}

/**
 * الحصول على قائمة الفتحات المستخدمة فقط
 * @returns {Array} مصفوفة من أرقام الفتحات المستخدمة
 */
export function getUsedSlots() {
    const used = [];
    for (let i = 1; i <= 3; i++) {
        if (isSlotUsed(i)) {
            used.push(i);
        }
    }
    return used;
}

/**
 * الحصول على عدد الفتحات المستخدمة
 * @returns {number} عدد الفتحات المستخدمة
 */
export function getUsedSlotsCount() {
    return getUsedSlots().length;
}

/**
 * التحقق مما إذا كان هناك أي فتحة محفوظة
 * @returns {boolean} true إذا كان هناك فتحة واحدة على الأقل مستخدمة
 */
export function hasAnySavedSlot() {
    return getUsedSlotsCount() > 0;
}

/**
 * تحديث بيانات الفتحة الحالية
 * @param {Object} updates - كائن يحتوي على التحديثات الجزئية
 * @example updateCurrentSlot({ playerLevel: 2, coins: 100 })
 */
export function updateCurrentSlot(updates) {
    if (!currentSlot) {
        console.error('No current slot to update.');
        return;
    }
    Object.assign(currentSlot, updates);
}

/**
 * تحديث إحصاءة معينة في الفتحة الحالية
 * @param {string} statName - اسم الإحصاءة (will, think, prac, soc, str, agi, fort)
 * @param {number} value - القيمة الجديدة
 */
export function updateCurrentStat(statName, value) {
    if (!currentSlot) {
        console.error('No current slot to update.');
        return;
    }
    if (currentSlot.stats && currentSlot.stats.hasOwnProperty(statName)) {
        currentSlot.stats[statName] = value;
    } else {
        console.error(`Stat "${statName}" not found.`);
    }
}

/**
 * إعادة تعيين الفتحة الحالية للقالب الفارغ
 * (لا تؤثر على localStorage - فقط الذاكرة)
 */
export function resetCurrentSlot() {
    if (!currentSlot) {
        console.error('No current slot to reset.');
        return;
    }
    const newSlot = createNewSlot();
    Object.assign(currentSlot, newSlot);
}

// ============================================
// 4. دوال مساعدة للمخزون (تعمل على currentSlot)
// ============================================

/**
 * إضافة عنصر للمخزون
 * @param {Object} item - العنصر المراد إضافته
 */
export function addItemToInventory(item) {
    if (!currentSlot) {
        console.error('No current slot.');
        return;
    }
    currentSlot.inventory.push(item);
}

/**
 * إزالة عنصر من المخزون
 * @param {number} index - موقع العنصر في المصفوفة
 */
export function removeItemFromInventory(index) {
    if (!currentSlot) {
        console.error('No current slot.');
        return;
    }
    if (index >= 0 && index < currentSlot.inventory.length) {
        currentSlot.inventory.splice(index, 1);
    }
}

/**
 * الحصول على عنصر من المخزون
 * @param {number} index - موقع العنصر
 * @returns {Object|null} العنصر أو null
 */
export function getItemFromInventory(index) {
    if (!currentSlot) return null;
    return currentSlot.inventory[index] || null;
}

/**
 * تجهيز عنصر
 * @param {string} slotType - نوع فتحة التجهيز (mainhand, head, body, etc.)
 * @param {Object} item - العنصر المراد تجهيزه
 */
export function equipItem(slotType, item) {
    if (!currentSlot) {
        console.error('No current slot.');
        return;
    }
    currentSlot.equippedItems[slotType] = item;
}

/**
 * إزالة تجهيز عنصر
 * @param {string} slotType - نوع فتحة التجهيز
 */
export function unequipItem(slotType) {
    if (!currentSlot) {
        console.error('No current slot.');
        return;
    }
    delete currentSlot.equippedItems[slotType];
}

// ============================================
// 5. دوال مساعدة للرسائل
// ============================================

/**
 * إضافة رسالة لسجل الرسائل
 * @param {string} message - نص الرسالة
 */
export function addMessage(message) {
    if (!currentSlot) {
        console.error('No current slot.');
        return;
    }
    currentSlot.messageLog.push(message);
}

/**
 * مسح سجل الرسائل
 */
export function clearMessageLog() {
    if (!currentSlot) {
        console.error('No current slot.');
        return;
    }
    currentSlot.messageLog = [];
}