// ============================================
// ========== YOUR STORY IDLE - MAIN ==========
// ============================================
// نقطة الدخول الرئيسية للعبة
// يربط جميع الملفات ويبدأ التشغيل

import { UIManager } from './ui-manager.js';
import { GameEngine } from './game-engine.js';

// تعريض الدوال للـ HTML (عشان onclick يشتغل)
window.GameEngine = GameEngine;
window.UIManager = UIManager;

// بدء التشغيل
GameEngine.initializeSlots();
UIManager.init();
UIManager.showStartScreen();

console.log('✅ YOUR STORY IDLE - Started successfully');