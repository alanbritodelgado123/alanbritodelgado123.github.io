// ==========================
// CONFIGURACIÓN Y CONSTANTES
// ==========================
const CONFIG = {
  DIFFICULTY_TIMES: {
    easy: 20000,   // 20 segundos
    medium: 15000, // 15 segundos
    hard: 10000    // 10 segundos
  },
  QUESTIONS_PER_QUIZ: 5,
  MAX_ATTEMPTS: 3,
  STORAGE_KEYS: {
    lang: 'quiz_lang',
    username: 'quiz_username',
    avatar: 'quiz_avatar',
    theme: 'quiz_theme',
    difficulty: 'quiz_difficulty',
    highScores: 'quiz_high_scores'
  }
};

// ==========================
// CLASE PRINCIPAL DEL QUIZ
// ==========================
class QuizApp {
  constructor() {
    // Estado principal
    this.currentLang = 'es';
    this.currentUsername = 'Ali';
    this.currentAvatar = '🦁';
    this.currentTheme = 'dark';
    this.currentDifficulty = 'medium';
    this.currentCategory = 'general';
    this.shuffledQuestions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.attempts = 0;
    this.timer = null;
    this.hintUsed = false;
    this.gameStartTime = 0;
    this.questionStartTime = 0;
    this.gameStats = {
      totalGames: 0,
      totalScore: 0,
      bestScore: 0,
      averageTime: 0
    };

    // Inicialización
    this.initializeElements();
    this.loadSettings();
    this.setupEventListeners();
    this.initializeCanvas();
    this.showSection('home');
  }

  // ==========================
  // INICIALIZAR ELEMENTOS DEL DOM
  // ==========================
  initializeElements() {
    this.elements = {
      canvas: document.getElementById('background-canvas'),
      quizContainer: document.getElementById('quiz-container'),
      usernameInput: document.getElementById('username'),
      userNameDisplay: document.getElementById('user-name'),
      userAvatarDisplay: document.getElementById('user-avatar'),
      difficultySelect: document.getElementById('difficulty'),
      navLinks: document.querySelectorAll('.nav-links a'),
      sections: document.querySelectorAll('.section'),
      countdownOverlay: document.getElementById('countdown-overlay'),
      countdownNumber: document.getElementById('countdown-number'),
      countdownText: document.getElementById('countdown-text'),
      themeOptions: document.querySelectorAll('.theme-option'),
      avatarRadios: document.querySelectorAll('input[name="avatar"]'),
      hintModal: document.getElementById('hint-modal'),
      hintText: document.getElementById('hint-text'),
      hintClose: document.getElementById('hint-close'),
      hintOk: document.getElementById('hint-ok')
    };
  }

  // ==========================
  // CARGAR CONFIGURACIONES
  // ==========================
  loadSettings() {
    try {
      this.currentLang = localStorage.getItem(CONFIG.STORAGE_KEYS.lang) || 'es';
      this.currentUsername = localStorage.getItem(CONFIG.STORAGE_KEYS.username) || 'Ali';
      this.currentAvatar = localStorage.getItem(CONFIG.STORAGE_KEYS.avatar) || '🦁';
      this.currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'dark';
      this.currentDifficulty = localStorage.getItem(CONFIG.STORAGE_KEYS.difficulty) || 'medium';

      // Cargar estadísticas del juego
      const savedStats = localStorage.getItem('quiz_stats');
      if (savedStats) {
        this.gameStats = { ...this.gameStats, ...JSON.parse(savedStats) };
      }

      this.applySettings();
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      this.resetToDefaults();
    }
  }

  // ==========================
  // APLICAR CONFIGURACIONES A LA INTERFAZ
  // ==========================
  applySettings() {
    // Idioma
    // (Si agregas selector de idioma, aquí se aplicaría)

    // Nombre de usuario
    if (this.elements.usernameInput) {
      this.elements.usernameInput.value = this.currentUsername;
    }

    // Dificultad
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.value = this.currentDifficulty;
    }

    // Avatar
    const avatarRadio = document.querySelector(`input[name="avatar"][value="${this.currentAvatar}"]`);
    if (avatarRadio) {
      avatarRadio.checked = true;
    }

    // Tema
    this.applyTheme();
    this.updateUserDisplay();
  }

  // ==========================
  // APLICAR TEMA VISUAL
  // ==========================
  applyTheme() {
    const body = document.body;
    const themeRadio = document.querySelector(`input[name="theme"][value="${this.currentTheme}"]`);

    body.classList.remove('dark-mode', 'light-mode');
    body.classList.add(`${this.currentTheme}-mode`);

    if (themeRadio) {
      themeRadio.checked = true;
    }

    this.elements.themeOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.theme === this.currentTheme) {
        option.classList.add('selected');
      }
    });
  }

  // ==========================
  // ACTUALIZAR DISPLAY DEL USUARIO
  // ==========================
  updateUserDisplay() {
    if (this.elements.userNameDisplay) {
      this.elements.userNameDisplay.textContent = this.currentUsername;
    }
    if (this.elements.userAvatarDisplay) {
      this.elements.userAvatarDisplay.textContent = this.currentAvatar;
    }
  }

  // ==========================
  // GUARDAR CONFIGURACIONES
  // ==========================
  saveSettings() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.lang, this.currentLang);
      localStorage.setItem(CONFIG.STORAGE_KEYS.username, this.currentUsername);
      localStorage.setItem(CONFIG.STORAGE_KEYS.avatar, this.currentAvatar);
      localStorage.setItem(CONFIG.STORAGE_KEYS.theme, this.currentTheme);
      localStorage.setItem(CONFIG.STORAGE_KEYS.difficulty, this.currentDifficulty);
      localStorage.setItem('quiz_stats', JSON.stringify(this.gameStats));
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
    }
  }

  // ==========================
  // RESETEAR A VALORES POR DEFECTO
  // ==========================
  resetToDefaults() {
    this.currentLang = 'es';
    this.currentUsername = 'Ali';
    this.currentAvatar = '🦁';
    this.currentTheme = 'dark';
    this.currentDifficulty = 'medium';
    this.applySettings();
  }

  // ==========================
  // MOSTRAR SECCIÓN
  // ==========================
  showSection(sectionId) {
    this.elements.sections.forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }
  }

  // ==========================
  // CONFIGURAR EVENT LISTENERS
  // ==========================
  setupEventListeners() {
    // Navegación
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        this.showSection(sectionId);
      });
    });

    // Botones y clics generales
    document.addEventListener('click', (e) => this.handleGlobalClicks(e));

    // Configuración de usuario
    if (this.elements.usernameInput) {
      this.elements.usernameInput.addEventListener('input', (e) => {
        this.currentUsername = e.target.value.trim() || 'Ali';
        this.saveSettings();
        this.updateUserDisplay();
      });
    }

    // Selección de avatar
    this.elements.avatarRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.currentAvatar = radio.value;
          this.saveSettings();
          this.updateUserDisplay();
        }
      });
    });

    // Cambio de dificultad
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.addEventListener('change', (e) => {
        this.currentDifficulty = e.target.value;
        this.saveSettings();
      });
    }

    // Selección de tema
    this.elements.themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          this.currentTheme = theme;
          this.saveSettings();
          this.applyTheme();
        }
      });
    });

    // Modal de pista
    if (this.elements.hintClose) {
      this.elements.hintClose.addEventListener('click', () => this.closeHintModal());
    }
    if (this.elements.hintOk) {
      this.elements.hintOk.addEventListener('click', () => this.closeHintModal());
    }
    if (this.elements.hintModal) {
      this.elements.hintModal.addEventListener('click', (e) => {
        if (e.target === this.elements.hintModal) {
          this.closeHintModal();
        }
      });
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Prevenir cierre accidental del countdown
    if (this.elements.countdownOverlay) {
      this.elements.countdownOverlay.addEventListener('click', (e) => {
        if (e.target === this.elements.countdownOverlay) {
          e.preventDefault();
        }
      });
    }

    // Redimensionar canvas
    window.addEventListener('resize', () => {
      if (this.elements.canvas) {
        this.resizeCanvas();
      }
    });
  }

  // ==========================
  // MANEJAR CLICS GLOBALES
  // ==========================
  handleGlobalClicks(e) {
    // Botón de inicio
    if (e.target.classList.contains('start-btn') && 
        !e.target.classList.contains('retry-btn') && 
        !e.target.classList.contains('restart-btn')) {
      this.currentCategory = e.target.getAttribute('data-category') || 'general';
      this.showCountdownAndStart();
    }

    // Clics en categorías disponibles
    if (e.target.closest('.category-card.available')) {
      const card = e.target.closest('.category-card.available');
      this.currentCategory = card.getAttribute('data-category') || 'general';
      this.showCountdownAndStart();
    }

    // Clics en categorías deshabilitadas
    if (e.target.closest('.category-card.disabled')) {
      this.showComingSoonMessage();
    }

    // Botón de pista
    if (e.target.classList.contains('hint-button')) {
      this.showHint();
    }

    // Botón retry/restart
    if (e.target.classList.contains('retry-btn') || e.target.classList.contains('restart-btn')) {
      this.showCountdownAndStart();
    }
  }

  // ==========================
  // MANEJAR ATAJOS DE TECLADO
  // ==========================
  handleKeydown(e) {
    if (document.getElementById('quizzes').classList.contains('active')) {
      switch(e.key) {
        case '1': this.checkAnswer(0); e.preventDefault(); break;
        case '2': this.checkAnswer(1); e.preventDefault(); break;
        case '3': this.checkAnswer(2); e.preventDefault(); break;
        case '4': this.checkAnswer(3); e.preventDefault(); break;
        case 'h':
        case 'H':
          if (!this.hintUsed && this.currentDifficulty !== 'hard') {
            this.showHint();
            e.preventDefault();
          }
          break;
        case 'Escape':
          this.showExitConfirmation();
          e.preventDefault();
          break;
      }
    }
  }

  // ==========================
  // MOSTRAR CONFIRMACIÓN DE SALIDA
  // ==========================
  showExitConfirmation() {
    clearTimeout(this.timer);

    const modal = document.createElement('div');
    modal.className = 'hint-modal active';
    modal.innerHTML = `
      <div class="hint-content">
        <div class="hint-header">
          <h3>Confirmar salida</h3>
          <button class="hint-close" id="confirm-close">×</button>
        </div>
        <div class="hint-body">
          <p>¿Estás seguro que quieres salir del quiz? Se perderá tu progreso actual.</p>
        </div>
        <div class="hint-footer">
          <button class="hint-btn" id="confirm-exit">Sí, salir</button>
          <button class="hint-btn" id="confirm-cancel" style="background: #95a5a6;">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirm-close').addEventListener('click', () => this.resumeGame());
    document.getElementById('confirm-cancel').addEventListener('click', () => this.resumeGame());
    document.getElementById('confirm-exit').addEventListener('click', () => {
      this.resetQuizInProgress();
      this.showSection('categories');
      document.body.removeChild(modal);
    });
  }

  resumeGame() {
    const modal = document.querySelector('.hint-modal.active');
    if (modal) document.body.removeChild(modal);

    // Reanudar temporizador
    const timeLeft = this.getRemainingTime();
    this.animateProgressBar(timeLeft);

    this.timer = setTimeout(() => {
      this.checkAnswer(-1);
    }, timeLeft);
  }

  getRemainingTime() {
    const bar = document.getElementById('progress-bar');
    if (bar) {
      const currentWidth = parseFloat(bar.style.width) || 100;
      const totalTime = CONFIG.DIFFICULTY_TIMES[this.currentDifficulty];
      return (currentWidth / 100) * totalTime;
    }
    return 10000;
  }

  resetQuizInProgress() {
    clearTimeout(this.timer);
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.attempts = 0;
    this.hintUsed = false;
  }

  // ==========================
  // MOSTRAR MENSAJE DE PRÓXIMAMENTE
  // ==========================
  showComingSoonMessage() {
    this.showNotification("Esta categoría está en construcción. ¡Próximamente!", 'info');
  }

  // ==========================
  // SISTEMA DE NOTIFICACIONES
  // ==========================
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 2rem',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 'bold',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    const colors = {
      info: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c'
    };
    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // ==========================
  // INICIALIZAR CANVAS ANIMADO
  // ==========================
  initializeCanvas() {
    if (!this.elements.canvas) return;
    this.elements.canvas.style.pointerEvents = 'none';
    this.elements.canvas.style.zIndex = '-2';

    const ctx = this.elements.canvas.getContext('2d');
    this.resizeCanvas();

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 50 : 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * this.elements.canvas.width,
        y: Math.random() * this.elements.canvas.height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);

      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#6C5CE7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > this.elements.canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > this.elements.canvas.height) p.dy *= -1;

        p.opacity += (Math.random() - 0.5) * 0.02;
        p.opacity = Math.max(0.1, Math.min(0.7, p.opacity));
      });

      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }

  resizeCanvas() {
    if (this.elements.canvas) {
      this.elements.canvas.width = window.innerWidth;
      this.elements.canvas.height = window.innerHeight;
    }
  }

  // ==========================
  // MOSTRAR COUNTDOWN Y COMENZAR
  // ==========================
  showCountdownAndStart() {
    const texts = {
      es: { ready: "¡Prepárate!", go: "¡YA!" },
    };

    this.elements.countdownOverlay.classList.add('active');
    this.elements.countdownText.textContent = texts[this.currentLang].ready;

    let count = 3;
    this.elements.countdownNumber.textContent = count;

    const countdownInterval = setInterval(() => {
      count--;

      if (count > 0) {
        this.elements.countdownNumber.textContent = count;
        this.animateCountdown();
      } else {
        this.elements.countdownNumber.textContent = texts[this.currentLang].go;
        this.elements.countdownText.textContent = "";
        this.animateCountdown();

        clearInterval(countdownInterval);

        setTimeout(() => {
          this.elements.countdownOverlay.classList.remove('active');
          this.showSection('quizzes');
          this.startNewGame();
        }, 1000);
      }
    }, 1000);
  }

  animateCountdown() {
    const content = document.querySelector('.countdown-content');
    if (content) {
      content.classList.remove('animate');
      setTimeout(() => content.classList.add('animate'), 10);
    }
  }

  // ==========================
  // COMENZAR NUEVO JUEGO
  // ==========================
  startNewGame() {
    try {
      const categoryData = this.getQuizData()[this.currentCategory];

      if (!categoryData || !categoryData[this.currentLang]) {
        this.showError('No hay preguntas disponibles para esta categoría.');
        return;
      }

      const questions = categoryData[this.currentLang];
      this.shuffledQuestions = [...questions]
        .sort(() => 0.5 - Math.random())
        .slice(0, CONFIG.QUESTIONS_PER_QUIZ);

      this.currentQuestionIndex = 0;
      this.score = 0;
      this.attempts = 0;
      this.hintUsed = false;
      this.gameStartTime = Date.now();

      this.showQuestion();
    } catch (error) {
      console.error('Error iniciando juego:', error);
      this.showError('Error al iniciar el juego. Por favor, intenta de nuevo.');
    }
  }

  // ==========================
  // MOSTRAR PREGUNTA ACTUAL
  // ==========================
  showQuestion() {
    if (this.currentQuestionIndex >= this.shuffledQuestions.length) {
      this.showWinScreen();
      return;
    }

    clearTimeout(this.timer);

    const question = this.shuffledQuestions[this.currentQuestionIndex];
    const texts = {
      es: {
        question: "Pregunta",
        of: "de",
        score: "Puntuación",
        hint: "💡 Pista",
        timeRemaining: "Tiempo restante"
      },
    };

    const timeLimit = CONFIG.DIFFICULTY_TIMES[this.currentDifficulty];
    const showHint = this.currentDifficulty !== 'hard' && !this.hintUsed;

    this.elements.quizContainer.innerHTML = `
      <h2>${texts[this.currentLang].question} ${this.currentQuestionIndex + 1} ${texts[this.currentLang].of} ${CONFIG.QUESTIONS_PER_QUIZ}</h2>
      <div class="quiz-card">
        <div class="image-placeholder">${question.emoji}</div>
        <div class="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="score-display">
          ${texts[this.currentLang].score}: ${this.score}/${this.currentQuestionIndex + 1}
        </div>
        <p class="question-text">${question.question}</p>
        ${showHint ? `<button class="hint-button">${texts[this.currentLang].hint}</button>` : ''}
        <div class="options">
          ${question.options.map((opt, i) => 
            `<button class="option-button" onclick="quizApp.checkAnswer(${i})" data-key="${String.fromCharCode(65 + i)}">
              ${String.fromCharCode(65 + i)}) ${opt}
            </button>`
          ).join('')}
        </div>
      </div>
    `;

    this.animateProgressBar(timeLimit);
    this.questionStartTime = Date.now();

    // Timer para la pregunta
    this.timer = setTimeout(() => {
      this.checkAnswer(-1); // Tiempo agotado
    }, timeLimit);
  }

  animateProgressBar(duration) {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;

    bar.style.transition = 'none';
    bar.style.width = '100%';

    setTimeout(() => {
      bar.style.transition = `width ${duration}ms linear`;
      bar.style.width = '0%';
    }, 50);
  }
}

// ==========================
// SISTEMA DE AUDIO
// ==========================
class AudioSystem {
  constructor() {
    this.enabled = true;
    this.sounds = {
      correct: new Audio('assets/correct.mp3'),
      incorrect: new Audio('assets/incorrect.mp3')
    };
  }

  play(type) {
    if (!this.enabled || !this.sounds[type]) return;
    this.sounds[type].currentTime = 0;
    this.sounds[type].play();
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}

// ==========================
// EXTENSIONES PARA QUIZAPP
// ==========================
const QuizAppExtensions = {
  init(quizApp) {
    quizApp.achievementSystem = new AchievementSystem();
    quizApp.audioSystem = new AudioSystem();

    // Sobrescribir checkAnswer para integrar audio y logros
    const originalCheckAnswer = quizApp.checkAnswer.bind(quizApp);
    quizApp.checkAnswer = function(selectedIndex) {
      const isCorrect = selectedIndex === this.shuffledQuestions[this.currentQuestionIndex].answer;
      this.audioSystem.play(isCorrect ? 'correct' : 'incorrect');
      originalCheckAnswer(selectedIndex);
    };

    // Sobrescribir showWinScreen para logros
    const originalShowWinScreen = quizApp.showWinScreen.bind(quizApp);
    quizApp.showWinScreen = function() {
      const gameData = {
        completed: true,
        score: this.score,
        totalTime: Date.now() - this.gameStartTime,
        totalGames: this.gameStats.totalGames + 1,
        hintUsed: this.hintUsed
      };
      const newAchievements = this.achievementSystem.checkAchievements(gameData);
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          this.achievementSystem.showAchievementNotification(achievement);
        }, index * 1000);
      });
      originalShowWinScreen();
    };

    // Agregar configuraciones de extensiones
    this.addExtensionSettings(quizApp);
  },

  addExtensionSettings(quizApp) {
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
      const extensionSettings = document.createElement('div');
      extensionSettings.innerHTML = `
        <div class="setting-group">
          <label>
            <input type="checkbox" id="sound-toggle" ${quizApp.audioSystem.enabled ? 'checked' : ''}>
            Efectos de sonido
          </label>
        </div>
        <div class="setting-group">
          <h3>Logros Desbloqueados</h3>
          <div class="achievements-display" id="achievements-display">
            ${this.getAchievementsHTML(quizApp.achievementSystem)}
          </div>
        </div>
      `;
      settingsSection.appendChild(extensionSettings);

      document.getElementById('sound-toggle').addEventListener('change', () => {
        quizApp.audioSystem.toggle();
      });
    }
  },

  getAchievementsHTML(achievementSystem) {
    return Object.entries(achievementSystem.achievements)
      .map(([key, achievement]) => `
        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
          <span class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</span>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
          </div>
        </div>
      `).join('');
  }
};

// ==========================
// INICIALIZACIÓN GLOBAL
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.quizApp = new QuizApp();
    QuizAppExtensions.init(window.quizApp);

    // Mostrar estadísticas en configuración
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
      const statsHTML = window.quizApp.getStatsDisplay();
      settingsSection.insertAdjacentHTML('beforeend', statsHTML);
    }
  } catch (error) {
    console.error('Error inicializando Quiz App:', error);
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; text-align: center; padding: 2rem;">
        <h2>Error al cargar la aplicación</h2>
        <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
        <button onclick="location.reload()" style="padding: 1rem 2rem; margin-top: 1rem; background: #6C5CE7; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Recargar página
        </button>
      </div>
    `;
  }
});

// ==========================
// UTILIDADES DE LOCALSTORAGE
// ==========================
function isLocalStorageSupported() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function cleanupCorruptedData() {
  try {
    const keys = Object.values(CONFIG.STORAGE_KEYS);
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          JSON.parse(item);
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up corrupted data:', error);
  }
}

if (isLocalStorageSupported()) {
  cleanupCorruptedData();
}

// ==========================
// SISTEMA DE LOGROS
// ==========================
class AchievementSystem {
  constructor() {
    this.achievements = {
      firstWin: {
        name: "Primer Quiz Completado",
        description: "Completa tu primer quiz.",
        icon: "🏅",
        unlocked: false
      },
      perfectScore: {
        name: "Puntuación Perfecta",
        description: "Responde todas las preguntas correctamente.",
        icon: "🌟",
        unlocked: false
      },
      fastFinish: {
        name: "Rápido y Furioso",
        description: "Completa el quiz en menos de 30 segundos.",
        icon: "⚡",
        unlocked: false
      },
      noHints: {
        name: "Sin Ayuda",
        description: "Completa el quiz sin usar pistas.",
        icon: "🔒",
        unlocked: false
      }
    };
  }

  checkAchievements(gameData) {
    const unlocked = [];
    if (gameData.completed) {
      if (!this.achievements.firstWin.unlocked) {
        this.achievements.firstWin.unlocked = true;
        unlocked.push(this.achievements.firstWin);
      }
      if (gameData.score === CONFIG.QUESTIONS_PER_QUIZ && !this.achievements.perfectScore.unlocked) {
        this.achievements.perfectScore.unlocked = true;
        unlocked.push(this.achievements.perfectScore);
      }
      if (gameData.totalTime < 30000 && !this.achievements.fastFinish.unlocked) {
        this.achievements.fastFinish.unlocked = true;
        unlocked.push(this.achievements.fastFinish);
      }
      if (!gameData.hintUsed && !this.achievements.noHints.unlocked) {
        this.achievements.noHints.unlocked = true;
        unlocked.push(this.achievements.noHints);
      }
    }
    return unlocked;
  }

  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <span class="achievement-title">${achievement.name}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 1000);
    }, 2500);
  }
}

// ==========================
// MANEJO DE PISTAS
// ==========================
QuizApp.prototype.showHint = function() {
  if (this.hintUsed || this.currentDifficulty === 'hard') return;
  this.hintUsed = true;
  const question = this.shuffledQuestions[this.currentQuestionIndex];
  const hint = this.getHints()[this.currentCategory]?.[this.currentLang]?.[this.currentQuestionIndex] || "No hay pista disponible.";
  this.elements.hintText.textContent = hint;
  this.elements.hintModal.classList.add('active');
  document.getElementById('hint-warning').style.display = 'block';
};

QuizApp.prototype.closeHintModal = function() {
  if (this.elements.hintModal) {
    this.elements.hintModal.classList.remove('active');
  }
};

// ==========================
// MOSTRAR RESULTADOS DEL QUIZ
// ==========================
QuizApp.prototype.showWinScreen = function() {
  clearTimeout(this.timer);
  const totalTime = Date.now() - this.gameStartTime;
  this.gameStats.totalGames += 1;
  this.gameStats.totalScore += this.score;
  this.gameStats.bestScore = Math.max(this.gameStats.bestScore, this.score);
  this.gameStats.averageTime = Math.round(
    ((this.gameStats.averageTime * (this.gameStats.totalGames - 1)) + totalTime) / this.gameStats.totalGames
  );
  this.saveSettings();

  this.elements.quizContainer.innerHTML = `
    <div class="quiz-card">
      <h2>¡Quiz Completado!</h2>
      <p>Puntuación final: <strong>${this.score} / ${CONFIG.QUESTIONS_PER_QUIZ}</strong></p>
      <p>Tiempo total: <strong>${(totalTime / 1000).toFixed(1)} segundos</strong></p>
      <button class="restart-btn">Jugar de nuevo</button>
      <button class="retry-btn">Volver a categorías</button>
    </div>
  `;
};

// ==========================
// CHEQUEAR RESPUESTA
// ==========================
QuizApp.prototype.checkAnswer = function(selectedIndex) {
  clearTimeout(this.timer);
  const question = this.shuffledQuestions[this.currentQuestionIndex];
  const correctIndex = question.answer;

  const optionButtons = Array.from(document.querySelectorAll('.option-button'));
  optionButtons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex) btn.classList.add('correct');
    if (i === selectedIndex && i !== correctIndex) btn.classList.add('incorrect');
    if (i === selectedIndex) btn.classList.add('selected');
  });

  if (selectedIndex === correctIndex) {
    this.score++;
    this.showNotification('¡Respuesta correcta!', 'success');
  } else if (selectedIndex === -1) {
    this.showNotification('¡Tiempo agotado!', 'warning');
  } else {
    this.showNotification('Respuesta incorrecta.', 'error');
  }

  setTimeout(() => {
    this.currentQuestionIndex++;
    this.showQuestion();
  }, 1200);
};

// ==========================
// OBTENER DATOS DE PREGUNTAS
// ==========================
QuizApp.prototype.getQuizData = function() {
  // Ejemplo de estructura, puedes expandirlo
  return {
    general: {
      es: [
        {
          question: "¿Cuál es el planeta más grande del sistema solar?",
          options: ["Tierra", "Júpiter", "Marte", "Venus"],
          answer: 1,
          emoji: "🪐"
        },
        {
          question: "¿Quién escribió 'Cien años de soledad'?",
          options: ["Mario Vargas Llosa", "Gabriel García Márquez", "Pablo Neruda", "Isabel Allende"],
          answer: 1,
          emoji: "📚"
        },
        {
          question: "¿Cuál es el elemento químico con símbolo 'O'?",
          options: ["Oro", "Oxígeno", "Osmio", "Óxido"],
          answer: 1,
          emoji: "🧪"
        },
        {
          question: "¿En qué año llegó el hombre a la Luna?",
          options: ["1969", "1972", "1955", "1980"],
          answer: 0,
          emoji: "🌕"
        },
        {
          question: "¿Cuál es el río más largo del mundo?",
          options: ["Amazonas", "Nilo", "Yangtsé", "Misisipi"],
          answer: 1,
          emoji: "🌊"
        }
      ]
    }
    // Puedes agregar más categorías e idiomas aquí
  };
};

// ==========================
// OBTENER PISTAS
// ==========================
QuizApp.prototype.getHints = function() {
  return {
    general: {
      es: [
        "Es un gigante gaseoso.",
        "Autor colombiano, Nobel de Literatura.",
        "Es esencial para la respiración.",
        "Fue en la década de los 60.",
        "Está en África."
      ]
    }
    // Puedes agregar más pistas por categoría e idioma
  };
};

// ==========================
// MOSTRAR ERROR
// ==========================
QuizApp.prototype.showError = function(msg) {
  this.showNotification(msg, 'error', 4000);
};

// ==========================
// MOSTRAR ESTADÍSTICAS
// ==========================
QuizApp.prototype.getStatsDisplay = function() {
  return `
    <div class="setting-group">
      <h3>Estadísticas</h3>
      <ul>
        <li>Partidas jugadas: <strong>${this.gameStats.totalGames}</strong></li>
        <li>Puntuación total: <strong>${this.gameStats.totalScore}</strong></li>
        <li>Mejor puntuación: <strong>${this.gameStats.bestScore}</strong></li>
        <li>Tiempo promedio: <strong>${(this.gameStats.averageTime / 1000).toFixed(1)} seg</strong></li>
      </ul>
    </div>
  `;
};