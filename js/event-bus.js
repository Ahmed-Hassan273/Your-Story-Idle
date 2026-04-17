// ============================================
// ========== YOUR STORY IDLE - EVENT BUS ==========
// ============================================
// هذا الملف يوفر باص أحداث مركزي للتواصل بين جميع أجزاء اللعبة
// لا يعتمد على أي ملف آخر - أداة تواصل مستقلة تماماً

/**
 * باص الأحداث المركزي
 * يستخدم EventTarget الأصلي في المتصفح لتوفير نظام أحداث خفيف وسريع
 */
class EventBus extends EventTarget {
    /**
     * إرسال حدث إلى جميع المستمعين
     * @param {string} event - اسم الحدث (مثلاً: 'player:healthChanged')
     * @param {any} detail - البيانات المرافقة للحدث (اختياري)
     * 
     * @example
     * eventBus.emit('player:healthChanged', { current: 25, max: 30 });
     * eventBus.emit('game:paused');
     */
    emit(event, detail = null) {
        this.dispatchEvent(new CustomEvent(event, { detail }));
    }

    /**
     * الاستماع لحدث معين
     * @param {string} event - اسم الحدث
     * @param {Function} callback - الدالة التي تستدعى عند وقوع الحدث
     * 
     * @example
     * eventBus.on('player:healthChanged', (e) => {
     *     const { current, max } = e.detail;
     *     console.log(`Health: ${current}/${max}`);
     * });
     */
    on(event, callback) {
        this.addEventListener(event, callback);
    }

    /**
     * إلغاء الاستماع لحدث معين
     * @param {string} event - اسم الحدث
     * @param {Function} callback - نفس دالة callback المستخدمة في on
     * 
     * @example
     * const handler = (e) => console.log(e.detail);
     * eventBus.on('player:healthChanged', handler);
     * eventBus.off('player:healthChanged', handler);
     */
    off(event, callback) {
        this.removeEventListener(event, callback);
    }

    /**
     * الاستماع لحدث لمرة واحدة فقط
     * بعد أول مرة يقع فيها الحدث، يتم إلغاء الاستماع تلقائياً
     * @param {string} event - اسم الحدث
     * @param {Function} callback - الدالة التي تستدعى عند وقوع الحدث
     * 
     * @example
     * eventBus.once('player:levelUp', (e) => {
     *     console.log(`Congratulations! You reached level ${e.detail.newLevel}!`);
     * });
     */
    once(event, callback) {
        const wrapper = (e) => {
            callback(e);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * إلغاء جميع المستمعين لحدث معين
     * @param {string} event - اسم الحدث
     * 
     * @example
     * eventBus.offAll('player:healthChanged');
     */
    offAll(event) {
        // نحتاج لطريقة مختلفة لأن EventTarget لا يوفر removeAll مباشرة
        // الحل: إنشاء EventTarget جديد (لكن هذا معقد)
        // الأفضل استخدام off لكل callback على حدة
        console.warn('offAll is not fully supported. Use off() for each callback instead.');
    }
}

// تصدير نسخة واحدة فقط من الباص (Singleton Pattern)
// هذا يضمن أن جميع أجزاء اللعبة تستخدم نفس باص الأحداث
export const eventBus = new EventBus();

// ============================================
// أسماء الأحداث المقترحة (مرجع فقط - لا يؤثر على الكود)
// ============================================
/*
    اللاعب:
    - player:healthChanged     -> { current, max, previous }
    - player:staminaChanged    -> { current, max }
    - player:focusChanged      -> { current, max }
    - player:hungerChanged     -> { current, max }
    - player:aetherChanged     -> { current, max }
    - player:xpChanged         -> { current, needed, level }
    - player:levelUp           -> { newLevel }
    - player:statChanged       -> { stat, value }
    - player:coinsChanged      -> { current }
    
    المخزون:
    - inventory:changed        -> { inventory }
    - item:added              -> { item }
    - item:removed            -> { item }
    - item:equipped           -> { item, slot }
    - item:unequipped         -> { item, slot }
    
    الوقت والطقس:
    - time:minute             -> { minutes, hours, days }
    - time:hour               -> { hours, days }
    - time:day                -> { days, months, years }
    - weather:changed         -> { weather, previous }
    
    الأحداث والقصة:
    - event:changed           -> { eventId, event }
    - message:added           -> { message }
    
    اللعبة:
    - game:paused             -> {}
    - game:resumed            -> {}
    - game:saved              -> { slotIndex }
    - game:loaded             -> { slotIndex }
    - game:started            -> { slotIndex }
    
    الفتحات:
    - slot:created            -> { slotIndex }
    - slot:deleted            -> { slotIndex }
    - slot:selected           -> { slotIndex }
*/