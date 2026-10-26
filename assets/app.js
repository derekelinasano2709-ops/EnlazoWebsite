
(() => {
  'use strict';

  // ==========================================
  // 1. CONFIGURACIÓN
  // ==========================================

  const $ = id => document.getElementById(id);
  const cfg = window.ENLAZO_CONFIG || {};

  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);

  const client = configured && window.supabase
    ? window.supabase.createClient(
        cfg.supabaseUrl,
        cfg.supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      )
    : null;

  const TOKEN_KEY = 'enlazo_discord_provider_token';

  let lang = localStorage.getItem('enlazo_language') || 'es';
  let currentSession = null;
  let providerToken = null;
  let loadSequence = 0;

  // El token de Discord solo se conserva durante esta sesión
  // de la pestaña; nunca se guarda en localStorage.
  try {
    providerToken = sessionStorage.getItem(TOKEN_KEY);
  } catch (_) {
    providerToken = null;
  }

  // ==========================================
  // 2. IDIOMAS
  // ==========================================

  const languages = {
    es: {
      name: '🇪🇸 Español',
      navFeatures: 'Funciones',
      navDashboard: 'Dashboard',
      navCommands: 'Comandos',
      login: 'Entrar con Discord ↗',
      eyebrow: 'CONECTA Y JUEGA · BOT DE DISCORD',
      heroTitle: 'Tu comunidad.<br><span class="gradient">Sin límites.</span>',
      heroDesc: 'Juegos, moderación y experiencias que conectan a las personas. Todo en un solo lugar, con el estilo de Enlazo.',
      openDashboard: 'Abrir mi dashboard ↗',
      explore: 'Explorar funciones ↓',
      notice: 'Sin estadísticas inventadas. Los datos aparecen cuando conectas tu cuenta.',
      badgePlay: '✦ Juega en comunidad',
      badgeCommunity: '◈ Una comunidad',
      featureKicker: 'TODO LO QUE NECESITAS',
      featureTitle: 'Una experiencia más <span class="gradient">conectada.</span>',
      featureDesc: 'Enlazo reúne entretenimiento y herramientas de comunidad en un mismo bot.',
      gameTitle: 'Juega en comunidad',
      gameDesc: 'Retos, trivia, juegos sociales y competiciones para mantener tu servidor activo.',
      securityTitle: 'Protege tu espacio',
      securityDesc: 'Herramientas de moderación y seguridad para cuidar las conversaciones.',
      customizeTitle: 'Hazlo tuyo',
      customizeDesc: 'Perfiles, niveles, AFK y acciones interactivas para una comunidad con personalidad.',
      dashboardKicker: 'TU ESPACIO',
      dashboardTitle: 'Dashboard <span class="gradient">de verdad.</span>',
      dashboardDesc: 'Inicia sesión para consultar los servidores disponibles en tu cuenta. Los controles de administración requieren una API segura.',
      accountTitle: 'Tu cuenta de Discord',
      accountSubtitle: 'Conecta tu cuenta para empezar.',
      connect: 'Conectar Discord ↗',
      emptyTitle: 'Todo comienza aquí',
      emptyDesc: 'Tu perfil y tus servidores aparecerán cuando inicies sesión.',
      securityNote: '🔒 Solo se muestran datos que Discord autoriza. Las modificaciones requieren un backend seguro.',
      commandsKicker: 'ENLAZO BOT',
      commandsTitle: '90 formas de <span class="gradient">conectar.</span>',
      commandsDesc: 'Explora las categorías principales de la edición definitiva del bot.',
      chips: ['⚡ Juegos', '🛡️ Moderación', '🎭 Roleplay', '📈 Niveles', '💤 AFK', '🧠 Trivia', '🌎 Idiomas', '🏆 Retos'],
      ctaTitle: '¿Listo para conectar tu comunidad?',
      ctaDesc: 'Una nueva forma de vivir Discord empieza con Enlazo.',
      invite: 'Añadir Enlazo ↗',
      privacy: 'Privacidad',
      terms: 'Términos',
      connected: 'Cuenta conectada',
      loading: 'Obteniendo información autorizada…',
      loadingDiscord: 'Cargando datos de Discord…',
      verified: 'Cuenta verificada por Discord',
      adminCount: n => `${n} servidor(es) con permisos de administración`,
      administrator: 'Administrador · Configuración disponible al conectar la API de Enlazo',
      noAdmins: 'No se encontraron servidores donde tengas permisos de administración.',
      noToken: 'Tu sesión está activa, pero falta el token de Discord para consultar los servidores. Pulsa «Reconectar Discord».',
      discordError: 'Discord rechazó la consulta. Es posible que debas volver a autorizar la cuenta.',
      unauthorized: 'El acceso de Discord ha caducado o no es válido. Vuelve a autorizar tu cuenta.',
      forbidden: 'Discord no permite consultar estos datos. Comprueba los permisos autorizados.',
      unexpected: 'Respuesta inesperada de Discord.',
      loadError: 'No se pudieron cargar los servidores. Inténtalo de nuevo.',
      loginError: 'No se pudo iniciar sesión: ',
      configure: 'Comprueba la URL y la clave pública de Supabase en config.js.',
      signedOut: 'Sesión cerrada',
      logout: 'Cerrar sesión',
      reconnect: 'Reconectar Discord ↗',
      theme: 'Cambiar tema',
      footer: '© Enlazo · Connect Through Play'
    },

    en: {
      name: '🇬🇧 English',
      navFeatures: 'Features',
      navDashboard: 'Dashboard',
      navCommands: 'Commands',
      login: 'Login with Discord ↗',
      eyebrow: 'CONNECT THROUGH PLAY · DISCORD BOT',
      heroTitle: 'Your community.<br><span class="gradient">No limits.</span>',
      heroDesc: 'Games, moderation, and experiences that bring people together. Everything in one place, with the Enlazo style.',
      openDashboard: 'Open my dashboard ↗',
      explore: 'Explore features ↓',
      notice: 'No made-up statistics. Your data appears when you connect your account.',
      badgePlay: '✦ Play together',
      badgeCommunity: '◈ One community',
      featureKicker: 'EVERYTHING YOU NEED',
      featureTitle: 'A more <span class="gradient">connected</span> experience.',
      featureDesc: 'Enlazo brings entertainment and community tools together in one bot.',
      gameTitle: 'Play together',
      gameDesc: 'Challenges, trivia, social games, and competitions to keep your server active.',
      securityTitle: 'Protect your space',
      securityDesc: 'Moderation and security tools to help keep conversations safe.',
      customizeTitle: 'Make it yours',
      customizeDesc: 'Profiles, levels, AFK, and interactive features for a community with personality.',
      dashboardKicker: 'YOUR SPACE',
      dashboardTitle: 'A real <span class="gradient">dashboard.</span>',
      dashboardDesc: 'Sign in to view the servers available to your account. Administration controls require a secure API.',
      accountTitle: 'Your Discord account',
      accountSubtitle: 'Connect your account to get started.',
      connect: 'Connect Discord ↗',
      emptyTitle: 'It starts here',
      emptyDesc: 'Your profile and servers will appear after you sign in.',
      securityNote: '🔒 Only data authorized by Discord is displayed. Changes require a secure backend.',
      commandsKicker: 'ENLAZO BOT',
      commandsTitle: '90 ways to <span class="gradient">connect.</span>',
      commandsDesc: 'Explore the main categories in the bot’s definitive edition.',
      chips: ['⚡ Games', '🛡️ Moderation', '🎭 Roleplay', '📈 Levels', '💤 AFK', '🧠 Trivia', '🌎 Languages', '🏆 Challenges'],
      ctaTitle: 'Ready to connect your community?',
      ctaDesc: 'A new way to experience Discord starts with Enlazo.',
      invite: 'Add Enlazo ↗',
      privacy: 'Privacy',
      terms: 'Terms',
      connected: 'Account connected',
      loading: 'Getting authorized information…',
      loadingDiscord: 'Loading Discord data…',
      verified: 'Verified by Discord',
      adminCount: n => `${n} server(s) with administrator permissions`,
      administrator: 'Administrator · Settings require the Enlazo API',
      noAdmins: 'No servers with administrator permissions were found.',
      noToken: 'Your session is active, but the Discord token needed to retrieve servers is missing. Click “Reconnect Discord”.',
      discordError: 'Discord rejected the request. You may need to authorize your account again.',
      unauthorized: 'Your Discord access has expired or is invalid. Authorize your account again.',
      forbidden: 'Discord does not allow this request. Check the authorized permissions.',
      unexpected: 'Unexpected response from Discord.',
      loadError: 'Could not load servers. Please try again.',
      loginError: 'Could not sign in: ',
      configure: 'Check the Supabase URL and public key in config.js.',
      signedOut: 'Signed out',
      logout: 'Sign out',
      reconnect: 'Reconnect Discord ↗',
      theme: 'Change theme',
      footer: '© Enlazo · Connect Through Play'
    },

    pt: {
      name: '🇧🇷 Português',
      navFeatures: 'Recursos',
      navDashboard: 'Painel',
      navCommands: 'Comandos',
      login: 'Entrar com Discord ↗',
      eyebrow: 'CONECTE-SE JOGANDO · BOT DO DISCORD',
      heroTitle: 'Sua comunidade.<br><span class="gradient">Sem limites.</span>',
      heroDesc: 'Jogos, moderação e experiências que conectam pessoas. Tudo em um só lugar, com o estilo Enlazo.',
      openDashboard: 'Abrir meu painel ↗',
      explore: 'Explorar recursos ↓',
      notice: 'Sem estatísticas inventadas. Seus dados aparecem quando você conecta sua conta.',
      badgePlay: '✦ Jogue em comunidade',
      badgeCommunity: '◈ Uma comunidade',
      featureKicker: 'TUDO O QUE VOCÊ PRECISA',
      featureTitle: 'Uma experiência mais <span class="gradient">conectada.</span>',
      featureDesc: 'O Enlazo reúne entretenimento e ferramentas para comunidades em um único bot.',
      gameTitle: 'Jogue em comunidade',
      gameDesc: 'Desafios, perguntas, jogos sociais e competições para manter seu servidor ativo.',
      securityTitle: 'Proteja seu espaço',
      securityDesc: 'Ferramentas de moderação e segurança para cuidar das conversas.',
      customizeTitle: 'Personalize sua experiência',
      customizeDesc: 'Perfis, níveis, AFK e recursos interativos para uma comunidade com personalidade.',
      dashboardKicker: 'SEU ESPAÇO',
      dashboardTitle: 'Um painel <span class="gradient">de verdade.</span>',
      dashboardDesc: 'Entre para consultar os servidores disponíveis na sua conta. Os controles administrativos exigem uma API segura.',
      accountTitle: 'Sua conta do Discord',
      accountSubtitle: 'Conecte sua conta para começar.',
      connect: 'Conectar Discord ↗',
      emptyTitle: 'Tudo começa aqui',
      emptyDesc: 'Seu perfil e seus servidores aparecerão quando você entrar.',
      securityNote: '🔒 Apenas dados autorizados pelo Discord são exibidos. Alterações exigem um backend seguro.',
      commandsKicker: 'ENLAZO BOT',
      commandsTitle: '90 maneiras de <span class="gradient">conectar.</span>',
      commandsDesc: 'Explore as principais categorias da edição definitiva do bot.',
      chips: ['⚡ Jogos', '🛡️ Moderação', '🎭 Roleplay', '📈 Níveis', '💤 AFK', '🧠 Trivia', '🌎 Idiomas', '🏆 Desafios'],
      ctaTitle: 'Pronto para conectar sua comunidade?',
      ctaDesc: 'Uma nova forma de viver o Discord começa com o Enlazo.',
      invite: 'Adicionar Enlazo ↗',
      privacy: 'Privacidade',
      terms: 'Termos',
      connected: 'Conta conectada',
      loading: 'Obtendo informações autorizadas…',
      loadingDiscord: 'Carregando dados do Discord…',
      verified: 'Conta verificada pelo Discord',
      adminCount: n => `${n} servidor(es) com permissões de administração`,
      administrator: 'Administrador · Configurações exigem a API do Enlazo',
      noAdmins: 'Nenhum servidor com permissões de administração foi encontrado.',
      noToken: 'Sua sessão está ativa, mas falta o token do Discord para consultar os servidores. Clique em “Reconectar Discord”.',
      discordError: 'O Discord rejeitou a consulta. Talvez seja necessário autorizar novamente.',
      unauthorized: 'O acesso do Discord expirou ou é inválido. Autorize novamente.',
      forbidden: 'O Discord não permite esta consulta. Verifique as permissões autorizadas.',
      unexpected: 'Resposta inesperada do Discord.',
      loadError: 'Não foi possível carregar os servidores. Tente novamente.',
      loginError: 'Não foi possível entrar: ',
      configure: 'Verifique a URL e a chave pública do Supabase em config.js.',
      signedOut: 'Sessão encerrada',
      logout: 'Sair',
      reconnect: 'Reconectar Discord ↗',
      theme: 'Alterar tema',
      footer: '© Enlazo · Connect Through Play'
    },

    fr: {
      name: '🇫🇷 Français',
      navFeatures: 'Fonctionnalités',
      navDashboard: 'Tableau de bord',
      navCommands: 'Commandes',
      login: 'Connexion avec Discord ↗',
      eyebrow: 'CONNECTER PAR LE JEU · BOT DISCORD',
      heroTitle: 'Votre communauté.<br><span class="gradient">Sans limites.</span>',
      heroDesc: 'Des jeux, de la modération et des expériences qui rapprochent les personnes. Tout au même endroit, avec le style Enlazo.',
      openDashboard: 'Ouvrir mon tableau de bord ↗',
      explore: 'Découvrir les fonctionnalités ↓',
      notice: 'Aucune statistique inventée. Vos données apparaissent lorsque vous connectez votre compte.',
      badgePlay: '✦ Jouons ensemble',
      badgeCommunity: '◈ Une communauté',
      featureKicker: 'TOUT CE DONT VOUS AVEZ BESOIN',
      featureTitle: 'Une expérience plus <span class="gradient">connectée.</span>',
      featureDesc: 'Enlazo réunit divertissement et outils communautaires dans un seul bot.',
      gameTitle: 'Jouez ensemble',
      gameDesc: 'Défis, quiz, jeux sociaux et compétitions pour garder votre serveur actif.',
      securityTitle: 'Protégez votre espace',
      securityDesc: 'Des outils de modération et de sécurité pour protéger les conversations.',
      customizeTitle: 'Personnalisez votre espace',
      customizeDesc: 'Profils, niveaux, AFK et fonctionnalités interactives pour une communauté unique.',
      dashboardKicker: 'VOTRE ESPACE',
      dashboardTitle: 'Un véritable <span class="gradient">tableau de bord.</span>',
      dashboardDesc: 'Connectez-vous pour consulter les serveurs disponibles sur votre compte. Les contrôles d’administration nécessitent une API sécurisée.',
      accountTitle: 'Votre compte Discord',
      accountSubtitle: 'Connectez votre compte pour commencer.',
      connect: 'Connecter Discord ↗',
      emptyTitle: 'Tout commence ici',
      emptyDesc: 'Votre profil et vos serveurs apparaîtront après la connexion.',
      securityNote: '🔒 Seules les données autorisées par Discord sont affichées. Les modifications nécessitent un backend sécurisé.',
      commandsKicker: 'ENLAZO BOT',
      commandsTitle: '90 façons de <span class="gradient">se connecter.</span>',
      commandsDesc: 'Découvrez les principales catégories de l’édition définitive du bot.',
      chips: ['⚡ Jeux', '🛡️ Modération', '🎭 Roleplay', '📈 Niveaux', '💤 AFK', '🧠 Quiz', '🌎 Langues', '🏆 Défis'],
      ctaTitle: 'Prêt à connecter votre communauté ?',
      ctaDesc: 'Une nouvelle façon de vivre Discord commence avec Enlazo.',
      invite: 'Ajouter Enlazo ↗',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      connected: 'Compte connecté',
      loading: 'Récupération des informations autorisées…',
      loadingDiscord: 'Chargement des données Discord…',
      verified: 'Compte vérifié par Discord',
      adminCount: n => `${n} serveur(s) avec des droits d’administration`,
      administrator: 'Administrateur · Les paramètres nécessitent l’API Enlazo',
      noAdmins: 'Aucun serveur avec des droits d’administration trouvé.',
      noToken: 'Votre session est active, mais le jeton Discord est manquant. Cliquez sur « Reconnecter Discord ». ',
      discordError: 'Discord a refusé la demande. Vous devrez peut-être autoriser à nouveau votre compte.',
      unauthorized: 'Votre accès Discord a expiré ou est invalide. Autorisez à nouveau votre compte.',
      forbidden: 'Discord ne permet pas cette demande. Vérifiez les autorisations accordées.',
      unexpected: 'Réponse inattendue de Discord.',
      loadError: 'Impossible de charger les serveurs. Réessayez.',
      loginError: 'Connexion impossible : ',
      configure: 'Vérifiez l’URL et la clé publique Supabase dans config.js.',
      signedOut: 'Déconnexion effectuée',
      logout: 'Déconnexion',
      reconnect: 'Reconnecter Discord ↗',
      theme: 'Changer de thème',
      footer: '© Enlazo · Connect Through Play'
    },

    zh: {
      name: '🇨🇳 简体中文',
      navFeatures: '功能',
      navDashboard: '控制面板',
      navCommands: '命令',
      login: '使用 Discord 登录 ↗',
      eyebrow: '通过游戏连接 · DISCORD 机器人',
      heroTitle: '你的社区。<br><span class="gradient">无限可能。</span>',
      heroDesc: '游戏、管理工具与互动体验，让大家紧密联系。Enlazo 将这一切融入一个平台。',
      openDashboard: '打开我的控制面板 ↗',
      explore: '探索功能 ↓',
      notice: '不使用虚假统计数据。连接账户后即可查看可用数据。',
      badgePlay: '✦ 一起游戏',
      badgeCommunity: '◈ 一个社区',
      featureKicker: '你需要的一切',
      featureTitle: '让体验更加<span class="gradient">紧密相连。</span>',
      featureDesc: 'Enlazo 将娱乐与社区工具整合在一个机器人中。',
      gameTitle: '一起游戏',
      gameDesc: '挑战、问答、社交游戏和比赛，让你的服务器保持活跃。',
      securityTitle: '保护你的社区',
      securityDesc: '使用管理与安全工具，维护健康的交流环境。',
      customizeTitle: '打造专属体验',
      customizeDesc: '个人资料、等级、AFK 和互动功能，让社区更具个性。',
      dashboardKicker: '你的空间',
      dashboardTitle: '真正的<span class="gradient">控制面板。</span>',
      dashboardDesc: '登录后查看账户可访问的服务器。管理操作需要安全的 API。',
      accountTitle: '你的 Discord 账户',
      accountSubtitle: '连接账户以开始使用。',
      connect: '连接 Discord ↗',
      emptyTitle: '一切从这里开始',
      emptyDesc: '登录后即可查看个人资料和服务器。',
      securityNote: '🔒 仅显示 Discord 授权的数据。修改设置需要安全的后端服务。',
      commandsKicker: 'ENLAZO BOT',
      commandsTitle: '90 种<span class="gradient">连接方式。</span>',
      commandsDesc: '探索机器人最终版本的主要功能分类。',
      chips: ['⚡ 游戏', '🛡️ 管理', '🎭 角色扮演', '📈 等级', '💤 AFK', '🧠 问答', '🌎 语言', '🏆 挑战'],
      ctaTitle: '准备好连接你的社区了吗？',
      ctaDesc: 'Enlazo 为你带来全新的 Discord 社区体验。',
      invite: '添加 Enlazo ↗',
      privacy: '隐私政策',
      terms: '服务条款',
      connected: '账户已连接',
      loading: '正在获取授权信息…',
      loadingDiscord: '正在加载 Discord 数据…',
      verified: '已通过 Discord 验证',
      adminCount: n => `${n} 个服务器具有管理员权限`,
      administrator: '管理员 · 设置功能需要 Enlazo API',
      noAdmins: '未找到具有管理员权限的服务器。',
      noToken: '会话已连接，但缺少查询服务器所需的 Discord 令牌。请点击“重新连接 Discord”。',
      discordError: 'Discord 拒绝了请求。你可能需要重新授权账户。',
      unauthorized: 'Discord 访问已过期或无效。请重新授权账户。',
      forbidden: 'Discord 不允许此请求。请检查已授权的权限。',
      unexpected: 'Discord 返回了意外的数据。',
      loadError: '无法加载服务器。请重试。',
      loginError: '登录失败：',
      configure: '请检查 config.js 中的 Supabase URL 和公开密钥。',
      signedOut: '已退出登录',
      logout: '退出登录',
      reconnect: '重新连接 Discord ↗',
      theme: '切换主题',
      footer: '© Enlazo · Connect Through Play'
    }
  };

  if (!languages[lang]) lang = 'es';

  const t = key => languages[lang][key] ?? languages.es[key] ?? key;

  // ==========================================
  // 3. MENSAJES Y TEMA
  // ==========================================

  function toast(message) {
    const el = $('toast');
    if (!el) {
      console.info('[Enlazo]', message);
      return;
    }

    el.textContent = message;
    el.classList.add('show');

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 5500);
  }

  function theme(mode) {
    document.body.classList.toggle('light', mode === 'light');
    localStorage.setItem('enlazo_theme', mode);

    if ($('theme')) {
      $('theme').textContent = mode === 'light' ? '☾' : '☀';
      $('theme').setAttribute('aria-label', t('theme'));
      $('theme').title = t('theme');
    }
  }

  theme(localStorage.getItem('enlazo_theme') || 'dark');

  if ($('theme')) {
    $('theme').addEventListener('click', () => {
      theme(document.body.classList.contains('light') ? 'dark' : 'light');
    });
  }

  if ($('year')) {
    $('year').textContent = new Date().getFullYear();
  }

  if ($('invite')) {
    $('invite').href =
      `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
        cfg.botClientId || '1558587255726276730'
      )}&permissions=0&scope=bot%20applications.commands`;
  }

  // ==========================================
  // 4. IDIOMA SIN SELECTORES DUPLICADOS
  // ==========================================

  function createLanguageSelector() {
    // Otras páginas ya tienen su propio #languageSelect.
    if ($('language') || $('languageSelect')) return;

    const actions = document.querySelector('.nav-actions');
    if (!actions) return;

    const select = document.createElement('select');
    select.id = 'language';
    select.className = 'language-select';
    select.setAttribute('aria-label', 'Website language');
    select.title = 'Website language';

    Object.entries(languages).forEach(([code, data]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = data.name;
      select.appendChild(option);
    });

    Object.assign(select.style, {
      padding: '9px 10px',
      borderRadius: '10px',
      border: '1px solid rgba(160,120,255,.35)',
      background: 'var(--card, #171321)',
      color: 'inherit',
      font: 'inherit',
      maxWidth: '150px',
      cursor: 'pointer'
    });

    select.value = lang;

    select.addEventListener('change', () => changeLanguage(select.value));
    actions.insertBefore(select, actions.firstChild);
  }

  function changeLanguage(code) {
    lang = languages[code] ? code : 'es';
    localStorage.setItem('enlazo_language', lang);
    applyTranslations();

    if (currentSession) {
      renderCurrentAccount();
    }
  }

  // Conecta también el selector que ya existe en otras páginas.
  if ($('languageSelect')) {
    $('languageSelect').value = lang;
    $('languageSelect').addEventListener('change', event => {
      changeLanguage(event.target.value);
    });
  }

  function put(selector, value) {
    const element = document.querySelector(selector);
    if (element && value !== undefined && value !== null) {
      element.innerHTML = value;
    }
  }

  function applyTranslations() {
    const d = languages[lang];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;

    const translations = {
      'header nav a[href="#features"]': d.navFeatures,
      'header nav a[href="#dashboard"]': d.navDashboard,
      'header nav a[href="#commands"]': d.navCommands,
      '#loginTop': d.login,
      '.hero .eyebrow': d.eyebrow,
      '.hero h1': d.heroTitle,
      '.hero > p': d.heroDesc,
      '#loginHero': d.openDashboard,
      '.hero-actions a': d.explore,
      '.hero-notice': d.notice,
      '.badge-a': d.badgePlay,
      '.badge-b': d.badgeCommunity,
      '#features .section-kicker': d.featureKicker,
      '#features h2': d.featureTitle,
      '#features .sub': d.featureDesc,
      '#features .cards article:nth-child(1) h3': d.gameTitle,
      '#features .cards article:nth-child(1) p': d.gameDesc,
      '#features .cards article:nth-child(2) h3': d.securityTitle,
      '#features .cards article:nth-child(2) p': d.securityDesc,
      '#features .cards article:nth-child(3) h3': d.customizeTitle,
      '#features .cards article:nth-child(3) p': d.customizeDesc,
      '#dashboard .section-kicker': d.dashboardKicker,
      '#dashboard h2': d.dashboardTitle,
      '#dashboard .sub': d.dashboardDesc,
      '#panelTitle': d.accountTitle,
      '#panelSubtitle': d.accountSubtitle,
      '#loginPanel': d.connect,
      '.panel-foot': d.securityNote,
      '#commands .section-kicker': d.commandsKicker,
      '#commands h2': d.commandsTitle,
      '#commands .sub': d.commandsDesc,
      '.cta h3': d.ctaTitle,
      '.cta p': d.ctaDesc,
      '#invite': d.invite,
      '.footer > span': d.footer,
      '.footer > div:last-child a[href="privacy.html"]': d.privacy,
      '.footer > div:last-child a[href="terms.html"]': d.terms
    };

    Object.entries(translations).forEach(([selector, value]) => {
      put(selector, value);
    });

    document.querySelectorAll('#commands .chips span').forEach((chip, index) => {
      if (d.chips[index]) chip.textContent = d.chips[index];
    });

    if ($('language')) $('language').value = lang;
    if ($('languageSelect')) $('languageSelect').value = lang;

    if ($('theme')) {
      $('theme').setAttribute('aria-label', d.theme);
      $('theme').title = d.theme;
    }

    if (!currentSession) setLoggedOut();
  }

  const escapeHTML = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  // ==========================================
  // 5. SESIÓN Y CIERRE DE SESIÓN
  // ==========================================

  function clearDiscordToken() {
    providerToken = null;

    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
  }

  function saveDiscordToken(token) {
    if (!token) return;

    providerToken = token;

    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (_) {}
  }

  function setLoggedOut() {
    currentSession = null;
    loadSequence++;
    clearDiscordToken();

    if ($('panelTitle')) $('panelTitle').textContent = t('accountTitle');
    if ($('panelSubtitle')) $('panelSubtitle').textContent = t('accountSubtitle');

    if ($('loginPanel')) {
      $('loginPanel').textContent = t('connect');
      $('loginPanel').onclick = login;
    }

    if ($('accountArea')) {
      $('accountArea').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◈</div>
          <h3>${escapeHTML(t('emptyTitle'))}</h3>
          <p>${escapeHTML(t('emptyDesc'))}</p>
        </div>`;
    }

    if ($('loginTop')) $('loginTop').onclick = login;
    if ($('loginHero')) $('loginHero').onclick = login;
  }

  async function logout() {
    if (!client) {
      setLoggedOut();
      return;
    }

    const { error } = await client.auth.signOut();

    if (error) {
      toast(error.message || t('loadError'));
      return;
    }

    setLoggedOut();
    toast(t('signedOut'));
  }

  // ==========================================
  // 6. INICIO DE SESIÓN CON DISCORD
  // ==========================================

  async function login() {
    if (!client) {
      toast(t('configure'));
      return;
    }

    try {
      const redirectTo = cfg.redirectUrl || (
        location.origin + location.pathname
      );

      const { error } = await client.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          scopes: 'identify guilds',
          redirectTo,
          queryParams: {
            prompt: 'consent'
          }
        }
      });

      if (error) {
        toast(t('loginError') + error.message);
      }
    } catch (error) {
      toast(t('loginError') + (error.message || 'Unknown error'));
    }
  }

  ['loginTop', 'loginHero', 'loginPanel'].forEach(id => {
    if ($(id)) $(id).onclick = login;
  });

  // ==========================================
  // 7. PERFIL DE SUPABASE
  // ==========================================

  async function saveProfile(session, discordUser) {
    if (!client || !session?.user?.id || !discordUser) return;

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${encodeURIComponent(discordUser.id)}/${encodeURIComponent(discordUser.avatar)}.png?size=128`
      : null;

    const profile = {
      id: session.user.id,
      username: discordUser.global_name || discordUser.username || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };

    // Las políticas RLS deben permitir que cada usuario modifique
    // únicamente la fila cuyo id coincide con auth.uid().
    const { error } = await client
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (error) {
      // El perfil no debe impedir que se muestren los servidores.
      console.warn('[Enlazo] No se pudo guardar el perfil:', error.message);
    }
  }

  // ==========================================
  // 8. CARGAR PERFIL Y SERVIDORES DE DISCORD
  // ==========================================

  function showAccountMessage(message, reconnect = false) {
    if ($('accountArea')) {
      $('accountArea').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◈</div>
          <p class="muted">${escapeHTML(message)}</p>
          ${reconnect ? `
            <button type="button" id="reconnectDiscord" class="btn">
              ${escapeHTML(t('reconnect'))}
            </button>` : ''}
        </div>`;
    }

    if (reconnect && $('reconnectDiscord')) {
      $('reconnectDiscord').onclick = async () => {
        clearDiscordToken();
        await login();
      };
    }
  }

  async function discordRequest(endpoint, token) {
    return fetch(`https://discord.com/api/v10${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async function load(session) {
    if (!session) {
      setLoggedOut();
      return;
    }

    currentSession = session;
    const sequence = ++loadSequence;

    // El token entregado tras OAuth tiene prioridad.
    if (session.provider_token) {
      saveDiscordToken(session.provider_token);
    }

    if ($('loginPanel')) {
      $('loginPanel').textContent = t('logout');
      $('loginPanel').onclick = logout;
    }

    if ($('loginTop')) {
      $('loginTop').textContent = t('logout');
      $('loginTop').onclick = logout;
    }

    if ($('panelTitle')) $('panelTitle').textContent = t('connected');
    if ($('panelSubtitle')) $('panelSubtitle').textContent = t('loading');

    if ($('accountArea')) {
      $('accountArea').innerHTML =
        `<p class="muted">${escapeHTML(t('loadingDiscord'))}</p>`;
    }

    if (!providerToken) {
      if ($('panelSubtitle')) $('panelSubtitle').textContent = t('connected');
      showAccountMessage(t('noToken'), true);
      return;
    }

    try {
      const [userResponse, guildResponse] = await Promise.all([
        discordRequest('/users/@me', providerToken),
        discordRequest('/users/@me/guilds', providerToken)
      ]);

      // Ignorar respuestas antiguas si el usuario cambió de sesión.
      if (sequence !== loadSequence) return;

      if (userResponse.status === 401 || guildResponse.status === 401) {
        clearDiscordToken();
        if ($('panelSubtitle')) $('panelSubtitle').textContent = t('connected');
        showAccountMessage(t('unauthorized'), true);
        return;
      }

      if (userResponse.status === 403 || guildResponse.status === 403) {
        if ($('panelSubtitle')) $('panelSubtitle').textContent = t('connected');
        showAccountMessage(t('forbidden'), true);
        return;
      }

      if (!userResponse.ok || !guildResponse.ok) {
        throw new Error(
          `Discord API: perfil ${userResponse.status}, servidores ${guildResponse.status}`
        );
      }

      const user = await userResponse.json();
      const guilds = await guildResponse.json();

      if (sequence !== loadSequence) return;

      if (!Array.isArray(guilds) || !user.id || !user.username) {
        throw new Error(t('unexpected'));
      }

      await saveProfile(session, user);

      const admins = guilds.filter(server => {
        if (server.owner) return true;

        try {
          return (BigInt(server.permissions || '0') & 8n) === 8n;
        } catch (_) {
          return false;
        }
      });

      if ($('panelTitle')) {
        $('panelTitle').textContent = user.global_name || user.username;
      }

      if ($('panelSubtitle')) {
        $('panelSubtitle').textContent = t('adminCount')(admins.length);
      }

      const avatar = user.avatar
        ? `https://cdn.discordapp.com/avatars/${encodeURIComponent(user.id)}/${encodeURIComponent(user.avatar)}.png?size=128`
        : '';

      const profileHTML = `
        <div class="profile">
          ${
            avatar
              ? `<img class="avatar" src="${avatar}" alt="Avatar" referrerpolicy="no-referrer">`
              : '<span class="guild-icon">◈</span>'
          }
          <div>
            <strong>${escapeHTML(user.global_name || user.username)}</strong>
            <div class="muted">
              @${escapeHTML(user.username)} · ${escapeHTML(t('verified'))}
            </div>
          </div>
        </div>`;

      const guildHTML = admins.length
        ? `<div class="guilds">
            ${admins.map(server => {
              const icon = server.icon
                ? `<img class="guild-icon"
                    src="https://cdn.discordapp.com/icons/${encodeURIComponent(server.id)}/${encodeURIComponent(server.icon)}.png?size=128"
                    alt=""
                    referrerpolicy="no-referrer">`
                : '<span class="guild-icon">◈</span>';

              return `
                <div class="guild">
                  ${icon}
                  <div>
                    <div class="guild-name">${escapeHTML(server.name)}</div>
                    <div class="guild-note">${escapeHTML(t('administrator'))}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>`
        : `<p class="muted">${escapeHTML(t('noAdmins'))}</p>`;

      if ($('accountArea')) {
        $('accountArea').innerHTML = profileHTML + guildHTML;
      }

    } catch (error) {
      if (sequence !== loadSequence) return;

      console.error('[Enlazo] Error al cargar Discord:', error);

      if ($('panelSubtitle')) $('panelSubtitle').textContent = t('connected');

      showAccountMessage(t('loadError'), true);
      toast(t('loadError'));
    }
  }

  function renderCurrentAccount() {
    if (currentSession) {
      load(currentSession);
    } else {
      setLoggedOut();
    }
  }

  // ==========================================
  // 9. INICIALIZACIÓN
  // ==========================================

  createLanguageSelector();
  applyTranslations();

  if (!client) {
    console.error(
      '[Enlazo] Supabase no está configurado. Comprueba config.js y el orden de los scripts.'
    );
  } else {
    // Supabase puede avisar de INITIAL_SESSION al cargar la página.
    // Evitamos hacer una segunda carga innecesaria con getSession().
    let receivedInitialSession = false;

    client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        receivedInitialSession = true;
        load(session);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.provider_token) {
          saveDiscordToken(session.provider_token);
        }

        load(session);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setLoggedOut();
      }
    });

    // Respaldo por si la sesión ya existe y aún no se ha recibido
    // el evento inicial.
    client.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.warn('[Enlazo] No se pudo recuperar la sesión:', error.message);
          return;
        }

        if (!receivedInitialSession && data?.session) {
          load(data.session);
        }
      })
      .catch(error => {
        console.warn('[Enlazo] Error al comprobar la sesión:', error);
      });
  }
})();
