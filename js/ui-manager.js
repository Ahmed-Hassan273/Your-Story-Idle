// ============================================
// ========== YOUR STORY IDLE - UI MANAGER ==========
// ============================================
// هذا الملف مسؤول عن واجهة المستخدم فقط (المظاهر)
// لا يحتوي على منطق اللعبة - يستمع للأحداث ويستدعي دوال game-engine

import { currentSlot, slots, createNewSlot } from './state.js';
import { eventBus } from './event-bus.js';
import { 
    GAME_CONFIG, 
    SPAWN_POINTS, 
    WEEK_DAYS, 
    SEASONS, 
    MOON_PHASES,
    WEATHER_TYPES,
    NAV 
} from './constants.js';
import * as GameEngine from './game-engine.js';

// ============================================
// 1. المتغيرات الداخلية
// ============================================

/** أداة التلميح */
const tooltip = document.getElementById('tooltip');

/** وضع حذف العناصر */
let deleteMode = false;

/** وضع تعيين مفاتيح المخزون */
let inventorySetKeyMode = false;

/** وضع تعيين مفاتيح المهارات */
let activeSkillsSetKeyMode = false;

/** فلتر المخزون الحالي */
let currentFilter = 'all';

/** نوع الترتيب */
let sortType = 'type';

/** اتجاه الترتيب */
let sortDir = 'asc';

/** دالة رد النافذة المنبثقة */
let modalCallback = null;

/** أقصى عدد للرسائل */
let maxMessages = GAME_CONFIG.defaultMaxMessages;

/** وضع الصعوبة المختار */
let selectedMode = '';

/** نقطة البداية المختارة */
let selectedSpawn = '';

// ============================================
// 2. دوال Tooltip
// ============================================

function showTooltip(e, item) {
    if (!item) return;
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<div class="tooltip-name">${item.name}</div><div>${item.description || ''}</div>`;
    positionTooltip(e);
}

function showSimpleTooltip(e, text) {
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<div>${text}</div>`;
    positionTooltip(e);
}

function showBarTooltip(e, name, maxVal) {
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<div class="tooltip-name">${name}</div><div>Max: ${maxVal}</div>`;
    positionTooltip(e);
}

function positionTooltip(e) {
    if (e) {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
    }
}

function hideTooltip() {
    tooltip.style.display = 'none';
}

// ============================================
// 3. دوال الرسائل والسجل
// ============================================

function addMessage(text) {
    if (!currentSlot) return;
    
    currentSlot.messageLog.push(text);
    if (currentSlot.messageLog.length > maxMessages) {
        currentSlot.messageLog.shift();
    }
    
    const logDiv = document.getElementById('log-display');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg-item';
    msgDiv.innerText = `>> ${text}`;
    logDiv.appendChild(msgDiv);
    
    while (logDiv.children.length > maxMessages) {
        logDiv.removeChild(logDiv.firstChild);
    }
    logDiv.scrollTop = logDiv.scrollHeight;
}

function clearLog() {
    if (!currentSlot) return;
    currentSlot.messageLog = [];
    document.getElementById('log-display').innerHTML = '';
    GameEngine.saveGame();
}

function increaseMaxMsg() {
    maxMessages = Math.min(GAME_CONFIG.maxMessagesMax, maxMessages + 1);
    document.getElementById('max-input').value = maxMessages;
}

function decreaseMaxMsg() {
    maxMessages = Math.max(GAME_CONFIG.maxMessagesMin, maxMessages - 1);
    document.getElementById('max-input').value = maxMessages;
}

function updateMaxMsgs(value) {
    let v = parseInt(value);
    if (isNaN(v)) v = GAME_CONFIG.defaultMaxMessages;
    maxMessages = Math.min(GAME_CONFIG.maxMessagesMax, Math.max(GAME_CONFIG.maxMessagesMin, v));
    document.getElementById('max-input').value = maxMessages;
}

// ============================================
// 4. دوال الشاشات
// ============================================

function showStartScreen() {
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-ui').style.visibility = 'hidden';
    document.getElementById('slots-wrapper').style.display = 'none';
    document.getElementById('creation-wrapper').style.display = 'none';
    document.getElementById('main-start-btn-container').style.display = 'block';
    renderSlots();
}

function showGameScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-ui').style.visibility = 'visible';
    document.getElementById('game-ui').style.opacity = '1';
}

function showSlots() {
    document.getElementById('main-start-btn-container').style.display = 'none';
    document.getElementById('slots-wrapper').style.display = 'flex';
    renderSlots();
}

function backToStart() {
    document.getElementById('slots-wrapper').style.display = 'none';
    document.getElementById('main-start-btn-container').style.display = 'block';
}

function renderSlots() {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= 3; i++) {
        const slotData = slots[i] || createNewSlot();
        const exists = slotData.exists;
        
        const slotDiv = document.createElement('div');
        slotDiv.className = 'slot-item';
        
        const btn = document.createElement('div');
        btn.className = 'char-slot';
        btn.innerText = `SLOT ${i}: ${exists ? 'SAVED' : 'EMPTY'}`;
        btn.onclick = () => {
            if (exists) {
                GameEngine.loadGame(i);
                showGameScreen();
                GameEngine.startGameLoop();
                if (!currentSlot.hasPlayedIntro) {
                    GameEngine.showIntro();
                }
            } else {
                currentSlotIndex = i;
                showCreation();
            }
        };
        
        slotDiv.appendChild(btn);
        
        if (exists) {
            const del = document.createElement('button');
            del.className = 'delete-slot-btn';
            del.innerHTML = '🗑️';
            del.onclick = (e) => {
                e.stopPropagation();
                showDeleteConfirm(i);
            };
            slotDiv.appendChild(del);
        }
        
        container.appendChild(slotDiv);
    }
}

// ============================================
// 5. دوال شاشة الإنشاء
// ============================================

function showCreation() {
    document.getElementById('slots-wrapper').style.display = 'none';
    document.getElementById('creation-wrapper').style.display = 'flex';
    attachCreationInfoListeners();
}

function cancelCreation() {
    document.getElementById('creation-wrapper').style.display = 'none';
    document.getElementById('slots-wrapper').style.display = 'flex';
}

function attachCreationInfoListeners() {
    document.querySelectorAll('.option-card').forEach(el => {
        el.removeEventListener('mouseenter', creationInfoHandler);
        el.removeEventListener('mouseleave', creationInfoReset);
        el.addEventListener('mouseenter', creationInfoHandler);
        el.addEventListener('mouseleave', creationInfoReset);
    });
}

function creationInfoHandler(e) {
    const info = e.target.getAttribute('data-info');
    if (info) {
        document.getElementById('creation-info-box-content').innerHTML = info;
    }
}

function creationInfoReset() {
    document.getElementById('creation-info-box-content').innerHTML = 'Select difficulty and spawn point to begin your adventure.';
}

function selectOption(type, value, el) {
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        if (type === 'mode') selectedMode = '';
        else if (type === 'spawn') selectedSpawn = '';
    } else {
        const parent = el.parentElement;
        parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        if (type === 'mode') selectedMode = value;
        else if (type === 'spawn') selectedSpawn = value;
    }
    updateCreationInfo(el);
}

function updateCreationInfo(el) {
    const box = document.getElementById('creation-info-box-content');
    const info = el.getAttribute('data-info');
    box.innerHTML = info || 'Select difficulty and spawn point to begin your adventure.';
}

function finishCreation() {
    if (!selectedMode) {
        addMessage('Select difficulty first.');
        return;
    }
    if (!selectedSpawn) {
        addMessage('Select spawn point first.');
        return;
    }
    
    GameEngine.startNewGame(currentSlotIndex, selectedMode, selectedSpawn);
    showGameScreen();
    GameEngine.startGameLoop();
    GameEngine.showIntro();
}

// ============================================
// 6. دوال منطقة الحدث
// ============================================

function updateEventArea(title, description) {
    document.getElementById('event-title').innerText = title;
    document.getElementById('event-stats').innerText = description;
    document.getElementById('event-image-area').innerHTML = '📜';
}

function updateChoices(choices) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    
    choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = c.text;
        btn.onclick = () => GameEngine.executeAction(c.action);
        container.appendChild(btn);
    });
}

function updateLocationDisplay(location) {
    document.getElementById('location-display').innerHTML = `📍 ${location}`;
}

// ============================================
// 7. دوال الإحصاءات والموارد
// ============================================

function updateStatsUI() {
    if (!currentSlot) return;
    
    const s = currentSlot.baseStats;
    document.getElementById('stat-will').innerText = s.will;
    document.getElementById('stat-think').innerText = s.think.toFixed(1);
    document.getElementById('stat-prac').innerText = s.practical.toFixed(1);
    document.getElementById('stat-soc').innerText = s.social.toFixed(1);
    document.getElementById('stat-str').innerText = s.strength;
    document.getElementById('stat-agi').innerText = s.agility;
    document.getElementById('stat-fort').innerText = s.fortitude;
    
    document.getElementById('stat-maxhealth').innerText = currentSlot.baseMaxHealth;
    document.getElementById('stat-maxstamina').innerText = currentSlot.baseMaxStamina;
    document.getElementById('stat-maxfocus').innerText = currentSlot.baseMaxFocus;
    document.getElementById('stat-maxhunger').innerText = currentSlot.baseMaxHunger;
    document.getElementById('stat-maxaether').innerText = currentSlot.baseMaxAether;
    document.getElementById('stat-maxhearts').innerText = currentSlot.baseMaxHearts;
    
    document.getElementById('player-name').value = currentSlot.basePlayerName;
    document.getElementById('player-age').innerText = `AGE: ${currentSlot.basePlayerAge}`;
}

function updateBarsUI() {
    if (!currentSlot) return;
    
    document.getElementById('health-fill').style.width = (currentSlot.healthVal / currentSlot.baseMaxHealth * 100) + '%';
    document.getElementById('health-text').innerText = currentSlot.healthVal;
    
    document.getElementById('stamina-fill').style.width = (currentSlot.stamina / currentSlot.baseMaxStamina * 100) + '%';
    document.getElementById('stamina-text').innerText = currentSlot.stamina;
    
    document.getElementById('focus-fill').style.width = (currentSlot.focusVal / currentSlot.baseMaxFocus * 100) + '%';
    document.getElementById('focus-text').innerText = currentSlot.focusVal;
    
    document.getElementById('hunger-fill').style.width = (currentSlot.hungerVal / currentSlot.baseMaxHunger * 100) + '%';
    document.getElementById('hunger-text').innerText = currentSlot.hungerVal;
    
    document.getElementById('aether-fill').style.width = (currentSlot.aetherVal / currentSlot.baseMaxAether * 100) + '%';
    document.getElementById('aether-text').innerText = currentSlot.aetherVal;
    
    document.getElementById('heart-val').innerText = currentSlot.heartsVal;
}

function updateXPDisplay() {
    if (!currentSlot) return;
    
    const xpNeeded = GameEngine.getXPNeeded();
    const percent = (currentSlot.baseXP / xpNeeded) * 100;
    
    document.getElementById('xp-fill').style.width = percent + '%';
    document.getElementById('xp-text').innerText = `${currentSlot.baseXP}/${xpNeeded} XP`;
    document.getElementById('player-level').innerText = currentSlot.baseLevel;
}

function updateCoinDisplay() {
    if (!currentSlot) return;
    document.getElementById('coins-display').innerText = currentSlot.baseCoins;
}

function updateAllUI() {
    updateStatsUI();
    updateBarsUI();
    updateXPDisplay();
    updateCoinDisplay();
}

// ============================================
// 8. دوال الوقت والطقس
// ============================================

function updateTimeDisplay() {
    if (!currentSlot) return;
    
    const dayIdx = (currentSlot.gameDays - 1) % 7;
    const day = WEEK_DAYS[dayIdx];
    const season = getCurrentSeasonDisplay();
    const weather = currentSlot.weather;
    
    const totalDays = (currentSlot.gameYears * 360) + ((currentSlot.gameMonths - 1) * 30) + currentSlot.gameDays;
    const moonPhaseNumber = getMoonPhase(totalDays);
    const moonPhaseName = MOON_PHASES[moonPhaseNumber];
    const lunarDay = getLunarDay(totalDays);
    
    const dateStr = `${String(currentSlot.gameDays).padStart(2, '0')}/${String(currentSlot.gameMonths).padStart(2, '0')}/${currentSlot.gameYears} | LUNAR DAY ${Math.floor(lunarDay)} | ${day} | ${String(currentSlot.gameHours).padStart(2, '0')}:${String(currentSlot.gameMinutes).padStart(2, '0')}`;
    const weatherStr = `${season} | ${weather} | ${moonPhaseName}`;
    
    document.getElementById('date-line').innerHTML = dateStr;
    document.getElementById('weather-line').innerHTML = weatherStr;
}

function getCurrentSeasonDisplay() {
    const month = currentSlot.gameMonths;
    if (month === 1) return 'SPRING';
    if (month === 2) return 'SUMMER';
    if (month === 3) return 'AUTUMN';
    return 'WINTER';
}

function getLunarDay(totalDays) {
    const LUNAR_CYCLE = 29.53;
    return ((totalDays - 1) % LUNAR_CYCLE) + 1;
}

function getMoonPhase(totalDays) {
    const moonAge = (totalDays - 1) % 29.53;
    if (moonAge < 1.5) return 0;
    if (moonAge < 7.5) return 1;
    if (moonAge < 8.5) return 2;
    if (moonAge < 14.5) return 3;
    if (moonAge < 15.5) return 4;
    if (moonAge < 21.5) return 5;
    if (moonAge < 22.5) return 6;
    return 7;
}

// ============================================
// 9. دوال المخزون
// ============================================

function renderInventory() {
    if (!currentSlot) return;
    
    const container = document.getElementById('inv-container');
    container.innerHTML = '';
    
    if (currentSlot.inventory.length === 0) {
        container.innerHTML = '<div class="empty-inv-msg">Empty Inventory</div>';
        return;
    }
    
    let filtered = [...currentSlot.inventory];
    if (currentFilter !== 'all') {
        filtered = filtered.filter(i => i.category === currentFilter);
    }
    
    filtered.sort((a, b) => {
        const m = sortDir === 'asc' ? 1 : -1;
        if (sortType === 'name') return m * a.name.localeCompare(b.name);
        if (sortType === 'rarity') return m * ((b.rarity || 0) - (a.rarity || 0));
        return m * (a.type || '').localeCompare(b.type || '');
    });
    
    filtered.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'slot' + (deleteMode ? ' delete-active' : '');
        slot.innerHTML = `<span style="font-size:24px">${item.icon || '📦'}</span>`;
        
        slot.onclick = () => {
            const realIdx = currentSlot.inventory.findIndex(i => 
                i.id === item.id && i.masteryLevel === item.masteryLevel
            );
            if (realIdx === -1) return;
            
            if (deleteMode) {
                GameEngine.removeItem(realIdx);
                renderInventory();
            } else {
                GameEngine.equipItem(realIdx);
            }
        };
        
        slot.onmouseenter = (e) => showTooltip(e, item);
        slot.onmouseleave = hideTooltip;
        
        container.appendChild(slot);
    });
}

function renderEquipment() {
    if (!currentSlot) return;
    
    const slots = document.querySelectorAll('#equip-container .equip-slot');
    slots.forEach(slot => {
        const slotType = slot.dataset.type;
        const item = currentSlot.equippedItems[slotType];
        
        if (item) {
            slot.innerHTML = `<span style="font-size:18px">${item.icon}</span>`;
            slot.dataset.itemJson = JSON.stringify(item);
        } else {
            slot.innerHTML = '';
            delete slot.dataset.itemJson;
        }
    });
}

function setFilter(filter) {
    currentFilter = filter;
    renderInventory();
}

function cycleSortType() {
    const types = ['type', 'name', 'rarity'];
    let idx = types.indexOf(sortType);
    idx = (idx + 1) % types.length;
    sortType = types[idx];
    document.getElementById('sort-type-btn').innerText = sortType.toUpperCase();
    renderInventory();
}

function toggleSortDir() {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    document.getElementById('sort-dir-btn').innerText = sortDir === 'asc' ? '↓' : '↑';
    renderInventory();
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    const btn = document.getElementById('del-mode-btn');
    btn.innerText = deleteMode ? 'DEL MODE ON' : 'DEL MODE OFF';
    btn.classList.toggle('active', deleteMode);
    renderInventory();
}

function showEquipTooltip(slot, e) {
    if (slot.dataset.itemJson) {
        showTooltip(e, JSON.parse(slot.dataset.itemJson));
    }
}

function updateCoinTooltip() {
    if (currentSlot) {
        showSimpleTooltip(null, `Coins: ${currentSlot.baseCoins}`);
    }
}

// ============================================
// 10. دوال المهارات
// ============================================

function renderSkills() {
    // سيتم تنفيذها لاحقاً
}

function handleSkillClick(el) {
    const skillName = el.getAttribute('data-skill-name');
    addMessage(`Skill: ${skillName}`);
}

// ============================================
// 11. دوال التبويبات
// ============================================

function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// ============================================
// 12. دوال النوافذ المنبثقة
// ============================================

function showModal(message, input = false, callback = null) {
    const modal = document.getElementById('modal-overlay');
    document.getElementById('modal-message').innerText = message;
    
    const inputField = document.getElementById('modal-input');
    if (input) {
        inputField.style.display = 'inline-block';
        inputField.value = '';
    } else {
        inputField.style.display = 'none';
    }
    
    modal.style.visibility = 'visible';
    modalCallback = callback;
}

function hideModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.visibility = 'hidden';
    document.getElementById('modal-input').style.display = 'none';
    document.getElementById('modal-input').value = '';
    modalCallback = null;
}

function showDeleteConfirm(slotNum) {
    showModal(`Delete Slot ${slotNum}? Type "Yes" to confirm.`, true, () => {
        const input = document.getElementById('modal-input');
        if (input.value.trim().toLowerCase() === 'yes') {
            GameEngine.deleteGame(slotNum);
            renderSlots();
        } else {
            addMessage("Deletion cancelled - Type 'Yes' to confirm.");
        }
        hideModal();
    });
}

function showMenuModal() {
    GameEngine.saveGame();
    showModal('Return to main menu? Progress will be saved.', false, () => {
        GameEngine.stopGameLoop();
        showStartScreen();
        hideModal();
    });
}

function showDeathScreen(data) {
    // سيتم تنفيذها لاحقاً
    addMessage(`PERMADEATH! Gained ${data.generalXP} Legacy XP.`);
    showStartScreen();
}

// ============================================
// 13. دوال Info Panel
// ============================================

function openInfoPanel() {
    document.getElementById('info-panel').style.visibility = 'visible';
}

function closeInfoPanel() {
    document.getElementById('info-panel').style.visibility = 'hidden';
}

// ============================================
// 14. دوال SET KEY
// ============================================

function toggleInventorySetKey() {
    inventorySetKeyMode = !inventorySetKeyMode;
    const btn = document.getElementById('inventory-setkey');
    btn.innerText = inventorySetKeyMode ? 'SET KEY ON' : 'SET KEY OFF';
    btn.classList.toggle('active', inventorySetKeyMode);
}

function toggleActiveSkillsSetKey() {
    activeSkillsSetKeyMode = !activeSkillsSetKeyMode;
    const btn = document.getElementById('active-skills-setkey');
    btn.innerText = activeSkillsSetKeyMode ? 'SET KEY ON' : 'SET KEY OFF';
    btn.classList.toggle('active', activeSkillsSetKeyMode);
}

function handleActionSlotClick(slotNum) {
    const slot = currentSlot?.actionSlots[slotNum];
    if (slot && slot.name) {
        addMessage(`Used ${slot.displayName}`);
    } else {
        addMessage(`Slot ${slotNum} is empty`);
    }
}

// ============================================
// 15. دوال التحكم
// ============================================

function togglePause() {
    const isPaused = GameEngine.togglePause();
    document.getElementById('pause-btn').innerText = isPaused ? 'RESUME' : 'PAUSE';
}

function manualSave() {
    GameEngine.saveGame();
    addMessage('Game saved.');
}

function openSettings() {
    addMessage('Settings coming soon');
}

// ============================================
// 16. دوال المقدمة
// ============================================

function showIntroScreen(text) {
    const introScreen = document.getElementById('intro-screen');
    const introText = document.getElementById('intro-story-text');
    introText.innerHTML = '';
    introScreen.style.visibility = 'visible';
    introScreen.style.opacity = '1';
}

function updateIntroText(text) {
    document.getElementById('intro-story-text').innerHTML = text;
}

function hideIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.opacity = '0';
    introScreen.style.visibility = 'hidden';
}

function skipIntro() {
    GameEngine.skipIntro();
}

// ============================================
// 17. الاستماع لأحداث event-bus
// ============================================

function setupEventListeners() {
    eventBus.on('player:healthChanged', updateBarsUI);
    eventBus.on('player:staminaChanged', updateBarsUI);
    eventBus.on('player:focusChanged', updateBarsUI);
    eventBus.on('player:hungerChanged', updateBarsUI);
    eventBus.on('player:aetherChanged', updateBarsUI);
    eventBus.on('player:xpChanged', updateXPDisplay);
    eventBus.on('player:levelUp', (e) => {
        addMessage(`Level Up! You are now level ${e.detail.level}.`);
        updateAllUI();
    });
    eventBus.on('player:coinsChanged', updateCoinDisplay);
    eventBus.on('player:maxStatsChanged', updateStatsUI);
    eventBus.on('player:statChanged', updateStatsUI);
    eventBus.on('player:resourcesChanged', updateBarsUI);
    
    eventBus.on('inventory:changed', () => {
        renderInventory();
        renderEquipment();
    });
    eventBus.on('equipment:changed', renderEquipment);
    eventBus.on('item:equipped', (e) => addMessage(`Equipped ${e.detail.item.name}.`));
    eventBus.on('item:unequipped', (e) => addMessage(`Unequipped ${e.detail.item.name}.`));
    eventBus.on('item:used', (e) => addMessage(`Used ${e.detail.item.name}.`));
    
    eventBus.on('time:minute', updateTimeDisplay);
    eventBus.on('time:hour', updateTimeDisplay);
    eventBus.on('time:day', updateTimeDisplay);
    eventBus.on('weather:changed', (e) => {
        addMessage(`Weather changed to ${e.detail.weather}.`);
        updateTimeDisplay();
    });
    
    eventBus.on('event:changed', (e) => {
        updateEventArea(e.detail.display, e.detail.description);
        updateChoices(e.detail.choices);
    });
    eventBus.on('location:changed', (e) => updateLocationDisplay(e.detail.location));
    
    eventBus.on('message:added', (e) => addMessage(e.detail.text));
    
    eventBus.on('intro:started', (e) => showIntroScreen(e.detail.text));
    eventBus.on('intro:typing', (e) => updateIntroText(e.detail.text));
    eventBus.on('intro:completed', hideIntroScreen);
    eventBus.on('intro:closed', () => {
        updateAllUI();
        renderInventory();
        renderEquipment();
    });
    
    eventBus.on('game:paused', () => document.getElementById('pause-btn').innerText = 'RESUME');
    eventBus.on('game:resumed', () => document.getElementById('pause-btn').innerText = 'PAUSE');
    eventBus.on('game:saved', () => addMessage('Game saved.'));
    eventBus.on('game:loaded', () => {
        updateAllUI();
        renderInventory();
        renderEquipment();
        updateTimeDisplay();
    });
    
    eventBus.on('ui:showDeathScreen', showDeathScreen);
    
    eventBus.on('slot:deleted', () => renderSlots());
}

// ============================================
// 18. دوال resizers (من الملف القديم)
// ============================================

function setupResizers() {
    const leftResizer = document.getElementById('left-resizer');
    const charInfoBox = document.getElementById('character-info-box');
    const invBox = document.getElementById('inventory-box');
    let isDraggingLeft = false, startYLeft, startCharFlex, startInvFlex;

    if (leftResizer) {
        leftResizer.addEventListener('mousedown', (e) => {
            isDraggingLeft = true;
            startYLeft = e.clientY;
            startCharFlex = parseFloat(getComputedStyle(charInfoBox).flexGrow);
            startInvFlex = parseFloat(getComputedStyle(invBox).flexGrow);
            e.preventDefault();
        });
    }

    const rightResizer = document.getElementById('right-resizer');
    const topBox = document.getElementById('top-box');
    const bottomBox = document.getElementById('bottom-box');
    let isDraggingRight = false, startYRight, startTopFlex, startBottomFlex;

    if (rightResizer) {
        rightResizer.addEventListener('mousedown', (e) => {
            isDraggingRight = true;
            startYRight = e.clientY;
            startTopFlex = parseFloat(getComputedStyle(topBox).flexGrow);
            startBottomFlex = parseFloat(getComputedStyle(bottomBox).flexGrow);
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (isDraggingLeft) {
            const delta = e.clientY - startYLeft;
            const container = charInfoBox.parentElement;
            const rect = container.getBoundingClientRect();
            const deltaPercent = (delta / rect.height) * 100;
            let newCharFlex = Math.max(25, Math.min(75, startCharFlex * 100 + deltaPercent)) / 100;
            let newInvFlex = (startCharFlex + startInvFlex) - newCharFlex;
            charInfoBox.style.flex = newCharFlex;
            invBox.style.flex = newInvFlex;
        }
        if (isDraggingRight) {
            const delta = e.clientY - startYRight;
            const container = topBox.parentElement;
            const rect = container.getBoundingClientRect();
            const deltaPercent = (delta / rect.height) * 100;
            let newTopFlex = Math.max(25, Math.min(75, startTopFlex * 100 + deltaPercent)) / 100;
            let newBottomFlex = (startTopFlex + startBottomFlex) - newTopFlex;
            topBox.style.flex = newTopFlex;
            bottomBox.style.flex = newBottomFlex;
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingLeft = false;
        isDraggingRight = false;
    });
}

// ============================================
// 19. دوال keyboard و mouse
// ============================================

function setupGlobalListeners() {
    document.addEventListener('keydown', (e) => {
        const n = parseInt(e.key);
        if (n >= 1 && n <= 9) {
            e.preventDefault();
            handleActionSlotClick(n);
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (tooltip.style.display === 'block') {
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
        }
    });
}

// ============================================
// 20. تهيئة UI Manager
// ============================================

function init() {
    setupEventListeners();
    setupResizers();
    setupGlobalListeners();
    
    // ربط الأزرار في HTML
    document.getElementById('modal-sure')?.addEventListener('click', () => {
        if (modalCallback) modalCallback();
        hideModal();
    });
    document.getElementById('modal-cancel')?.addEventListener('click', hideModal);
    document.getElementById('auto-save-toggle')?.addEventListener('change', (e) => {
        GameEngine.setAutoSaveEnabled(e.target.checked);
    });
    document.getElementById('player-name')?.addEventListener('change', (e) => {
        if (currentSlot) {
            currentSlot.basePlayerName = e.target.value;
            GameEngine.saveGame();
        }
    });
}

// ============================================
// 21. تصدير الدوال للاستخدام في HTML
// ============================================

export const UIManager = {
    // Tooltip
    showTooltip,
    showSimpleTooltip,
    showBarTooltip,
    hideTooltip,
    
    // الشاشات
    showStartScreen,
    showSlots,
    backToStart,
    showCreation,
    cancelCreation,
    finishCreation,
    selectOption,
    renderSlots,
    
    // الحدث
    updateEventArea,
    updateChoices,
    
    // الإحصاءات
    updateStatsUI,
    updateBarsUI,
    updateAllUI,
    updateXPDisplay,
    updateCoinDisplay,
    updateCoinTooltip,
    
    // الوقت
    updateTimeDisplay,
    
    // المخزون
    renderInventory,
    setFilter,
    cycleSortType,
    toggleSortDir,
    toggleDeleteMode,
    showEquipTooltip,
    
    // المهارات
    renderSkills,
    handleSkillClick,
    
    // السجل
    addMessage,
    clearLog,
    increaseMaxMsg,
    decreaseMaxMsg,
    updateMaxMsgs,
    
    // النوافذ
    showModal,
    hideModal,
    showDeleteConfirm,
    showMenuModal,
    
    // Info Panel
    openInfoPanel,
    closeInfoPanel,
    
    // التبويبات
    openTab,
    
    // SET KEY
    toggleInventorySetKey,
    toggleActiveSkillsSetKey,
    handleActionSlotClick,
    
    // التحكم
    togglePause,
    manualSave,
    openSettings,
    
    // المقدمة
    skipIntro,
    
    // التهيئة
    init
};

// كائن GameState للتوافق مع HTML
window.GameState = {
    get stats() {
        if (!currentSlot) return { str: 1, agi: 1, fort: 1, will: 1 };
        return {
            str: currentSlot.baseStats?.strength || 1,
            agi: currentSlot.baseStats?.agility || 1,
            fort: currentSlot.baseStats?.fortitude || 1,
            will: currentSlot.baseStats?.will || 1
        };
    },
    get maxHealth() { return currentSlot?.baseMaxHealth || 10; },
    get maxStamina() { return currentSlot?.baseMaxStamina || 10; },
    get maxFocus() { return currentSlot?.baseMaxFocus || 100; },
    get maxHunger() { return currentSlot?.baseMaxHunger || 100; },
    get maxAether() { return currentSlot?.baseMaxAether || 10; },
    get maxHearts() { return currentSlot?.baseMaxHearts || 1; }
};

// ============================================
// 22. بدء التشغيل
// ============================================

window.UIManager = UIManager;