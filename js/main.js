// ============================================
// ========== YOUR STORY IDLE - MAIN ==========
// ============================================

import { GameEngine } from './game-engine.js';
import { UIManager } from './ui-manager.js';

window.GameEngine = GameEngine;
window.UIManager = UIManager;

GameEngine.initializeSlots();
UIManager.init();
UIManager.showStartScreen();

console.log('✅ YOUR STORY IDLE - Started successfully');
