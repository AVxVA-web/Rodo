if (typeof window.lucide === 'undefined') {
    window.lucide = { createIcons: function(options) { console.warn('Lucide icons not loaded. Check connection or CDN.'); } };
}

const CURRENT_STATE_VERSION = 3;

const CATEGORIES = {
    study: { label: 'مذاكرة', color: 'bg-purple-400', colorCode: '#c084fc', bgCheck: 'bg-purple-500', textCheck: 'text-purple-400' },
    solve: { label: 'حل وتدريب', color: 'bg-blue-400', colorCode: '#60a5fa', bgCheck: 'bg-blue-500', textCheck: 'text-blue-400' },
    review: { label: 'مراجعة', color: 'bg-orange-400', colorCode: '#fb923c', bgCheck: 'bg-orange-500', textCheck: 'text-orange-400' },
    life: { label: 'شخصي', color: 'bg-emerald-400', colorCode: '#34d399', bgCheck: 'bg-emerald-500', textCheck: 'text-emerald-400' }
};

function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getLocalDateStr(dateObj = new Date()) {
    const offset = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
}

function getNextPaymentDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return '';
    
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let day = parseInt(parts[2], 10);
    
    month += 1;
    if (month > 12) {
        month = 1;
        year += 1;
    }
    
    const maxDaysInNewMonth = new Date(year, month, 0).getDate();
    const safeDay = Math.min(day, maxDaysInNewMonth);
    
    return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

const STORE_CATALOG = [
    { id: 'boost_xp_1', title: 'مضاعف الخبرة (ساعة)', desc: 'يضاعف نقاط الخبرة المكتسبة 1.5x لمدة ساعة.', cost: 150, category: 'boosts', icon: 'zap', rarity: 'rare', type: 'boost', boostType: 'xp', multiplier: 1.5, duration: 60 * 60 * 1000 },
    { id: 'boost_coin_1', title: 'مضاعف الذهب (ساعة)', desc: 'يضاعف العملات المكتسبة 1.5x لمدة ساعة.', cost: 150, category: 'boosts', icon: 'coins', rarity: 'rare', type: 'boost', boostType: 'coin', multiplier: 1.5, duration: 60 * 60 * 1000 },
    { id: 'boost_xp_2', title: 'إكسير الخبرة الأسطوري', desc: 'يضاعف نقاط الخبرة 2x لمدة 3 ساعات.', cost: 400, category: 'boosts', icon: 'flask-conical', rarity: 'epic', type: 'boost', boostType: 'xp', multiplier: 2, duration: 3 * 60 * 60 * 1000 },
    { id: 'theme_crimson', title: 'طاقة القرمزي', desc: 'مظهر أحمر ناري يعكس الحماس والطاقة.', cost: 500, category: 'themes', icon: 'palette', rarity: 'epic', type: 'theme' },
    { id: 'theme_emerald', title: 'هالة الزمرد', desc: 'مظهر أخضر هادئ يساعد على التركيز.', cost: 500, category: 'themes', icon: 'palette', rarity: 'epic', type: 'theme' },
    { id: 'theme_cyber', title: 'سايبر نيون', desc: 'مظهر مستقبلي عالي التباين.', cost: 800, category: 'themes', icon: 'palette', rarity: 'legendary', type: 'theme' },
    { id: 'theme_gold', title: 'بريق الذهب', desc: 'مظهر ذهبي ملكي للأساطير فقط.', cost: 1000, category: 'themes', icon: 'palette', rarity: 'legendary', type: 'theme' },
    { id: 'effect_task_1', title: 'نبضة الإنجاز', desc: 'تأثير بصري عند إكمال المهام.', cost: 300, category: 'effects', icon: 'sparkles', rarity: 'rare', type: 'effect', effectEvent: 'task-complete' },
    { id: 'effect_focus_1', title: 'توهج التركيز', desc: 'توهج ذهبي عند إنهاء جلسة تركيز.', cost: 500, category: 'effects', icon: 'flame', rarity: 'epic', type: 'effect', effectEvent: 'focus-complete' },
    { id: 'effect_achieve_1', title: 'احتفال الأساطير', desc: 'تأثير خاص عند فتح إنجاز جديد.', cost: 600, category: 'effects', icon: 'party-popper', rarity: 'legendary', type: 'effect', effectEvent: 'achievement-unlock' },
    { id: 'effect_streak_1', title: 'شعلة الاستمرارية', desc: 'تأثير ناري عند زيادة أيام الاستمرارية.', cost: 400, category: 'effects', icon: 'flame', rarity: 'epic', type: 'effect', effectEvent: 'streak' },
    { id: 'title_1', title: 'لقب: المثابر', desc: 'لقب يظهر بجانب اسمك.', cost: 300, category: 'titles', icon: 'award', rarity: 'rare', type: 'title', label: 'المثابر' },
    { id: 'title_2', title: 'لقب: سيد التركيز', desc: 'لقب يظهر بجانب اسمك.', cost: 600, category: 'titles', icon: 'award', rarity: 'epic', type: 'title', label: 'سيد التركيز' },
    { id: 'title_3', title: 'لقب: الأسطورة', desc: 'اللقب الأعظم على الإطلاق.', cost: 1500, category: 'titles', icon: 'crown', rarity: 'legendary', type: 'title', label: 'الأسطورة' },
    { id: 'avatar_premium_1', title: 'أفاتار: فارس الظلام', desc: 'شخصية حصرية لا تفتح إلا بالذهب.', cost: 1200, category: 'avatars', icon: 'user-circle', rarity: 'legendary', type: 'avatar', avatarId: 9 },
    { id: 'mystery_small', title: 'صندوق الغموض الصغير', desc: 'قد يحتوي على ذهب، خبرة، أو معززات.', cost: 200, category: 'mystery', icon: 'box', rarity: 'rare', type: 'mystery', pool: 'small' },
    { id: 'mystery_epic', title: 'صندوق الأساطير', desc: 'مكافآت ضخمة وفرصة لربح ألقاب حصرية.', cost: 800, category: 'mystery', icon: 'gift', rarity: 'legendary', type: 'mystery', pool: 'epic' },
    { id: 'power_xp_1', title: 'جرعة الحكمة', desc: 'تمنحك 200 XP فوراً.', cost: 250, category: 'powerups', icon: 'flask-round', rarity: 'common', type: 'instant', grantXp: 200 },
    { id: 'power_focus_1', title: 'لفيفة الزمن', desc: 'تضيف 60 دقيقة لسجل تركيزك.', cost: 400, category: 'powerups', icon: 'scroll', rarity: 'rare', type: 'instant', grantFocus: 60 },
    { id: 'power_streak_1', title: 'درع الاستمرارية', desc: 'يحميك من فقدان السلسلة (يضيف 3 أيام).', cost: 600, category: 'powerups', icon: 'shield', rarity: 'epic', type: 'instant', grantStreak: 3 },
    { id: 'theme_void', title: 'فراغ الأبعاد', desc: 'مظهر أسطوري غامض يبتلع التشتت.', cost: 15000, category: 'themes', icon: 'moon', rarity: 'legendary', type: 'theme' },
    { id: 'theme_mythic_fire', title: 'نار التنين', desc: 'مظهر خرافي لا يمتلكه إلا النخبة.', cost: 25000, category: 'themes', icon: 'flame', rarity: 'mythic', type: 'theme' },
    { id: 'title_4', title: 'لقب: قاهر المستحيل', desc: 'لقب خرافي يثبت تفوقك المطلق.', cost: 20000, category: 'titles', icon: 'swords', rarity: 'mythic', type: 'title', label: 'قاهر المستحيل' },
    { id: 'avatar_premium_2', title: 'أفاتار: باحثة السايبر', desc: 'شخصية نادرة بتصميم مستقبلي.', cost: 3000, category: 'avatars', icon: 'user', rarity: 'epic', type: 'avatar', avatarId: 10 },
    { id: 'avatar_premium_3', title: 'أفاتار: حكيم الأكاديمية', desc: 'شخصية أسطورية تعكس الحكمة والوقار.', cost: 10000, category: 'avatars', icon: 'user', rarity: 'legendary', type: 'avatar', avatarId: 11 },
    { id: 'avatar_premium_4', title: 'أفاتار: إمبراطورة المجد', desc: 'شخصية خرافية لا تليق إلا بالأساطير.', cost: 25000, category: 'avatars', icon: 'crown', rarity: 'mythic', type: 'avatar', avatarId: 12 },
    { id: 'boost_xp_3', title: 'جوهر المعرفة الخالص', desc: 'يضاعف نقاط الخبرة 3x لمدة 12 ساعة.', cost: 8000, category: 'boosts', icon: 'zap', rarity: 'legendary', type: 'boost', boostType: 'xp', multiplier: 3, duration: 12 * 60 * 60 * 1000 },
    { id: 'chest_scholar', title: 'Scholar Cache', desc: 'صندوق حظ يحتوي على عناصر بنسب متوازنة (70% شائِع / 25% نادر / 5% ملحمي).', cost: 400, category: 'rewards', icon: 'box', rarity: 'rare', type: 'chest', chestType: 'scholar' },
    { id: 'chest_elite', title: 'Elite Crate', desc: 'صندوق النخبة مع نظام شفقة تصاعدي (65% نادر / 30% ملحمي / 5% أسطوري).', cost: 1200, category: 'rewards', icon: 'gift', rarity: 'epic', type: 'chest', chestType: 'elite' },
    { id: 'chest_mythic', title: 'Mythic Vault', desc: 'صندوق الأساطير الخرافي مع ضمانات الشفقة (70% ملحمي / 25% أسطوري / 5% خرافي).', cost: 4000, category: 'rewards', icon: 'crown', rarity: 'legendary', type: 'chest', chestType: 'mythic' },
    { id: 'boost_focus_deep', title: 'إكسير التركيز العميق', desc: 'يضاعف دقائق التركيز 2x لمدة ساعتين (مؤقت التركيز فقط).', cost: 60, category: 'boosts', icon: 'flame', rarity: 'rare', type: 'boost', boostType: 'focus', multiplier: 2, duration: 2 * 60 * 60 * 1000 },
    { id: 'title_common_1', title: 'لقب: مبتدئ', desc: 'لقب بسيط يعبر عن بداية طريقك.', cost: 100, category: 'titles', icon: 'award', rarity: 'common', type: 'title', label: 'مبتدئ' },
    { id: 'title_common_2', title: 'لقب: مجتهد', desc: 'لقب يثبت جديتك وعزمك.', cost: 200, category: 'titles', icon: 'award', rarity: 'common', type: 'title', label: 'مجتهد' },
    { id: 'theme_common_1', title: 'رمادي هادئ', desc: 'مظهر هادئ مريح للعين أثناء المذاكرة.', cost: 200, category: 'themes', icon: 'palette', rarity: 'common', type: 'theme' }
];

const STAGES = [
    { id: 1, name: "التأسيس والانطلاق", weeks: [1, 13], color: "from-blue-500 to-cyan-500", icon: "flag" },
    { id: 2, name: "التعمق والربط", weeks: [14, 26], color: "from-purple-500 to-indigo-500", icon: "book-open" },
    { id: 3, name: "تحدي المنتصف", weeks: [27, 39], color: "from-orange-500 to-red-500", icon: "flame" },
    { id: 4, name: "ليالي الحسم", weeks: [40, 52], color: "from-yellow-400 to-yellow-600", icon: "trophy" }
];

const QUOTES = [
    "الألم المؤقت للمذاكرة أفضل من ألم الندم الدائم.",
    "لا تتوقف عندما تتعب، بل توقف عندما تنتهي.",
    "كل صفحة تقرأها تبني طوبة في قصر مستقبلك.",
    "النجاح ليس صدفة، بل هو استمرارية وعمل شاق."
];

const ACHIEVEMENTS_TEMPLATES = [
    { id: 'first_task', title: 'البداية الواعدة', desc: 'أنجزت أول مهمة لك بنجاح!', xp: 100, icon: 'sparkles', rank: 'برونزي' },
    { id: 'focus_50', title: 'سيد التركيز الخالص', desc: 'حققت 50 دقيقة من التركيز العميق.', xp: 200, icon: 'brain', rank: 'فضي' },
    { id: 'streak_3', title: 'الشعلة المستمرة', desc: 'حافظت على سلسلة أيام متتالية لمدة 3 أيام.', xp: 150, icon: 'flame', rank: 'برونزي' },
    { id: 'schedule_pro', title: 'المهندس المنظم', desc: 'أضفت 3 خطط أو دروس لجدولك الأسبوعي.', xp: 100, icon: 'calendar', rank: 'برونزي' },
    { id: 'gold_master', title: 'مستثمر الأسطورة', desc: 'جمعت 1000 عملة ذهبية في مسيرتك.', xp: 250, icon: 'coins', rank: 'ذهبي' }
];

const AVATARS_DATA = [
    { id: 1, reqLvl: 1, type: 'common', gender: 'male', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#3b82f6"/><circle cx="50" cy="65" r="28" fill="#fed7aa"/><path d="M22 65 Q50 20 78 65 Z" fill="#1f2937"/><rect x="25" y="50" width="50" height="18" rx="4" fill="#111827" opacity="0.9"/><rect x="25" y="50" width="50" height="4" fill="#374151"/></svg>` },
    { id: 2, reqLvl: 1, type: 'common', gender: 'female', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#ec4899"/><path d="M20 90 C20 40 80 40 80 90 Z" fill="#4b5563"/><circle cx="50" cy="65" r="26" fill="#ffedd5"/><circle cx="37" cy="58" r="12" fill="#111827"/><circle cx="63" cy="58" r="12" fill="#111827"/><path d="M49 58 L51 58" stroke="#111827" stroke-width="4"/></svg>` },
    { id: 3, reqLvl: 1, type: 'common', gender: 'male', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#f59e0b"/><circle cx="50" cy="65" r="28" fill="#fcd34d"/><path d="M20 50 Q50 30 80 50 C80 20 20 20 50 Z" fill="#78350f"/><path d="M22 55 L78 55 L72 70 L28 70 Z" fill="#000" opacity="0.8"/></svg>` },
    { id: 4, reqLvl: 1, type: 'common', gender: 'female', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#10b981"/><circle cx="50" cy="65" r="26" fill="#fecaca"/><path d="M30 30 C 10 10, 50 10, 50 30 C 50 10, 90 10, 70 30 C 90 70, 70 90, 50 60 C 30 90, 10 70, 30 30 Z" fill="#9d174d"/><rect x="28" y="52" width="20" height="14" fill="#111827"/><rect x="52" y="52" width="20" height="14" fill="#111827"/><path d="M48 56 L52 56" stroke="#111827" stroke-width="3"/></svg>` },
    { id: 5, reqLvl: 5, type: 'rare', gender: 'male', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#0f172a"/><circle cx="50" cy="65" r="28" fill="#e2e8f0"/><path d="M15 50 L30 10 L40 30 L50 5 L60 30 L70 10 L85 50 Z" fill="#38bdf8"/><rect x="20" y="52" width="60" height="12" rx="6" fill="#000"/><rect x="24" y="55" width="52" height="6" rx="3" fill="#06b6d4"/><circle cx="85" cy="58" r="3" fill="#38bdf8"/></svg>` },
    { id: 6, reqLvl: 5, type: 'rare', gender: 'female', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#4c1d95"/><circle cx="50" cy="65" r="26" fill="#f3e8ff"/><circle cx="25" cy="35" r="15" fill="#d946ef"/><circle cx="75" cy="35" r="15" fill="#d946ef"/><path d="M35 30 Q50 20 65 30 Z" fill="#d946ef"/><path d="M25 65 L45 50 L50 55 L55 50 L75 65 L60 70 L40 70 Z" fill="#000"/><path d="M30 63 L43 54 M70 63 L57 54" stroke="#f0abfc" stroke-width="3"/></svg>` },
    { id: 7, reqLvl: 10, type: 'epic', gender: 'male', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#7f1d1d"/><circle cx="50" cy="65" r="28" fill="#ffedd5"/><path d="M20 60 C 20 0, 50 20, 50 10 C 50 20, 80 0, 80 60 Z" fill="#f97316"/><path d="M30 60 C 30 20, 50 30, 50 25 C 50 30, 70 20, 70 60 Z" fill="#fef08a"/><path d="M22 55 L78 55 L65 70 L35 70 Z" fill="#000"/><path d="M25 57 L75 57" stroke="#ef4444" stroke-width="2"/></svg>` },
    { id: 8, reqLvl: 10, type: 'epic', gender: 'female', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#064e3b"/><circle cx="50" cy="65" r="26" fill="#ecfdf5"/><path d="M20 90 C15 30 85 30 80 90 Z" fill="#10b981"/><path d="M30 40 L40 25 L50 35 L60 25 L70 40 Z" fill="#fbbf24"/><circle cx="36" cy="58" r="14" fill="#000"/><circle cx="64" cy="58" r="14" fill="#000"/><path d="M36 58 L36 58 M64 58 L64 58" stroke="#34d399" stroke-width="8" stroke-linecap="round"/><path d="M48 58 L52 58" stroke="#000" stroke-width="3"/></svg>` },
    { id: 9, reqLvl: 999, reqItem: 'avatar_premium_1', type: 'legendary', gender: 'male', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#1e1b4b"/><circle cx="50" cy="65" r="28" fill="#c4b5fd"/><path d="M20 90 C20 40 80 40 80 90 Z" fill="#0f172a"/><path d="M35 30 L50 10 L65 30 Z" fill="#8b5cf6"/><circle cx="35" cy="55" r="8" fill="#fde047"/><circle cx="65" cy="55" r="8" fill="#fde047"/></svg>` },
    { id: 10, reqLvl: 999, reqItem: 'avatar_premium_2', type: 'epic', gender: 'female', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#0891b2"/><circle cx="50" cy="60" r="25" fill="#fbcfe8"/><path d="M25 90 Q50 40 75 90 Z" fill="#164e63"/><path d="M30 40 Q50 20 70 40 Z" fill="#c026d3"/><circle cx="40" cy="55" r="4" fill="#000"/><circle cx="60" cy="55" r="4" fill="#000"/></svg>` },
    { id: 11, reqLvl: 999, reqItem: 'avatar_premium_3', type: 'legendary', gender: 'male', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#b45309"/><circle cx="50" cy="55" r="25" fill="#ffedd5"/><path d="M20 100 Q50 30 80 100 Z" fill="#78350f"/><rect x="35" y="20" width="30" height="15" fill="#1e3a8a"/><rect x="30" y="35" width="40" height="5" fill="#1e3a8a"/><circle cx="40" cy="50" r="3" fill="#000"/><circle cx="60" cy="50" r="3" fill="#000"/><path d="M40 70 Q50 85 60 70 Z" fill="#d97706"/></svg>` },
    { id: 12, reqLvl: 999, reqItem: 'avatar_premium_4', type: 'mythic', gender: 'female', svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#e11d48"/><circle cx="50" cy="60" r="24" fill="#ffe4e6"/><path d="M15 100 Q50 40 85 100 Z" fill="#4c0519"/><path d="M20 50 Q50 0 80 50 Z" fill="#fbbf24"/><circle cx="50" cy="20" r="8" fill="#ef4444"/><circle cx="38" cy="55" r="4" fill="#000"/><circle cx="62" cy="55" r="4" fill="#000"/></svg>` }
];

const DEFAULT_HABITS = [
    { id: 1, title: 'الصلاة في وقتها', completed: false, icon: 'shrine' },
    { id: 2, title: 'شرب 2 لتر ماء', completed: false, icon: 'droplet' },
    { id: 3, title: 'ورد الذكر وقراءة القرآن', completed: false, icon: 'book-open' },
    { id: 4, title: 'تمرين سريع / تمدد', completed: false, icon: 'activity' }
];

const RANDOM_EVENTS_DATA = [
    { id: 'weekend_boost', title: 'نسيم الخميس', desc: 'نهاية أسبوع سعيدة! استمتع بدفعة من الطاقة والذهب مكافأة لعملك.', xp: 150, coins: 150, icon: 'wind', theme: 'blue' },
    { id: 'merchant', title: 'التاجر المتجول', desc: 'بينما كنت تراجع دروسك، وجدت كيساً من الذهب ضائعاً!', xp: 0, coins: 300, icon: 'gem', theme: 'yellow' },
    { id: 'wise_man', title: 'حكمة عابر', desc: 'استمعت لنصيحة حكيم زادت من بصيرتك وخبرتك بشكل كبير.', xp: 200, coins: 0, icon: 'book-open', theme: 'purple' },
    { id: 'lucky_star', title: 'نجمة الحظ', desc: 'اليوم هو يوم سعدك، كل شيء يسير لصالحك في رحلتك!', xp: 100, coins: 100, icon: 'star', theme: 'emerald' }
];

const INITIAL_STATE = {
    version: CURRENT_STATE_VERSION,
    userName: 'اسمك هنا',
    avatarId: 1,
    lastActionDate: null,
    lastLoginDate: null,
    lastEventDate: null,
    tasks: [],
    inventory: [],
    goals: [],
    mainGoal: '',
    xp: 0,
    coins: 0,
    currentWeek: 1,
    streak: 0,
    bestStreak: 0,
    totalFocusMinutes: 0,
    rewards: [],
    rewardLedger: [],
    stats: { study: 0, solve: 0, review: 0, life: 0 },
    lessons: [],
    studyPlan: [],
    unlockedAchievements: [],
    habits: [...DEFAULT_HABITS],
    productivity: { 'السبت': 0, 'الأحد': 0, 'الإثنين': 0, 'الثلاثاء': 0, 'الأربعاء': 0, 'الخميس': 0, 'الجمعة': 0 },
    todayStats: { tasks: 0, xp: 0, focus: 0 },
    yesterdayStats: null,
    pendingRecap: false,
    weeklyStats: { tasks: 0, xp: 0, focus: 0 },
    weeklyReports: [],
    examSubjects: [],
    weaknesses: [],
    errorBank: {
        errors: [],
        lastSmartReviewDate: null
    },
    studySubjects: [],
    activeSession: { isRunning: false, startTime: null, elapsedMs: 0, pendingSave: false },
    streakNeedsRestart: false,
    heatmapData: {},
    store: {
        ownedItems: [],
        consumables: [],
        activeBoosts: [],
        activeTheme: null,
        activeTitle: null,
        activeEffects: [],
        shards: { rare: 0, epic: 0, legendary: 0, mythic: 0 },
        tickets: { scholar: 0, elite: 0, mythic: 0 },
        wheelTokens: 0,
        pity: {
            scholar: { count: 0, softPity: 0 },
            elite: { count: 0, softPity: 0 },
            mythic: { count: 0, softPity: 0 }
        }
    }
};



let rewardOperationCounter = 0;
let entityOperationCounter = 0;

function createEntityId() {
    const now = Date.now();
    entityOperationCounter = (entityOperationCounter + 1) % 1000;
    return (now * 1000) + entityOperationCounter;
}

function clearStopwatchInterval() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}

function resetActiveSession() {
    clearStopwatchInterval();
    state.activeSession = { isRunning: false, startTime: null, elapsedMs: 0, pendingSave: false };
}

function refreshCoreViews() {
    applyTheme();
    updateGlobalUI();
    renderTasks();
    renderGoals();
    renderStore();
    renderStats();
    renderJourney();
    renderProfile();
    renderSchedule();
    renderHabits();
    renderWeeklyHistory();
    renderHeatmap();
    renderErrorBank();
    updateStopwatchUI(true);
    renderStudyTimeTable();
    renderRecentSessions();
}

function ensureRewardLedger() {
    if (!Array.isArray(state.rewardLedger)) state.rewardLedger = [];
    state.rewardLedger = state.rewardLedger.filter(entry => entry && typeof entry.id === 'string');
    if (state.rewardLedger.length > 500) state.rewardLedger = state.rewardLedger.slice(-500);
}

function createRewardId(scope, id) {
    rewardOperationCounter = (rewardOperationCounter + 1) % 1000000;
    return `${scope}:${String(id)}:${Date.now()}:${rewardOperationCounter}`;
}

const RewardService = {
    grant({ id, xp = 0, coins = 0, meta = {} } = {}) {
        ensureRewardLedger();
        if (!id || typeof id !== 'string') return false;
        if (state.rewardLedger.some(entry => entry.id === id)) return false;

        const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
        const safeCoins = Number.isFinite(coins) ? Math.max(0, Math.floor(coins)) : 0;
        if (safeXp === 0 && safeCoins === 0) return false;

        state.xp = Math.max(0, state.xp) + safeXp;
        state.coins = Math.max(0, state.coins) + safeCoins;
        state.rewardLedger.push({
            id,
            xp: safeXp,
            coins: safeCoins,
            status: 'granted',
            createdAt: Date.now(),
            meta: meta && typeof meta === 'object' ? meta : {}
        });
        if (state.rewardLedger.length > 500) state.rewardLedger.splice(0, state.rewardLedger.length - 500);
        return true;
    },

    revoke(id, fallbackXp = 0, fallbackCoins = 0) {
        ensureRewardLedger();
        if (id && typeof id === 'string') {
            const entry = [...state.rewardLedger].reverse().find(item => item.id === id);
            if (entry) {
                if (entry.status === 'revoked') return false;
                state.xp = Math.max(0, state.xp - Math.max(0, entry.xp || 0));
                state.coins = Math.max(0, state.coins - Math.max(0, entry.coins || 0));
                entry.status = 'revoked';
                entry.revokedAt = Date.now();
                return true;
            }
        }

        const safeXp = Number.isFinite(fallbackXp) ? Math.max(0, Math.floor(fallbackXp)) : 0;
        const safeCoins = Number.isFinite(fallbackCoins) ? Math.max(0, Math.floor(fallbackCoins)) : 0;
        if (safeXp === 0 && safeCoins === 0) return false;
        state.xp = Math.max(0, state.xp - safeXp);
        state.coins = Math.max(0, state.coins - safeCoins);
        return true;
    }
};

function normalizeRewardId(existingId, scope, entityId) {
    return (typeof existingId === 'string' && existingId.trim()) ? existingId : createRewardId(scope, entityId);
}

function commitRewardOrRestore(snapshot, rewardArgs) {
    const granted = RewardService.grant(rewardArgs);
    if (granted) return true;
    if (snapshot) {
        state = JSON.parse(snapshot);
    }
    return false;
}

let state = JSON.parse(JSON.stringify(INITIAL_STATE));
let stateSnapshot = null;
let pendingRandomEvent = null;
let stopwatchInterval = null;
let currentStoreCategory = 'storefront';
let currentCatalogSubtab = 'all';
let storeBoostInterval = null;
let storeTransactionLocked = false;

function setCatalogSubtab(subtab) {
    currentCatalogSubtab = subtab;
    const btns = document.querySelectorAll('.catalog-subtab-btn');
    btns.forEach(b => {
        b.classList.remove('active', 'bg-blue-500/20', 'text-blue-400', 'border-blue-500/30');
        b.classList.add('bg-white/5', 'text-white/50', 'border-white/5');
        if (b.dataset.subtab === subtab) {
            b.classList.remove('bg-white/5', 'text-white/50', 'border-white/5');
            b.classList.add('active', 'bg-blue-500/20', 'text-blue-400', 'border-blue-500/30');
        }
    });
    renderStoreGrid();
}

function redeemShard(type) {
    const values = { rare: 50, epic: 100, legendary: 250, mythic: 500 };
    const coinVal = values[type] || 50;

    executeStoreTransaction(() => {
        if (!state.store.shards || (state.store.shards[type] || 0) <= 0) {
            showToast('لا توجد شظايا كافية من هذا النوع للاستبدال.', 'info');
            return false;
        }
        state.store.shards[type]--;
        RewardService.grant({ id: createRewardId('shard-redeem', type), xp: 0, coins: coinVal, meta: { source: 'shard-redeem', shardType: type } });
        playSound('reward');
        showToast(`تم استبدال شظية بـ ${coinVal} عملة ذهبية بنجاح! 🪙`, 'success', true);
        renderStore();
        return true;
    });
}

let currentErrorFilterSubject = 'all';
let currentErrorFilterStatus = 'all';
let currentErrorSearch = '';
let errorRenderLimit = 20;
let currentActiveErrorId = null;

function runMigrations(loadedState) {
    let s = loadedState;
    if (typeof s.version !== 'number' || !Number.isFinite(s.version)) s.version = 0;
    if (!s.store || typeof s.store !== 'object' || Array.isArray(s.store)) s.store = {};
    if (!Array.isArray(s.store.ownedItems)) s.store.ownedItems = [];
    if (!Array.isArray(s.store.consumables)) s.store.consumables = [];
    if (!Array.isArray(s.store.activeBoosts)) s.store.activeBoosts = [];
    if (!Array.isArray(s.store.activeEffects)) s.store.activeEffects = [];
    if (!s.store.shards || typeof s.store.shards !== 'object' || Array.isArray(s.store.shards)) s.store.shards = { rare: 0, epic: 0, legendary: 0, mythic: 0 };
    if (!s.store.tickets || typeof s.store.tickets !== 'object' || Array.isArray(s.store.tickets)) s.store.tickets = { scholar: 0, elite: 0, mythic: 0 };
    if (typeof s.store.wheelTokens !== 'number' || !Number.isFinite(s.store.wheelTokens)) s.store.wheelTokens = 0;
    if (!s.store.pity || typeof s.store.pity !== 'object') s.store.pity = {};
    ['scholar', 'elite', 'mythic'].forEach(key => {
        if (!s.store.pity[key] || typeof s.store.pity[key] !== 'object') s.store.pity[key] = { count: 0, softPity: 0 };
        if (typeof s.store.pity[key].count !== 'number' || !Number.isFinite(s.store.pity[key].count) || s.store.pity[key].count < 0) s.store.pity[key].count = 0;
        if (typeof s.store.pity[key].softPity !== 'number' || !Number.isFinite(s.store.pity[key].softPity) || s.store.pity[key].softPity < 0) s.store.pity[key].softPity = 0;
    });
    if (!s.activeSession || typeof s.activeSession !== 'object') s.activeSession = { isRunning: false, startTime: null, elapsedMs: 0, pendingSave: false };
    if (typeof s.activeSession.isRunning !== 'boolean') s.activeSession.isRunning = false;
    if (typeof s.activeSession.elapsedMs !== 'number' || !Number.isFinite(s.activeSession.elapsedMs) || s.activeSession.elapsedMs < 0) s.activeSession.elapsedMs = 0;
    if (typeof s.activeSession.pendingSave !== 'boolean') s.activeSession.pendingSave = false;
    if (typeof s.streakNeedsRestart !== 'boolean') s.streakNeedsRestart = false;

    if (s.version < 2) {
        if (Array.isArray(s.store.ownedItems)) {
            if (s.store.ownedItems.includes('mystery_small')) {
                s.store.tickets.scholar = (s.store.tickets.scholar || 0) + 1;
                s.store.ownedItems = s.store.ownedItems.filter(id => id !== 'mystery_small');
            }
            if (s.store.ownedItems.includes('mystery_epic')) {
                s.store.tickets.elite = (s.store.tickets.elite || 0) + 1;
                s.store.ownedItems = s.store.ownedItems.filter(id => id !== 'mystery_epic');
            }
        }
        if (Array.isArray(s.store.consumables)) {
            s.store.consumables.forEach(c => {
                if (c.itemId === 'mystery_small') s.store.tickets.scholar = (s.store.tickets.scholar || 0) + 1;
                if (c.itemId === 'mystery_epic') s.store.tickets.elite = (s.store.tickets.elite || 0) + 1;
            });
            s.store.consumables = s.store.consumables.filter(c => c.itemId !== 'mystery_small' && c.itemId !== 'mystery_epic');
        }
    }
    if (s.version < 3) {
        if (!Array.isArray(s.rewardLedger)) s.rewardLedger = [];
        // Existing balances remain untouched; ledgering starts prospectively.
        s.rewardLedger = s.rewardLedger.slice(-500).filter(entry => entry && typeof entry.id === 'string');
    }
    s.version = CURRENT_STATE_VERSION;
    return s;
}


function normalizeStateCollections(targetState) {
    const s = targetState;
    const nonNegativeInt = (value, fallback = 0) => {
        const n = Number(value);
        return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
    };
    const normalizeId = (value) => {
        const n = Number(value);
        return Number.isSafeInteger(n) && n > 0 ? n : createEntityId();
    };
    const normalizeEntityIds = (items) => {
        const seen = new Set();
        return items.map(item => {
            let id = normalizeId(item.id);
            while (seen.has(id)) id = createEntityId();
            seen.add(id);
            item.id = id;
            return item;
        });
    };

    const arrayDefaults = {
        tasks: [], goals: [], lessons: [], studyPlan: [], examSubjects: [], studySubjects: [],
        weaknesses: [], rewards: [], rewardLedger: []
    };
    Object.entries(arrayDefaults).forEach(([key, fallback]) => {
        if (!Array.isArray(s[key])) s[key] = [...fallback];
    });
    if (!Array.isArray(s.habits)) s.habits = [...DEFAULT_HABITS];
    if (!s.errorBank || typeof s.errorBank !== 'object' || Array.isArray(s.errorBank)) s.errorBank = { errors: [], lastSmartReviewDate: null };
    if (!Array.isArray(s.errorBank.errors)) s.errorBank.errors = [];
    if (!s.store || typeof s.store !== 'object' || Array.isArray(s.store)) s.store = JSON.parse(JSON.stringify(INITIAL_STATE.store));

    s.tasks = normalizeEntityIds(s.tasks.filter(Boolean).map(t => ({ ...t })).filter(t => String(t.text ?? '').trim()));
    s.tasks.forEach(t => {
        t.text = String(t.text).trim();
        t.category = CATEGORIES[t.category] ? t.category : 'study';
        t.completed = t.completed === true;
        t.xp = nonNegativeInt(t.xp, 15);
        if (t.completed && t.rewardId != null) t.rewardId = String(t.rewardId);
        if (t.earnedXp !== undefined) t.earnedXp = nonNegativeInt(t.earnedXp, 0);
        if (t.earnedCoins !== undefined) t.earnedCoins = nonNegativeInt(t.earnedCoins, 0);
    });

    s.goals = normalizeEntityIds(s.goals.filter(Boolean).map(g => ({ ...g })).filter(g => String(g.text ?? '').trim()));
    s.goals.forEach(g => { g.text = String(g.text).trim(); g.completed = g.completed === true; if (g.rewardId != null) g.rewardId = String(g.rewardId); });

    s.habits = normalizeEntityIds(s.habits.filter(Boolean).map(h => ({ ...h })).filter(h => String(h.title ?? '').trim()));
    s.habits.forEach(h => { h.title = String(h.title).trim(); h.completed = h.completed === true; h.icon = String(h.icon || 'check-square'); if (h.rewardId != null) h.rewardId = String(h.rewardId); });

    const normalizeScheduleList = (items) => {
        items = normalizeEntityIds(items.filter(Boolean).map(i => ({ ...i })).filter(i => String(i.title ?? '').trim()));
        items.forEach(i => {
            i.title = String(i.title).trim();
            i.time = String(i.time || '');
            if (!['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].includes(i.day)) i.day = 'السبت';
            i.completed = i.completed === true;
            if (i.rewardId != null) i.rewardId = String(i.rewardId);
        });
        return items;
    };
    s.lessons = normalizeScheduleList(s.lessons);
    s.studyPlan = normalizeScheduleList(s.studyPlan);

    s.studySubjects = normalizeEntityIds(s.studySubjects.filter(Boolean).map(sub => ({ ...sub })).filter(sub => String(sub.name ?? '').trim()));
    s.studySubjects.forEach(sub => {
        sub.name = String(sub.name).trim();
        sub.totalMinutes = nonNegativeInt(sub.totalMinutes, 0);
        sub.weeklyGoal = nonNegativeInt(sub.weeklyGoal, 0);
        sub.history = Array.isArray(sub.history) ? sub.history.filter(Boolean).map(h => ({ ...h })) : [];
        const seenSessions = new Set();
        sub.history = sub.history.filter(h => {
            let id = normalizeId(h.id);
            while (seenSessions.has(id)) id = createEntityId();
            seenSessions.add(id); h.id = id;
            h.date = String(h.date || getLocalDateStr());
            h.minutes = nonNegativeInt(h.minutes, 0);
            h.timestamp = nonNegativeInt(h.timestamp, Date.now());
            if (h.rewardId != null) h.rewardId = String(h.rewardId);
            if (h.earnedXp !== undefined) h.earnedXp = nonNegativeInt(h.earnedXp, 0);
            if (h.earnedCoins !== undefined) h.earnedCoins = nonNegativeInt(h.earnedCoins, 0);
            return true;
        });
    });

    s.examSubjects = normalizeEntityIds(s.examSubjects.filter(Boolean).map(sub => ({ ...sub })).filter(sub => String(sub.name ?? '').trim()));
    s.examSubjects.forEach(sub => {
        sub.name = String(sub.name).trim();
        sub.exams = Array.isArray(sub.exams) ? sub.exams.filter(Boolean).map(exam => ({ ...exam })) : [];
        const seenExams = new Set();
        sub.exams = sub.exams.filter(exam => {
            let id = normalizeId(exam.id);
            while (seenExams.has(id)) id = createEntityId();
            seenExams.add(id); exam.id = id;
            exam.name = String(exam.name || '').trim();
            exam.grade = Number.isFinite(Number(exam.grade)) ? Math.max(0, Number(exam.grade)) : 0;
            exam.totalGrade = Number.isFinite(Number(exam.totalGrade)) ? Math.max(0, Number(exam.totalGrade)) : 0;
            exam.percentage = exam.totalGrade > 0 ? Math.round((exam.grade / exam.totalGrade) * 1000) / 10 : 0;
            if (exam.rewardId != null) exam.rewardId = String(exam.rewardId);
            return !!exam.name && exam.totalGrade > 0 && exam.grade <= exam.totalGrade;
        });
        updateSubjectStats(sub);
    });

    s.errorBank.errors = normalizeEntityIds(s.errorBank.errors.filter(Boolean).map(err => ({ ...err })).filter(err => String(err.text ?? '').trim() && String(err.subjectName ?? '').trim()));
    s.errorBank.errors.forEach(err => {
        err.subjectName = String(err.subjectName).trim();
        err.text = String(err.text).trim();
        err.lessonLearned = String(err.lessonLearned || '');
        if (!['conceptual', 'calculation', 'careless', 'other'].includes(err.type)) err.type = 'other';
        if (!['low', 'medium', 'high'].includes(err.severity)) err.severity = 'medium';
        if (!['new', 'reviewed', 'mastered'].includes(err.status)) err.status = 'new';
        err.repetitionCount = nonNegativeInt(err.repetitionCount, 0);
        err.reviewCount = nonNegativeInt(err.reviewCount, 0);
        err.dateAdded = String(err.dateAdded || new Date().toLocaleDateString('ar-EG'));
        if (err.lastReviewedAt != null && !Number.isFinite(Number(err.lastReviewedAt))) err.lastReviewedAt = null;
        if (err.lastRepeatedAt != null && !Number.isFinite(Number(err.lastRepeatedAt))) err.lastRepeatedAt = null;
        if (err.masteredAt != null && !Number.isFinite(Number(err.masteredAt))) err.masteredAt = null;
    });

    s.store.ownedItems = Array.isArray(s.store.ownedItems) ? s.store.ownedItems.filter(id => STORE_CATALOG.some(item => item.id === id && ['theme', 'title', 'avatar', 'effect'].includes(item.type))) : [];
    s.store.consumables = Array.isArray(s.store.consumables) ? s.store.consumables.filter(c => c && typeof c.itemId === 'string' && STORE_CATALOG.some(item => item.id === c.itemId && !['theme', 'title', 'avatar', 'effect'].includes(item.type))).map(c => ({ ...c, instanceId: c.instanceId ?? createEntityId() })) : [];
    s.store.activeBoosts = Array.isArray(s.store.activeBoosts) ? s.store.activeBoosts.filter(b => b && STORE_CATALOG.some(item => item.id === b.itemId && item.type === 'boost') && Number.isFinite(Number(b.expiresAt)) && Number(b.expiresAt) > Date.now()) : [];
    s.store.activeEffects = Array.isArray(s.store.activeEffects) ? s.store.activeEffects.filter(id => s.store.ownedItems.includes(id) && STORE_CATALOG.some(item => item.id === id && item.type === 'effect')) : [];
    if (!STORE_CATALOG.some(item => item.id === s.store.activeTheme && item.type === 'theme' && s.store.ownedItems.includes(item.id))) s.store.activeTheme = null;
    if (!STORE_CATALOG.some(item => item.id === s.store.activeTitle && item.type === 'title' && s.store.ownedItems.includes(item.id))) s.store.activeTitle = null;
    s.store.shards = s.store.shards && typeof s.store.shards === 'object' ? s.store.shards : {};
    ['rare', 'epic', 'legendary', 'mythic'].forEach(k => s.store.shards[k] = nonNegativeInt(s.store.shards[k], 0));
    s.store.tickets = s.store.tickets && typeof s.store.tickets === 'object' ? s.store.tickets : {};
    ['scholar', 'elite', 'mythic'].forEach(k => s.store.tickets[k] = nonNegativeInt(s.store.tickets[k], 0));
    s.store.wheelTokens = nonNegativeInt(s.store.wheelTokens, 0);

    s.rewardLedger = Array.isArray(s.rewardLedger) ? s.rewardLedger.filter(e => e && typeof e.id === 'string').slice(-500).map(e => ({
        ...e,
        xp: nonNegativeInt(e.xp, 0),
        coins: nonNegativeInt(e.coins, 0),
        status: e.status === 'revoked' ? 'revoked' : 'granted',
        createdAt: nonNegativeInt(e.createdAt, Date.now()),
        ...(e.revokedAt != null ? { revokedAt: nonNegativeInt(e.revokedAt, Date.now()) } : {})
    })) : [];
    return s;
}

function executeStoreTransaction(transactionFn) {
    if (storeTransactionLocked) {
        showToast('هناك معاملة قيد التنفيذ، يرجى الانتظار.', 'info');
        return false;
    }
    storeTransactionLocked = true;
    const snapshot = JSON.parse(JSON.stringify(state));
    try {
        const success = transactionFn();
        if (!success) {
            storeTransactionLocked = false;
            return false;
        }
        checkAchievements();
        storeTransactionLocked = false;
        localStorage.setItem('hsQuestPremium_v4', JSON.stringify(state));
        isStorageWarningActive = false;
        updateGlobalUI();
        renderStore();
        return true;
    } catch (e) {
        console.error("Store transaction failed, rolling back:", e);
        state = JSON.parse(JSON.stringify(snapshot));
        storeTransactionLocked = false;
        saveState();
        renderStore();
        updateGlobalUI();
        showToast('فشل حفظ المعاملة في التخزين. تم التراجع عن العملية واستعادة الحالة السابقة.', 'info');
        return false;
    }
}

function openChest(chestType, useTicket, prepaid = false) {
    let cost = 0;
    let ticketKey = '';
    let targetRarity = '';

    if (chestType === 'scholar') {
        cost = 400; ticketKey = 'scholar'; targetRarity = 'epic';
    } else if (chestType === 'elite') {
        cost = 1200; ticketKey = 'elite'; targetRarity = 'legendary';
    } else if (chestType === 'mythic') {
        cost = 4000; ticketKey = 'mythic'; targetRarity = 'mythic';
    } else {
        return;
    }

    if (!state.store.pity) state.store.pity = {};
    if (!state.store.pity[chestType]) state.store.pity[chestType] = { count: 0 };

    return executeStoreTransaction(() => {
        if (useTicket) {
            if (!state.store.tickets || state.store.tickets[ticketKey] <= 0) {
                showToast('لا توجد تذكرة متاحة لهذا الصندوق.', 'info');
                return false;
            }
            state.store.tickets[ticketKey]--;
        } else if (!prepaid) {
            if (state.coins < cost) {
                showToast(`تحتاج إلى ${cost - state.coins} ذهب إضافي لفتح الصندوق.`, 'info');
                return false;
            }
            state.coins -= cost;
        }

        let pityObj = state.store.pity[chestType];
        let targetChance = 0.05 + (pityObj.count * 0.02);
        if (pityObj.count >= 9) targetChance = 1.0;

        const cryptoArray = new Uint32Array(1);
        window.crypto.getRandomValues(cryptoArray);
        const rand = cryptoArray[0] / (0xffffffff + 1);

        let rolledRarity = '';
        if (rand < targetChance || pityObj.count >= 9) {
            rolledRarity = targetRarity;
            pityObj.count = 0;
        } else {
            pityObj.count++;
            const nonTargetRand = (rand - targetChance) / (1.0 - targetChance);
            if (chestType === 'scholar') {
                if (nonTargetRand < (0.70 / 0.95)) rolledRarity = 'common';
                else rolledRarity = 'rare';
            } else if (chestType === 'elite') {
                if (nonTargetRand < (0.65 / 0.95)) rolledRarity = 'rare';
                else rolledRarity = 'epic';
            } else if (chestType === 'mythic') {
                if (nonTargetRand < (0.70 / 0.95)) rolledRarity = 'epic';
                else rolledRarity = 'legendary';
            }
        }

        const eligibleItems = STORE_CATALOG.filter(item => item.rarity === rolledRarity && ['theme', 'title', 'avatar', 'effect', 'boost', 'instant'].includes(item.type));
        let rewardResult = null;
        let isDuplicate = false;

        if (eligibleItems.length > 0) {
            const randIdxArray = new Uint32Array(1);
            window.crypto.getRandomValues(randIdxArray);
            const chosenItem = eligibleItems[randIdxArray[0] % eligibleItems.length];

            const isPermanent = ['theme', 'title', 'avatar', 'effect'].includes(chosenItem.type);
            const alreadyOwned = isPermanent && state.store.ownedItems.includes(chosenItem.id);

            if (!alreadyOwned) {
                if (isPermanent) {
                    state.store.ownedItems.push(chosenItem.id);
                    if (chosenItem.type === 'avatar') renderProfile();
                } else {
                    state.store.consumables.push({ instanceId: createEntityId(), itemId: chosenItem.id });
                }
                rewardResult = { type: 'item', item: chosenItem };
            } else {
                isDuplicate = true;
                let duplicateRewardText = '';
                if (rolledRarity === 'common') {
                    RewardService.grant({ id: createRewardId('chest-duplicate', `${chestType}:common`), xp: 0, coins: 100, meta: { source: 'chest-duplicate', chestType, rarity: 'common' } });
                    duplicateRewardText = '100 عملة (تعويض عن تكرار شائع)';
                } else if (rolledRarity === 'rare') {
                    state.store.shards.rare += 10;
                    duplicateRewardText = '10 شظايا نادرة';
                } else if (rolledRarity === 'epic') {
                    state.store.shards.epic += 20;
                    duplicateRewardText = '20 شظية ملحمية';
                } else if (rolledRarity === 'legendary') {
                    state.store.shards.legendary += 50;
                    duplicateRewardText = '50 شظية أسطورية';
                } else if (rolledRarity === 'mythic') {
                    state.store.shards.mythic += 100;
                    duplicateRewardText = '100 شظية خرافية';
                }
                rewardResult = { type: 'duplicate', item: chosenItem, rewardText: duplicateRewardText };
            }
        } else {
            RewardService.grant({ id: createRewardId('chest-fallback', chestType), xp: 0, coins: 200, meta: { source: 'chest-fallback', chestType } });
            rewardResult = { type: 'fallback', rewardText: '200 عملة ذهبية' };
        }

        playSound('epic_hit');
        showChestRevealModal(chestType, rewardResult, isDuplicate);
        return true;
    });
}

function spinWheel() {
    if (!state.store.wheelTokens || state.store.wheelTokens <= 0) {
        showToast('تحتاج إلى رمز عجلة (Wheel Token) للدوران.', 'info');
        return;
    }

    executeStoreTransaction(() => {
        state.store.wheelTokens--;

        const cryptoArray = new Uint32Array(1);
        window.crypto.getRandomValues(cryptoArray);
        const rand = cryptoArray[0] / (0xffffffff + 1);

        let spinResultText = '';
        const wheelRewardId = createRewardId('wheel-spin', state.currentWeek);
        if (rand < 0.50) {
            RewardService.grant({ id: `${wheelRewardId}:coins`, xp: 0, coins: 500, meta: { source: 'wheel', reward: 'coins' } });
            spinResultText = '500 عملة ذهبية 🪙';
        } else if (rand < 0.80) {
            RewardService.grant({ id: `${wheelRewardId}:xp`, xp: 500, coins: 0, meta: { source: 'wheel', reward: 'xp' } });
            spinResultText = '500 نقطة خبرة (XP) ⭐';
        } else if (rand < 0.95) {
            state.store.tickets.elite++;
            spinResultText = 'تذكرة النخبة (Elite Ticket) 🎟️';
        } else {
            state.store.tickets.mythic++;
            spinResultText = 'تذكرة أسطورية (Mythic Ticket) 👑';
        }

        playSound('reward');
        showToast(`نتيجة عجلة الحظ: ${spinResultText}`, 'success', true);
        renderStore();
        return true;
    });
}

function convertShardsToWheelToken() {
    executeStoreTransaction(() => {
        const shards = state.store.shards;
        const totalShards = (shards.rare || 0) + (shards.epic || 0) + (shards.legendary || 0) + (shards.mythic || 0);

        if (totalShards < 100) {
            showToast('تحتاج إلى 100 شظية على الأقل لتحويلها إلى رمز عجلة.', 'info');
            return false;
        }

        let needed = 100;
        const order = ['rare', 'epic', 'legendary', 'mythic'];
        for (const type of order) {
            if (needed <= 0) break;
            const available = shards[type] || 0;
            const take = Math.min(available, needed);
            shards[type] -= take;
            needed -= take;
        }

        state.store.wheelTokens = (state.store.wheelTokens || 0) + 1;
        playSound('reward');
        showToast('تم تحويل 100 شظية إلى رمز عجلة بنجاح! 🎡', 'success', true);
        renderStore();
        return true;
    });
}

function showChestRevealModal(chestType, rewardResult, isDuplicate) {
    const modal = document.getElementById('chest-reveal-modal');
    if (!modal) return;

    const titleEl = document.getElementById('chest-reveal-title');
    const descEl = document.getElementById('chest-reveal-desc');
    const rewardTextEl = document.getElementById('chest-reveal-reward-text');

    const chestNames = { scholar: 'Scholar Cache', elite: 'Elite Crate', mythic: 'Mythic Vault' };
    if (titleEl) titleEl.innerText = `فتح ${chestNames[chestType] || 'الصندوق'}`;

    if (rewardResult.type === 'item') {
        if (descEl) descEl.innerText = 'تهانينا! لقد حصلت على عنصر جديد مميز!';
        if (rewardTextEl) rewardTextEl.innerText = rewardResult.item.title;
    } else if (rewardResult.type === 'duplicate') {
        if (descEl) descEl.innerText = 'العنصر مكرر! تم تحويله إلى مكافأة بديلة:';
        if (rewardTextEl) rewardTextEl.innerText = rewardResult.rewardText;
    } else {
        if (descEl) descEl.innerText = 'مكافأة صندوق الحظ:';
        if (rewardTextEl) rewardTextEl.innerText = rewardResult.rewardText;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    lucide.createIcons({ root: modal });
}

function closeChestRevealModal() {
    const modal = document.getElementById('chest-reveal-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
    saveState();
    renderStore();
    updateGlobalUI();
}

function updateRewardsUI() {
    if (!state.store) return;
    if (!state.store.tickets) state.store.tickets = { scholar: 0, elite: 0, mythic: 0 };
    if (!state.store.shards) state.store.shards = { rare: 0, epic: 0, legendary: 0, mythic: 0 };
    if (typeof state.store.wheelTokens !== 'number') state.store.wheelTokens = 0;

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setTxt('ui-ticket-scholar', state.store.tickets.scholar || 0);
    setTxt('ui-ticket-elite', state.store.tickets.elite || 0);
    setTxt('ui-ticket-mythic', state.store.tickets.mythic || 0);
    setTxt('ui-scholar-ticket-count', state.store.tickets.scholar || 0);
    setTxt('ui-elite-ticket-count', state.store.tickets.elite || 0);
    setTxt('ui-mythic-ticket-count', state.store.tickets.mythic || 0);
    setTxt('ui-wheel-tokens', state.store.wheelTokens || 0);

    setTxt('ui-shard-rare', state.store.shards.rare || 0);
    setTxt('ui-shard-epic', state.store.shards.epic || 0);
    setTxt('ui-shard-legendary', state.store.shards.legendary || 0);
    setTxt('ui-shard-mythic', state.store.shards.mythic || 0);
    lucide.createIcons();
}

let rawSavedState = null;
try {
    rawSavedState = localStorage.getItem('hsQuestPremium_v4');
    if (rawSavedState) {
        const parsed = JSON.parse(rawSavedState);
        if (typeof parsed === 'object' && parsed !== null) {
            if (typeof parsed.version === 'number' && parsed.version > CURRENT_STATE_VERSION) {
                throw new Error(`Unsupported future state version: ${parsed.version}`);
            }
            const migratedState = runMigrations(parsed);
            state = { ...state, ...migratedState };
            state = normalizeStateCollections(state);
        }
        
        const arrayKeys = ['tasks', 'inventory', 'goals', 'lessons', 'studyPlan', 'unlockedAchievements', 'habits', 'weeklyReports', 'examSubjects', 'weaknesses', 'studySubjects', 'rewards', 'rewardLedger'];
        arrayKeys.forEach(key => {
            if (!Array.isArray(state[key])) state[key] = JSON.parse(JSON.stringify(INITIAL_STATE[key]));
        });

        const objectKeys = ['stats', 'productivity', 'todayStats', 'weeklyStats', 'activeSession', 'heatmapData'];
        objectKeys.forEach(key => {
            if (typeof state[key] !== 'object' || state[key] === null) {
                state[key] = JSON.parse(JSON.stringify(INITIAL_STATE[key]));
            } else {
                state[key] = { ...INITIAL_STATE[key], ...state[key] };
            }
        });

        if (!state.store) {
            state.store = {
                ownedItems: [],
                consumables: [],
                activeBoosts: [],
                activeTheme: null,
                activeTitle: null,
                activeEffects: []
            };
        } else {
            if (!Array.isArray(state.store.ownedItems)) state.store.ownedItems = [];
            if (!Array.isArray(state.store.consumables)) state.store.consumables = [];
            if (!Array.isArray(state.store.activeBoosts)) state.store.activeBoosts = [];
            if (!Array.isArray(state.store.activeEffects)) state.store.activeEffects = [];
        }

        if (!state.errorBank || !Array.isArray(state.errorBank.errors)) {
            state.errorBank = { errors: [], lastSmartReviewDate: null };
        }

        if (state.weaknesses && state.weaknesses.length > 0) {
            state.weaknesses.forEach(w => {
                const exists = state.errorBank.errors.find(e => e.id === w.id);
                if (!exists) {
                    state.errorBank.errors.push({
                        id: w.id,
                        subjectName: w.subject || 'غير محدد',
                        text: w.desc || '',
                        lessonLearned: '',
                        type: 'other',
                        severity: w.priority || 'medium',
                        status: w.solved === true ? 'reviewed' : 'new',
                        repetitionCount: 0,
                        reviewCount: 0,
                        dateAdded: w.date || new Date().toLocaleDateString('ar-EG'),
                        lastReviewedAt: null,
                        lastRepeatedAt: null,
                        masteredAt: null
                    });
                }
            });
        }

        if (typeof state.xp !== 'number' || !isFinite(state.xp) || state.xp < 0) state.xp = 0;
        if (typeof state.coins !== 'number' || !isFinite(state.coins) || state.coins < 0) state.coins = 0;
        if (typeof state.streak !== 'number' || !isFinite(state.streak) || state.streak < 0) state.streak = 0;
        if (typeof state.bestStreak !== 'number' || !isFinite(state.bestStreak) || state.bestStreak < 0) state.bestStreak = state.streak || 0;
        if (typeof state.currentWeek !== 'number' || !isFinite(state.currentWeek) || state.currentWeek < 1) state.currentWeek = 1;
        if (typeof state.totalFocusMinutes !== 'number' || !isFinite(state.totalFocusMinutes) || state.totalFocusMinutes < 0) state.totalFocusMinutes = 0;
        
        if (!Array.isArray(state.habits)) state.habits = [...DEFAULT_HABITS];
        if (!state.userName || typeof state.userName !== 'string') state.userName = 'اسمك هنا';
        if (!state.avatarId || typeof state.avatarId !== 'number') state.avatarId = 1;
        
        state.studySubjects.forEach(s => {
            if(!Array.isArray(s.history)) s.history = [];
            if(typeof s.weeklyGoal !== 'number' || !isFinite(s.weeklyGoal)) s.weeklyGoal = 0;
        });
        
        state = normalizeStateCollections(state);
        state.streakNeedsRestart = state.streakNeedsRestart === true;
        if (!state.activeSession || typeof state.activeSession !== 'object') {
            state.activeSession = JSON.parse(JSON.stringify(INITIAL_STATE.activeSession));
        } else {
            state.activeSession.pendingSave = state.activeSession.pendingSave === true;
        }
        delete state._storeLocked;
        state.version = CURRENT_STATE_VERSION;
    }
} catch(e) {
    console.error("State parsing failed, attempting recovery.", e);
    let recoverySaved = false;
    if (rawSavedState) {
        try {
            const timestamp = Date.now();
            localStorage.setItem(`hsQuestPremium_v4_corrupted_${timestamp}`, rawSavedState);
            console.warn(`Corrupted state saved to hsQuestPremium_v4_corrupted_${timestamp}`);
            recoverySaved = true;
        } catch(recoveryErr) {
            console.error("Failed to save corrupted state.", recoveryErr);
            recoverySaved = false;
        }
    }
    state = JSON.parse(JSON.stringify(INITIAL_STATE));
    state._needsCorruptionNotice = true;
    state._recoverySaved = recoverySaved;
}

let isStorageWarningActive = false;

function saveState() {
    checkAchievements();
    delete state._storeLocked;
    try {
        localStorage.setItem('hsQuestPremium_v4', JSON.stringify(state));
        isStorageWarningActive = false;
    } catch (e) {
        console.warn("فشل في حفظ البيانات. تأكد من أن مساحة التخزين غير ممتلئة أو أنك لا تستخدم التصفح الخفي.");
        if (!isStorageWarningActive) {
            isStorageWarningActive = true;
            showStorageError();
        }
    }
    updateGlobalUI();
}

function showStorageError() {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `flex flex-col gap-3 p-4 rounded-2xl glass-panel shadow-2xl border border-red-500/50 bg-red-500/10 toast-enter pointer-events-auto max-w-[92vw]`;
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="shrink-0 bg-black/40 p-2 rounded-full"><i data-lucide="alert-triangle" class="w-5 h-5 text-red-400"></i></div>
            <div class="flex-1">
                <h4 class="text-sm font-bold text-white mb-1">مساحة التخزين ممتلئة</h4>
                <p class="text-xs text-white/80 leading-snug">بياناتك الحالية ما زالت موجودة داخل التطبيق، لكن قد لا يتم حفظ التغييرات الجديدة. يرجى تصدير بياناتك الآن.</p>
            </div>
        </div>
        <div class="flex gap-2 mt-1">
            <button onclick="exportData()" class="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                <i data-lucide="download" class="w-4 h-4"></i> تصدير البيانات
            </button>
            <button onclick="this.parentElement.parentElement.remove(); isStorageWarningActive = false;" class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-colors">
                إغلاق
            </button>
        </div>
    `;
    container.appendChild(toast);
    lucide.createIcons({ root: toast });
}

function exportData() {
    try {
        const stateToExport = JSON.parse(JSON.stringify(state));
        delete stateToExport._needsCorruptionNotice;
        delete stateToExport._recoverySaved;
        delete stateToExport._storeLocked;
        stateToExport.version = CURRENT_STATE_VERSION;
        if (!Array.isArray(stateToExport.rewardLedger)) stateToExport.rewardLedger = [];
        stateToExport.rewardLedger = stateToExport.rewardLedger.slice(-500);
        
        const exportPayload = {
            rodo_metadata: {
                exportDate: new Date().toISOString(),
                appVersion: "2.0.0",
                appId: "RODO"
            },
            rodo_state: stateToExport
        };
        
        const dataStr = JSON.stringify(exportPayload);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `rodo-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('تم تصدير البيانات بنجاح.', 'success');
    } catch (e) {
        console.error("Export failed", e);
        showToast('حدث خطأ أثناء تصدير البيانات.', 'info');
    }
}

function triggerImport() {
    const input = document.getElementById('import-file-input');
    if (input) input.click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            validateAndApplyImport(json);
        } catch (err) {
            console.error("Import parse error:", err);
            showToast('ملف غير صالح أو تالف. يرجى التأكد من اختيار ملف RODO صحيح.', 'info');
        }
        event.target.value = '';
    };
    reader.onerror = () => {
        showToast('حدث خطأ أثناء قراءة الملف.', 'info');
        event.target.value = '';
    };
    reader.readAsText(file);
}

function validateAndApplyImport(json) {
    if (!json || typeof json !== 'object') {
        showToast('تنسيق الملف غير مدعوم.', 'info');
        return;
    }
    
    if (!json.rodo_metadata || json.rodo_metadata.appId !== "RODO" || !json.rodo_state || typeof json.rodo_state.version !== 'number') {
        showToast('هذا الملف ليس ملف نسخ احتياطي صالح لـ RODO.', 'info');
        return;
    }
    
    if (json.rodo_state.version > CURRENT_STATE_VERSION) {
        showToast('هذا الملف أحدث من إصدار RODO الحالي. حدّث التطبيق أولاً قبل استعادته.', 'info');
        return;
    }

    let candidateState;
    try {
        candidateState = JSON.parse(JSON.stringify(json.rodo_state));
    } catch (cloneError) {
        showToast('تعذر قراءة بيانات النسخ الاحتياطي بشكل آمن.', 'info');
        return;
    }
    
    const requiredArrays = ['tasks', 'habits', 'goals', 'lessons', 'studyPlan', 'examSubjects', 'studySubjects', 'weaknesses', 'rewards', 'rewardLedger'];
    const MAX_IMPORTED_COLLECTION_ITEMS = 5000;
    for (const key of requiredArrays) {
        if (candidateState[key] !== undefined && !Array.isArray(candidateState[key])) {
            showToast(`بيانات الملف تالفة: ${key} ليس قائمة صحيحة.`, 'info');
            return;
        }
        if (Array.isArray(candidateState[key]) && candidateState[key].length > MAX_IMPORTED_COLLECTION_ITEMS) {
            showToast(`ملف النسخ الاحتياطي كبير أو غير طبيعي في قسم ${key}.`, 'info');
            return;
        }
    }
    
    if (candidateState.errorBank && (!Array.isArray(candidateState.errorBank.errors))) {
        showToast(`بيانات الملف تالفة: بنك الأخطاء غير صالح.`, 'info');
        return;
    }

    if (candidateState.store && (!Array.isArray(candidateState.store.ownedItems) || !Array.isArray(candidateState.store.consumables || []) || !Array.isArray(candidateState.store.activeBoosts || []) || !Array.isArray(candidateState.store.activeEffects || []))) {
        showToast(`بيانات الملف تالفة: المتجر غير صالح.`, 'info');
        return;
    }

    const numericKeys = ['xp', 'coins', 'streak', 'bestStreak', 'totalFocusMinutes', 'currentWeek'];
    for (const key of numericKeys) {
        if (candidateState[key] !== undefined && (!Number.isFinite(candidateState[key]) || candidateState[key] < 0)) {
            showToast(`بيانات الملف تالفة: قيمة ${key} غير صالحة.`, 'info');
            return;
        }
    }

    if (candidateState.rewardLedger !== undefined && (!Array.isArray(candidateState.rewardLedger) || candidateState.rewardLedger.length > 500)) {
        showToast('بيانات الملف تالفة: سجل المكافآت غير صالح.', 'info');
        return;
    }

    if (candidateState.xp !== undefined && typeof candidateState.xp !== 'number') {
        showToast(`بيانات الملف تالفة: قيمة الخبرة غير صالحة.`, 'info');
        return;
    }
    if (candidateState.coins !== undefined && typeof candidateState.coins !== 'number') {
        showToast(`بيانات الملف تالفة: قيمة الذهب غير صالحة.`, 'info');
        return;
    }
    
    candidateState = runMigrations(candidateState);
    candidateState = normalizeStateCollections({ ...JSON.parse(JSON.stringify(INITIAL_STATE)), ...candidateState });

    // Keep only the documented top-level state schema; runtime/internal fields are never imported.
    const allowedStateKeys = new Set(Object.keys(INITIAL_STATE));
    candidateState = Object.fromEntries(Object.entries(candidateState).filter(([key]) => allowedStateKeys.has(key)));

    const catalogById = new Map(STORE_CATALOG.map(item => [item.id, item]));
    if (candidateState.store) {
        candidateState.store.ownedItems = candidateState.store.ownedItems.filter(id => {
            const item = catalogById.get(id);
            return !!item && ['theme', 'title', 'avatar', 'effect'].includes(item.type);
        });
        candidateState.store.activeEffects = candidateState.store.activeEffects.filter(id => {
            const item = catalogById.get(id);
            return !!item && item.type === 'effect' && candidateState.store.ownedItems.includes(id);
        });
        if (!catalogById.has(candidateState.store.activeTheme) || !candidateState.store.ownedItems.includes(candidateState.store.activeTheme) || catalogById.get(candidateState.store.activeTheme)?.type !== 'theme') candidateState.store.activeTheme = null;
        if (!catalogById.has(candidateState.store.activeTitle) || !candidateState.store.ownedItems.includes(candidateState.store.activeTitle) || catalogById.get(candidateState.store.activeTitle)?.type !== 'title') candidateState.store.activeTitle = null;
        candidateState.store.consumables = candidateState.store.consumables.filter(c => c && typeof c.instanceId !== 'undefined' && catalogById.has(c.itemId) && !['theme', 'title', 'avatar', 'effect'].includes(catalogById.get(c.itemId).type));
        candidateState.store.activeBoosts = candidateState.store.activeBoosts.filter(b => b && catalogById.has(b.itemId) && catalogById.get(b.itemId).type === 'boost' && Number.isFinite(b.expiresAt));
        const shardKeys = ['rare', 'epic', 'legendary', 'mythic'];
        shardKeys.forEach(k => { candidateState.store.shards[k] = Number.isFinite(candidateState.store.shards[k]) ? Math.max(0, Math.floor(candidateState.store.shards[k])) : 0; });
        const ticketKeys = ['scholar', 'elite', 'mythic'];
        ticketKeys.forEach(k => { candidateState.store.tickets[k] = Number.isFinite(candidateState.store.tickets[k]) ? Math.max(0, Math.floor(candidateState.store.tickets[k])) : 0; });
    }
    candidateState.rewardLedger = Array.isArray(candidateState.rewardLedger) ? candidateState.rewardLedger.filter(entry => entry && typeof entry.id === 'string').slice(-500) : [];
    
    if (confirm('هل أنت متأكد من استعادة هذه البيانات؟ سيتم مسح بياناتك الحالية بالكامل وإحلال البيانات الجديدة.')) {
        state = { ...JSON.parse(JSON.stringify(INITIAL_STATE)), ...candidateState };
        delete state._storeLocked;
        state.version = CURRENT_STATE_VERSION;
        
        clearStopwatchInterval();
        pendingRandomEvent = null;
        stateSnapshot = null;
        
        saveState();
        
        refreshCoreViews();
        
        showToast('تمت استعادة البيانات بنجاح! أهلاً بعودتك.', 'success');
        switchTab('dashboard');
    }
}

function saveSnapshot() { 
    stateSnapshot = JSON.parse(JSON.stringify(state)); 
    return JSON.stringify(state); 
}

function restoreSnapshot() {
    if (!stateSnapshot) return;
    state = JSON.parse(JSON.stringify(stateSnapshot));
    stateSnapshot = null;
    saveState();
    refreshCoreViews();
    if (isAudioInitialized && synth) synth.triggerAttackRelease("C3", "16n");
}

function getBoostMultiplier(boostType) {
    if (!state.store || !state.store.activeBoosts) return 1;
    
    const now = Date.now();
    let multiplier = 1;
    
    state.store.activeBoosts = state.store.activeBoosts.filter(b => b.expiresAt > now);
    
    state.store.activeBoosts.forEach(b => {
        const item = STORE_CATALOG.find(i => i.id === b.itemId);
        if (item && item.boostType === boostType) {
            multiplier = Math.max(multiplier, item.multiplier);
        }
    });
    
    return multiplier;
}

function initStoreBoostInterval() {
    if (storeBoostInterval) return;
    storeBoostInterval = setInterval(() => {
        if (!state.store || !state.store.activeBoosts || state.store.activeBoosts.length === 0) return;
        
        const now = Date.now();
        let changed = false;
        
        state.store.activeBoosts = state.store.activeBoosts.filter(b => {
            if (b.expiresAt <= now) {
                changed = true;
                const item = STORE_CATALOG.find(i => i.id === b.itemId);
                if (item) showToast(`انتهى تأثير ${item.title}`, 'info');
                return false;
            }
            return true;
        });
        
        if (changed) {
            saveState();
            const storeView = document.getElementById('view-store');
            if (storeView && storeView.classList.contains('active')) {
                renderStore();
            }
        }
    }, 10000);
}

function applyTheme() {
    if (state.store && state.store.activeTheme) {
        document.documentElement.setAttribute('data-theme', state.store.activeTheme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function triggerStoreEffect(eventName, payload = null) {
    if (!state.store || !state.store.activeEffects || state.store.activeEffects.length === 0) return;
    
    const activeEffectItems = state.store.activeEffects.map(id => STORE_CATALOG.find(i => i.id === id)).filter(Boolean);
    const triggeredEffects = activeEffectItems.filter(item => item.effectEvent === eventName);
    
    triggeredEffects.forEach(effect => {
        if (eventName === 'task-complete') {
            const burst = document.createElement('div');
            burst.className = 'effect-glow-burst fixed inset-0 pointer-events-none z-[9999]';
            burst.style.background = 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)';
            document.body.appendChild(burst);
            setTimeout(() => burst.remove(), 800);
        } else if (eventName === 'focus-complete') {
            const burst = document.createElement('div');
            burst.className = 'effect-glow-burst fixed inset-0 pointer-events-none z-[9999]';
            document.body.appendChild(burst);
            setTimeout(() => burst.remove(), 800);
        } else if (eventName === 'achievement-unlock') {
            const floatTxt = document.createElement('div');
            floatTxt.className = 'effect-float-text text-yellow-400 text-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]';
            floatTxt.innerText = `🏆 إنجاز جديد!`;
            document.body.appendChild(floatTxt);
            setTimeout(() => floatTxt.remove(), 1200);
        } else if (eventName === 'streak') {
            const floatTxt = document.createElement('div');
            floatTxt.className = 'effect-float-text text-orange-400 text-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]';
            floatTxt.innerText = `🔥 استمرارية!`;
            document.body.appendChild(floatTxt);
            setTimeout(() => floatTxt.remove(), 1200);
        }
    });
}

const getLevel = () => Math.floor(state.xp / 100) + 1;
const getXpProgress = () => state.xp % 100;

function getAvatarDecorationsHtml(level, isSmall = false) {
    let html = '';
    const sClass = isSmall ? 'w-4 h-4 -bottom-1 border' : 'w-8 h-8 -bottom-2 border-2';
    const iClass = isSmall ? 'w-2 h-2' : 'w-4 h-4';
    const cClass = isSmall ? 'w-5 h-5 -top-2' : 'w-7 h-7 -top-3';

    if (level >= 10) html += `<div class="absolute ${isSmall ? '-left-1' : '-left-2'} ${sClass} bg-slate-800 rounded-full border-slate-500 flex items-center justify-center z-20 shadow-lg"><i data-lucide="shield" class="${iClass} text-slate-300"></i></div>`;
    if (level >= 15) html += `<div class="absolute ${isSmall ? '-right-1' : '-right-2'} ${sClass} bg-amber-900 rounded-full border-amber-500 flex items-center justify-center z-20 shadow-lg"><i data-lucide="sword" class="${iClass} text-amber-400"></i></div>`;
    if (level >= 30) html += `<div class="absolute left-1/2 -translate-x-1/2 ${cClass} flex items-center justify-center z-20 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"><i data-lucide="crown" class="w-full h-full text-yellow-400 fill-yellow-400"></i></div>`;
    if (level >= 50) html += `<div class="absolute left-1/2 -translate-x-1/2 ${cClass} flex items-center justify-center z-20 drop-shadow-[0_0_15px_rgba(225,29,72,0.8)] -top-4"><i data-lucide="sparkles" class="w-full h-full text-rose-500 fill-rose-500"></i></div>`;
    
    return html;
}

function getAvatarAuraClass(level) {
    if (level >= 50) return 'ring-2 ring-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-[pulse_2s_infinite]';
    if (level >= 30) return 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-[pulse_2s_infinite]';
    if (level >= 20) return 'ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-[pulse_3s_infinite]';
    return 'border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)]';
}

function updateQuote() { 
    const quoteEl = document.getElementById('ui-daily-quote');
    if(quoteEl) quoteEl.innerText = QUOTES[Math.floor(Math.random() * QUOTES.length)]; 
}

function checkStreakAndPenaltyOnLoad() {
    if (!state.lastActionDate) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const lastAction = new Date(state.lastActionDate); lastAction.setHours(0,0,0,0);
    const diffTime = today - lastAction;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
        const xpPenalty = Math.min(state.xp, 50 * diffDays);
        const coinsPenalty = Math.min(state.coins, 50 * diffDays);
        state.xp -= xpPenalty;
        state.coins -= coinsPenalty;
        state.streak = 0;
        state.streakNeedsRestart = true;
        state.lastActionDate = new Date().toDateString();
        state.pendingRecap = false;
        state.yesterdayStats = null;
        saveState();
        showPenaltyModal(diffDays, xpPenalty, coinsPenalty);
        return true;
    }
    return false;
}

function showPenaltyModal(days, xp, coins) {
    try {
        initAudio().then(() => {
            if (Tone.context.state !== 'running') return;
            const osc = new Tone.Oscillator(50, "sawtooth").toDestination().start();
            osc.volume.value = -5; osc.frequency.rampTo(40, 1);
            setTimeout(() => osc.stop(), 1500);
        });
    } catch(e) {}

    const penaltyDaysEl = document.getElementById('penalty-days');
    if (penaltyDaysEl) penaltyDaysEl.innerText = `${days} أيام`;
    
    if (xp > 0) {
        const xpBox = document.getElementById('penalty-xp-box');
        const xpText = document.getElementById('penalty-xp');
        if(xpBox) xpBox.classList.remove('hidden');
        if(xpText) xpText.innerText = `-${xp}`;
    }
    if (coins > 0) {
        const coinsBox = document.getElementById('penalty-coins-box');
        const coinsText = document.getElementById('penalty-coins');
        if(coinsBox) coinsBox.classList.remove('hidden');
        if(coinsText) coinsText.innerText = `-${coins}`;
    }

    const modal = document.getElementById('modal-penalty');
    const content = document.getElementById('modal-penalty-content');
    if(modal && content) {
        modal.classList.remove('hidden'); modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0'); modal.classList.add('modal-overlay-enter');
            content.classList.remove('opacity-0', 'scale-95'); content.classList.add('modal-animate-enter');
        }, 10);
    }
}

function closePenaltyModal() {
    const modal = document.getElementById('modal-penalty');
    if(!modal) return;
    modal.classList.remove('modal-overlay-enter'); modal.classList.add('opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); modal.style.display = 'none'; }, 500);
}

function checkDailyReset() {
    const todayStr = new Date().toDateString();
    if (state.lastLoginDate !== todayStr) {
        if (state.todayStats.tasks > 0 || state.todayStats.xp > 0 || state.todayStats.focus > 0) {
            state.yesterdayStats = { ...state.todayStats };
            state.pendingRecap = true;
        }
        state.tasks = state.tasks.filter(t => !t.completed);
        state.habits.forEach(h => h.completed = false);
        state.todayStats = { tasks: 0, xp: 0, focus: 0 };
        state.lastLoginDate = todayStr;
        saveState();
    }
    return state.pendingRecap;
}

function showDailyRecap() {
    if (!state.yesterdayStats) return;
    playSound('achievement');

    const recapTasks = document.getElementById('recap-tasks');
    const recapXp = document.getElementById('recap-xp');
    const recapFocus = document.getElementById('recap-focus');

    if(recapTasks) recapTasks.innerText = state.yesterdayStats.tasks;
    if(recapXp) recapXp.innerText = state.yesterdayStats.xp;
    if(recapFocus) recapFocus.innerText = state.yesterdayStats.focus;
    
    const modal = document.getElementById('modal-daily-recap');
    const content = document.getElementById('modal-daily-recap-content');
    if(modal && content) {
        modal.classList.remove('hidden'); modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0'); modal.classList.add('modal-overlay-enter');
            content.classList.remove('opacity-0', 'scale-95'); content.classList.add('modal-animate-enter');
        }, 10);
    }
}

function closeDailyRecap() {
    const modal = document.getElementById('modal-daily-recap');
    if(!modal) return;
    modal.classList.remove('modal-overlay-enter'); modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden'); modal.style.display = 'none';
        state.pendingRecap = false; state.yesterdayStats = null; saveState();
        if (pendingRandomEvent) setTimeout(() => showRandomEventModal(pendingRandomEvent), 500);
    }, 300);
}

function checkRandomEvents() {
    const todayStr = new Date().toDateString();
    if (state.lastEventDate === todayStr) return null; 

    let eventToTrigger = null;
    const todayDay = new Date().getDay(); 

    if (todayDay === 4) {
        eventToTrigger = RANDOM_EVENTS_DATA.find(e => e.id === 'weekend_boost');
    } else if (Math.random() < 0.25) {
        const available = RANDOM_EVENTS_DATA.filter(e => e.id !== 'weekend_boost');
        eventToTrigger = available[Math.floor(Math.random() * available.length)];
    }

    if (eventToTrigger) {
        state.lastEventDate = todayStr;
        saveState(); return eventToTrigger;
    }
    return null;
}

function showRandomEventModal(eventData) {
    playSound('achievement');

    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-desc');
    if(titleEl) titleEl.innerText = eventData.title;
    if(descEl) descEl.innerText = eventData.desc;
    
    const iconEl = document.getElementById('event-icon');
    if(iconEl) iconEl.setAttribute('data-lucide', eventData.icon);
    
    const glowBg = document.getElementById('event-glow-bg');
    const iconContainer = document.getElementById('event-icon-container');
    const btn = document.getElementById('btn-claim-event');
    
    const themeMap = {
        blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400 border-blue-500/50 bg-blue-900/40', btn: 'bg-blue-600 hover:bg-blue-500 text-white' },
        yellow: { bg: 'bg-yellow-500/20', icon: 'text-yellow-400 border-yellow-500/50 bg-yellow-900/40', btn: 'bg-yellow-600 hover:bg-yellow-500 text-white' },
        red: { bg: 'bg-red-500/20', icon: 'text-red-400 border-red-500/50 bg-red-900/40', btn: 'bg-red-600 hover:bg-red-500 text-white' },
        purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400 border-purple-500/50 bg-purple-900/40', btn: 'bg-purple-600 hover:bg-purple-500 text-white' },
        emerald: { bg: 'bg-emerald-500/20', icon: 'text-emerald-400 border-emerald-500/50 bg-emerald-900/40', btn: 'bg-emerald-600 hover:bg-emerald-500 text-white' }
    };
    const theme = themeMap[eventData.theme] || themeMap.blue;

    if(glowBg) glowBg.className = `absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-[60px] pointer-events-none transition-colors duration-1000 ${theme.bg}`;
    if(iconContainer) iconContainer.className = `w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-2xl mb-5 border-2 anim-event-icon ${theme.icon}`;
    if(btn) btn.className = `w-full py-4 min-h-[44px] rounded-xl font-black text-sm btn-press transition-all shadow-lg flex items-center justify-center gap-2 ${theme.btn}`;

    let rewardsHtml = '';
    if (eventData.xp > 0) rewardsHtml += `<div class="text-center"><span class="block text-2xl font-black text-yellow-400">+${eventData.xp}</span><span class="text-[10px] text-white/50 font-bold uppercase tracking-wider">XP</span></div>`;
    if (eventData.coins > 0) rewardsHtml += `<div class="text-center"><span class="block text-2xl font-black text-yellow-500">+${eventData.coins}</span><span class="text-[10px] text-white/50 font-bold uppercase tracking-wider">ذهب</span></div>`;
    
    const rewardsBox = document.getElementById('event-rewards-box');
    if(rewardsBox) rewardsBox.innerHTML = rewardsHtml;

    if(btn) {
        btn.onclick = () => {
            const rewardId = `random-event:${getLocalDateStr()}:${eventData.id}`;
            const granted = RewardService.grant({ id: rewardId, xp: eventData.xp, coins: eventData.coins, meta: { source: 'random-event', eventId: eventData.id } });
            if (!granted) {
                closeRandomEvent();
                showToast('تم استلام مكافأة هذا الحدث بالفعل.', 'info');
                return;
            }
            saveState();
            closeRandomEvent();
            showToast(`تم استلام مكافأة "${eventData.title}" بنجاح!`, 'reward');
        };
    }

    const modal = document.getElementById('modal-random-event');
    const content = document.getElementById('modal-random-event-content');
    if(modal && content) {
        lucide.createIcons({ root: modal });
        modal.classList.remove('hidden'); modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0'); modal.classList.add('modal-overlay-enter');
            content.classList.remove('opacity-0', 'scale-95'); content.classList.add('modal-animate-enter');
        }, 10);
    }
}

function closeRandomEvent() {
    const modal = document.getElementById('modal-random-event');
    if(!modal) return;
    modal.classList.remove('modal-overlay-enter'); modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden'); modal.style.display = 'none';
        pendingRandomEvent = null;
    }, 500);
}

function updateDailyStreak() {
    if (checkStreakAndPenaltyOnLoad()) {
        state.streak = 1;
        state.streakNeedsRestart = false;
        state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
        state.lastActionDate = new Date().toDateString();
        saveState();
        return;
    }
    const todayStr = new Date().toDateString();
    if (state.streakNeedsRestart && state.lastActionDate === todayStr && state.streak === 0) {
        state.streak = 1;
        state.streakNeedsRestart = false;
        state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
        state.lastActionDate = todayStr;
        saveState();
        return;
    }
    if (state.lastActionDate === todayStr) return;
    if (state.streak === 0) state.streak = 1;
    else {
        state.streak += 1; playSound('success');
        setTimeout(() => {
            showToast(`يوم جديد في سلسلة الاستمرارية 🔥 (${state.streak} أيام متواصلة!)`, 'success');
            triggerStoreEffect('streak');
        }, 1000);
    }
    state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
    if (state.streak >= 30 && !state.store.mythicStreakAwarded) {
        state.store.mythicStreakAwarded = true;
        if (!state.store.tickets) state.store.tickets = { scholar: 0, elite: 0, mythic: 0 };
        state.store.tickets.mythic++;
        showToast('وصلت إلى سلسلة 30 يوماً! حصلت على تذكرة أسطورية (Mythic Ticket) 👑', 'achievement', true);
    }
    state.lastActionDate = todayStr;
    saveState();
}

function updateHeatmap(points) {
    const todayStr = getLocalDateStr();
    const current = state.heatmapData[todayStr] || 0;
    state.heatmapData[todayStr] = Math.max(0, current + points);
    saveState();
    renderHeatmap();
}

function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    if(!container) return;

    const today = new Date();
    let gridHTML = '';
    
    for (let w = 13; w >= 0; w--) {
        gridHTML += `<div class="flex flex-col gap-1.5">`;
        for (let d = 6; d >= 0; d--) {
            const daysAgo = (w * 7) + d;
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            const dateStr = getLocalDateStr(date);
            const points = state.heatmapData[dateStr] || 0;
            
            let bgClass = 'bg-white/5 border-white/5';
            if (points > 0 && points <= 15) bgClass = 'bg-blue-500/30 border-blue-500/20';
            else if (points > 15 && points <= 40) bgClass = 'bg-blue-500/60 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
            else if (points > 40) bgClass = 'bg-blue-400 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.6)]';

            gridHTML += `<div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] border ${bgClass} transition-all hover:scale-125 hover:z-10 hover:ring-1 ring-white" title="${dateStr}: ${points} نقطة نشاط"></div>`;
        }
        gridHTML += `</div>`;
    }

    container.innerHTML = gridHTML;
    
    setTimeout(() => {
        const scrollContainer = container.parentElement;
        if (scrollContainer) {
            scrollContainer.scrollTo({
                left: scrollContainer.scrollWidth,
                behavior: 'smooth'
            });
        }
    }, 50);
}

function showWeeklyReportModal(report) {
    playSound('reward');
    const reportWeekNum = document.getElementById('report-week-num');
    const reportTasks = document.getElementById('report-tasks');
    const reportXp = document.getElementById('report-xp');
    const reportFocus = document.getElementById('report-focus');

    if(reportWeekNum) reportWeekNum.innerText = report.week;
    if(reportTasks) reportTasks.innerText = report.stats.tasks;
    if(reportXp) reportXp.innerText = report.stats.xp;
    if(reportFocus) reportFocus.innerText = report.stats.focus;

    const modal = document.getElementById('modal-weekly-report');
    const content = document.getElementById('modal-weekly-report-content');
    if(modal && content) {
        modal.classList.remove('hidden'); modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0'); modal.classList.add('modal-overlay-enter');
            content.classList.remove('opacity-0', 'scale-95'); content.classList.add('modal-animate-enter');
        }, 10);
    }
}

function closeWeeklyReport() {
    const modal = document.getElementById('modal-weekly-report');
    if(!modal) return;
    modal.classList.remove('modal-overlay-enter'); modal.classList.add('opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); modal.style.display = 'none'; }, 300);
}

function undoAdvanceWeek() {
    restoreSnapshot(); closeWeeklyReport(); showToast('تم التراجع عن إنهاء الأسبوع بنجاح.', 'info');
}

function renderWeeklyHistory() {
    const container = document.getElementById('ui-weekly-history');
    if (!container) return;
    if (state.weeklyReports.length === 0) {
        container.innerHTML = `<div class="p-6 text-center border-dashed border-2 border-white/10 rounded-2xl opacity-60"><p class="text-sm text-white/70">لم تقم بإنهاء أي أسبوع حتى الآن. استمر في العمل وستظهر تقاريرك هنا.</p></div>`;
        return;
    }
    container.innerHTML = state.weeklyReports.map(report => `
        <div class="glass-panel p-4 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors group">
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <span class="text-xs font-black text-purple-400">${report.week}</span>
                    </div>
                    <h4 class="text-sm font-bold text-white">حصاد الأسبوع</h4>
                </div>
                <span class="text-[10px] text-white/40 font-medium">${report.date}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                    <div class="text-[10px] text-white/50 mb-1">المهام</div>
                    <div class="text-sm font-black text-blue-400">${report.stats.tasks}</div>
                </div>
                <div class="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                    <div class="text-[10px] text-white/50 mb-1">خبرة XP</div>
                    <div class="text-sm font-black text-yellow-400">${report.stats.xp}</div>
                </div>
                <div class="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                    <div class="text-[10px] text-white/50 mb-1">تركيز (د)</div>
                    <div class="text-sm font-black text-emerald-400">${report.stats.focus}</div>
                </div>
            </div>
        </div>
    `).join('');
}

let isAudioInitialized = false;
let synth = null;
let ambientNoise = null;
let isAmbientPlaying = false;

async function initAudio() {
    if (!isAudioInitialized) {
        try {
            await Tone.start();
            synth = new Tone.PolySynth(Tone.Synth).toDestination();
            synth.volume.value = -12;
            isAudioInitialized = true;
        } catch (error) {
            console.warn("Audio initialization prevented by browser policy until user interacts.");
        }
    }
}

async function playSound(type) {
    try {
        if (Tone.context && Tone.context.state !== 'running' && !isAudioInitialized) {
            return; 
        }
        
        await initAudio();
        if (!isAudioInitialized || !synth) return;
        if (Tone.context.state !== 'running') await Tone.context.resume();
        
        if (type === 'success') synth.triggerAttackRelease(["C5", "E5"], "16n");
        else if (type === 'pop') synth.triggerAttackRelease("G4", "32n");
        else if (type === 'reward') {
            const now = Tone.now();
            synth.triggerAttackRelease("C4", "16n", now);
            synth.triggerAttackRelease("E4", "16n", now + 0.1);
            synth.triggerAttackRelease("G4", "16n", now + 0.2);
            synth.triggerAttackRelease("C5", "8n", now + 0.3);
        } else if (type === 'achievement') {
            const now = Tone.now();
            synth.triggerAttackRelease("E4", "8n", now);
            synth.triggerAttackRelease("G4", "8n", now + 0.08);
            synth.triggerAttackRelease("B4", "8n", now + 0.16);
            synth.triggerAttackRelease("E5", "4n", now + 0.24);
        } else if (type === 'hit') synth.triggerAttackRelease("G2", "16n");
        else if (type === 'epic_hit') {
            const now = Tone.now();
            synth.triggerAttackRelease("E2", "8n", now);
            synth.triggerAttackRelease("G2", "8n", now + 0.1);
            synth.triggerAttackRelease("E1", "4n", now + 0.2);
        }
    } catch (error) {
        console.warn("Sound blocked by browser policy.");
    }
}

function toggleAmbientSound() {
    initAudio().then(() => {
        if (Tone.context.state !== 'running') Tone.context.resume();
        
        const btn = document.getElementById('btn-ambient-toggle');
        if (!ambientNoise) {
            const filter = new Tone.Filter(300, "lowpass").toDestination();
            ambientNoise = new Tone.Noise("brown").connect(filter);
            ambientNoise.volume.value = -8; 
        }

        if (isAmbientPlaying) {
            ambientNoise.stop();
            if(btn) {
                btn.classList.replace('text-blue-400', 'text-white/50');
                btn.classList.replace('bg-blue-500/10', 'bg-transparent');
                btn.classList.replace('border-blue-500/30', 'border-white/10');
                btn.innerHTML = `<i data-lucide="wind" class="w-5 h-5"></i><span class="text-sm font-medium">صوت هواء هادئ</span>`;
            }
        } else {
            ambientNoise.start();
            if(btn) {
                btn.classList.replace('text-white/50', 'text-blue-400');
                btn.classList.replace('bg-transparent', 'bg-blue-500/10');
                btn.classList.replace('border-white/10', 'border-blue-500/30');
                btn.innerHTML = `<i data-lucide="wind" class="w-5 h-5"></i><span class="text-sm font-medium">إيقاف الصوت الهادئ</span>`;
            }
        }
        isAmbientPlaying = !isAmbientPlaying;
        lucide.createIcons({ root: btn });
    }).catch(e => console.warn(e));
}

function showToast(message, type = 'info', allowUndo = false, localSnapshot = null) {
    const container = document.getElementById('toast-container');
    if(!container) return;

    const toast = document.createElement('div');
    let iconHtml = '<i data-lucide="info" class="w-5 h-5 text-blue-400"></i>';
    let bgClass = 'bg-blue-500/10 border-blue-500/20';
    
    if (type === 'success') {
        iconHtml = '<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-400"></i>';
        bgClass = 'bg-emerald-500/10 border-emerald-500/20';
    } else if (type === 'reward' || type === 'coin' || type === 'achievement') {
        iconHtml = '<i data-lucide="crown" class="w-5 h-5 text-yellow-400"></i>';
        bgClass = 'bg-yellow-500/10 border-yellow-500/20';
    } else if (type === 'hit' || type === 'epic_hit') {
        iconHtml = '<i data-lucide="swords" class="w-5 h-5 text-red-400"></i>';
        bgClass = 'bg-red-500/10 border-red-500/20';
    }

    toast.className = `flex items-center gap-3 p-3.5 rounded-2xl glass-panel shadow-2xl border ${bgClass} toast-enter pointer-events-auto max-w-[92vw] min-h-[44px]`;
    toast.innerHTML = `<div class="shrink-0 bg-black/40 p-2 rounded-full">${iconHtml}</div><p class="text-sm font-medium text-white flex-1 leading-snug">${escapeHTML(message)}</p>`;

    if (allowUndo) {
        const undoBtn = document.createElement('button');
        undoBtn.className = 'ml-2 shrink-0 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors';
        undoBtn.innerHTML = `<i data-lucide="undo-2" class="w-4 h-4"></i> تراجع`;
        undoBtn.onclick = () => {
            if (localSnapshot) {
                state = JSON.parse(localSnapshot);
                saveState();
                renderTasks(); renderGoals(); renderStore();
                renderStats(); renderJourney(); renderProfile(); renderSchedule(); renderHabits();
                renderWeeklyHistory(); renderHeatmap(); renderErrorBank();
                if (isAudioInitialized && synth) synth.triggerAttackRelease("C3", "16n");
            }
            toast.classList.replace('toast-enter', 'toast-leave');
            setTimeout(() => toast.remove(), 400);
        };
        toast.appendChild(undoBtn);
    }
    container.appendChild(toast);
    lucide.createIcons({ root: toast });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.replace('toast-enter', 'toast-leave');
            setTimeout(() => toast.remove(), 400);
        }
    }, 4000);
}

function keepActiveNavVisible(tabId) {
    const activeNav = document.getElementById(`nav-${tabId}`);
    const navBar = activeNav ? activeNav.closest('nav') : null;
    if (!activeNav || !navBar || window.innerWidth > 767) return;
    requestAnimationFrame(() => {
        activeNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
}

function switchTab(tabId) {
    const navs = ['dashboard', 'goals', 'focus', 'store', 'stats', 'profile', 'schedule', 'exams', 'weaknesses'];
    navs.forEach(nav => {
        const btn = document.getElementById(`nav-${nav}`);
        const section = document.getElementById(`view-${nav}`);
        if (nav === tabId) {
            let activeColor = 'text-blue-400 bg-blue-500/10';
            if(tabId === 'goals') activeColor = 'text-purple-400 bg-purple-500/10';
            if(tabId === 'store') activeColor = 'text-yellow-400 bg-yellow-500/10';
            if(tabId === 'schedule') activeColor = 'text-emerald-400 bg-emerald-500/10';
            if(tabId === 'exams') activeColor = 'text-indigo-400 bg-indigo-500/10';
            if(tabId === 'weaknesses') activeColor = 'text-rose-400 bg-rose-500/10';
            
            if (btn) btn.className = `flex-1 min-w-[50px] min-h-[44px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-inner ${activeColor}`;
            if (section) section.classList.add('active');
        } else {
            if (btn) btn.className = "flex-1 min-w-[50px] min-h-[44px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-white/50 hover:text-white";
            if (section) section.classList.remove('active');
        }
    });

    if (tabId === 'dashboard') { renderTasks(); renderHabits(); }
    if (tabId === 'goals') renderGoals();
    if (tabId === 'store') renderStore();
    if (tabId === 'stats') { renderStats(); renderJourney(); renderProductivityChart(); renderWeeklyHistory(); renderAcademicOverview(); }
    if (tabId === 'profile') { renderProfile(); renderAchievements(); }
    if (tabId === 'schedule') renderSchedule();
    if (tabId === 'exams') renderExams();
    if (tabId === 'weaknesses') renderErrorBank();
    if (tabId === 'focus') { updateStopwatchUI(true); renderHeatmap(); renderStudyTimeTable(); renderRecentSessions(); }
    
    const navBar = document.querySelector('nav');
    if(navBar) lucide.createIcons({ root: navBar });
    keepActiveNavVisible(tabId);
}

function checkAchievements() {
    let unlockedAny = false;
    ACHIEVEMENTS_TEMPLATES.forEach(tmpl => {
        if (state.unlockedAchievements.includes(tmpl.id)) return;
        
        let isConditionMet = false;
        if (tmpl.id === 'first_task' && state.tasks.filter(t => t.completed).length >= 1) isConditionMet = true;
        if (tmpl.id === 'focus_50' && state.totalFocusMinutes >= 50) isConditionMet = true;
        if (tmpl.id === 'streak_3' && state.streak >= 3) isConditionMet = true;
        if (tmpl.id === 'schedule_pro' && (state.lessons.length + state.studyPlan.length) >= 3) isConditionMet = true;
        if (tmpl.id === 'gold_master' && state.coins >= 1000) isConditionMet = true;

        if (isConditionMet) {
            state.unlockedAchievements.push(tmpl.id);
            const granted = RewardService.grant({ id: `achievement:${tmpl.id}`, xp: tmpl.xp, coins: tmpl.xp, meta: { source: 'achievement', achievementId: tmpl.id } });
            unlockedAny = unlockedAny || granted;
            setTimeout(() => { 
                playSound('achievement'); 
                showToast(`🏆 إنجاز جديد مذهل! فتحت وسام "${tmpl.title}" وحصلت على +${tmpl.xp} XP وذهب!`, 'achievement'); 
                triggerStoreEffect('achievement-unlock');
            }, 800);
        }
    });
    if (unlockedAny) updateGlobalUI();
}

function renderAchievements() {
    const container = document.getElementById('ui-achievements-container');
    if (!container) return;
    container.innerHTML = ACHIEVEMENTS_TEMPLATES.map(tmpl => {
        const isUnlocked = state.unlockedAchievements.includes(tmpl.id);
        const rankColor = tmpl.rank === 'ذهبي' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' : tmpl.rank === 'فضي' ? 'text-slate-300 border-slate-500/30 bg-slate-500/5' : 'text-orange-400 border-orange-500/30 bg-orange-500/5';
        
        return `
        <div class="achievement-card glass-panel p-4 rounded-2xl flex items-center gap-3 border ${isUnlocked ? 'border-yellow-500/20 bg-yellow-500/[0.02]' : 'border-white/5 opacity-40'}">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? rankColor : 'bg-white/5 border border-white/10 text-white/40'}">
                <i data-lucide="${tmpl.icon}" class="w-6 h-6"></i>
            </div>
            <div class="flex-1 min-w-0 text-right">
                <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold ${isUnlocked ? 'text-white' : 'text-white/50'} truncate">${tmpl.title}</h4>
                    <span class="text-[8px] font-bold px-1.5 py-0.5 rounded ${rankColor}">${tmpl.rank}</span>
                </div>
                <p class="text-[10px] text-white/40 mt-1 leading-snug">${tmpl.desc}</p>
                ${isUnlocked ? `<span class="text-[9px] text-yellow-400 font-black mt-2 inline-block">+${tmpl.xp} XP/ذهب</span>` : '<span class="text-[9px] text-white/20 mt-2 inline-block">مغلق</span>'}
            </div>
        </div>`;
    }).join('');
    lucide.createIcons({ root: container });
}

function addHabit(e) {
    e.preventDefault();
    const input = document.getElementById('new-habit-input');
    const text = input.value.trim();
    if (!text) return;
    state.habits.unshift({ id: createEntityId(), title: text, completed: false, icon: 'check-square' });
    input.value = ''; input.blur(); saveState(); renderHabits(); showToast('تمت إضافة العادة بنجاح!', 'success');
}

function toggleHabit(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    const localSnapshot = saveSnapshot();
    habit.completed = !habit.completed;

        if (habit.completed) {
        const finalXp = Math.floor(10 * getBoostMultiplier('xp'));
        const finalCoins = Math.floor(10 * getBoostMultiplier('coin'));
        habit.rewardId = createRewardId('habit', `${habit.id}:${getLocalDateStr()}`);
        habit.earnedXp = finalXp;
        habit.earnedCoins = finalCoins;
        
        if (!commitRewardOrRestore(localSnapshot, { id: habit.rewardId, xp: finalXp, coins: finalCoins, meta: { source: 'habit', habitId: habit.id } })) {
            renderHabits();
            showToast('المكافأة مسجلة بالفعل ولم يتم تكرارها.', 'info');
            return;
        }
        state.todayStats.xp += finalXp; state.weeklyStats.xp += finalXp;
        updateHeatmap(finalXp);

        const todayStr = getLocalDateStr();
        if (state.habits.length > 0 && state.habits.every(h => h.completed) && state.lastScholarTicketDate !== todayStr) {
            state.lastScholarTicketDate = todayStr;
            if (!state.store.tickets) state.store.tickets = { scholar: 0, elite: 0, mythic: 0 };
            state.store.tickets.scholar++;
            showToast('أكملت جميع العادات اليومية! حصلت على تذكرة Scholar Ticket 🎟️', 'achievement', true, localSnapshot);
        } else {
            playSound('pop'); showToast(`أحسنت! أتممت عادة اليوم. +${finalXp} XP وذهب`, 'success', true, localSnapshot);
        }
    } else {
        const revXp = habit.earnedXp !== undefined ? habit.earnedXp : 10;
        const revCoins = habit.earnedCoins !== undefined ? habit.earnedCoins : 10;
        
        RewardService.revoke(habit.rewardId, revXp, revCoins);
        habit.rewardId = null;
        state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        updateHeatmap(-revXp);
        showToast('تم التراجع عن العادة', 'info', true, localSnapshot);
    }
    saveState(); renderHabits();
}

function deleteHabit(id, e) {
    e.stopPropagation(); const localSnapshot = saveSnapshot(); 
    const habit = state.habits.find(h => h.id === id);
    if (habit && habit.completed) {
        const revXp = habit.earnedXp !== undefined ? habit.earnedXp : 10;
        const revCoins = habit.earnedCoins !== undefined ? habit.earnedCoins : 10;
        RewardService.revoke(habit.rewardId, revXp, revCoins);
        state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        updateHeatmap(-revXp);
    }
    state.habits = state.habits.filter(h => h.id !== id);
    saveState(); renderHabits(); showToast('تم حذف العادة', 'info', true, localSnapshot);
}

function renderHabits() {
    const container = document.getElementById('ui-habits-container');
    if(!container) return;
    if (state.habits.length === 0) {
        container.innerHTML = `<div class="col-span-full py-4 text-center text-white/30 text-xs">اضف بعض العادات الثابتة لتدعم روتينك اليومي.</div>`;
        return;
    }
    container.innerHTML = state.habits.map(habit => {
        return `
        <div onclick="toggleHabit(${habit.id})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}" class="glass-panel p-3 min-h-[44px] rounded-xl flex items-center justify-between cursor-pointer btn-press border ${habit.completed ? 'border-emerald-500/40 bg-emerald-500/5 opacity-60' : 'border-white/5 hover:bg-white/[0.02]'}">
            <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${habit.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20'}">
                    ${habit.completed ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                </div>
                <span class="text-sm font-semibold truncate ${habit.completed ? 'line-through text-white/40' : 'text-white/90'}">${escapeHTML(habit.title)}</span>
            </div>
            <button onclick="deleteHabit(${habit.id}, event)" aria-label="حذف العادة" class="w-11 h-11 flex items-center justify-center hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors shrink-0"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>`;
    }).join('');
    lucide.createIcons({ root: container });
}

let isZenMode = false;
let wasAmbientPlayingBeforeZen = false;

function toggleZenMode() {
    initAudio().catch(e=>console.warn(e));
    const overlay = document.getElementById('zen-overlay');
    if(!overlay) return;

    if (!isZenMode) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) docElm.requestFullscreen().catch(() => {});
        else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen(); 
        
        setTimeout(() => { overlay.classList.add('zen-active'); }, 20);
        
        wasAmbientPlayingBeforeZen = isAmbientPlaying;
        if (!isAmbientPlaying) toggleAmbientSound();

        isZenMode = true;
        updateStopwatchUI();
    } else {
        overlay.classList.remove('zen-active');
        setTimeout(() => { 
            overlay.classList.add('hidden');
            overlay.style.display = '';
        }, 700);
        
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if(document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        
        if (isAmbientPlaying && !wasAmbientPlayingBeforeZen) toggleAmbientSound();

        isZenMode = false;
    }
    lucide.createIcons({ root: overlay });
}

function updateMainGoal(val) {
    const newVal = val.trim();
    if (newVal === state.mainGoal) return;
    state.mainGoal = newVal; saveState(); updateGlobalUI();
    if (newVal) showToast('تم تحديث هدفك الأعظم! لن نجعلك تنساه أبداً.', 'success');
}

function addBigQuest(event) {
    event.preventDefault();
    const input = document.getElementById('new-goal-input');
    const text = input.value.trim();
    if (!text) return;
    state.goals.unshift({ id: createEntityId(), text, completed: false });
    input.value = ''; input.blur(); saveState(); renderGoals(); showToast('تم إضافة المهمة الكبرى بنجاح!', 'info');
}

function toggleBigQuest(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;
    const localSnapshot = saveSnapshot();
    goal.completed = !goal.completed;
    
    if (goal.completed) {
        const finalXp = Math.floor(500 * getBoostMultiplier('xp'));
        const finalCoins = Math.floor(500 * getBoostMultiplier('coin'));
        goal.rewardId = normalizeRewardId(goal.rewardId, 'goal', goal.id);
        goal.earnedXp = finalXp;
        goal.earnedCoins = finalCoins;

        if (!commitRewardOrRestore(localSnapshot, { id: goal.rewardId, xp: finalXp, coins: finalCoins, meta: { source: 'goal', goalId: goal.id } })) {
            renderGoals();
            showToast('المكافأة مسجلة بالفعل ولم يتم تكرارها.', 'info');
            return;
        }
        state.todayStats.xp += finalXp; state.weeklyStats.xp += finalXp;
        updateHeatmap(100);
        updateDailyStreak(); playSound('reward');
        showToast(`إنجاز أسطوري للمهمة الكبرى! +${finalXp} XP وذهب`, 'success', true, localSnapshot);
    } else {
        const revXp = goal.earnedXp !== undefined ? goal.earnedXp : 500;
        const revCoins = goal.earnedCoins !== undefined ? goal.earnedCoins : 500;

        RewardService.revoke(goal.rewardId, revXp, revCoins);
        goal.rewardId = null;
        state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        updateHeatmap(-100);
        showToast('تم التراجع عن المهمة الكبرى', 'info', true, localSnapshot);
    }
    saveState(); renderGoals();
}

function deleteBigQuest(id, event) {
    event.stopPropagation(); const localSnapshot = saveSnapshot(); 
    const goal = state.goals.find(g => g.id === id);
    if (goal && goal.completed) {
        const revXp = goal.earnedXp !== undefined ? goal.earnedXp : 500;
        const revCoins = goal.earnedCoins !== undefined ? goal.earnedCoins : 500;
        RewardService.revoke(goal.rewardId, revXp, revCoins);
        state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        updateHeatmap(-100);
    }
    state.goals = state.goals.filter(g => g.id !== id);
    saveState(); renderGoals(); showToast('تم الحذف', 'info', true, localSnapshot);
}

function renderGoals() {
    const mainGoalInput = document.getElementById('ui-main-goal-input');
    if(mainGoalInput) mainGoalInput.value = state.mainGoal;
    
    const container = document.getElementById('ui-goals-container');
    if(!container) return;

    if (state.goals.length === 0) {
        container.innerHTML = `<div class="glass-panel rounded-3xl p-8 text-center opacity-70 border-dashed border-2 border-white/10 mt-4"><p class="text-sm text-white/70">لا توجد مهام كبرى حالياً. أضف الامتحانات أو المشاريع الكبيرة هنا.</p></div>`;
        return;
    }
    container.innerHTML = state.goals.map(goal => {
        return `
        <div onclick="toggleBigQuest(${goal.id})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}" class="group glass-panel p-4 min-h-[44px] rounded-2xl flex items-center justify-between cursor-pointer transition-all btn-press border ${goal.completed ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 hover:bg-white/[0.03]'}">
            <div class="flex items-center gap-3 flex-1 overflow-hidden">
                <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.completed ? 'bg-purple-500 border-purple-500' : 'border-white/20'}">
                    ${goal.completed ? '<i data-lucide="star" class="w-4 h-4 text-white"></i>' : '<i data-lucide="target" class="w-4 h-4 text-white/40"></i>'}
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                    <span class="text-base font-bold truncate ${goal.completed ? 'line-through text-purple-200/60' : 'text-white'}">${escapeHTML(goal.text)}</span>
                    <span class="text-[11px] font-bold ${goal.completed ? 'text-purple-400/50' : 'text-purple-400'}">+500 XP</span>
                </div>
            </div>
            <button onclick="deleteBigQuest(${goal.id}, event)" aria-label="حذف المهمة الكبرى" class="w-11 h-11 flex items-center justify-center hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-xl transition-colors shrink-0"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>`;
    }).join('');
    lucide.createIcons({ root: container });
}

function updateUserName(newName) {
    if(newName.trim().length === 0) {
        const nameInput = document.getElementById('ui-profile-name');
        if(nameInput) nameInput.value = state.userName;
        return;
    }
    state.userName = newName.trim(); saveState(); showToast('تم تحديث اسم البطل!', 'success');
}

function selectAvatar(id, reqLvl, reqItem) {
    if (reqItem && (!state.store || !state.store.ownedItems.includes(reqItem))) {
        showToast(`هذا الأفاتار مقفول! يجب شراؤه من المتجر أولاً.`, 'info'); return;
    }
    if (!reqItem && getLevel() < reqLvl) {
        showToast(`هذا الأفاتار مقفول! تحتاج للوصول للمستوى ${reqLvl} لفتحه.`, 'info'); return;
    }
    state.avatarId = id; saveState(); renderProfile(); showToast('تم تغيير هويتك بنجاح!', 'success');
}

function openAvatarStudio(id) {
    const av = AVATARS_DATA.find(a => a.id === id);
    if (!av) return;

    const modal = document.getElementById('modal-avatar-studio');
    const svgContainer = document.getElementById('studio-avatar-svg');
    const titleEl = document.getElementById('studio-avatar-title');
    const descEl = document.getElementById('studio-avatar-desc');
    const rarityEl = document.getElementById('studio-avatar-rarity');
    const actionContainer = document.getElementById('studio-avatar-action-container');
    const glowEl = document.getElementById('studio-avatar-glow');

    if (!modal || !svgContainer) return;

    svgContainer.innerHTML = av.svg;
    
    let storeItem = null;
    if (av.reqItem) {
        storeItem = STORE_CATALOG.find(i => i.id === av.reqItem);
    }

    if (titleEl) titleEl.innerText = storeItem ? storeItem.title : `أفاتار المستوى ${av.reqLvl}`;
    if (descEl) descEl.innerText = storeItem ? storeItem.desc : 'أفاتار أساسي يعكس تقدمك في رحلتك.';

    const rarity = av.type || 'common';
    const rarityColors = {
        'common': 'text-gray-400 border-gray-500/30 bg-gray-500/10',
        'rare': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        'epic': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        'legendary': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        'mythic': 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    };
    const rarityLabels = {
        'common': 'شائع', 'rare': 'نادر', 'epic': 'ملحمي', 'legendary': 'أسطوري', 'mythic': 'خرافي'
    };

    if (rarityEl) {
        rarityEl.className = `absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black border z-10 ${rarityColors[rarity] || rarityColors['common']}`;
        rarityEl.innerText = rarityLabels[rarity] || 'شائع';
    }

    if (glowEl) {
        glowEl.className = `absolute inset-0 rounded-3xl opacity-20 blur-xl bg-${rarity === 'mythic' ? 'rose' : rarity === 'legendary' ? 'yellow' : rarity === 'epic' ? 'purple' : rarity === 'rare' ? 'blue' : 'gray'}-500`;
    }

    const level = getLevel();
    const isLocked = av.reqItem ? (!state.store || !state.store.ownedItems.includes(av.reqItem)) : (level < av.reqLvl);
    const isSelected = state.avatarId === av.id;

    if (actionContainer) {
        if (isSelected) {
            actionContainer.innerHTML = `<button class="w-full py-3 min-h-[44px] rounded-xl bg-white/10 text-white/50 font-bold text-sm cursor-not-allowed">مُستخدم حالياً</button>`;
        } else if (isLocked) {
            if (av.reqItem && storeItem) {
                const canAfford = state.coins >= storeItem.cost;
                actionContainer.innerHTML = `
                    <button onclick="buyStoreItem('${storeItem.id}'); closeAvatarStudio();" class="w-full py-3 min-h-[44px] rounded-xl ${canAfford ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/5 text-white/30 cursor-not-allowed'} font-black text-sm flex justify-center items-center gap-2 btn-press transition-colors">
                        شراء بـ ${storeItem.cost} <i data-lucide="coins" class="w-5 h-5"></i>
                    </button>
                `;
            } else {
                actionContainer.innerHTML = `<button class="w-full py-3 min-h-[44px] rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm cursor-not-allowed">مقفول (يتطلب مستوى ${av.reqLvl})</button>`;
            }
        } else {
            actionContainer.innerHTML = `<button onclick="selectAvatar(${av.id}, ${av.reqLvl}, '${av.reqItem || ''}'); closeAvatarStudio();" class="w-full py-3 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm btn-press transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">تجهيز الأفاتار</button>`;
        }
        lucide.createIcons({ root: actionContainer });
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('modal-overlay-enter');
        const content = document.getElementById('modal-avatar-studio-content');
        if (content) {
            content.classList.remove('opacity-0', 'scale-95');
            content.classList.add('modal-animate-enter');
        }
    }, 10);
}

function closeAvatarStudio() {
    const modal = document.getElementById('modal-avatar-studio');
    if (!modal) return;
    modal.classList.remove('modal-overlay-enter');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }, 300);
}

function renderProfile() {
    const nameInput = document.getElementById('ui-profile-name');
    if(nameInput) nameInput.value = state.userName;
    
    const container = document.getElementById('ui-avatar-grid');
    if(!container) return;

    const level = getLevel();
    
    container.innerHTML = AVATARS_DATA.map(av => {
        const isSelected = state.avatarId === av.id; 
        const isLocked = av.reqItem ? (!state.store || !state.store.ownedItems.includes(av.reqItem)) : (level < av.reqLvl);
        let lockOverlay = '';
        
        if (isLocked) {
            const lockText = av.reqItem ? 'متجر' : `Lvl ${av.reqLvl}`;
            lockOverlay = `<div class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30 rounded-2xl"><i data-lucide="lock" class="w-6 h-6 text-white/80 mb-1"></i><span class="text-[9px] font-bold text-white bg-red-500/80 px-1.5 py-0.5 rounded">${lockText}</span></div>`;
        }

        const decs = isSelected && !isLocked ? getAvatarDecorationsHtml(level, true) : '';
        const aura = isSelected && !isLocked ? getAvatarAuraClass(level) : 'border border-white/10 hover:border-white/30';
        const scale = isSelected ? 'scale-95' : '';

        return `
        <div onclick="openAvatarStudio(${av.id})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}" class="relative aspect-square rounded-2xl cursor-pointer transition-transform btn-press ${scale} ${aura}">
            <div class="w-full h-full rounded-2xl overflow-hidden ${isLocked ? 'locked-avatar' : ''}">
                ${av.svg}
            </div>
            ${decs}
            ${lockOverlay}
        </div>`;
    }).join('');
    lucide.createIcons({ root: container });
}

let resetClickCount = 0;
function requestReset() {
    const btn = document.getElementById('btn-reset-data');
    if(!btn) return;

    if (resetClickCount === 0) {
        resetClickCount++;
        btn.className = "w-full py-3 min-h-[44px] bg-red-600 text-white rounded-xl text-sm font-bold btn-press transition-all animate-pulse";
        btn.innerText = "هل أنت متأكد؟ (اضغط مجدداً للتأكيد)";
        setTimeout(() => {
            resetClickCount = 0;
            btn.className = "w-full py-3 min-h-[44px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold btn-press transition-all";
            btn.innerText = "إعادة تهيئة البيانات (Reset)";
        }, 3000);
    } else {
        state = JSON.parse(JSON.stringify(INITIAL_STATE)); 
        state.version = CURRENT_STATE_VERSION;
        
        clearStopwatchInterval();
        pendingRandomEvent = null;
        stateSnapshot = null;

        saveState();

        refreshCoreViews();

        resetClickCount = 0;
        btn.className = "w-full py-3 min-h-[44px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold btn-press transition-all";
        btn.innerText = "إعادة تهيئة البيانات (Reset)";
        
        switchTab('dashboard'); 
        showToast('تم مسح جميع البيانات والعودة لنقطة الصفر.', 'info');
    }
}

function addTask(event) {
    event.preventDefault();
    const input = document.getElementById('new-task-input');
    const text = input.value.trim();
    if (!text) return;
    const categoryElement = document.querySelector('input[name="taskCategory"]:checked');
    const category = categoryElement ? categoryElement.value : 'study';
    const xpReward = Math.floor(Math.random() * 10) + 15;
    state.tasks.unshift({ id: createEntityId(), text, category, completed: false, xp: xpReward });
    input.value = ''; input.blur(); saveState(); renderTasks(); showToast('تمت الإضافة! توكل على الله.', 'info');
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const localSnapshot = saveSnapshot();
    task.completed = !task.completed;
    
    if (task.completed) {
        const xpMult = getBoostMultiplier('xp');
        const coinMult = getBoostMultiplier('coin');
        const finalXp = Math.floor(task.xp * xpMult);
        const finalCoins = Math.floor(task.xp * coinMult);
        task.rewardId = normalizeRewardId(task.rewardId, 'task', task.id);
        task.earnedXp = finalXp;
        task.earnedCoins = finalCoins;

        if (!commitRewardOrRestore(localSnapshot, { id: task.rewardId, xp: finalXp, coins: finalCoins, meta: { source: 'task', taskId: task.id } })) {
            renderTasks();
            showToast('المكافأة مسجلة بالفعل ولم يتم تكرارها.', 'info');
            return;
        }
        state.stats[task.category] += 1;
        state.todayStats.tasks += 1; state.todayStats.xp += finalXp;
        state.weeklyStats.tasks += 1; state.weeklyStats.xp += finalXp;
        updateHeatmap(finalXp);
        updateDailyStreak(); playSound('success'); showToast(`عاش! +${finalXp} XP وعملة`, 'success', true, localSnapshot);
        triggerStoreEffect('task-complete');
    } else {
        const revXp = task.earnedXp !== undefined ? task.earnedXp : task.xp;
        const revCoins = task.earnedCoins !== undefined ? task.earnedCoins : task.xp;

        RewardService.revoke(task.rewardId, revXp, revCoins);
        task.rewardId = null;
        state.stats[task.category] = Math.max(0, state.stats[task.category] - 1);
        state.todayStats.tasks = Math.max(0, state.todayStats.tasks - 1); state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp);
        state.weeklyStats.tasks = Math.max(0, state.weeklyStats.tasks - 1); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        updateHeatmap(-revXp);
        showToast('تم إلغاء إنجاز المهمة', 'info', true, localSnapshot);
    }
    saveState(); renderTasks();
}

function deleteTask(id, event) {
    event.stopPropagation(); const localSnapshot = saveSnapshot(); 
    const task = state.tasks.find(t => t.id === id);
    if (task && task.completed) {
        const revXp = task.earnedXp !== undefined ? task.earnedXp : task.xp;
        const revCoins = task.earnedCoins !== undefined ? task.earnedCoins : task.xp;
        RewardService.revoke(task.rewardId, revXp, revCoins);
        state.stats[task.category] = Math.max(0, state.stats[task.category] - 1);
        state.todayStats.tasks = Math.max(0, state.todayStats.tasks - 1); state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp);
        state.weeklyStats.tasks = Math.max(0, state.weeklyStats.tasks - 1); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        updateHeatmap(-revXp);
    }
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState(); renderTasks(); showToast('تم حذف المهمة', 'info', true, localSnapshot);
}

function renderTasks() {
    const container = document.getElementById('ui-tasks-container');
    if(!container) return;

    if (state.tasks.length === 0) {
        container.innerHTML = `<div class="glass-panel rounded-3xl p-8 text-center opacity-70 border-dashed border-2 border-white/10 mt-4"><p class="text-sm text-white/70">لا توجد مهام حالياً. أضف مهامك لتصنع أسطورتك!</p></div>`;
        return;
    }
    container.innerHTML = state.tasks.map(task => {
        const style = CATEGORIES[task.category] || CATEGORIES['study'];
        return `
        <div onclick="toggleTask(${task.id})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}" class="group glass-panel p-4 min-h-[44px] rounded-[1.5rem] flex items-center justify-between cursor-pointer transition-all btn-press ${task.completed ? 'opacity-50 bg-white/5' : 'hover:bg-white/[0.03]'}">
            <div class="flex items-center gap-3 flex-1 overflow-hidden">
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? `${style.bgCheck} border-transparent` : 'border-white/20'}">
                    ${task.completed ? '<i data-lucide="check" class="w-4 h-4 text-white"></i>' : ''}
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                    <span class="text-base font-medium truncate ${task.completed ? 'line-through text-white/40' : 'text-white/90'}">${escapeHTML(task.text)}</span>
                    <span class="text-[11px] font-bold ${task.completed ? 'text-white/40' : style.textCheck}">+${task.xp} XP | ${style.label}</span>
                </div>
            </div>
            <button onclick="deleteTask(${task.id}, event)" aria-label="حذف المهمة" class="w-11 h-11 flex items-center justify-center hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-xl transition-colors shrink-0"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>`;
    }).join('');
    lucide.createIcons({ root: container });
}

function formatStudyTimeShort(minutes) {
    if (!minutes) return '0 د';
    if (minutes < 60) return `${minutes} د`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}س ${m}د` : `${h}س`;
}

function updateStopwatchUI(renderIcons = false) {
    const display = document.getElementById('stopwatch-display');
    const spinner = document.getElementById('stopwatch-spinner');
    const pulseBg = document.getElementById('timer-pulse-bg');
    const ringBg = document.getElementById('stopwatch-ring-bg');
    const finishBtn = document.getElementById('btn-stopwatch-finish');
    const toggleBtn = document.getElementById('btn-stopwatch-toggle');
    const resetBtn = document.getElementById('btn-stopwatch-reset');
    const iconToggle = document.getElementById('icon-stopwatch-toggle');
    const subjectLabel = document.getElementById('stopwatch-subject-display');

    if (!display) return;

    let totalMs = state.activeSession.elapsedMs;
    if (state.activeSession.isRunning && state.activeSession.startTime) {
        totalMs += Date.now() - state.activeSession.startTime;
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');

    display.innerText = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    
    const zenDisplay = document.getElementById('timer-display-zen');
    if (zenDisplay) zenDisplay.innerText = display.innerText;

    if (state.activeSession.isRunning) {
        display.classList.add('timer-running');
        if (spinner) spinner.style.opacity = '1';
        if (spinner) spinner.style.transform = `rotate(${(totalSeconds % 60) * 6}deg)`; 
        if (pulseBg) pulseBg.classList.replace('opacity-0', 'opacity-100');
        if (pulseBg) pulseBg.classList.add('animate-pulse');
        if (ringBg) ringBg.classList.add('scale-105', 'border-orange-500/20');
        
        if (finishBtn) finishBtn.classList.remove('opacity-50', 'pointer-events-none', 'scale-95');
        if (resetBtn) resetBtn.classList.remove('opacity-50', 'pointer-events-none', 'scale-95');
        
        if (renderIcons && toggleBtn && iconToggle) {
            toggleBtn.className = "w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 flex justify-center items-center btn-focus-action shadow-[0_0_25px_rgba(249,115,22,0.4)]";
            iconToggle.setAttribute('data-lucide', 'pause');
            iconToggle.classList.remove('ml-1');
            lucide.createIcons({ root: toggleBtn });
        }
        if (subjectLabel) {
            subjectLabel.innerText = "جاري التسجيل...";
            subjectLabel.className = "text-orange-400 font-bold text-xs bg-orange-500/10 px-4 py-2 min-h-[32px] rounded-full border border-orange-500/20 shadow-inner mt-2 animate-pulse transition-all duration-300";
        }
    } else {
        display.classList.remove('timer-running');
        if (spinner) spinner.style.opacity = '0';
        if (pulseBg) pulseBg.classList.replace('opacity-100', 'opacity-0');
        if (pulseBg) pulseBg.classList.remove('animate-pulse');
        if (ringBg) ringBg.classList.remove('scale-105', 'border-orange-500/20');

        if (totalMs > 0) {
            if (finishBtn) finishBtn.classList.remove('opacity-50', 'pointer-events-none', 'scale-95');
            if (resetBtn) resetBtn.classList.remove('opacity-50', 'pointer-events-none', 'scale-95');
            if (subjectLabel) {
                subjectLabel.innerText = "مؤقت متوقف";
                subjectLabel.className = "text-white/50 font-bold text-xs bg-white/5 px-4 py-2 min-h-[32px] rounded-full border border-white/10 mt-2 transition-all duration-300";
            }
        } else {
            if (finishBtn) finishBtn.classList.add('opacity-50', 'pointer-events-none', 'scale-95');
            if (resetBtn) resetBtn.classList.add('opacity-50', 'pointer-events-none', 'scale-95');
            if (subjectLabel) {
                subjectLabel.innerText = "جاهز للبدء";
                subjectLabel.className = "text-blue-400 font-bold text-xs bg-blue-500/10 px-4 py-2 min-h-[32px] rounded-full border border-blue-500/20 shadow-inner mt-2 transition-all duration-300";
            }
        }

        if (renderIcons && toggleBtn && iconToggle) {
            toggleBtn.className = "w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center btn-focus-action shadow-[0_0_25px_rgba(37,99,235,0.4)]";
            iconToggle.setAttribute('data-lucide', 'play');
            iconToggle.classList.add('ml-1');
            lucide.createIcons({ root: toggleBtn });
        }
    }
}

function toggleStopwatch() {
    if (state.activeSession.pendingSave) {
        openSaveSessionModal();
        return;
    }

    initAudio().then(() => {
        if (Tone.context && Tone.context.state !== 'running') Tone.context.resume();
    }).catch(e=>console.warn(e));

    if (state.activeSession.isRunning) {
        state.activeSession.elapsedMs += Date.now() - state.activeSession.startTime;
        state.activeSession.isRunning = false;
        state.activeSession.startTime = null;
        clearStopwatchInterval();
    } else {
        state.activeSession.isRunning = true;
        state.activeSession.startTime = Date.now();
        stopwatchInterval = setInterval(() => updateStopwatchUI(false), 1000);
    }
    saveState();
    updateStopwatchUI(true);
}

function resetStopwatch() {
    if(confirm('هل أنت متأكد من إلغاء هذه الجلسة؟ لن يتم حفظ الوقت.')) {
        state.activeSession = { isRunning: false, startTime: null, elapsedMs: 0, pendingSave: false };
        clearStopwatchInterval();
        saveState();
        updateStopwatchUI(true);
    }
}

function finishSession() {
    if (state.activeSession.pendingSave) {
        openSaveSessionModal();
        return;
    }
    let totalMs = state.activeSession.elapsedMs;
    if (state.activeSession.isRunning && state.activeSession.startTime) totalMs += Date.now() - state.activeSession.startTime;
    let minutes = Math.floor(totalMs / 60000);
    if (minutes < 1) {
        showToast('الجلسة قصيرة جداً (أقل من دقيقة)، لم يتم حفظها.', 'info');
        return;
    }
    if (minutes > 720) {
        minutes = 720;
        totalMs = 720 * 60000;
        showToast('تم تحديد الجلسة بـ 12 ساعة كحد أقصى لمنع التلاعب بالوقت.', 'info');
    }
    state.activeSession.isRunning = false;
    state.activeSession.elapsedMs = totalMs;
    state.activeSession.startTime = null;
    state.activeSession.pendingSave = true;
    clearStopwatchInterval();
    saveState();
    updateStopwatchUI(true);
    openSaveSessionModal();
}

function openSaveSessionModal() {
    const totalMs = state.activeSession && state.activeSession.elapsedMs ? state.activeSession.elapsedMs : 0;
    if (totalMs <= 0) return;
    const h = Math.floor(totalMs / 3600000).toString().padStart(2, '0');
    const m = Math.floor((totalMs % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0');
    const durationEl = document.getElementById('modal-save-duration');
    if (durationEl) durationEl.innerText = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    renderModalSubjects();
    const modal = document.getElementById('modal-save-session');
    const content = document.getElementById('modal-save-session-content');
    if (!modal || !content) return;
    modal.classList.remove('hidden'); modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.remove('opacity-0'); modal.classList.add('modal-overlay-enter');
        content.classList.remove('opacity-0', 'scale-95'); content.classList.add('modal-animate-enter');
    }, 10);
}

function closeSaveSessionModal() {
    const modal = document.getElementById('modal-save-session');
    if (!modal) return;
    const wasPending = !!(state.activeSession && state.activeSession.pendingSave);
    modal.classList.remove('modal-overlay-enter'); modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden'); modal.style.display = 'none';
        if (wasPending) {
            resetActiveSession();
            saveState();
            updateStopwatchUI(true);
        }
    }, 300);
}

function renderModalSubjects() {
    const container = document.getElementById('modal-subject-list');
    if (state.studySubjects.length === 0) {
        container.innerHTML = `<div class="text-center p-4 border border-dashed border-white/20 rounded-xl opacity-70 mb-2"><p class="text-sm text-white/70">لم تقم بإضافة أي مواد بعد. أضف مادتك الأولى بالأسفل لحفظ الجلسة.</p></div>`;
        return;
    }
    
    container.innerHTML = state.studySubjects.map(sub => `
        <button onclick="confirmSaveSession(${sub.id})" class="w-full text-right p-3 min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all flex items-center justify-between group btn-press mb-2">
            <span class="font-bold text-white group-hover:text-blue-400">${escapeHTML(sub.name)}</span>
            <i data-lucide="chevron-left" class="w-5 h-5 text-white/30 group-hover:text-blue-400"></i>
        </button>
    `).join('');
    lucide.createIcons({ root: container });
}

function addStudySubjectFromModal() {
    const input = document.getElementById('new-study-subject-input');
    const name = input.value.trim();
    if (!name) return;
    
    state.studySubjects.push({
        id: createEntityId(),
        name: name,
        totalMinutes: 0,
        weeklyGoal: 0,
        lastStudied: 'لم تُدرس بعد',
        history: []
    });
    input.value = '';
    saveState();
    renderModalSubjects();
    renderStudyTimeTable();
}

function confirmSaveSession(subjectId) {
    if (!state.activeSession || !state.activeSession.pendingSave) return;
    const subject = state.studySubjects.find(s => s.id === subjectId);
    if (!subject) return;

    const totalMs = state.activeSession.elapsedMs;
    const rawMinutes = Math.floor(totalMs / 60000);
    const focusMultiplier = getBoostMultiplier('focus');
    const minutes = Math.floor(rawMinutes * focusMultiplier);
    
    if(!subject.history) subject.history = [];
    
    const todayStr = getLocalDateStr();
    
    const finalXp = Math.floor((minutes * 2) * getBoostMultiplier('xp'));
    const finalCoins = Math.floor((minutes * 1) * getBoostMultiplier('coin'));
    
    const sessionId = createEntityId();
    const rewardId = createRewardId('focus', sessionId);
    const focusSnapshot = saveSnapshot();
    if (!RewardService.grant({ id: rewardId, xp: finalXp, coins: finalCoins, meta: { source: 'focus', subjectId: subject.id, sessionId } })) {
        state = JSON.parse(focusSnapshot);
        renderStudyTimeTable();
        renderRecentSessions();
        showToast('المكافأة مسجلة بالفعل ولم يتم تكرارها.', 'info');
        return;
    }

    subject.history.push({
        id: sessionId,
        date: todayStr,
        minutes: minutes,
        timestamp: Date.now(),
        earnedXp: finalXp,
        earnedCoins: finalCoins,
        rewardId
    });
    
    subject.totalMinutes += minutes;
    subject.lastStudied = new Date().toLocaleDateString('ar-EG');
    state.totalFocusMinutes += minutes;
    state.todayStats.focus += minutes;
    state.weeklyStats.focus += minutes;
    
    updateHeatmap(finalXp);
    updateDailyStreak();
    
    state.activeSession = { isRunning: false, startTime: null, elapsedMs: 0, pendingSave: false };
    
    saveState();
    closeSaveSessionModal();
    updateStopwatchUI(true);
    renderStudyTimeTable();
    renderRecentSessions();
    renderStats();
    renderAcademicOverview();
    
    playSound('reward');
    showToast(`أحسنت! تمت إضافة ${minutes} دقيقة إلى ${subject.name}. +${finalXp} XP`, 'success');
    triggerStoreEffect('focus-complete');
}

function setSubjectWeeklyGoal(id) {
    const subject = state.studySubjects.find(s => s.id === id);
    if (!subject) return;
    const currentGoal = subject.weeklyGoal || 0;
    const input = prompt(`أدخل الهدف الأسبوعي بالدقائق لمادة ${subject.name} (مثال: 120 لساعتين):`, currentGoal);
    if (input !== null && input.trim() !== '') {
        const parsed = parseInt(input, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            subject.weeklyGoal = parsed;
            saveState();
            renderStudyTimeTable();
            showToast('تم تحديث الهدف الأسبوعي بنجاح', 'success');
        } else {
            showToast('قيمة غير صالحة', 'info');
        }
    }
}

function renderStudyTimeTable() {
    const container = document.getElementById('study-subjects-table-body');
    if (!container) return;

    if (state.studySubjects.length === 0) {
        container.innerHTML = `
            <tr><td colspan="6" class="py-10 text-center">
                <div class="flex flex-col items-center justify-center opacity-50">
                    <i data-lucide="book-dashed" class="w-10 h-10 mb-3 text-white/40"></i>
                    <p class="text-sm text-white/70 font-medium">لا توجد مواد مسجلة.</p>
                    <p class="text-xs text-white/40 mt-1">ابدأ جلسة وأضف مادتك الأولى!</p>
                </div>
            </td></tr>
        `;
        lucide.createIcons({ root: container });
        return;
    }

    const sortedSubjects = [...state.studySubjects].sort((a, b) => b.totalMinutes - a.totalMinutes);
    const totalAllMinutes = sortedSubjects.reduce((sum, s) => sum + s.totalMinutes, 0) || 1;

    const todayStr = getLocalDateStr();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    container.innerHTML = sortedSubjects.map(sub => {
        const percent = Math.round((sub.totalMinutes / totalAllMinutes) * 100);
        const todayMins = sub.history?.filter(h => h.date === todayStr).reduce((acc, curr) => acc + curr.minutes, 0) || 0;
        const weeklyMins = sub.history?.filter(h => new Date(h.date) >= sevenDaysAgo).reduce((acc, curr) => acc + curr.minutes, 0) || 0;
        
        const weeklyGoal = sub.weeklyGoal || 0;
        let goalHtml = '';
        if (weeklyGoal > 0) {
            const goalPercent = Math.min(Math.round((weeklyMins / weeklyGoal) * 100), 100);
            goalHtml = `
                <div class="mt-2 w-full max-w-[120px]">
                    <div class="flex justify-between text-[9px] text-white/50 mb-0.5">
                        <span>الهدف الأسبوعي</span>
                        <span class="${weeklyMins >= weeklyGoal ? 'text-emerald-400' : ''}">${weeklyMins} / ${weeklyGoal} د</span>
                    </div>
                    <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full ${weeklyMins >= weeklyGoal ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-1000" style="width: ${goalPercent}%"></div>
                    </div>
                </div>
            `;
        }

        return `
            <tr class="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                <td class="py-3 px-2">
                    <div class="font-bold text-white text-base group-hover:text-blue-400 transition-colors">${escapeHTML(sub.name)}</div>
                    <div class="text-[11px] text-white/40 mb-1">آخر مرة: ${sub.lastStudied || 'لم تُدرس'}</div>
                    ${goalHtml}
                </td>
                <td class="py-3 px-2 text-center text-sm font-bold text-emerald-400">
                    ${formatStudyTimeShort(todayMins)}
                </td>
                <td class="py-3 px-2 text-center text-sm font-bold text-blue-400">
                    ${formatStudyTimeShort(weeklyMins)}
                </td>
                <td class="py-3 px-2 text-center text-sm font-bold text-indigo-400 bg-indigo-500/5 rounded-lg">
                    ${formatStudyTimeShort(sub.totalMinutes)}
                </td>
                <td class="py-3 px-2 text-center w-1/5">
                    <div class="flex items-center justify-center gap-2">
                        <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10 hidden sm:block">
                            <div class="h-full bg-indigo-500 transition-all duration-1000" style="width: ${percent}%"></div>
                        </div>
                        <span class="text-xs text-white/70 font-medium">${percent}%</span>
                    </div>
                </td>
                <td class="py-3 px-2 text-left">
                    <div class="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onclick="setSubjectWeeklyGoal(${sub.id})" aria-label="تحديد الهدف الأسبوعي" class="w-11 h-11 flex items-center justify-center text-white/50 hover:text-emerald-400 transition-all hover:scale-110 btn-press" title="الهدف الأسبوعي"><i data-lucide="target" class="w-5 h-5"></i></button>
                        <button onclick="editStudySubject(${sub.id})" aria-label="تعديل اسم المادة" class="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110 btn-press" title="تعديل الاسم"><i data-lucide="edit-2" class="w-5 h-5"></i></button>
                        <button onclick="deleteStudySubject(${sub.id})" aria-label="حذف المادة" class="w-11 h-11 flex items-center justify-center text-white/50 hover:text-red-400 transition-all hover:scale-110 btn-press" title="حذف"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    lucide.createIcons({ root: container });
}

function renderRecentSessions() {
    const container = document.getElementById('recent-sessions-container');
    if (!container) return;

    let allSessions = [];
    
    if (Array.isArray(state.studySubjects)) {
        state.studySubjects.forEach(sub => {
            if (Array.isArray(sub.history)) {
                sub.history.forEach((session, index) => {
                    if (!session || typeof session !== 'object') return;
                    
                    const safeId = session.id || `${sub.id}_${index}`;
                    const safeTime = Number(session.timestamp) || new Date(session.date).getTime() || 0;
                    
                    allSessions.push({
                        id: safeId,
                        subjectId: sub.id,
                        subjectName: sub.name || 'مادة غير معروفة',
                        minutes: Number(session.minutes) || 0,
                        date: session.date || 'غير معروف',
                        timestamp: safeTime
                    });
                });
            }
        });
    }

    allSessions.sort((a, b) => b.timestamp - a.timestamp);
    const recent = allSessions.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="py-8 flex flex-col items-center justify-center opacity-50">
                <i data-lucide="history" class="w-10 h-10 mb-3 text-orange-400/50"></i>
                <p class="text-sm text-white/70 font-medium">لسه مفيش جلسات مذاكرة</p>
                <p class="text-xs text-white/40 mt-1">ابدأ جلسة تركيز وسجّل أول جلسة ليك هنا.</p>
            </div>
        `;
        lucide.createIcons({ root: container });
        return;
    }

    container.innerHTML = recent.map(session => {
        let dateDisplay = session.date;
        const todayStr = getLocalDateStr();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateStr(yesterday);
        
        let timeString = '';
        if (session.timestamp) {
            const d = new Date(session.timestamp);
            if (!isNaN(d.getTime())) {
                timeString = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            }
        }

        if (session.date === todayStr) {
            dateDisplay = `اليوم ${timeString ? '· ' + timeString : ''}`;
        } else if (session.date === yesterdayStr) {
            dateDisplay = `أمس ${timeString ? '· ' + timeString : ''}`;
        } else {
            dateDisplay = `${session.date} ${timeString ? '· ' + timeString : ''}`;
        }
        const safeDateDisplay = escapeHTML(String(dateDisplay));

        return `
        <div class="session-item flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 min-h-[44px] group">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                    <i data-lucide="flame" class="w-5 h-5 text-orange-400"></i>
                </div>
                <div class="flex flex-col">
                    <span class="font-bold text-base text-white group-hover:text-orange-400 transition-colors">${escapeHTML(session.subjectName)}</span>
                    <span class="text-[11px] text-white/50 font-medium mt-0.5">${safeDateDisplay}</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">${formatStudyTimeShort(session.minutes)}</span>
                <button onclick="deleteSession(${session.subjectId}, '${session.id}')" aria-label="حذف الجلسة" class="w-10 h-10 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all btn-press opacity-50 group-hover:opacity-100" title="حذف الجلسة">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
    lucide.createIcons({ root: container });
}

function _revertSessionTransaction(session) {
    const revXp = session.earnedXp !== undefined ? session.earnedXp : session.minutes * 2;
    const revCoins = session.earnedCoins !== undefined ? session.earnedCoins : session.minutes * 1;

    state.totalFocusMinutes = Math.max(0, state.totalFocusMinutes - session.minutes);
    
    const todayStr = getLocalDateStr();
    if (session.date === todayStr) {
        state.todayStats.focus = Math.max(0, state.todayStats.focus - session.minutes);
    }
    
    const sessionDate = new Date(session.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (sessionDate >= sevenDaysAgo) {
        state.weeklyStats.focus = Math.max(0, state.weeklyStats.focus - session.minutes);
    }

    RewardService.revoke(session.rewardId, revXp, revCoins);

    if (state.heatmapData[session.date]) {
        state.heatmapData[session.date] = Math.max(0, state.heatmapData[session.date] - revXp);
    }
}

function deleteSession(subjectId, sessionId) {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟ سيتم خصم الوقت والخبرة من الإحصائيات.')) return;

    const subject = state.studySubjects.find(s => s.id === subjectId);
    if (!subject) return;

    const sessionIndex = subject.history.findIndex(h => String(h.id) === String(sessionId));
    if (sessionIndex === -1) return;

    const session = subject.history[sessionIndex];
    
    _revertSessionTransaction(session);

    subject.history.splice(sessionIndex, 1);
    subject.totalMinutes = Math.max(0, subject.totalMinutes - session.minutes);

    saveState();
    renderStudyTimeTable();
    renderRecentSessions();
    renderHeatmap();
    updateGlobalUI();
    renderProductivityChart();
    renderStats();
    renderAcademicOverview();

    showToast('تم حذف الجلسة وإعادة حساب الإحصائيات.', 'info');
}

function editStudySubject(id) {
    const subject = state.studySubjects.find(s => s.id === id);
    if (!subject) return;
    const newName = prompt('أدخل الاسم الجديد للمادة:', subject.name);
    if (newName && newName.trim() !== '') {
        subject.name = newName.trim();
        saveState();
        renderStudyTimeTable();
        renderRecentSessions();
        renderStats();
        showToast('تم تحديث اسم المادة بنجاح', 'success');
    }
}

function deleteStudySubject(id) {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم مسح سجل وقتها بالكامل وسيتم خصم الخبرة والوقت المرتبط بجلساتها.')) return;
    
    const subject = state.studySubjects.find(s => s.id === id);
    if (subject && subject.history && Array.isArray(subject.history)) {
        subject.history.forEach(session => {
            _revertSessionTransaction(session);
        });
    }
    
    state.studySubjects = state.studySubjects.filter(s => s.id !== id);
    
    saveState();
    renderStudyTimeTable();
    renderRecentSessions();
    renderHeatmap();
    updateGlobalUI();
    renderProductivityChart();
    renderStats();
    
    showToast('تم حذف المادة وجلساتها بنجاح', 'info');
}

function buyStoreItem(id) {
    const item = STORE_CATALOG.find(i => i.id === id);
    if (!item) return;

    if (storeTransactionLocked) {
        showToast('هناك معاملة قيد التنفيذ، يرجى الانتظار.', 'info');
        return;
    }

    const isPermanent = ['theme', 'title', 'avatar', 'effect'].includes(item.type);
    if (isPermanent && state.store.ownedItems.includes(id)) {
        showToast('أنت تملك هذا العنصر بالفعل!', 'info');
        return;
    }

    if (state.coins < item.cost) {
        showToast(`تحتاج إلى ${item.cost - state.coins} ذهب إضافي.`, 'info');
        return;
    }

    const localSnapshot = saveSnapshot();
    storeTransactionLocked = true;
    try {
        state.coins -= item.cost;

        if (item.type === 'mystery') {
            openMysteryBox(item, localSnapshot);
            return;
        }

        if (isPermanent) {
            state.store.ownedItems.push(id);
            playSound('reward');
            showToast(`تم شراء ${item.title} بنجاح!`, 'success', true, localSnapshot);
            if (item.type === 'avatar') renderProfile();
        } else {
            state.store.consumables.push({ instanceId: createEntityId(), itemId: id });
            playSound('reward');
            showToast(`تم شراء ${item.title}. تجده في خزانة المقتنيات.`, 'success', true, localSnapshot);
        }

        saveState();
        renderStore();
        updateGlobalUI();
    } catch (e) {
        console.error('Store purchase failed, rolling back:', e);
        state = JSON.parse(localSnapshot);
        saveState();
        renderStore();
        updateGlobalUI();
        showToast('تعذر إتمام عملية الشراء، وتمت استعادة رصيدك.', 'info');
    } finally {
        storeTransactionLocked = false;
    }
}

function activateStoreItem(id) {
    const item = STORE_CATALOG.find(i => i.id === id);
    if (!item || !state.store.ownedItems.includes(id)) return;

    if (item.type === 'theme') {
        state.store.activeTheme = id;
        applyTheme();
    } else if (item.type === 'title') {
        state.store.activeTitle = id;
    } else if (item.type === 'avatar') {
        state.avatarId = item.avatarId;
        renderProfile();
    } else if (item.type === 'effect') {
        if (!state.store.activeEffects.includes(id)) {
            state.store.activeEffects.push(id);
        }
    }

    saveState();
    renderStore();
    updateGlobalUI();
    showToast(`تم تفعيل ${item.title}`, 'info');
}

function deactivateStoreItem(id) {
    const item = STORE_CATALOG.find(i => i.id === id);
    if (!item) return;

    if (item.type === 'theme' && state.store.activeTheme === id) {
        state.store.activeTheme = null;
        applyTheme();
    } else if (item.type === 'title' && state.store.activeTitle === id) {
        state.store.activeTitle = null;
    } else if (item.type === 'avatar' && state.avatarId === item.avatarId) {
        const level = getLevel();
        const availableStandard = AVATARS_DATA.filter(a => a.type === 'common' && a.reqLvl <= level);
        const highest = availableStandard.reduce((prev, current) => (prev.id > current.id) ? prev : current, availableStandard[0]);
        state.avatarId = highest ? highest.id : 1;
        renderProfile();
    } else if (item.type === 'effect') {
        state.store.activeEffects = state.store.activeEffects.filter(eId => eId !== id);
    }

    saveState();
    renderStore();
    updateGlobalUI();
}

function consumeItem(instanceId) {
    const index = state.store.consumables.findIndex(c => c.instanceId === instanceId);
    if (index === -1) return;

    const consumable = state.store.consumables[index];
    const item = STORE_CATALOG.find(i => i.id === consumable.itemId);
    if (!item) return;

    const localSnapshot = saveSnapshot();

    if (item.type === 'boost') {
        state.store.consumables.splice(index, 1);
        state.store.activeBoosts.push({
            itemId: item.id,
            expiresAt: Date.now() + item.duration
        });
        playSound('achievement');
        showToast(`تم تفعيل ${item.title}!`, 'success', true, localSnapshot);
    } else if (item.type === 'chest') {
        state.store.consumables.splice(index, 1);
        const opened = openChest(item.chestType, false, true);
        if (!opened) {
            state.store.consumables.splice(index, 0, consumable);
            saveState();
            renderStore();
            updateGlobalUI();
            return;
        }
        return;
    } else if (item.type === 'instant') {
        const rewardId = `consumable:${consumable.instanceId}`;
        state.store.consumables.splice(index, 1);
        if (!RewardService.grant({ id: rewardId, xp: item.grantXp || 0, coins: 0, meta: { source: 'consumable', itemId: item.id, instanceId: consumable.instanceId } })) {
            state = JSON.parse(localSnapshot);
            showToast('تم تسجيل استخدام هذا العنصر بالفعل.', 'info');
            return;
        }
        if (item.grantFocus) {
            state.totalFocusMinutes += item.grantFocus;
            state.todayStats.focus += item.grantFocus;
            state.weeklyStats.focus += item.grantFocus;
        }
        if (item.grantStreak) state.streak += item.grantStreak;
        playSound('achievement');
        showToast(`تم استخدام ${item.title} بنجاح!`, 'success', true, localSnapshot);
    }

    saveState();
    renderStore();
    updateGlobalUI();
}

function openMysteryBox(boxItem, localSnapshot) {
    const cryptoArray = new Uint32Array(1);
    window.crypto.getRandomValues(cryptoArray);
    const rand = cryptoArray[0] / (0xffffffff + 1);
    
    let rewardText = '';
    const rewardSeed = createRewardId('mystery-box', boxItem.id);
    
    if (boxItem.pool === 'small') {
        if (rand < 0.4) {
            RewardService.grant({ id: `mystery:${rewardSeed}:xp300`, xp: 300, coins: 0, meta: { source: 'mystery', pool: boxItem.pool } }); rewardText = '300 XP';
        } else if (rand < 0.8) {
            RewardService.grant({ id: `mystery:${rewardSeed}:coins300`, xp: 0, coins: 300, meta: { source: 'mystery', pool: boxItem.pool } }); rewardText = '300 ذهب';
        } else {
            state.store.consumables.push({ instanceId: createEntityId(), itemId: 'boost_xp_1' });
            rewardText = 'مضاعف الخبرة (ساعة)';
        }
    } else {
        if (rand < 0.33) {
            RewardService.grant({ id: `mystery:${rewardSeed}:xp1000`, xp: 1000, coins: 0, meta: { source: 'mystery', pool: boxItem.pool } }); rewardText = '1000 XP';
        } else if (rand < 0.66) {
            RewardService.grant({ id: `mystery:${rewardSeed}:coins1000`, xp: 0, coins: 1000, meta: { source: 'mystery', pool: boxItem.pool } }); rewardText = '1000 ذهب';
        } else {
            const epicItems = STORE_CATALOG.filter(i => i.rarity === 'epic' && ['theme', 'title'].includes(i.type));
            const randItemIndexArray = new Uint32Array(1);
            window.crypto.getRandomValues(randItemIndexArray);
            const rolledItem = epicItems[randItemIndexArray[0] % epicItems.length];
            
            if (rolledItem && !state.store.ownedItems.includes(rolledItem.id)) {
                state.store.ownedItems.push(rolledItem.id);
                rewardText = rolledItem.title;
            } else {
                RewardService.grant({ id: `mystery:${rewardSeed}:duplicate`, xp: 0, coins: 1500, meta: { source: 'mystery-duplicate', pool: boxItem.pool } });
                rewardText = '1500 ذهب (تعويض عن عنصر مكرر)';
            }
        }
    }

    playSound('epic_hit');
    showToast(`فتحت ${boxItem.title} وحصلت على: ${rewardText} 🎁`, 'achievement', true, localSnapshot);
    saveState();
    renderStore();
    updateGlobalUI();
}

function getDailyStoreOffers() {
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0; 
    }
    const rng = function(seed) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    
    let currentSeed = hash;
    const nextRandom = () => {
        currentSeed++;
        return rng(currentSeed);
    };

    const availableItems = STORE_CATALOG.filter(item => {
        const isPermanent = ['theme', 'title', 'avatar', 'effect'].includes(item.type);
        return !(isPermanent && state.store && state.store.ownedItems.includes(item.id));
    });

    if (availableItems.length === 0) return { featured: STORE_CATALOG[0], deals: [] };

    const featuredIndex = Math.floor(nextRandom() * availableItems.length);
    const featured = availableItems[featuredIndex];
    
    const deals = [];
    const tempItems = [...availableItems];
    tempItems.splice(featuredIndex, 1);
    
    for(let i=0; i<3; i++) {
        if(tempItems.length === 0) break;
        const idx = Math.floor(nextRandom() * tempItems.length);
        deals.push(tempItems[idx]);
        tempItems.splice(idx, 1);
    }
    
    return { featured, deals };
}

function renderStoreFront() {
    const featuredContainer = document.getElementById('ui-store-featured');
    const dealsContainer = document.getElementById('ui-store-daily-deals');
    if(!featuredContainer || !dealsContainer) return;

    const { featured, deals } = getDailyStoreOffers();

    if (featured) {
        const canAfford = state.coins >= featured.cost;
        featuredContainer.innerHTML = `
            <div class="store-featured-card p-6 flex flex-col sm:flex-row items-center gap-6">
                <div class="store-deal-badge">العرض المميز</div>
                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl store-card-icon-bg flex items-center justify-center shrink-0 rarity-${featured.rarity}">
                    <i data-lucide="${featured.icon}" class="w-12 h-12 sm:w-16 sm:h-16 store-card-icon"></i>
                </div>
                <div class="flex-1 text-center sm:text-right">
                    <h3 class="text-2xl font-black text-white mb-2">${featured.title}</h3>
                    <p class="text-sm text-white/70 mb-6 leading-relaxed">${featured.desc}</p>
                    <button onclick="buyStoreItem('${featured.id}')" class="w-full sm:w-auto px-8 py-3 min-h-[44px] rounded-xl ${canAfford ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/5 text-white/30 cursor-not-allowed'} font-black text-sm flex justify-center items-center gap-2 btn-press transition-colors">
                        شراء بـ ${featured.cost} <i data-lucide="coins" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        featuredContainer.innerHTML = '';
    }

    if (deals.length > 0) {
        dealsContainer.innerHTML = deals.map(item => {
            const canAfford = state.coins >= item.cost;
            return `
            <div class="store-card glass-panel p-4 rounded-2xl border border-white/5 rarity-${item.rarity}">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl store-card-icon-bg flex items-center justify-center shrink-0">
                        <i data-lucide="${item.icon}" class="w-6 h-6 store-card-icon"></i>
                    </div>
                    <span class="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded-md border border-red-500/30">صفقة اليوم</span>
                </div>
                <h4 class="text-base font-bold text-white mb-1">${item.title}</h4>
                <p class="text-[11px] text-white/60 leading-relaxed mb-4 flex-1">${item.desc}</p>
                <button onclick="buyStoreItem('${item.id}')" class="w-full py-2 min-h-[44px] rounded-xl ${canAfford ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-white/5 text-white/30 cursor-not-allowed'} font-bold text-sm flex justify-center items-center gap-2 btn-press">
                    شراء بـ ${item.cost} <i data-lucide="coins" class="w-4 h-4"></i>
                </button>
            </div>`;
        }).join('');
    } else {
        dealsContainer.innerHTML = '';
    }
    
    lucide.createIcons({ root: featuredContainer });
    lucide.createIcons({ root: dealsContainer });
}

function renderStoreGrid() {
    const frontView = document.getElementById('ui-store-front');
    const catalogView = document.getElementById('ui-store-catalog');
    const rewardsView = document.getElementById('ui-store-rewards');
    const invView = document.getElementById('ui-store-inventory-view');

    [frontView, catalogView, rewardsView, invView].forEach(v => {
        if (v) { v.classList.add('hidden'); v.classList.remove('flex'); }
    });

    if (currentStoreCategory === 'storefront') {
        if (frontView) { frontView.classList.remove('hidden'); frontView.classList.add('flex'); }
        return;
    } else if (currentStoreCategory === 'catalog') {
        if (catalogView) { catalogView.classList.remove('hidden'); catalogView.classList.add('flex'); }
        
        const grid = document.getElementById('ui-store-grid');
        const emptyState = document.getElementById('ui-store-grid-empty');
        if (!grid) return;

        let items = STORE_CATALOG;
        if (currentCatalogSubtab && currentCatalogSubtab !== 'all') {
            items = items.filter(i => i.category === currentCatalogSubtab);
        }

        if (items.length === 0) {
            grid.innerHTML = '';
            if (emptyState) { emptyState.classList.remove('hidden'); emptyState.classList.add('block'); }
            return;
        } else {
            if (emptyState) { emptyState.classList.add('hidden'); emptyState.classList.remove('block'); }
        }

        grid.innerHTML = items.map(item => {
            const isOwned = state.store.ownedItems.includes(item.id);
            const canAfford = state.coins >= item.cost;
            const isPermanent = ['theme', 'title', 'avatar', 'effect'].includes(item.type);
            
            let isActive = false;
            if (item.type === 'theme') isActive = state.store.activeTheme === item.id;
            if (item.type === 'title') isActive = state.store.activeTitle === item.id;
            if (item.type === 'avatar') isActive = state.avatarId === item.avatarId;
            if (item.type === 'effect') isActive = state.store.activeEffects.includes(item.id);

            let btnHtml = '';
            if (isOwned && isPermanent) {
                if (isActive) {
                    btnHtml = `<button onclick="deactivateStoreItem('${item.id}')" class="w-full py-2 min-h-[56px] rounded-xl bg-white/10 text-white font-bold text-sm btn-press">إلغاء التفعيل</button>`;
                } else {
                    btnHtml = `<button onclick="activateStoreItem('${item.id}')" class="w-full py-2 min-h-[56px] rounded-xl bg-blue-500/20 text-blue-400 font-bold text-sm btn-press">تفعيل</button>`;
                }
            } else {
                btnHtml = `<button onclick="buyStoreItem('${item.id}')" class="w-full py-2 min-h-[56px] rounded-xl ${canAfford ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-white/5 text-white/30 cursor-not-allowed'} font-bold text-sm flex justify-center items-center gap-2 btn-press">
                    شراء بـ ${item.cost} <i data-lucide="coins" class="w-4 h-4"></i>
                </button>`;
            }

            return `
            <div class="store-card glass-panel p-4 rounded-2xl border border-white/5 rarity-${item.rarity} ${isOwned && isPermanent ? 'owned' : ''} ${isActive ? 'active-item' : ''}">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl store-card-icon-bg flex items-center justify-center shrink-0">
                        <i data-lucide="${item.icon}" class="w-6 h-6 store-card-icon"></i>
                    </div>
                    ${isOwned && isPermanent ? `<span class="text-[10px] font-bold bg-white/10 text-white/70 px-2 py-1 rounded-md">مملوك</span>` : ''}
                </div>
                <h4 class="text-base font-bold text-white mb-1">${item.title}</h4>
                <p class="text-[11px] text-white/60 leading-relaxed mb-4 flex-1">${item.desc}</p>
                ${btnHtml}
            </div>`;
        }).join('');
        lucide.createIcons({ root: grid });
        return;
    } else if (currentStoreCategory === 'rewards') {
        if (rewardsView) { rewardsView.classList.remove('hidden'); rewardsView.classList.add('flex'); }
        updateRewardsUI();
        return;
    } else if (currentStoreCategory === 'inventory') {
        if (invView) { invView.classList.remove('hidden'); invView.classList.add('flex'); }
        renderInventoryList();
        return;
    }
}

function renderInventoryList() {
    const invContainer = document.getElementById('ui-inventory-container');
    const invEmpty = document.getElementById('ui-inventory-empty');
    if (!invContainer) return;

    if (!state.store.consumables || state.store.consumables.length === 0) {
        invContainer.innerHTML = '';
        if (invEmpty) { invEmpty.classList.remove('hidden'); invEmpty.classList.add('block'); }
    } else {
        if (invEmpty) { invEmpty.classList.add('hidden'); invEmpty.classList.remove('block'); }
        invContainer.innerHTML = state.store.consumables.map(c => {
            const item = STORE_CATALOG.find(i => i.id === c.itemId);
            if (!item) return '';
            return `
            <div class="glass-panel p-3.5 min-h-[56px] rounded-2xl flex items-center justify-between border border-emerald-500/20 bg-emerald-500/5 group shadow-lg">
                <div class="flex items-center gap-3 flex-1 overflow-hidden">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <i data-lucide="${item.icon}" class="w-5 h-5 text-emerald-400"></i>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <h4 class="text-sm font-bold text-white leading-tight truncate pr-1">${escapeHTML(item.title)}</h4>
                        <span class="text-[10px] text-emerald-400/70 truncate">${item.desc}</span>
                    </div>
                </div>
                <button onclick="consumeItem('${c.instanceId}')" class="px-4 py-2 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 btn-press shrink-0 shadow-md">
                    <i data-lucide="play" class="w-3.5 h-3.5"></i> استخدام
                </button>
            </div>`;
        }).join('');
    }
    lucide.createIcons({ root: invContainer });
}

function renderStore() {
    const storeCoinsMagicEl = document.getElementById('ui-store-coins-magic');
    if (storeCoinsMagicEl) storeCoinsMagicEl.innerText = state.coins;
    
    renderStoreFront();
    renderStoreGrid();
    
    const activeBoostsContainer = document.getElementById('ui-active-boosts-container');
    const activeBoostsSection = document.getElementById('ui-store-active-boosts');
    
    if (activeBoostsContainer && activeBoostsSection) {
        const now = Date.now();
        const active = state.store.activeBoosts.filter(b => b.expiresAt > now);
        
        if (active.length > 0) {
            activeBoostsSection.classList.remove('hidden');
            activeBoostsSection.classList.add('flex');
            
            activeBoostsContainer.innerHTML = active.map(b => {
                const item = STORE_CATALOG.find(i => i.id === b.itemId);
                if (!item) return '';
                const remainingMins = Math.ceil((b.expiresAt - now) / 60000);
                return `
                <div class="glass-panel p-3 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-center gap-3 active-boost-card">
                    <div class="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-white truncate">${item.title}</h4>
                        <p class="text-[10px] text-orange-400 font-bold mt-0.5">ينتهي بعد ${remainingMins} دقيقة</p>
                    </div>
                </div>`;
            }).join('');
        } else {
            activeBoostsSection.classList.add('hidden');
            activeBoostsSection.classList.remove('flex');
        }
    }

    renderInventoryList();
    lucide.createIcons();
}

const IntelligenceEngine = {
    getNeglectWarnings: function() {
        const warnings = [];
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        state.studySubjects.forEach(sub => {
            if (sub.history && sub.history.length > 0) {
                const lastSession = sub.history[sub.history.length - 1];
                const lastTime = Number(lastSession.timestamp) || new Date(lastSession.date).getTime();
                if (now - lastTime > sevenDays) {
                    warnings.push({ icon: 'alert-triangle', text: `مادة "${sub.name}" لم تُدرس منذ أكثر من أسبوع. لا تدعها تتراكم!`, color: 'text-orange-400' });
                }
            }
        });
        return warnings;
    },
    getGoalIntelligence: function() {
        const insights = [];
        state.studySubjects.forEach(sub => {
            if (sub.weeklyGoal > 0) {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const weeklyMins = sub.history?.filter(h => new Date(h.date) >= sevenDaysAgo).reduce((acc, curr) => acc + curr.minutes, 0) || 0;
                const percent = Math.round((weeklyMins / sub.weeklyGoal) * 100);
                if (percent >= 100) {
                    insights.push({ icon: 'check-circle', text: `أنجزت هدفك الأسبوعي في "${sub.name}" (${percent}%). عمل رائع!`, color: 'text-emerald-400' });
                } else if (percent >= 80) {
                    insights.push({ icon: 'trending-up', text: `أنت قريب جداً من هدفك الأسبوعي في "${sub.name}" (${percent}%). واصل!`, color: 'text-blue-400' });
                }
            }
        });
        return insights;
    },
    getStudyRhythm: function(timePeriods) {
        const insights = [];
        if (!timePeriods) return insights;
        let maxTimeMins = 0;
        let bestTime = null;
        for (let p in timePeriods) {
            if (timePeriods[p] > maxTimeMins) {
                maxTimeMins = timePeriods[p];
                bestTime = p;
            }
        }
        if (bestTime && maxTimeMins > 120) {
            insights.push({ icon: 'sun', text: `يبدو أن ذروة نشاطك في فترة ${bestTime}. استغل هذا الوقت للمهام الصعبة.`, color: 'text-yellow-400' });
        }
        return insights;
    },
    getErrorIntelligence: function() {
        const insights = [];
        const errors = state.errorBank.errors;
        if (errors.length === 0) return insights;
        
        const repeated = errors.filter(e => e.repetitionCount > 0);
        if (repeated.length > 3) {
            insights.push({ icon: 'repeat', text: `لديك ${repeated.length} أخطاء متكررة. خصص جلسة لمراجعة بنك الأخطاء قريباً.`, color: 'text-rose-400' });
        }
        
        const mastered = errors.filter(e => e.status === 'mastered');
        if (mastered.length > 0 && mastered.length === errors.length) {
            insights.push({ icon: 'award', text: `لقد أتقنت جميع أخطائك المسجلة! مستوى أسطوري.`, color: 'text-yellow-400' });
        }
        return insights;
    },
    getExamTrends: function() {
        const insights = [];
        state.examSubjects.forEach(sub => {
            if (sub.exams && sub.exams.length >= 2) {
                const sorted = [...sub.exams].sort((a, b) => new Date(a.date) - new Date(b.date));
                const last = sorted[sorted.length - 1];
                const prev = sorted[sorted.length - 2];
                if (last.percentage > prev.percentage + 5) {
                    insights.push({ icon: 'trending-up', text: `مستواك في "${sub.name}" في تصاعد! استمر على هذا النحو.`, color: 'text-emerald-400' });
                } else if (last.percentage < prev.percentage - 10) {
                    insights.push({ icon: 'trending-down', text: `هناك تراجع في درجات "${sub.name}". راجع أخطاءك الأخيرة.`, color: 'text-rose-400' });
                }
            }
        });
        return insights;
    },
    getComebackIntelligence: function() {
        const insights = [];
        if (state.streak === 1 && state.bestStreak > 5) {
            insights.push({ icon: 'shield', text: `عودة حميدة! لقد بدأت سلسلة جديدة. لا تستسلم، يمكنك تجاوز رقمك القياسي (${state.bestStreak}).`, color: 'text-blue-400' });
        }
        return insights;
    }
};

function calculateAdvancedStats() {
    const now = new Date();
    const todayStr = getLocalDateStr(now);
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);

    let allSessions = [];
    let subjectTotals = [];
    let totalAllMinutes = 0;

    state.studySubjects.forEach(sub => {
        let subMins = 0;
        if (sub.history) {
            sub.history.forEach(h => {
                allSessions.push({...h, subjectName: sub.name});
                subMins += h.minutes;
            });
        }
        if (subMins > 0) {
            subjectTotals.push({ name: sub.name, minutes: subMins });
            totalAllMinutes += subMins;
        }
    });

    allSessions.sort((a, b) => a.timestamp - b.timestamp);

    let todaySessions = 0;
    let weeklySessions = 0;
    let monthlySessions = 0;
    let totalMinutes = 0;
    let longestSession = 0;

    let sessionsByDate = {};
    let minutesByDate = {};
    let timePeriods = { 'الصباح': 0, 'الظهيرة': 0, 'المساء': 0, 'الليل': 0 };

    allSessions.forEach(s => {
        const sDate = new Date(s.timestamp);
        if (s.date === todayStr) todaySessions++;
        if (sDate >= sevenDaysAgo) weeklySessions++;
        if (sDate >= thirtyDaysAgo) monthlySessions++;

        totalMinutes += s.minutes;
        if (s.minutes > longestSession) longestSession = s.minutes;

        sessionsByDate[s.date] = (sessionsByDate[s.date] || 0) + 1;
        minutesByDate[s.date] = (minutesByDate[s.date] || 0) + s.minutes;

        const hour = sDate.getHours();
        if (hour >= 5 && hour < 12) timePeriods['الصباح'] += s.minutes;
        else if (hour >= 12 && hour < 17) timePeriods['الظهيرة'] += s.minutes;
        else if (hour >= 17 && hour < 21) timePeriods['المساء'] += s.minutes;
        else timePeriods['الليل'] += s.minutes;
    });

    const avgDuration = allSessions.length > 0 ? Math.round(totalMinutes / allSessions.length) : 0;

    let mostSessionsDay = 0;
    for (let d in sessionsByDate) {
        if (sessionsByDate[d] > mostSessionsDay) mostSessionsDay = sessionsByDate[d];
    }

    let longestDayMins = 0;
    for (let d in minutesByDate) {
        if (minutesByDate[d] > longestDayMins) longestDayMins = minutesByDate[d];
    }

    let bestTime = '--';
    let maxTimeMins = 0;
    for (let p in timePeriods) {
        if (timePeriods[p] > maxTimeMins) {
            maxTimeMins = timePeriods[p];
            bestTime = p;
        }
    }

    subjectTotals.sort((a, b) => b.minutes - a.minutes);
    let distribution = subjectTotals.slice(0, 4).map(s => ({
        name: s.name,
        percent: Math.round((s.minutes / totalAllMinutes) * 100)
    }));

    let score = 0;
    if (allSessions.length > 0) {
        let volScore = Math.min((weeklySessions / 14) * 50, 50);
        let durScore = Math.min((avgDuration / 45) * 50, 50);
        score = Math.round(volScore + durScore);
    }

    let compareText = "لا توجد بيانات سابقة";
    let compareTrend = "neutral";
    if (state.weeklyReports && state.weeklyReports.length > 0) {
        const lastWeekFocus = state.weeklyReports[0].stats.focus || 0;
        const thisWeekFocus = state.weeklyStats.focus || 0;
        if (lastWeekFocus > 0) {
            const diff = Math.round(((thisWeekFocus - lastWeekFocus) / lastWeekFocus) * 100);
            if (diff > 0) { compareText = `+${diff}% عن الأسبوع الماضي`; compareTrend = 'up'; }
            else if (diff < 0) { compareText = `${diff}% عن الأسبوع الماضي`; compareTrend = 'down'; }
            else { compareText = "نفس مستوى الأسبوع الماضي"; }
        }
    }

    return {
        todaySessions, weeklySessions, monthlySessions, avgDuration,
        longestSession, mostSessionsDay, longestDayMins, bestTime,
        distribution, score, compareText, compareTrend,
        totalSessions: allSessions.length,
        timePeriods
    };
}

function generateSmartInsights(stats) {
    let insights = [];
    
    if (!stats || stats.totalSessions === 0) {
        return [{ icon: 'brain', text: 'لسه مفيش بيانات كافية. ابدأ أول جلسة تركيز عشان نقدر نحلل أدائك!', color: 'text-purple-400' }];
    }

    if (stats.bestTime && stats.bestTime !== '--') {
        insights.push({ icon: 'clock', text: `أغلب وقت مذاكرتك بيكون في فترة ${stats.bestTime} — حاول تحط أصعب المهام في الوقت ده.`, color: 'text-blue-400' });
    }

    if (stats.avgDuration >= 40) {
        insights.push({ icon: 'zap', text: `متوسط جلستك ${stats.avgDuration} دقيقة. ممتاز! أنت بتحافظ على تركيز عميق لفترات طويلة.`, color: 'text-yellow-400' });
    } else if (stats.avgDuration > 0 && stats.avgDuration < 25) {
        insights.push({ icon: 'alert-circle', text: `جلساتك قصيرة (متوسط ${stats.avgDuration} دقيقة). جرّب تقنية بومودورو (25 دقيقة) لزيادة التحمل.`, color: 'text-rose-400' });
    }

    if (stats.distribution && stats.distribution.length > 0) {
        const topSubject = stats.distribution[0];
        if (topSubject.percent > 50) {
            insights.push({ icon: 'pie-chart', text: `مادة "${topSubject.name}" واخدة ${topSubject.percent}% من وقتك. تأكد إنك مش ناسي باقي المواد.`, color: 'text-indigo-400' });
        }
    }

    if (stats.compareTrend === 'up') {
        insights.push({ icon: 'trending-up', text: 'أنت بتحقق تقدم ملحوظ ومعدل دراستك زاد عن الأسبوع اللي فات. استمر!', color: 'text-emerald-400' });
    } else if (stats.weeklySessions >= 5) {
        insights.push({ icon: 'flame', text: `أنت ذاكرت ${stats.weeklySessions} جلسات هذا الأسبوع. استمرارية ممتازة!`, color: 'text-orange-400' });
    }

    const l4Neglect = IntelligenceEngine.getNeglectWarnings();
    const l4Goals = IntelligenceEngine.getGoalIntelligence();
    const l4Rhythm = IntelligenceEngine.getStudyRhythm(stats.timePeriods);
    const l4Errors = IntelligenceEngine.getErrorIntelligence();
    const l4Exams = IntelligenceEngine.getExamTrends();
    const l4Comeback = IntelligenceEngine.getComebackIntelligence();

    const allL4 = [...l4Comeback, ...l4Goals, ...l4Neglect, ...l4Rhythm, ...l4Errors, ...l4Exams];
    
    insights = [...insights, ...allL4];

    if (insights.length === 0) {
        insights.push({ icon: 'activity', text: 'أنت تسير بخطى ثابتة. استمر في تسجيل جلسات لمزيد من التحليلات الدقيقة.', color: 'text-emerald-400' });
    }

    return insights.slice(0, 4);
}

function renderStats() {
    const stats = calculateAdvancedStats();

    const setTxt = (id, txt) => { const el = document.getElementById(id); if(el) el.innerText = txt; };
    
    setTxt('stat-performance-score', stats.score);
    const compEl = document.getElementById('stat-performance-compare');
    if (compEl) {
        compEl.innerText = stats.compareText;
        compEl.className = `mt-3 text-xs font-bold px-3 py-1.5 rounded-full border ${stats.compareTrend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : stats.compareTrend === 'down' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/5 text-white/60 border-white/10'}`;
    }

    setTxt('stat-current-level', `Lvl ${getLevel()}`);
    setTxt('stat-xp-progress-text', `${getXpProgress()} / 100 XP`);
    const xpBar = document.getElementById('stat-xp-progress-bar');
    if (xpBar) xpBar.style.width = `${getXpProgress()}%`;

    setTxt('stat-today-sessions', stats.todaySessions);
    setTxt('stat-weekly-sessions', stats.weeklySessions);
    setTxt('stat-monthly-sessions', stats.monthlySessions);
    setTxt('stat-avg-duration', `${stats.avgDuration} د`);

    setTxt('stat-best-time', stats.bestTime);
    setTxt('stat-focus-avg-len', `${stats.avgDuration} د`);
    setTxt('stat-longest-session', `${stats.longestSession} د`);

    setTxt('stat-best-streak', state.bestStreak || state.streak || 0);
    setTxt('stat-most-sessions-day', stats.mostSessionsDay);
    setTxt('stat-longest-day', `${stats.longestDayMins} د`);

    const distContainer = document.getElementById('stat-study-distribution');
    if (distContainer) {
        if (stats.distribution.length === 0) {
            distContainer.innerHTML = `<div class="text-center py-6 opacity-50"><p class="text-xs text-white/60">لا توجد بيانات كافية.</p></div>`;
        } else {
            const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500'];
            distContainer.innerHTML = stats.distribution.map((d, i) => `
                <div class="mb-2">
                    <div class="flex justify-between text-xs font-bold mb-1 text-white/80">
                        <span>${escapeHTML(d.name)}</span>
                        <span>${d.percent}%</span>
                    </div>
                    <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full ${colors[i%colors.length]} stat-bar-fill" style="width: ${d.percent}%"></div>
                    </div>
                </div>
            `).join('');
        }
    }

    const insightsContainer = document.getElementById('stat-smart-insights');
    if (insightsContainer) {
        const insights = generateSmartInsights(stats);
        insightsContainer.innerHTML = insights.map(ins => `
            <div class="bg-black/40 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <i data-lucide="${ins.icon}" class="w-4 h-4 ${ins.color}"></i>
                </div>
                <p class="text-xs text-white/80 leading-relaxed font-medium mt-0.5">${escapeHTML(ins.text)}</p>
            </div>
        `).join('');
        lucide.createIcons({ root: insightsContainer });
    }

    renderRecentSessions();
    renderErrorAnalytics();
}

function renderProductivityChart() {
    const container = document.getElementById('stat-weekly-activity-chart');
    if(!container) return;

    const now = new Date();
    let daysData = [];
    let maxMins = 1; 

    for (let i = 6; i >= 0; i--) {
        let d = new Date(now);
        d.setDate(d.getDate() - i);
        let dStr = getLocalDateStr(d);
        let dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
        
        let mins = 0;
        state.studySubjects.forEach(sub => {
            if (sub.history) {
                sub.history.forEach(h => {
                    if (h.date === dStr) mins += h.minutes;
                });
            }
        });
        if (mins > maxMins) maxMins = mins;
        daysData.push({ dayName, mins });
    }

    container.innerHTML = `
    <div class="flex items-end justify-between h-40 gap-2 sm:gap-3 px-2 w-full pt-4 min-w-[320px]">
        ${daysData.map(data => {
            const heightPercent = Math.max((data.mins / maxMins) * 100, 8); 
            return `
            <div class="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div class="w-full bg-white/5 rounded-t-lg rounded-b-lg relative flex items-end justify-center h-full hover:bg-white/10 transition-colors border border-white/5">
                    <div class="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg rounded-b-lg transition-all duration-1000 ease-out relative group-hover:from-blue-500 group-hover:to-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]" style="height: ${heightPercent}%;">
                        <div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-xs font-bold text-white px-2 py-1 rounded shadow-lg pointer-events-none border border-white/10 z-10">${data.mins}د</div>
                    </div>
                </div>
                <span class="text-[10px] font-bold text-white/50">${data.dayName}</span>
            </div>`;
        }).join('')}
    </div>`;
}

function renderJourney() {
    const container = document.getElementById('ui-timeline');
    if(!container) return;

    let stageName = STAGES.find(s => state.currentWeek >= s.weeks[0] && state.currentWeek <= s.weeks[1])?.name || STAGES[0].name;

    let gridHTML = '<div class="flex flex-wrap justify-center gap-2 p-2">';
    for (let i = 1; i <= 52; i++) {
        let isCompleted = i < state.currentWeek;
        let isCurrent = i === state.currentWeek;

        let bgClass = 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10';
        
        if (isCompleted) {
            bgClass = 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]';
        } else if (isCurrent) {
            bgClass = 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse ring-2 ring-yellow-400/50';
        }

        gridHTML += `
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center text-xs sm:text-sm font-black transition-all ${bgClass} relative group cursor-default" title="الأسبوع ${i}">
            ${i}
            ${isCurrent ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div><div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>' : ''}
        </div>`;
    }
    gridHTML += '</div>';

    container.innerHTML = `
        <div class="text-center mb-6">
            <span class="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-sm font-bold text-white/80 shadow-inner">
                <i data-lucide="map" class="w-4 h-4 text-blue-400"></i> المرحلة الحالية: <span class="text-white">${stageName}</span>
            </span>
        </div>
        ${gridHTML}
    `;
    lucide.createIcons({ root: container });
}

let advanceWeekClickCount = 0;
function confirmAdvanceWeek() {
    if (state.currentWeek >= 52) return showToast('لقد أنهيت السنة بنجاح أسطوري!', 'success');
    const btn = document.getElementById('btn-advance-week');
    if(!btn) return;

    if (advanceWeekClickCount === 0) {
        advanceWeekClickCount++;
        btn.dataset.originalHtml = btn.innerHTML;
        
        btn.className = "w-full py-3.5 min-h-[44px] bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-xl font-bold text-sm btn-press transition-all flex items-center justify-center gap-2 animate-pulse";
        btn.innerHTML = `<span>هل أنت متأكد من إنهاء الأسبوع؟</span><i data-lucide="help-circle" class="w-5 h-5"></i>`;
        lucide.createIcons({ root: btn });

        setTimeout(() => {
            if (advanceWeekClickCount > 0) {
                advanceWeekClickCount = 0;
                btn.className = "w-full py-3.5 min-h-[44px] bg-white hover:bg-gray-200 text-black rounded-xl font-bold text-sm btn-press transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]";
                btn.innerHTML = btn.dataset.originalHtml;
                lucide.createIcons({ root: btn });
            }
        }, 3000);
    } else {
        advanceWeekClickCount = 0;
        btn.className = "w-full py-3.5 min-h-[44px] bg-white hover:bg-gray-200 text-black rounded-xl font-bold text-sm btn-press transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]";
        btn.innerHTML = btn.dataset.originalHtml;
        lucide.createIcons({ root: btn });
        
        advanceWeek();
    }
}

function advanceWeek() {
    saveSnapshot(); 
    
    const report = {
        id: Date.now(),
        week: state.currentWeek,
        date: new Date().toLocaleDateString('ar-EG'),
        stats: { ...state.weeklyStats }
    };
    
    state.weeklyReports.unshift(report);
    state.weeklyStats = { tasks: 0, xp: 0, focus: 0 };
    state.productivity = { 'السبت': 0, 'الأحد': 0, 'الإثنين': 0, 'الثلاثاء': 0, 'الأربعاء': 0, 'الخميس': 0, 'الجمعة': 0 };

    if (!state.store.tickets) state.store.tickets = { scholar: 0, elite: 0, mythic: 0 };
    state.store.tickets.elite++;

    state.currentWeek += 1;
    
    const finalXp = Math.floor(200 * getBoostMultiplier('xp'));
    const finalCoins = Math.floor(200 * getBoostMultiplier('coin'));
    state.xp += finalXp; 
    state.coins += finalCoins;
    
    saveState(); 
    renderJourney(); 
    renderWeeklyHistory();
    updateGlobalUI();
    
    showWeeklyReportModal(report);
}

let activeScheduleTab = 'lessons'; 
let selectedScheduleDay = 'السبت';
const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function setScheduleTab(tab) {
    activeScheduleTab = tab;
    const btnLessons = document.getElementById('tab-lessons'); const btnStudy = document.getElementById('tab-study');
    if(!btnLessons || !btnStudy) return;

    if (tab === 'lessons') {
        btnLessons.className = "flex-1 py-2 min-h-[44px] text-sm font-bold rounded-lg transition-all bg-emerald-500 text-white shadow-md";
        btnStudy.className = "flex-1 py-2 min-h-[44px] text-sm font-bold rounded-lg transition-all text-white/50 hover:text-white";
        document.getElementById('schedule-header-icon').setAttribute('data-lucide', 'calendar-days');
        document.getElementById('schedule-header-title').innerText = "الدروس والمواعيد";
        document.getElementById('schedule-glow').className = "absolute left-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none";
        document.getElementById('btn-add-schedule').className = "w-11 h-11 min-w-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center btn-press shrink-0 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    } else {
        btnStudy.className = "flex-1 py-2 min-h-[44px] text-sm font-bold rounded-lg transition-all bg-indigo-500 text-white shadow-md";
        btnLessons.className = "flex-1 py-2 min-h-[44px] text-sm font-bold rounded-lg transition-all text-white/50 hover:text-white";
        document.getElementById('schedule-header-icon').setAttribute('data-lucide', 'book-open');
        document.getElementById('schedule-header-title').innerText = "خطة المذاكرة";
        document.getElementById('schedule-glow').className = "absolute left-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none";
        document.getElementById('btn-add-schedule').className = "w-11 h-11 min-w-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center btn-press shrink-0 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]";
    }
    lucide.createIcons(); renderScheduleDays(); renderScheduleItems();
}

function renderScheduleDays() {
    const container = document.getElementById('ui-schedule-days');
    if(!container) return;
    container.innerHTML = DAYS.map(day => {
        const isSel = day === selectedScheduleDay;
        const activeColor = activeScheduleTab === 'lessons' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
        return `<button onclick="selectedScheduleDay = '${day}'; renderScheduleDays(); renderScheduleItems();" class="px-4 py-2 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-bold border transition-all shrink-0 ${isSel ? activeColor : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}">${day}</button>`;
    }).join('');
}

function addScheduleItem(e) {
    e.preventDefault();
    const inputTitle = document.getElementById('new-schedule-title');
    const inputTime = document.getElementById('new-schedule-time');
    const inputPaymentDate = document.getElementById('new-schedule-payment-date');
    if(!inputTitle || !inputTime) return;

    const title = inputTitle.value.trim();
    const time = inputTime.value.trim();
    const initialPaymentDate = inputPaymentDate ? inputPaymentDate.value : '';
    if(!title) return;

    const list = activeScheduleTab === 'lessons' ? state.lessons : state.studyPlan;
    
    let newItem = { id: createEntityId(), day: selectedScheduleDay, title, time, completed: false };
    
    if (initialPaymentDate) {
        newItem.lastPaymentDate = initialPaymentDate;
        newItem.paymentDate = getNextPaymentDate(initialPaymentDate);
    }
    
    list.push(newItem);
    
    inputTitle.value = ''; inputTime.value = '';
    if(inputPaymentDate) inputPaymentDate.value = '';
    saveState(); renderScheduleItems(); showToast('تمت الإضافة للجدول بنجاح!', 'success');
}

function openRecordPaymentModal(id, e) {
    e.stopPropagation();
    const list = activeScheduleTab === 'lessons' ? state.lessons : state.studyPlan;
    const item = list.find(i => i.id === id);
    if(!item) return;
    
    const modal = document.getElementById('modal-record-payment');
    const content = document.getElementById('modal-record-payment-content');
    const dateInput = document.getElementById('record-payment-date');
    const idInput = document.getElementById('record-payment-item-id');
    
    if(!modal || !content || !dateInput || !idInput) return;
    
    idInput.value = id;
    dateInput.value = getLocalDateStr(); 
    
    modal.classList.remove('hidden'); modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.remove('opacity-0'); modal.classList.add('modal-overlay-enter');
        content.classList.remove('opacity-0', 'scale-95'); content.classList.add('modal-animate-enter');
    }, 10);
}

function closeRecordPaymentModal() {
    const modal = document.getElementById('modal-record-payment');
    if(!modal) return;
    modal.classList.remove('modal-overlay-enter'); modal.classList.add('opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); modal.style.display = 'none'; }, 300);
}

function confirmRecordPayment() {
    const dateInput = document.getElementById('record-payment-date');
    const idInput = document.getElementById('record-payment-item-id');
    if(!dateInput || !idInput) return;
    
    const actualDate = dateInput.value;
    const id = parseInt(idInput.value, 10);
    
    if(!actualDate) {
        showToast('يرجى إدخال تاريخ الدفع الفعلي.', 'info');
        return;
    }
    
    const list = activeScheduleTab === 'lessons' ? state.lessons : state.studyPlan;
    const item = list.find(i => i.id === id);
    if(!item) return;
    
    item.lastPaymentDate = actualDate;
    item.paymentDate = getNextPaymentDate(actualDate);
    
    if (item.hasOwnProperty('isPaid')) {
        delete item.isPaid;
    }
    
    saveState();
    renderScheduleItems();
    closeRecordPaymentModal();
    showToast('تم تسجيل الدفع وبدء دورة شهرية جديدة بنجاح!', 'success');
}

function toggleScheduleItem(id) {
    const list = activeScheduleTab === 'lessons' ? state.lessons : state.studyPlan;
    const item = list.find(i => i.id === id);
    if(!item) return;
    const localSnapshot = saveSnapshot(); 
    item.completed = !item.completed;
    if(item.completed) { 
        const finalXp = Math.floor(20 * getBoostMultiplier('xp'));
        const finalCoins = Math.floor(10 * getBoostMultiplier('coin'));
        item.rewardId = normalizeRewardId(item.rewardId, 'schedule', item.id);
        item.earnedXp = finalXp;
        item.earnedCoins = finalCoins;

        if (!commitRewardOrRestore(localSnapshot, { id: item.rewardId, xp: finalXp, coins: finalCoins, meta: { source: 'schedule', itemId: item.id } })) {
            renderScheduleItems();
            showToast('المكافأة مسجلة بالفعل ولم يتم تكرارها.', 'info');
            return;
        }
        state.todayStats.xp += finalXp; state.weeklyStats.xp += finalXp;
        playSound('pop'); showToast(`+${finalXp} XP ، استمر يا بطل!`, 'success', true, localSnapshot); 
    } else { 
        const revXp = item.earnedXp !== undefined ? item.earnedXp : 20;
        const revCoins = item.earnedCoins !== undefined ? item.earnedCoins : 10;

        RewardService.revoke(item.rewardId, revXp, revCoins);
        item.rewardId = null;
        state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
        showToast('تم التراجع', 'info', true, localSnapshot);
    }
    saveState(); renderScheduleItems();
}

function deleteScheduleItem(id, e) {
    e.stopPropagation(); const localSnapshot = saveSnapshot();
    const list = activeScheduleTab === 'lessons' ? state.lessons : state.studyPlan;
    const item = list.find(i => i.id === id);
    if (item && item.completed) {
        const revXp = item.earnedXp !== undefined ? item.earnedXp : 20;
        const revCoins = item.earnedCoins !== undefined ? item.earnedCoins : 10;
        RewardService.revoke(item.rewardId, revXp, revCoins);
        state.todayStats.xp = Math.max(0, state.todayStats.xp - revXp); state.weeklyStats.xp = Math.max(0, state.weeklyStats.xp - revXp);
    }
    if (activeScheduleTab === 'lessons') state.lessons = state.lessons.filter(i => i.id !== id);
    else state.studyPlan = state.studyPlan.filter(i => i.id !== id);
    saveState(); renderScheduleItems(); showToast('تم الحذف', 'info', true, localSnapshot);
}

function renderScheduleItems() {
    const container = document.getElementById('ui-schedule-items');
    if(!container) return;

    const list = activeScheduleTab === 'lessons' ? state.lessons : state.studyPlan;
    const dayItems = list.filter(i => i.day === selectedScheduleDay);
    const colorClass = activeScheduleTab === 'lessons' ? 'emerald' : 'indigo';
    
    if(dayItems.length === 0) {
        container.innerHTML = `<div class="glass-panel p-6 rounded-2xl text-center opacity-60 border-dashed border-2 border-white/10 mt-2"><p class="text-sm text-white/70">لا توجد عناصر مضافة ليوم ${selectedScheduleDay}</p></div>`;
        return;
    }
    
    container.innerHTML = dayItems.map(item => {
        let paymentHtml = '';
        
        if (item.paymentDate) {
            let statusClass = 'payment-status-normal';
            let statusText = '';

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const pDate = new Date(item.paymentDate);
            pDate.setHours(0, 0, 0, 0);
            
            const diffTime = pDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                statusClass = 'payment-status-overdue';
                statusText = 'متأخر عن الدفع';
            } else if (diffDays === 0) {
                statusClass = 'payment-status-due';
                statusText = 'مستحق اليوم';
            } else if (diffDays <= 3) {
                statusClass = 'payment-status-soon';
                statusText = 'مستحق قريباً';
            } else if (diffDays <= 7) {
                statusClass = 'payment-status-upcoming';
                statusText = 'مستحق خلال أسبوع';
            } else {
                statusClass = 'payment-status-normal';
                statusText = `موعد الدفع: ${new Date(item.paymentDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}`;
            }

            paymentHtml = `
                <div class="payment-info-container">
                    <span class="payment-status-badge ${statusClass}">
                        <i data-lucide="credit-card" class="w-3 h-3"></i> ${statusText}
                    </span>
                    <button onclick="openRecordPaymentModal(${item.id}, event)" class="btn-record-payment">
                        <i data-lucide="calendar-check" class="w-3 h-3"></i> تسجيل الدفع
                    </button>
                </div>
            `;
        }

        return `
        <div onclick="toggleScheduleItem(${item.id})" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}" class="glass-panel p-3.5 min-h-[44px] rounded-2xl flex items-center justify-between cursor-pointer btn-press border ${item.completed ? `border-${colorClass}-500/40 bg-${colorClass}-500/10 opacity-60` : 'border-white/5 hover:bg-white/[0.02]'}">
            <div class="flex items-center gap-3 flex-1 overflow-hidden">
                <div class="w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${item.completed ? `bg-${colorClass}-500 border-${colorClass}-500 text-white` : 'border-white/20'}">
                    ${item.completed ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                </div>
                <div class="flex flex-col min-w-0 w-full">
                    <span class="text-base font-bold truncate ${item.completed ? 'line-through text-white/40' : 'text-white/90'}">${escapeHTML(item.title)}</span>
                    ${item.time ? `<span class="text-xs text-${colorClass}-400 font-medium flex items-center gap-1 mt-0.5"><i data-lucide="clock" class="w-3 h-3"></i> ${escapeHTML(item.time)}</span>` : ''}
                    ${paymentHtml}
                </div>
            </div>
            <button onclick="deleteScheduleItem(${item.id}, event)" aria-label="حذف المادة" class="w-11 h-11 flex items-center justify-center hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors shrink-0"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>`;
    }).join('');
    lucide.createIcons({ root: container });
}

function renderSchedule() { renderScheduleDays(); renderScheduleItems(); }

function updateGlobalUI() {
    const level = getLevel();
    
    const headerName = document.getElementById('ui-header-name');
    const headerLevel = document.getElementById('ui-header-level');
    const headerCoins = document.getElementById('ui-header-coins');
    const headerStreak = document.getElementById('ui-header-streak');
    const headerWeek = document.getElementById('ui-header-week');

    if(headerName) {
        let titleHtml = '';
        if (state.store && state.store.activeTitle) {
            const titleItem = STORE_CATALOG.find(i => i.id === state.store.activeTitle);
            if (titleItem) {
                titleHtml = `<span class="text-[10px] text-yellow-400 ml-2 border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 rounded align-middle">${titleItem.label}</span>`;
            }
        }
        headerName.innerHTML = `${escapeHTML(state.userName)}${titleHtml}`;
    }
    
    if(headerLevel) headerLevel.innerText = `Lvl ${level}`;
    if(headerCoins) headerCoins.innerText = state.coins;
    if(headerStreak) headerStreak.innerText = state.streak;
    if(headerWeek) headerWeek.innerText = state.currentWeek;
    
    const xpTextStr = `${getXpProgress()} / 100`;
    const xpTextEl = document.getElementById('ui-xp-text');
    const xpBarEl = document.getElementById('ui-xp-bar');
    
    if(xpTextEl) xpTextEl.innerText = xpTextStr;
    if(xpBarEl) xpBarEl.style.width = `${getXpProgress()}%`;
    
    const streakIcon = document.getElementById('streak-icon');
    if(streakIcon) {
        if(state.streak > 0) streakIcon.classList.add('text-orange-400', 'fill-orange-400/50');
        else streakIcon.classList.remove('fill-orange-400/50');
    }

    const av = AVATARS_DATA.find(a => a.id === state.avatarId) || AVATARS_DATA[0];
    
    const headerAvatarContainer = document.getElementById('ui-header-avatar-container');
    if(headerAvatarContainer) {
        const headerDecs = getAvatarDecorationsHtml(level, true); 
        const headerAura = getAvatarAuraClass(level);
        headerAvatarContainer.innerHTML = `
            <div class="w-full h-full rounded-xl overflow-hidden ${headerAura} bg-white/5 flex items-center justify-center relative">
                ${av.svg}
            </div>
            ${headerDecs}
        `;
    }
    
    const mainGoalBanner = document.getElementById('ui-main-goal-banner');
    const mainGoalText = document.getElementById('ui-main-goal-text');
    
    if (mainGoalBanner && mainGoalText) {
        if (state.mainGoal) {
            mainGoalBanner.classList.remove('hidden');
            mainGoalBanner.classList.add('flex');
            mainGoalText.innerText = state.mainGoal;
        } else {
            mainGoalBanner.classList.add('hidden');
            mainGoalBanner.classList.remove('flex');
        }
    }

    // Dashboard academic overview is derived from current state; nothing is persisted.
    renderAcademicOverview();
    
    const headerEl = document.querySelector('header');
    if(headerEl) lucide.createIcons({ root: headerEl });
}

function addExamSubject(e) {
    e.preventDefault();
    const inputEl = document.getElementById('new-subject-name');
    if (!inputEl) return;
    
    const subjectName = inputEl.value.trim();
    if (!subjectName) return;
    
    const newSubject = {
        id: createEntityId(),
        name: subjectName,
        exams: [],
        totalGrade: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0
    };
    
    state.examSubjects.push(newSubject);
    inputEl.value = '';
    saveState();
    renderExams();
    showToast(`تمت إضافة مادة "${subjectName}" بنجاح! 📚`, 'success');
}

function addExamResult(subjectId, e) {
    e.preventDefault();
    const subject = state.examSubjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const form = e.target;
    const examNameInput = form.querySelector('[data-exam-name]');
    const gradeInput = form.querySelector('[data-exam-grade]');
    const totalInput = form.querySelector('[data-exam-total]');
    const dateInput = form.querySelector('[data-exam-date]');
    
    if (!examNameInput || !gradeInput || !totalInput) return;
    
    const examName = examNameInput.value.trim();
    const grade = parseFloat(gradeInput.value);
    const totalGrade = parseFloat(totalInput.value);
    const examDate = dateInput.value || getLocalDateStr();
    
    if (!examName || !isFinite(grade) || !isFinite(totalGrade) || grade < 0 || totalGrade <= 0 || grade > totalGrade) {
        showToast('تأكد من إدخال البيانات بشكل صحيح!', 'info');
        return;
    }
    
    const percentage = (grade / totalGrade) * 100;
    const examId = createEntityId();
    const rewardId = createRewardId('exam', examId);
    const newExam = {
        id: examId,
        name: examName,
        grade: grade,
        totalGrade: totalGrade,
        percentage: Math.round(percentage * 10) / 10,
        date: examDate,
        rewardId,
        earnedXp: Math.floor((Math.floor(percentage / 10) * 50) * getBoostMultiplier('xp')),
        earnedCoins: Math.floor((Math.floor(percentage / 10) * 10) * getBoostMultiplier('coin'))
    };
    
    const finalXp = newExam.earnedXp;
    const finalCoins = newExam.earnedCoins;
    if (!RewardService.grant({ id: rewardId, xp: finalXp, coins: finalCoins, meta: { source: 'exam', subjectId: subject.id, examId } })) {
        showToast('هذه المكافأة موجودة بالفعل ولم يتم تكرارها.', 'info');
        return;
    }
    subject.exams.push(newExam);
    updateSubjectStats(subject);
    
    examNameInput.value = '';
    gradeInput.value = '';
    totalInput.value = '';
    dateInput.value = '';
    
    saveState();
    renderExams();
    showToast(`تم إضافة نتيجة "${examName}" بنجاح! +${finalXp} XP و +${finalCoins} عملة 🎉`, 'success');
}

function updateSubjectStats(subject) {
    if (subject.exams.length === 0) {
        subject.totalGrade = 0;
        subject.averageGrade = 0;
        subject.highestGrade = 0;
        subject.lowestGrade = 0;
        return;
    }
    
    const percentages = subject.exams.map(e => e.percentage);
    subject.averageGrade = Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10) / 10;
    subject.highestGrade = Math.max(...percentages);
    subject.lowestGrade = Math.min(...percentages);
    subject.totalGrade = subject.exams.reduce((sum, e) => sum + e.grade, 0);
}

function deleteExamResult(subjectId, examId) {
    const subject = state.examSubjects.find(s => s.id === subjectId);
    if (!subject) return;
    const exam = subject.exams.find(e => e.id === examId);
    if (!exam) return;
    if (exam.rewardId) {
        const revXp = Number.isFinite(exam.earnedXp) ? exam.earnedXp : 0;
        const revCoins = Number.isFinite(exam.earnedCoins) ? exam.earnedCoins : 0;
        RewardService.revoke(exam.rewardId, revXp, revCoins);
    }
    subject.exams = subject.exams.filter(e => e.id !== examId);
    updateSubjectStats(subject);
    saveState();
    renderExams();
    showToast('تم حذف النتيجة بنجاح!', 'success');
}

function deleteExamSubject(subjectId) {
    if (!confirm('هل أنت متأكد من حذف هذه المادة وجميع نتائجها؟')) return;
    
    const subject = state.examSubjects.find(s => s.id === subjectId);
    if (!subject) return;
    if (Array.isArray(subject.exams)) {
        subject.exams.forEach(exam => {
            if (exam && exam.rewardId) {
                RewardService.revoke(exam.rewardId, Number.isFinite(exam.earnedXp) ? exam.earnedXp : 0, Number.isFinite(exam.earnedCoins) ? exam.earnedCoins : 0);
            }
        });
    }
    state.examSubjects = state.examSubjects.filter(s => s.id !== subjectId);
    saveState();
    renderExams();
    showToast('تم حذف المادة بنجاح!', 'success');
}

function getGradeColor(percentage) {
    if (percentage >= 90) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'ممتاز' };
    if (percentage >= 80) return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'جيد جداً' };
    if (percentage >= 70) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'جيد' };
    if (percentage >= 60) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'مقبول' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'ضعيف' };
}

/**
 * تقدير نطاق النتيجة النهائية بناءً على نسب الامتحانات المسجلة فقط.
 * لا نُخزّن الناتج؛ يتم اشتقاقه لحظيًا حتى يظل متزامنًا مع البيانات المحفوظة.
 * النطاق ضيق ومفهوم للطالب؛ الفرق بين حديه لا يتجاوز 5 نقاط مئوية.
 */
function calculateProjectedPercentage() {
    const percentages = [];
    state.examSubjects.forEach(subject => {
        if (!subject || !Array.isArray(subject.exams)) return;
        subject.exams.forEach(exam => {
            const pct = Number(exam?.percentage);
            if (Number.isFinite(pct) && pct >= 0 && pct <= 100) percentages.push(pct);
        });
    });

    const count = percentages.length;
    if (count === 0) return null;

    const average = percentages.reduce((sum, pct) => sum + pct, 0) / count;
    const variance = count > 1
        ? percentages.reduce((sum, pct) => sum + ((pct - average) ** 2), 0) / (count - 1)
        : 0;
    const stdDev = Math.sqrt(variance);

    // RODO يعرض نطاقًا ضيقًا وواضحًا: الفرق بين الحد الأدنى والأقصى لا يتجاوز 5 نقاط مئوية.
    // يظل التذبذب بين النتائج مؤثرًا، لكن يتم ضبطه داخل هذا السقف حتى لا يتحول
    // التوقع إلى نطاق واسع يصعب على الطالب فهمه أو الاستفادة منه.
    const MAX_RANGE_POINTS = 5;
    const MAX_MARGIN = MAX_RANGE_POINTS / 2;

    let baseMargin;
    if (count === 1) baseMargin = 2.5;
    else if (count === 2) baseMargin = 2.25;
    else if (count === 3) baseMargin = 2.15;
    else if (count <= 5) baseMargin = 2.05;
    else baseMargin = 1.9;

    const variabilityMargin = Math.min(stdDev * 0.35, MAX_MARGIN - baseMargin);
    const margin = Math.min(MAX_MARGIN, Math.max(1.5, baseMargin + Math.max(0, variabilityMargin)));

    // احسب الحدين أولًا ثم طبّق قيدًا نهائيًا صريحًا؛ هذا يضمن أن التقريب عند .5
    // لا يجعل الفرق بين الطرفين يتجاوز 5 نقاط مئوية بأي شكل.
    let lower = Math.max(0, Math.round(average - margin));
    let upper = Math.min(100, Math.round(average + margin));
    if (upper - lower > MAX_RANGE_POINTS) {
        if (upper <= 100 - MAX_RANGE_POINTS) {
            upper = lower + MAX_RANGE_POINTS;
        } else {
            lower = Math.max(0, upper - MAX_RANGE_POINTS);
        }
    }
    const center = Math.round(average * 10) / 10;

    let confidenceLabel = 'تقدير أولي';
    if (count >= 6) confidenceLabel = 'التقدير أكثر استقرارًا';
    else if (count >= 4) confidenceLabel = 'التقدير بدأ يثبت';
    else if (count >= 2) confidenceLabel = 'تقدير مبدئي';

    return { center, lower, upper, count, margin: Math.round(margin * 10) / 10, confidenceLabel };
}


function getExamPercentagesForOverview() {
    const percentages = [];
    if (!Array.isArray(state.examSubjects)) return percentages;
    state.examSubjects.forEach(subject => {
        if (!subject || !Array.isArray(subject.exams)) return;
        subject.exams.forEach(exam => {
            const pct = Number(exam?.percentage);
            if (Number.isFinite(pct) && pct >= 0 && pct <= 100) percentages.push(pct);
        });
    });
    return percentages;
}

function getExamHistoryForOverview() {
    const history = [];
    let order = 0;
    if (!Array.isArray(state.examSubjects)) return history;
    state.examSubjects.forEach(subject => {
        if (!subject || !Array.isArray(subject.exams)) return;
        subject.exams.forEach(exam => {
            const pct = Number(exam?.percentage);
            if (!Number.isFinite(pct) || pct < 0 || pct > 100) return;
            const rawDate = String(exam?.date || '').slice(0, 10);
            const dateMs = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? new Date(`${rawDate}T12:00:00`).getTime() : NaN;
            history.push({
                percentage: pct,
                date: rawDate,
                dateMs: Number.isFinite(dateMs) ? dateMs : Number.POSITIVE_INFINITY,
                order: order++,
                examName: String(exam?.name || 'امتحان'),
                subjectName: String(subject?.name || 'مادة')
            });
        });
    });
    history.sort((a, b) => (a.dateMs - b.dateMs) || (a.order - b.order));
    return history;
}

function calculateExamTrend() {
    const history = getExamHistoryForOverview();
    if (history.length < 4) return null;

    const windowSize = Math.min(3, Math.floor(history.length / 2));
    const earlier = history.slice(0, windowSize).map(item => item.percentage);
    const recent = history.slice(-windowSize).map(item => item.percentage);
    const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    const delta = Math.round((average(recent) - average(earlier)) * 10) / 10;

    let direction = 'steady';
    if (delta >= 1) direction = 'up';
    else if (delta <= -1) direction = 'down';

    return { delta, direction, sampleSize: windowSize * 2 };
}

function getAcademicMilestoneInfo(percentage) {
    const milestones = [70, 75, 80, 85, 90];
    const labels = {
        70: 'البداية',
        75: 'تقدم',
        80: 'ثبات',
        85: 'تقدم قوي',
        90: 'مستوى مرتفع'
    };
    const next = milestones.find(value => value > percentage) ?? null;
    const previous = milestones.filter(value => value <= percentage).at(-1) ?? null;
    return { milestones, labels, next, previous };
}

function renderWhereAmIGoing() {
    const container = document.getElementById('ui-where-am-i-going');
    if (!container) return;

    const projection = calculateProjectedPercentage();
    if (!projection) {
        container.innerHTML = `
            <article class="rodo-academic-card rodo-forecast-card rodo-empty-card">
                <div class="rodo-card-glow rodo-forecast-glow" aria-hidden="true"></div>
                <div class="rodo-card-heading">
                    <div class="rodo-card-heading-main">
                        <div class="rodo-icon-bubble rodo-forecast-icon" aria-hidden="true"><i data-lucide="compass"></i></div>
                        <div>
                            <p class="rodo-eyebrow">مسارك الأكاديمي</p>
                            <h3>إلى أين تتجه نتيجتك؟</h3>
                        </div>
                    </div>
                    <span class="rodo-forecast-pill is-empty">بانتظار أول نتيجة</span>
                </div>
                <div class="rodo-forecast-empty">
                    <div class="rodo-forecast-empty-mark" aria-hidden="true"><span></span><span></span><span></span></div>
                    <div>
                        <strong>نتيجتك الأولى ترسم نقطة البداية</strong>
                        <p>سجّل امتحانًا واحدًا على الأقل لتظهر قراءة مبنية على درجاتك المسجلة.</p>
                    </div>
                </div>
                <div class="rodo-forecast-footnote"><i data-lucide="info" aria-hidden="true"></i><span>القراءة تقديرية لمساعدتك على متابعة مسارك، وليست وعدًا بالنتيجة النهائية.</span></div>
            </article>
        `;
        lucide.createIcons({ root: container });
        return;
    }

    const lower = Number(projection.lower);
    const upper = Number(projection.upper);
    const center = Number(projection.center);
    const rangeWidth = Math.max(0, upper - lower);
    const milestoneInfo = getAcademicMilestoneInfo(center);
    const nextTarget = milestoneInfo.next;
    const trend = calculateExamTrend();
    const trendClass = trend?.direction === 'up' ? 'is-up' : trend?.direction === 'down' ? 'is-down' : 'is-steady';
    const trendText = trend
        ? trend.direction === 'up'
            ? `يتحسن +${trend.delta}%`
            : trend.direction === 'down'
                ? `يتراجع ${trend.delta}%`
                : 'مستقر تقريبًا'
        : 'نتائج أكثر توضّح الاتجاه';
    const nextText = nextTarget == null ? 'كل المحطات مكتملة' : `${nextTarget}%`;

    container.innerHTML = `
        <article class="rodo-academic-card rodo-forecast-card">
            <div class="rodo-card-glow rodo-forecast-glow" aria-hidden="true"></div>
            <div class="rodo-card-heading">
                <div class="rodo-card-heading-main">
                    <div class="rodo-icon-bubble rodo-forecast-icon" aria-hidden="true"><i data-lucide="compass"></i></div>
                    <div>
                        <p class="rodo-eyebrow">مسارك الأكاديمي</p>
                        <h3>إلى أين تتجه نتيجتك؟</h3>
                        <span class="rodo-card-subtitle">قراءة من ${projection.count} ${projection.count === 1 ? 'امتحان مسجل' : 'امتحانات مسجلة'}</span>
                    </div>
                </div>
                <div class="rodo-forecast-trend ${trendClass}"><span class="rodo-trend-dot" aria-hidden="true"></span>${trendText}</div>
            </div>

            <div class="rodo-forecast-result">
                <div class="rodo-forecast-result-copy">
                    <span class="rodo-forecast-label">النطاق الحالي</span>
                    <div class="rodo-forecast-range" dir="ltr" aria-label="من ${lower} إلى ${upper} بالمئة">
                        <strong>${lower}</strong><span class="rodo-forecast-dash" aria-hidden="true">—</span><strong>${upper}<i>%</i></strong>
                    </div>
                    <span class="rodo-forecast-caption">ملخّص تقديري للنتائج المسجّلة</span>
                </div>
                <div class="rodo-forecast-average">
                    <span>متوسط نتائجك</span>
                    <strong dir="ltr">${center}<i>%</i></strong>
                    <small>حتى الآن</small>
                </div>
            </div>

            <div class="rodo-range-visual" role="img" aria-label="نطاق النتائج من ${lower}% إلى ${upper}%، ومتوسطها ${center}%">
                <div class="rodo-range-track" dir="ltr">
                    <span class="rodo-range-fill" style="left:${lower}%;width:${rangeWidth}%"></span>
                    <span class="rodo-range-marker" style="left:${center}%"></span>
                </div>
                <div class="rodo-range-labels" dir="ltr"><span>${lower}%</span><span>${upper}%</span></div>
            </div>

            <div class="rodo-forecast-meta">
                <div><span>محطتك التالية</span><strong dir="ltr">${nextText}</strong></div>
                <div><span>ثبات القراءة</span><strong>${projection.confidenceLabel}</strong></div>
                <div><span>عدد النتائج</span><strong>${projection.count}</strong></div>
            </div>
            <div class="rodo-forecast-footnote"><i data-lucide="info" aria-hidden="true"></i><span>كل نتيجة جديدة تضيف سياقًا لمسارك؛ راجع الدرجة الفعلية ومتطلبات مادتك دائمًا.</span></div>
        </article>
    `;
    lucide.createIcons({ root: container });
}

function renderProgressStory() {
    const container = document.getElementById('ui-progress-story');
    if (!container) return;

    const history = getExamHistoryForOverview();
    if (!history.length) {
        container.innerHTML = `
            <article class="rodo-academic-card rodo-story-card rodo-story-empty">
                <div class="rodo-card-glow rodo-story-glow" aria-hidden="true"></div>
                <div class="rodo-card-heading">
                    <div class="rodo-card-heading-main">
                        <div class="rodo-icon-bubble rodo-story-icon" aria-hidden="true"><i data-lucide="route"></i></div>
                        <div><p class="rodo-eyebrow">قصة التقدّم</p><h3>كل رحلة تبدأ بنتيجة</h3></div>
                    </div>
                    <span class="rodo-story-count">لا توجد نتائج بعد</span>
                </div>
                <div class="rodo-story-empty-path" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
                <div class="rodo-story-empty-copy"><strong>أول نتيجة هتكون أول نقطة في رحلتك</strong><span>سجّل امتحانك لتبدأ في رؤية الفرق بين البداية والآن.</span></div>
            </article>
        `;
        lucide.createIcons({ root: container });
        return;
    }

    const first = history[0];
    const latest = history[history.length - 1];
    const best = history.reduce((winner, item) => item.percentage > winner.percentage ? item : winner, history[0]);
    const projection = calculateProjectedPercentage();
    const delta = Math.round((latest.percentage - first.percentage) * 10) / 10;
    const next = getAcademicMilestoneInfo(projection?.center ?? latest.percentage).next;
    const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
    const deltaClass = delta > 0 ? 'is-positive' : delta < 0 ? 'is-negative' : 'is-neutral';
    const resultCountLabel = history.length === 1 ? 'نتيجة مسجّلة' : 'نتائج مسجّلة';

    container.innerHTML = `
        <article class="rodo-academic-card rodo-story-card">
            <div class="rodo-card-glow rodo-story-glow" aria-hidden="true"></div>
            <div class="rodo-card-heading">
                <div class="rodo-card-heading-main">
                    <div class="rodo-icon-bubble rodo-story-icon" aria-hidden="true"><i data-lucide="route"></i></div>
                    <div>
                        <p class="rodo-eyebrow">قصة التقدّم</p>
                        <h3>رحلتك، نتيجة وراء نتيجة</h3>
                    </div>
                </div>
                <span class="rodo-story-count">${history.length} ${resultCountLabel}</span>
            </div>

            <div class="rodo-story-comparison" dir="rtl" aria-label="مقارنة أول نتيجة بآخر نتيجة">
                <div class="rodo-story-score is-first"><span>البداية</span><strong dir="ltr">${Math.round(first.percentage * 10) / 10}<i>%</i></strong></div>
                <div class="rodo-story-connector" aria-hidden="true"><span><i data-lucide="arrow-left"></i></span></div>
                <div class="rodo-story-score is-latest"><span>آخر نتيجة</span><strong dir="ltr">${Math.round(latest.percentage * 10) / 10}<i>%</i></strong></div>
            </div>

            <div class="rodo-story-highlights">
                <div class="rodo-story-change ${deltaClass}">
                    <span class="rodo-story-highlight-icon" aria-hidden="true"><i data-lucide="trending-up"></i></span>
                    <span><small>التغيّر من البداية</small><strong dir="ltr">${deltaLabel} <i>نقطة</i></strong></span>
                </div>
                <div class="rodo-story-best">
                    <span class="rodo-story-highlight-icon" aria-hidden="true"><i data-lucide="trophy"></i></span>
                    <span><small>أفضل نتيجة</small><strong dir="ltr">${Math.round(best.percentage * 10) / 10}<i>%</i></strong></span>
                </div>
            </div>

            <div class="rodo-story-next">
                <span class="rodo-story-next-mark" aria-hidden="true"><i data-lucide="target"></i></span>
                <span>${next == null ? 'وصلت إلى كل المحطات الحالية' : 'المحطة الأكاديمية التالية'}</span>
                <strong dir="ltr">${next == null ? '—' : `${next}%`}</strong>
            </div>
        </article>
    `;
    lucide.createIcons({ root: container });
}

function renderAcademicMilestones() {
    const container = document.getElementById('ui-academic-milestones');
    if (!container) return;

    const percentages = getExamPercentagesForOverview();
    const average = percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : 0;
    const info = getAcademicMilestoneInfo(average);
    const { milestones, labels, next, previous } = info;
    const current = Math.round(average * 10) / 10;
    const progressToNext = next == null ? 100 : previous == null ? Math.min(100, Math.max(0, (average / next) * 100)) : Math.min(100, Math.max(0, ((average - previous) / (next - previous)) * 100));
    const gapToNext = next == null ? 0 : Math.round(Math.max(0, next - average) * 10) / 10;
    const hasResults = percentages.length > 0;

    container.innerHTML = `
        <article class="rodo-academic-card rodo-milestone-card ${hasResults ? '' : 'rodo-empty-card'}">
            <div class="rodo-card-glow rodo-milestone-glow" aria-hidden="true"></div>
            <div class="rodo-card-heading">
                <div class="rodo-card-heading-main">
                    <div class="rodo-icon-bubble rodo-milestone-icon" aria-hidden="true"><i data-lucide="milestone"></i></div>
                    <div><p class="rodo-eyebrow">محطاتك الأكاديمية</p><h3>كل درجة تفتح لك محطة</h3></div>
                </div>
                <div class="rodo-milestone-current" dir="ltr">${hasResults ? `${current}<i>%</i>` : '—'}</div>
            </div>

            <div class="rodo-milestone-progress-copy">
                <span>${hasResults ? (next == null ? 'أنهيت المحطات المحددة' : `تقدّمك نحو محطة ${next}%`) : 'أول محطة عند 70%'}</span>
                <strong>${hasResults ? (next == null ? 'مكتملة' : `باقي ${gapToNext} نقطة`) : 'ابدأ بأول نتيجة'}</strong>
            </div>
            <div class="rodo-milestone-meter" role="progressbar" aria-label="التقدم نحو المحطة الأكاديمية التالية" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${hasResults ? Math.round(progressToNext) : 0}">
                <span style="width:${hasResults ? progressToNext : 0}%"></span>
            </div>

            <div class="rodo-milestone-ladder" role="list" aria-label="محطات المتوسط الأكاديمي">
                ${milestones.map(value => {
                    const reached = hasResults && average >= value;
                    const active = hasResults && !reached && next === value;
                    const stepClass = reached ? 'is-reached' : active ? 'is-next' : 'is-upcoming';
                    const stateLabel = reached ? 'تم بلوغها' : active ? 'المحطة التالية' : 'قادمة';
                    return `
                        <div class="rodo-milestone-step ${stepClass}" role="listitem" aria-label="${value} بالمئة، ${stateLabel}" ${active ? 'aria-current="step"' : ''}>
                            <span class="rodo-milestone-step-mark" aria-hidden="true">${reached ? '<i data-lucide="check"></i>' : active ? '<i data-lucide="sparkles"></i>' : '<i data-lucide="lock-keyhole"></i>'}</span>
                            <strong dir="ltr">${value}<i>%</i></strong>
                            <span class="rodo-milestone-step-label">${escapeHTML(labels[value])}</span>
                            <small>${stateLabel}</small>
                        </div>
                    `;
                }).join('')}
            </div>
            <p class="rodo-milestone-note">${hasResults ? 'المتوسط المعروض محسوب من نتائجك المسجّلة.' : 'سجّل أول امتحان لتبدأ رحلتك بين المحطات.'}</p>
        </article>
    `;
    lucide.createIcons({ root: container });
}

let studyCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedStudyCalendarDate = null;

function changeStudyCalendarMonth(offset) {
    const step = Number(offset);
    if (!Number.isInteger(step)) return;
    studyCalendarMonth = new Date(studyCalendarMonth.getFullYear(), studyCalendarMonth.getMonth() + step, 1);
    selectedStudyCalendarDate = null;
    renderStudyCalendar();
}

function selectStudyCalendarDate(dateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    const [year, month, day] = dateStr.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    if (selected.getFullYear() !== year || selected.getMonth() !== month - 1 || selected.getDate() !== day) return;
    studyCalendarMonth = new Date(year, month - 1, 1);
    selectedStudyCalendarDate = dateStr;
    renderStudyCalendar();
}

function getStudyCalendarData(year, month) {
    const calendarMonth = new Date(Number(year), Number(month), 1);
    if (Number.isNaN(calendarMonth.getTime())) return {};

    const monthPrefix = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-`;
    const days = Object.create(null);
    const getDateKey = (record) => {
        if (!record || typeof record !== 'object') return null;
        const dateText = typeof record.date === 'string' ? record.date : '';
        const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
        if (dateParts) {
            const [recordYear, recordMonth, recordDay] = dateParts.slice(1).map(Number);
            const parsedDate = new Date(recordYear, recordMonth - 1, recordDay);
            if (parsedDate.getFullYear() === recordYear && parsedDate.getMonth() === recordMonth - 1 && parsedDate.getDate() === recordDay) {
                return dateText;
            }
        }

        if (record.timestamp == null || record.timestamp === '') return null;
        const timestamp = Number(record.timestamp);
        if (!Number.isFinite(timestamp)) return null;
        const fallbackDate = new Date(timestamp);
        if (Number.isNaN(fallbackDate.getTime())) return null;
        return `${fallbackDate.getFullYear()}-${String(fallbackDate.getMonth() + 1).padStart(2, '0')}-${String(fallbackDate.getDate()).padStart(2, '0')}`;
    };
    const getDay = (dateKey) => {
        if (!dateKey || !dateKey.startsWith(monthPrefix)) return null;
        if (!days[dateKey]) days[dateKey] = { minutes: 0, sessions: 0, exams: 0, subjects: [], examSubjects: [] };
        return days[dateKey];
    };

    if (Array.isArray(state.studySubjects)) {
        state.studySubjects.forEach(subject => {
            if (!subject || !Array.isArray(subject.history)) return;
            subject.history.forEach(session => {
                const day = getDay(getDateKey(session));
                const minutes = Number(session?.minutes);
                if (!day || !Number.isFinite(minutes) || minutes < 0) return;
                day.minutes += minutes;
                day.sessions += 1;
                const subjectName = String(subject.name || '').trim();
                if (subjectName && !day.subjects.includes(subjectName)) day.subjects.push(subjectName);
            });
        });
    }

    if (Array.isArray(state.examSubjects)) {
        state.examSubjects.forEach(subject => {
            if (!subject || !Array.isArray(subject.exams)) return;
            subject.exams.forEach(exam => {
                const day = getDay(getDateKey(exam));
                if (!day) return;
                day.exams += 1;
                const subjectName = String(subject.name || '').trim();
                if (subjectName && !day.examSubjects.includes(subjectName)) day.examSubjects.push(subjectName);
            });
        });
    }

    return days;
}

function renderStudyCalendar() {
    const container = document.getElementById('ui-study-calendar');
    if (!container) return;

    const year = studyCalendarMonth.getFullYear();
    const month = studyCalendarMonth.getMonth();
    const monthData = getStudyCalendarData(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = getLocalDateStr();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const monthLabel = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
    const dayLabels = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    let activeDays = 0;
    let totalMinutes = 0;
    let totalSessions = 0;
    let totalExams = 0;
    Object.values(monthData).forEach(value => {
        if (value.minutes > 0 || value.sessions > 0 || value.exams > 0) activeDays++;
        totalMinutes += value.minutes;
        totalSessions += value.sessions;
        totalExams += value.exams;
    });

    const activeDateEntries = Object.entries(monthData).filter(([, value]) => value.minutes > 0 || value.sessions > 0);
    const strongestDay = activeDateEntries.slice().sort((a, b) => (b[1].minutes - a[1].minutes) || (b[1].sessions - a[1].sessions))[0] || null;
    if (!selectedStudyCalendarDate || !selectedStudyCalendarDate.startsWith(prefix)) {
        const defaultDate = monthData[today] ? today : (strongestDay ? strongestDay[0] : null);
        selectedStudyCalendarDate = defaultDate;
    }
    const selectedData = selectedStudyCalendarDate ? monthData[selectedStudyCalendarDate] : null;
    const selectedSubjectNames = selectedData ? [...new Set([...selectedData.subjects, ...selectedData.examSubjects])] : [];
    const selectedDateLabel = selectedStudyCalendarDate
        ? new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' }).format(new Date(`${selectedStudyCalendarDate}T12:00:00`))
        : 'اختر يومًا';

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push('<div class="rodo-calendar-blank" aria-hidden="true"></div>');
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const data = monthData[date] || { minutes: 0, sessions: 0, exams: 0, subjects: [], examSubjects: [] };
        const intensityClass = data.minutes >= 180 ? 'is-intense' : data.minutes >= 90 ? 'is-active' : data.minutes >= 30 ? 'is-light' : (data.minutes > 0 || data.exams > 0) ? 'is-trace' : '';
        const dayClasses = ['rodo-calendar-day', intensityClass, date === today ? 'is-today' : '', date === selectedStudyCalendarDate ? 'is-selected' : ''].filter(Boolean).join(' ');
        const title = `${day} ${monthLabel} · ${data.minutes} دقيقة مذاكرة · ${data.sessions} جلسة${data.exams ? ` · ${data.exams} امتحان` : ''}`;
        const timeLabel = data.minutes > 0 ? (data.minutes >= 60 ? `${Math.floor(data.minutes / 60)}س` : `${data.minutes}د`) : '';
        cells.push(`
            <button type="button" onclick="selectStudyCalendarDate('${date}')" aria-label="${escapeHTML(title)}" aria-pressed="${date === selectedStudyCalendarDate ? 'true' : 'false'}" ${date === today ? 'aria-current="date"' : ''} class="${dayClasses}">
                <span class="rodo-calendar-day-number" dir="ltr">${day}</span>
                <span class="rodo-calendar-day-meta" dir="ltr"><span>${timeLabel}</span>${data.exams > 0 ? '<i class="rodo-calendar-exam-dot" title="نتيجة امتحان" aria-label="يوجد امتحان مسجل"></i>' : ''}</span>
            </button>
        `);
    }

    const strongestDayLabel = strongestDay
        ? new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(`${strongestDay[0]}T12:00:00`))
        : 'لا يوجد بعد';
    const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();

    container.innerHTML = `
        <article class="rodo-academic-card rodo-month-card">
            <div class="rodo-card-glow rodo-calendar-glow" aria-hidden="true"></div>
            <div class="rodo-card-heading rodo-month-heading">
                <div class="rodo-card-heading-main">
                    <div class="rodo-icon-bubble rodo-calendar-icon" aria-hidden="true"><i data-lucide="calendar-days"></i></div>
                    <div class="rodo-month-title-wrap">
                        <p class="rodo-eyebrow">تقويم المذاكرة</p>
                        <h3>${monthLabel}</h3>
                    </div>
                </div>
                <div class="rodo-month-controls" dir="ltr">
                    <button type="button" onclick="changeStudyCalendarMonth(-1)" aria-label="الشهر السابق" class="rodo-month-nav"><i data-lucide="chevron-left"></i></button>
                    ${isCurrentMonth ? '<span class="rodo-month-current">هذا الشهر</span>' : ''}
                    <button type="button" onclick="changeStudyCalendarMonth(1)" aria-label="الشهر التالي" class="rodo-month-nav"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>

            <div class="rodo-month-stats" aria-label="ملخص نشاط الشهر">
                <div><span>أيام نشطة</span><strong>${activeDays}</strong></div>
                <div><span>وقت المذاكرة</span><strong>${formatStudyTimeShort(totalMinutes)}</strong></div>
                <div><span>جلسات</span><strong>${totalSessions}</strong></div>
                <div><span>امتحانات</span><strong>${totalExams}</strong></div>
            </div>

            <div class="rodo-calendar-grid" dir="ltr" aria-label="أيام الشهر">
                ${dayLabels.map(label => `<span class="rodo-calendar-weekday" aria-hidden="true">${label}</span>`).join('')}
                ${cells.join('')}
            </div>
            <div class="rodo-calendar-legend"><span><i class="rodo-legend-study" aria-hidden="true"></i> وقت مذاكرة</span><span><i class="rodo-calendar-exam-dot" aria-hidden="true"></i> امتحان مسجل</span></div>

            <div class="rodo-calendar-detail">
                <div class="rodo-calendar-detail-head">
                    <div><span class="rodo-calendar-detail-eyebrow">تفاصيل اليوم</span><strong>${selectedDateLabel}</strong></div>
                    <span class="rodo-calendar-tap-hint">اختر يومًا من التقويم</span>
                </div>
                ${selectedData ? `
                    <div class="rodo-calendar-day-stats">
                        <div><span>مذاكرة</span><strong dir="ltr">${formatStudyTimeShort(selectedData.minutes)}</strong></div>
                        <div><span>جلسات</span><strong dir="ltr">${selectedData.sessions}</strong></div>
                        <div><span>امتحانات</span><strong dir="ltr">${selectedData.exams}</strong></div>
                    </div>
                    ${selectedSubjectNames.length ? `<div class="rodo-calendar-subjects">${selectedSubjectNames.map(name => `<span>${escapeHTML(name)}</span>`).join('')}</div>` : ''}
                ` : '<p class="rodo-calendar-empty">مفيش نشاط مسجّل في اليوم ده لسه.</p>'}
            </div>

            <div class="rodo-calendar-strongest"><span class="rodo-strongest-icon" aria-hidden="true"><i data-lucide="trophy"></i></span><span>أقوى يوم هذا الشهر</span><strong title="${escapeHTML(strongestDayLabel)}">${strongestDay ? `${strongestDayLabel} · ${formatStudyTimeShort(strongestDay[1].minutes)}` : 'لا يوجد نشاط مسجل بعد'}</strong></div>
        </article>
    `;
    lucide.createIcons({ root: container });
}

function renderAcademicOverview() {
    renderWhereAmIGoing();
    renderProgressStory();
    renderAcademicMilestones();
    renderStudyCalendar();
}

function renderExamProjection() {
    const container = document.getElementById('ui-exam-projection');
    if (!container) return;

    const projection = calculateProjectedPercentage();
    if (!projection) {
        container.innerHTML = `
            <div class="glass-panel rounded-[2rem] p-6 shadow-xl border border-white/8 bg-gradient-to-br from-white/[0.025] to-transparent relative overflow-hidden">
                <div class="absolute -left-10 -top-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-[45px] pointer-events-none"></div>
                <div class="flex items-start gap-3 text-right">
                    <div class="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-300">
                        <i data-lucide="scan-line" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-white/45 mb-1">التوقع الحالي للنتيجة</p>
                        <h3 class="text-lg font-black text-white mb-1">لسه محتاجين أول نتيجة</h3>
                        <p class="text-xs text-white/45 leading-6">سجّل نتيجة امتحان واحدة على الأقل، وRODO هيبدأ يبني لك نطاقًا تقديريًا هادئًا بناءً على درجاتك المسجلة.</p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons({ root: container });
        return;
    }

    const leftPosition = Math.min(100, Math.max(0, projection.lower));
    const rightPosition = Math.min(100, Math.max(0, projection.upper));
    const centerPosition = Math.min(100, Math.max(0, projection.center));
    const rangeWidth = Math.max(4, rightPosition - leftPosition);

    container.innerHTML = `
        <div class="glass-panel rounded-[2rem] p-6 shadow-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.045] via-white/[0.015] to-transparent relative overflow-hidden">
            <div class="absolute -right-12 -top-12 w-36 h-36 bg-indigo-500/12 rounded-full blur-[55px] pointer-events-none"></div>
            <div class="relative">
                <div class="flex items-start justify-between gap-4 mb-5">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-300">
                            <i data-lucide="target" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-base font-black text-white">النتيجة المتوقعة حاليًا</h3>
                                <span class="text-[10px] font-bold text-indigo-300/80 bg-indigo-500/10 border border-indigo-500/10 rounded-full px-2 py-1">${projection.confidenceLabel}</span>
                            </div>
                            <p class="text-xs text-white/45">بناءً على ${projection.count} امتحان مسجل</p>
                        </div>
                    </div>
                    <div class="text-left shrink-0">
                        <div class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">${projection.lower}<span class="text-white/30 mx-1">–</span>${projection.upper}<span class="text-lg text-white/45 mr-1">%</span></div>
                        <p class="text-[10px] text-white/35 mt-1">نطاق تقديري، وليس ضمانًا</p>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="relative h-3 rounded-full bg-white/[0.055] border border-white/8 overflow-hidden">
                        <div class="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-indigo-500/30 via-indigo-400/55 to-indigo-500/30" style="left:${leftPosition}%; width:${rangeWidth}%"></div>
                        <div class="absolute -top-1 w-1.5 h-5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)] -translate-x-1/2" style="left:${centerPosition}%"></div>
                    </div>
                    <div class="flex justify-between mt-2 text-[10px] font-bold text-white/35" dir="ltr">
                        <span>${projection.lower}%</span>
                        <span class="text-white/65">المنتصف ${projection.center}%</span>
                        <span>${projection.upper}%</span>
                    </div>
                </div>

                <div class="flex items-start gap-2 rounded-xl bg-black/20 border border-white/5 px-3 py-2.5">
                    <i data-lucide="info" class="w-4 h-4 text-white/30 shrink-0 mt-0.5"></i>
                    <p class="text-[11px] leading-5 text-white/40">النطاق يتسع عندما يكون عدد الامتحانات قليلًا أو درجاتك متذبذبة، ويصبح أضيق مع زيادة النتائج واستقرار مستواك.</p>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons({ root: container });
}

function renderExams() {
    const container = document.getElementById('ui-exams-subjects-container');
    if (!container) return;

    renderExamProjection();
    renderAcademicOverview();
    
    if (state.examSubjects.length === 0) {
        container.innerHTML = `
            <div class="glass-panel rounded-2xl p-8 text-center border-dashed border-2 border-white/10 shadow-lg">
                <i data-lucide="book-marked" class="w-12 h-12 text-indigo-400/50 mx-auto mb-3"></i>
                <p class="text-white/60 font-medium">لم تضف أي مادة حتى الآن. ابدأ بإضافة مادة لتتبع نتائجك! 📖</p>
            </div>
        `;
        lucide.createIcons({ root: container });
        return;
    }
    
    container.innerHTML = state.examSubjects.map(subject => {
        const hasExams = subject.exams.length > 0;
        const avgColor = hasExams ? getGradeColor(subject.averageGrade) : { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/50', label: 'لا توجد نتائج' };
        
        return `
            <div class="glass-panel rounded-2xl overflow-hidden shadow-lg border border-indigo-500/20 bg-indigo-500/[0.02]">
                <div class="bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 p-4 border-b border-indigo-500/20">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3 flex-1">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <i data-lucide="book" class="w-5 h-5 text-indigo-400"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-bold text-white">${escapeHTML(subject.name)}</h3>
                                <p class="text-xs text-white/50 font-medium">عدد الامتحانات: ${subject.exams.length}</p>
                            </div>
                        </div>
                        <button onclick="deleteExamSubject(${subject.id})" aria-label="حذف المادة" class="w-11 h-11 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors btn-press" title="حذف المادة">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                    
                    ${hasExams ? `
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div class="bg-black/30 rounded-lg p-3 border border-white/5">
                                <p class="text-[10px] text-white/50 font-bold mb-1">المتوسط</p>
                                <p class="text-lg font-black ${avgColor.text}">${subject.averageGrade}%</p>
                            </div>
                            <div class="bg-black/30 rounded-lg p-3 border border-white/5">
                                <p class="text-[10px] text-white/50 font-bold mb-1">الأعلى</p>
                                <p class="text-lg font-black text-emerald-400">${subject.highestGrade}%</p>
                            </div>
                            <div class="bg-black/30 rounded-lg p-3 border border-white/5">
                                <p class="text-[10px] text-white/50 font-bold mb-1">الأقل</p>
                                <p class="text-lg font-black text-red-400">${subject.lowestGrade}%</p>
                            </div>
                            <div class="bg-black/30 rounded-lg p-3 border border-white/5">
                                <p class="text-[10px] text-white/50 font-bold mb-1">الإجمالي</p>
                                <p class="text-lg font-black text-yellow-400">${subject.totalGrade}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="p-4">
                    <form onsubmit="addExamResult(${subject.id}, event)" class="mb-4 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="plus" class="w-5 h-5 text-indigo-400"></i>
                            <span class="text-sm font-bold text-white/70">إضافة نتيجة امتحان</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <input type="text" data-exam-name aria-label="اسم الامتحان" placeholder="اسم الامتحان" required class="bg-black/60 rounded-lg border border-white/10 text-white px-4 text-base min-h-[44px] focus:outline-none placeholder-white/30 font-medium">
                            <input type="number" data-exam-grade aria-label="درجتك" placeholder="درجتك" step="0.1" required class="bg-black/60 rounded-lg border border-white/10 text-white px-4 text-base min-h-[44px] focus:outline-none placeholder-white/30 font-medium">
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <input type="number" data-exam-total aria-label="الدرجة الكلية" placeholder="الدرجة الكلية" step="0.1" required class="bg-black/60 rounded-lg border border-white/10 text-white px-4 text-base min-h-[44px] focus:outline-none placeholder-white/30 font-medium">
                            <input type="date" data-exam-date aria-label="تاريخ الامتحان" class="bg-black/60 rounded-lg border border-white/10 text-white px-4 text-base min-h-[44px] focus:outline-none placeholder-white/30 font-medium">
                        </div>
                        <button type="submit" class="w-full py-3 min-h-[44px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base btn-press transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] flex justify-center items-center gap-2">
                            <i data-lucide="plus" class="w-4 h-4"></i> أضف النتيجة
                        </button>
                    </form>
                    
                    <div class="space-y-3">
                        ${subject.exams.length === 0 ? `
                            <div class="text-center py-4 text-white/40 text-sm">
                                لا توجد نتائج امتحانات حتى الآن
                            </div>
                        ` : subject.exams.map(exam => {
                            const examColor = getGradeColor(exam.percentage);
                            return `
                                <div class="${examColor.bg} border ${examColor.border} rounded-xl p-4 min-h-[44px] flex items-center justify-between group hover:shadow-lg transition-all">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <h4 class="font-bold text-white text-base">${escapeHTML(exam.name)}</h4>
                                            <span class="text-[11px] font-bold ${examColor.text} bg-black/40 px-2 py-0.5 rounded">${examColor.label}</span>
                                        </div>
                                        <div class="flex items-center gap-3 text-sm text-white/70">
                                            <span><strong class="text-white">${exam.grade}/${exam.totalGrade}</strong></span>
                                            <span class="${examColor.text} font-bold">${exam.percentage}%</span>
                                            <span class="text-white/50">${new Date(exam.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <button onclick="deleteExamResult(${subject.id}, ${exam.id})" aria-label="حذف النتيجة" class="w-11 h-11 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors btn-press opacity-50 group-hover:opacity-100" title="حذف النتيجة">
                                        <i data-lucide="x" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons({ root: container });
}

function initErrorBank() {
    const formAddError = document.getElementById('form-add-error');
    if (formAddError) formAddError.addEventListener('submit', addError);

    const searchInput = document.getElementById('error-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentErrorSearch = e.target.value.trim().toLowerCase();
                errorRenderLimit = 20;
                renderErrorBank();
            }, 250);
        });
    }

    const subjectFiltersContainer = document.getElementById('error-subject-filters');
    if (subjectFiltersContainer && !subjectFiltersContainer.dataset.bound) {
        subjectFiltersContainer.dataset.bound = '1';
        subjectFiltersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-error-subject]');
            if (!btn) return;
            currentErrorFilterSubject = btn.dataset.errorSubject || 'all';
            errorRenderLimit = 20;
            renderErrorBank();
        });
    }

    const errorListContainer = document.getElementById('error-list-container');
    if (errorListContainer && !errorListContainer.dataset.bound) {
        errorListContainer.dataset.bound = '1';
        errorListContainer.addEventListener('click', (e) => {
            const card = e.target.closest('[data-error-id]');
            if (!card) return;
            const id = Number(card.dataset.errorId);
            if (Number.isFinite(id)) openErrorDetail(id);
        });
        errorListContainer.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const card = e.target.closest('[data-error-id]');
            if (!card) return;
            e.preventDefault();
            const id = Number(card.dataset.errorId);
            if (Number.isFinite(id)) openErrorDetail(id);
        });
    }

    const loadMoreBtn = document.getElementById('error-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            errorRenderLimit += 20;
            renderErrorBank();
        });
    }

    const btnSmartReview = document.getElementById('btn-smart-review');
    if (btnSmartReview) btnSmartReview.addEventListener('click', triggerSmartReview);

    const btnCloseDetail = document.getElementById('btn-close-error-detail');
    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeErrorDetail);

    const btnActionRepeat = document.getElementById('btn-error-action-repeat');
    if (btnActionRepeat) btnActionRepeat.addEventListener('click', repeatError);

    const btnActionReview = document.getElementById('btn-error-action-review');
    if (btnActionReview) btnActionReview.addEventListener('click', openErrorReview);

    const btnActionMaster = document.getElementById('btn-error-action-master');
    if (btnActionMaster) btnActionMaster.addEventListener('click', masterError);

    const btnActionDelete = document.getElementById('btn-error-action-delete');
    if (btnActionDelete) btnActionDelete.addEventListener('click', deleteError);

    const formReview = document.getElementById('form-error-review');
    if (formReview) formReview.addEventListener('submit', submitErrorReview);

    const btnCloseReview = document.getElementById('btn-close-error-review');
    if (btnCloseReview) btnCloseReview.addEventListener('click', closeErrorReview);

    const btnNavToErrorBank = document.getElementById('btn-nav-to-error-bank');
    if (btnNavToErrorBank) btnNavToErrorBank.addEventListener('click', () => switchTab('weaknesses'));

    const errorLessonInput = document.getElementById('error-lesson-input');
    if (errorLessonInput) {
        errorLessonInput.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    }

    const errorTypeInput = document.getElementById('error-type-input');
    if (errorTypeInput) {
        errorTypeInput.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    }
}

function isErrorNeedsReview(err) {
    if (err.status === 'new') return true;
    if (err.status === 'reviewed') {
        if (!err.lastReviewedAt) return true;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - err.lastReviewedAt > sevenDays) return true;
        if (err.lastRepeatedAt && err.lastRepeatedAt > err.lastReviewedAt) return true;
    }
    return false;
}

function triggerSmartReview() {
    currentErrorFilterSubject = 'all';
    currentErrorFilterStatus = 'needs_review';
    currentErrorSearch = '';
    const searchInput = document.getElementById('error-search');
    if (searchInput) searchInput.value = '';
    errorRenderLimit = 20;
    renderErrorBank();
    showToast('تم تفعيل المراجعة الذكية. ركز على هذه الأخطاء!', 'info');
}

function addError(e) {
    e.preventDefault();
    const subjectInput = document.getElementById('new-error-subject');
    const severityInput = document.getElementById('new-error-severity');
    const textInput = document.getElementById('new-error-text');
    const typeInput = document.getElementById('new-error-type');
    const lessonInput = document.getElementById('new-error-lesson');

    if (!subjectInput || !textInput) return;

    const subjectName = subjectInput.value.trim();
    const text = textInput.value.trim();
    
    if (!subjectName || !text) return;

    const newError = {
        id: createEntityId(),
        subjectName: subjectName,
        text: text,
        lessonLearned: lessonInput ? lessonInput.value.trim() : '',
        type: typeInput ? typeInput.value : 'other',
        severity: severityInput ? severityInput.value : 'medium',
        status: 'new',
        repetitionCount: 0,
        reviewCount: 0,
        dateAdded: new Date().toLocaleDateString('ar-EG'),
        lastReviewedAt: null,
        lastRepeatedAt: null,
        masteredAt: null
    };

    state.errorBank.errors.unshift(newError);
    saveState();

    subjectInput.value = '';
    textInput.value = '';
    if (lessonInput) lessonInput.value = '';
    if (typeInput) typeInput.value = 'other';
    if (severityInput) severityInput.value = 'medium';

    currentErrorFilterSubject = 'all';
    currentErrorFilterStatus = 'all';
    errorRenderLimit = 20;
    renderErrorBank();
    showToast('تم تسجيل الخطأ بنجاح. المواجهة هي أول خطوة للنصر!', 'success');
}

function openErrorDetail(id) {
    const err = state.errorBank.errors.find(e => e.id === id);
    if (!err) return;

    currentActiveErrorId = id;

    const elSubject = document.getElementById('detail-error-subject');
    const elStatus = document.getElementById('detail-error-status');
    const elDate = document.getElementById('detail-error-date');
    const elText = document.getElementById('detail-error-text');
    const elType = document.getElementById('detail-error-type');
    const elSeverity = document.getElementById('detail-error-severity');
    const elRepetition = document.getElementById('detail-error-repetition');
    const elLastReview = document.getElementById('detail-error-last-review');
    const elLesson = document.getElementById('detail-error-lesson');

    if (elSubject) elSubject.innerText = err.subjectName;
    if (elDate) elDate.innerText = err.dateAdded;
    if (elText) elText.innerText = err.text;
    if (elRepetition) elRepetition.innerText = err.repetitionCount;
    if (elLesson) elLesson.innerText = err.lessonLearned || 'لم يتم كتابة درس مستفاد بعد.';

    if (elStatus) {
        if (err.status === 'new') {
            elStatus.innerText = 'جديد';
            elStatus.className = 'text-[10px] font-bold px-2 py-1 rounded-md border text-rose-400 border-rose-500/30 bg-rose-500/10';
        } else if (err.status === 'reviewed') {
            elStatus.innerText = 'تمت المراجعة';
            elStatus.className = 'text-[10px] font-bold px-2 py-1 rounded-md border text-blue-400 border-blue-500/30 bg-blue-500/10';
        } else {
            elStatus.innerText = 'مُتقن';
            elStatus.className = 'text-[10px] font-bold px-2 py-1 rounded-md border text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        }
    }

    if (elType) {
        const typeMap = { 'conceptual': 'مفاهيمي', 'calculation': 'حسابي', 'careless': 'قلة تركيز', 'other': 'أخرى' };
        elType.innerText = typeMap[err.type] || 'أخرى';
    }

    if (elSeverity) {
        const sevMap = { 'low': 'بسيطة', 'medium': 'متوسطة', 'high': 'مهمة 🔥' };
        elSeverity.innerText = sevMap[err.severity] || 'متوسطة';
    }

    if (elLastReview) {
        if (err.lastReviewedAt) {
            elLastReview.innerText = new Date(err.lastReviewedAt).toLocaleDateString('ar-EG');
        } else {
            elLastReview.innerText = 'لم يراجع';
        }
    }

    const btnMaster = document.getElementById('btn-error-action-master');
    if (btnMaster) {
        if (err.status === 'reviewed' && err.lessonLearned.trim() !== '') {
            btnMaster.classList.remove('hidden');
            btnMaster.classList.add('flex');
        } else {
            btnMaster.classList.add('hidden');
            btnMaster.classList.remove('flex');
        }
    }

    const modal = document.getElementById('modal-error-detail');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('modal-overlay-enter');
            const content = modal.firstElementChild;
            if (content) {
                content.classList.remove('opacity-0', 'scale-95');
                content.classList.add('modal-animate-enter');
            }
        }, 10);
    }
}

function closeErrorDetail() {
    const modal = document.getElementById('modal-error-detail');
    if (!modal) return;
    modal.classList.remove('modal-overlay-enter');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        currentActiveErrorId = null;
    }, 300);
}

function repeatError() {
    if (!currentActiveErrorId) return;
    const err = state.errorBank.errors.find(e => e.id === currentActiveErrorId);
    if (!err) return;

    const localSnapshot = saveSnapshot();
    err.repetitionCount++;
    err.lastRepeatedAt = Date.now();

    if (err.status === 'mastered') {
        err.status = 'reviewed';
    }

    saveState();
    renderErrorBank();
    openErrorDetail(currentActiveErrorId);
    showToast('تم تسجيل التكرار. لا بأس، الاستمرارية هي الحل!', 'info', true, localSnapshot);
}

function openErrorReview() {
    if (!currentActiveErrorId) return;
    const err = state.errorBank.errors.find(e => e.id === currentActiveErrorId);
    if (!err) return;

    const typeInput = document.getElementById('error-type-input');
    const lessonInput = document.getElementById('error-lesson-input');

    if (typeInput) typeInput.value = err.type;
    if (lessonInput) lessonInput.value = err.lessonLearned;

    const modal = document.getElementById('modal-error-review');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('modal-overlay-enter');
            const content = modal.firstElementChild;
            if (content) {
                content.classList.remove('opacity-0', 'scale-95');
                content.classList.add('modal-animate-enter');
            }
        }, 10);
    }
}

function closeErrorReview() {
    const modal = document.getElementById('modal-error-review');
    if (!modal) return;
    modal.classList.remove('modal-overlay-enter');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }, 300);
}

function submitErrorReview(e) {
    e.preventDefault();
    if (!currentActiveErrorId) return;
    const err = state.errorBank.errors.find(e => e.id === currentActiveErrorId);
    if (!err) return;

    const typeInput = document.getElementById('error-type-input');
    const lessonInput = document.getElementById('error-lesson-input');

    if (!lessonInput || lessonInput.value.trim() === '') {
        showToast('يجب كتابة الدرس المستفاد!', 'info');
        return;
    }

    const localSnapshot = saveSnapshot();

    if (typeInput) err.type = typeInput.value;
    err.lessonLearned = lessonInput.value.trim();
    err.reviewCount++;
    err.lastReviewedAt = Date.now();

    if (err.status === 'new') {
        err.status = 'reviewed';
    }

    const finalXp = Math.floor(20 * getBoostMultiplier('xp'));
    const finalCoins = Math.floor(10 * getBoostMultiplier('coin'));
    const reviewRewardId = `error-review:${err.id}:${err.reviewCount}`;
    RewardService.grant({ id: reviewRewardId, xp: finalXp, coins: finalCoins, meta: { source: 'error-review', errorId: err.id, reviewCount: err.reviewCount } });

    saveState();
    renderErrorBank();
    closeErrorReview();
    openErrorDetail(currentActiveErrorId);
    playSound('pop');
    showToast(`تمت المراجعة بنجاح! +${finalXp} XP`, 'success', true, localSnapshot);
}

function masterError() {
    if (!currentActiveErrorId) return;
    const err = state.errorBank.errors.find(e => e.id === currentActiveErrorId);
    if (!err) return;

    if (err.status !== 'reviewed' || err.lessonLearned.trim() === '') {
        showToast('يجب مراجعة الخطأ وكتابة الدرس المستفاد أولاً.', 'info');
        return;
    }

    const localSnapshot = saveSnapshot();

    err.status = 'mastered';
    err.masteredAt = Date.now();

    const finalXp = Math.floor(50 * getBoostMultiplier('xp'));
    const finalCoins = Math.floor(20 * getBoostMultiplier('coin'));
    const masterRewardId = `error-master:${err.id}`;
    RewardService.grant({ id: masterRewardId, xp: finalXp, coins: finalCoins, meta: { source: 'error-master', errorId: err.id } });

    saveState();
    renderErrorBank();
    openErrorDetail(currentActiveErrorId);
    playSound('reward');
    showToast(`عمل رائع! لقد أتقنت هذا الخطأ. +${finalXp} XP`, 'success', true, localSnapshot);
}

function deleteError() {
    if (!currentActiveErrorId) return;
    if (!confirm('هل أنت متأكد من حذف هذا الخطأ نهائياً؟')) return;

    const localSnapshot = saveSnapshot();
    state.errorBank.errors = state.errorBank.errors.filter(e => e.id !== currentActiveErrorId);
    
    saveState();
    renderErrorBank();
    closeErrorDetail();
    showToast('تم حذف الخطأ بنجاح.', 'info', true, localSnapshot);
}

function renderErrorBank() {
    const totalEl = document.getElementById('error-bank-total');
    if (totalEl) totalEl.innerText = state.errorBank.errors.length;

    const subjects = [...new Set(state.errorBank.errors.map(e => e.subjectName))].filter(Boolean);
    const subjectFiltersContainer = document.getElementById('error-subject-filters');
    if (subjectFiltersContainer) {
        let pillsHtml = `<button data-error-subject="all" class="error-filter-pill px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold border transition-all ${currentErrorFilterSubject === 'all' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}">الكل</button>`;
        subjects.forEach(sub => {
            const isSel = currentErrorFilterSubject === sub;
            pillsHtml += `<button data-error-subject="${escapeHTML(sub)}" class="error-filter-pill px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold border transition-all ${isSel ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}">${escapeHTML(sub)}</button>`;
        });
        subjectFiltersContainer.innerHTML = pillsHtml;
    }

    const statusFiltersContainer = document.getElementById('error-status-filters');
    if (statusFiltersContainer) {
        const statuses = [
            { id: 'all', label: 'الكل' },
            { id: 'needs_review', label: 'تحتاج مراجعة' },
            { id: 'new', label: 'جديد' },
            { id: 'reviewed', label: 'تمت المراجعة' },
            { id: 'mastered', label: 'مُتقن' },
            { id: 'repeated', label: 'متكرر' }
        ];
        let statusHtml = '';
        statuses.forEach(st => {
            const isSel = currentErrorFilterStatus === st.id;
            statusHtml += `<button onclick="currentErrorFilterStatus='${st.id}'; errorRenderLimit=20; renderErrorBank();" class="error-filter-pill px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold border transition-all ${isSel ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}">${st.label}</button>`;
        });
        statusFiltersContainer.innerHTML = statusHtml;
    }

    let filtered = state.errorBank.errors.filter(err => {
        if (currentErrorFilterSubject !== 'all' && err.subjectName !== currentErrorFilterSubject) return false;
        
        if (currentErrorFilterStatus === 'new' && err.status !== 'new') return false;
        if (currentErrorFilterStatus === 'reviewed' && err.status !== 'reviewed') return false;
        if (currentErrorFilterStatus === 'mastered' && err.status !== 'mastered') return false;
        if (currentErrorFilterStatus === 'repeated' && err.repetitionCount === 0) return false;
        if (currentErrorFilterStatus === 'needs_review' && !isErrorNeedsReview(err)) return false;

        if (currentErrorSearch) {
            const searchLower = currentErrorSearch.toLowerCase();
            const textMatch = err.text.toLowerCase().includes(searchLower);
            const lessonMatch = err.lessonLearned.toLowerCase().includes(searchLower);
            if (!textMatch && !lessonMatch) return false;
        }

        return true;
    });

    filtered.sort((a, b) => {
        const aNeeds = isErrorNeedsReview(a);
        const bNeeds = isErrorNeedsReview(b);
        if (aNeeds && !bNeeds) return -1;
        if (!aNeeds && bNeeds) return 1;
        return b.id - a.id;
    });

    const listContainer = document.getElementById('error-list-container');
    const emptyState = document.getElementById('error-empty-state');
    const noResults = document.getElementById('error-no-results');
    const loadMoreBtn = document.getElementById('error-load-more');

    if (!listContainer) return;

    if (state.errorBank.errors.length === 0) {
        listContainer.innerHTML = '';
        if (emptyState) { emptyState.classList.remove('hidden'); emptyState.classList.add('block'); }
        if (noResults) { noResults.classList.add('hidden'); noResults.classList.remove('block'); }
        if (loadMoreBtn) { loadMoreBtn.classList.add('hidden'); loadMoreBtn.classList.remove('inline-block'); }
        return;
    } else {
        if (emptyState) { emptyState.classList.add('hidden'); emptyState.classList.remove('block'); }
    }

    if (filtered.length === 0) {
        listContainer.innerHTML = '';
        if (noResults) { noResults.classList.remove('hidden'); noResults.classList.add('block'); }
        if (loadMoreBtn) { loadMoreBtn.classList.add('hidden'); loadMoreBtn.classList.remove('inline-block'); }
        return;
    } else {
        if (noResults) { noResults.classList.add('hidden'); noResults.classList.remove('block'); }
    }

    const toRender = filtered.slice(0, errorRenderLimit);
    
    listContainer.innerHTML = toRender.map(err => {
        let statusBadge = '';
        if (err.status === 'new') statusBadge = '<span class="text-[10px] font-bold px-2 py-1 rounded-md border text-rose-400 border-rose-500/30 bg-rose-500/10">جديد</span>';
        else if (err.status === 'reviewed') statusBadge = '<span class="text-[10px] font-bold px-2 py-1 rounded-md border text-blue-400 border-blue-500/30 bg-blue-500/10">مراجعة</span>';
        else statusBadge = '<span class="text-[10px] font-bold px-2 py-1 rounded-md border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">مُتقن</span>';

        return `
        <div data-error-id="${err.id}" tabindex="0" role="button" class="error-card-compact glass-panel rounded-2xl p-4 min-h-[44px] border border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer btn-press error-severity-${err.severity}">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span class="text-[10px] font-bold px-2 py-1 rounded-md bg-white/10 text-white/70 shrink-0">${escapeHTML(err.subjectName)}</span>
                    <h4 class="text-sm font-bold text-white line-clamp-1">${escapeHTML(err.text)}</h4>
                </div>
                <div class="shrink-0 ml-2">
                    ${statusBadge}
                </div>
            </div>
            <div class="flex justify-between items-center mt-3">
                <span class="text-[10px] text-white/40">${escapeHTML(String(err.dateAdded))}</span>
                ${err.repetitionCount > 0 ? `<span class="text-[10px] font-bold text-orange-400 flex items-center gap-1"><i data-lucide="rotate-cw" class="w-3 h-3"></i> تكرر ${err.repetitionCount}</span>` : ''}
            </div>
        </div>`;
    }).join('');

    lucide.createIcons({ root: listContainer });

    if (loadMoreBtn) {
        if (filtered.length > errorRenderLimit) {
            loadMoreBtn.classList.remove('hidden');
            loadMoreBtn.classList.add('inline-block');
        } else {
            loadMoreBtn.classList.add('hidden');
            loadMoreBtn.classList.remove('inline-block');
        }
    }
}

function calculateErrorAnalytics() {
    const errors = state.errorBank.errors;
    const total = errors.length;
    
    let mastered = 0;
    let reviewed = 0;
    let newCount = 0;
    let repeated = 0;
    let needsReview = 0;
    
    let typeDist = { 'conceptual': 0, 'calculation': 0, 'careless': 0, 'other': 0 };
    let subjectDist = {};

    errors.forEach(err => {
        if (err.status === 'mastered') mastered++;
        else if (err.status === 'reviewed') reviewed++;
        else newCount++;

        if (err.repetitionCount > 0) repeated++;
        if (isErrorNeedsReview(err)) needsReview++;

        if (typeDist[err.type] !== undefined) typeDist[err.type]++;
        else typeDist['other']++;

        subjectDist[err.subjectName] = (subjectDist[err.subjectName] || 0) + 1;
    });

    const masteryPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    let sortedSubjects = Object.keys(subjectDist).map(name => ({
        name,
        count: subjectDist[name],
        percent: Math.round((subjectDist[name] / total) * 100)
    })).sort((a, b) => b.count - a.count);

    return {
        total, mastered, reviewed, newCount, repeated, needsReview, masteryPercentage,
        typeDist, subjectDist: sortedSubjects
    };
}

function renderErrorAnalytics() {
    const stats = calculateErrorAnalytics();

    const setTxt = (id, txt) => { const el = document.getElementById(id); if(el) el.innerText = txt; };
    
    setTxt('stat-errors-total', stats.total);
    setTxt('stat-errors-review', stats.needsReview);
    setTxt('stat-errors-repeated', stats.repeated);
    setTxt('stat-errors-mastered', stats.mastered);
    setTxt('stat-errors-mastery', `(${stats.masteryPercentage}%)`);

    const typeDistContainer = document.getElementById('stat-errors-type-distribution');
    if (typeDistContainer) {
        if (stats.total === 0) {
            typeDistContainer.innerHTML = `<p class="text-xs text-white/40 text-center py-2">لا توجد بيانات</p>`;
        } else {
            const types = [
                { key: 'conceptual', label: 'مفاهيمي', color: 'bg-purple-500' },
                { key: 'calculation', label: 'حسابي', color: 'bg-blue-500' },
                { key: 'careless', label: 'قلة تركيز', color: 'bg-orange-500' },
                { key: 'other', label: 'أخرى', color: 'bg-slate-500' }
            ];
            typeDistContainer.innerHTML = types.map(t => {
                const count = stats.typeDist[t.key];
                const percent = Math.round((count / stats.total) * 100);
                if (count === 0) return '';
                return `
                <div class="mb-2">
                    <div class="flex justify-between text-[10px] font-bold mb-1 text-white/70">
                        <span>${t.label}</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full ${t.color} stat-bar-fill" style="width: ${percent}%"></div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    const subDistContainer = document.getElementById('stat-errors-subject-distribution');
    if (subDistContainer) {
        if (stats.subjectDist.length === 0) {
            subDistContainer.innerHTML = `<p class="text-xs text-white/40 text-center py-2">لا توجد بيانات</p>`;
        } else {
            const topSubjects = stats.subjectDist.slice(0, 4);
            subDistContainer.innerHTML = topSubjects.map((s, i) => {
                const colors = ['bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500'];
                return `
                <div class="mb-2">
                    <div class="flex justify-between text-[10px] font-bold mb-1 text-white/70">
                        <span class="truncate pr-2">${escapeHTML(s.name)}</span>
                        <span>${s.percent}%</span>
                    </div>
                    <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full ${colors[i%colors.length]} stat-bar-fill" style="width: ${s.percent}%"></div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    const insightsContainer = document.getElementById('stat-errors-insights');
    if (insightsContainer) {
        let insightsHtml = '';
        if (stats.total === 0) {
            insightsHtml = `<p class="text-xs text-white/50">ابدأ بتسجيل أخطائك للحصول على تحليلات ذكية.</p>`;
        } else {
            if (stats.needsReview > 0) {
                insightsHtml += `<p class="text-xs text-white/80 mb-2"><span class="text-rose-400 font-bold">•</span> لديك ${stats.needsReview} أخطاء تحتاج إلى مراجعة لتثبيت المعلومة.</p>`;
            }
            if (stats.masteryPercentage >= 50) {
                insightsHtml += `<p class="text-xs text-white/80 mb-2"><span class="text-emerald-400 font-bold">•</span> أداء ممتاز! لقد أتقنت ${stats.masteryPercentage}% من الأخطاء المسجلة.</p>`;
            }
            if (stats.repeated > 0) {
                insightsHtml += `<p class="text-xs text-white/80 mb-2"><span class="text-orange-400 font-bold">•</span> يوجد ${stats.repeated} أخطاء متكررة. حاول التركيز على أسبابها الجذرية.</p>`;
            }
            
            let maxType = 'other';
            let maxCount = 0;
            for (const [key, val] of Object.entries(stats.typeDist)) {
                if (val > maxCount && key !== 'other') { maxCount = val; maxType = key; }
            }
            if (maxCount > 0 && (maxCount / stats.total) > 0.4) {
                const typeMap = { 'conceptual': 'المفاهيمية', 'calculation': 'الحسابية', 'careless': 'قلة التركيز' };
                insightsHtml += `<p class="text-xs text-white/80 mb-2"><span class="text-blue-400 font-bold">•</span> نسبة كبيرة من أخطائك تعود إلى الأخطاء ${typeMap[maxType]}.</p>`;
            }
            
            if (!insightsHtml) {
                insightsHtml = `<p class="text-xs text-white/50">استمر في تسجيل ومراجعة الأخطاء لبناء قاعدة بيانات قوية.</p>`;
            }
        }
        insightsContainer.innerHTML = insightsHtml;
    }
}

window.onload = () => {
    let popupDelay = 0;
    const splashScreen = document.getElementById('splash-screen');
    
    const focusInsights = document.getElementById('smart-insights-container');
    if (focusInsights && focusInsights.parentElement) focusInsights.parentElement.remove();
    
    if (splashScreen) {
        const headerSpans = document.querySelectorAll('header span');
        headerSpans.forEach(span => {
            if (span.textContent.trim().toLowerCase() === 'rodo') {
                span.innerHTML = '<img src="assets/images/logo.webp" alt="Rodo" width="32" height="32" class="h-7 sm:h-8 w-auto inline-block object-contain">';
                span.classList.remove('bg-clip-text', 'text-transparent', 'bg-gradient-to-r', 'from-blue-400', 'to-indigo-500', 'tracking-tighter', 'font-black', 'text-2xl', 'text-lg');
                span.classList.add('flex', 'items-center');
            }
        });

        if (!sessionStorage.getItem('rodo_splash_played')) {
            sessionStorage.setItem('rodo_splash_played', 'true');
            popupDelay = 4600;
            
            const header = document.querySelector('header');
            const main = document.querySelector('main');
            const nav = document.querySelector('nav');
            
            if (header) { header.style.opacity = '0'; header.style.transform = 'translateY(-20px)'; }
            if (main) { main.style.opacity = '0'; main.style.transform = 'translateY(20px)'; }
            if (nav) { nav.style.opacity = '0'; nav.style.transform = 'translateY(20px)'; }

            setTimeout(() => {
                const splashLogo = splashScreen.querySelector('img');
                const splashTagline = splashScreen.querySelector('p');
                const splashGlow = splashScreen.querySelector('.absolute');

                if (!splashLogo) {
                    splashScreen.remove();
                    return;
                }

                const splashRect = splashLogo.getBoundingClientRect();
                
                splashScreen.style.animation = 'none';
                splashLogo.style.animation = 'none';
                if (splashTagline) splashTagline.style.animation = 'none';
                if (splashGlow) splashGlow.style.animation = 'none';

                splashLogo.style.transform = 'none';
                const baseSplashRect = splashLogo.getBoundingClientRect();

                const visibleSpans = Array.from(document.querySelectorAll('header span')).filter(s => s.querySelector('img') && s.getBoundingClientRect().width > 0);
                const targetLogo = visibleSpans.length > 0 ? visibleSpans[0].querySelector('img') : null;

                if (targetLogo) {
                    const targetRect = targetLogo.getBoundingClientRect();

                    const initialScaleX = splashRect.width / baseSplashRect.width;
                    const initialScaleY = splashRect.height / baseSplashRect.height;
                    const initialTx = splashRect.left - baseSplashRect.left + (splashRect.width - baseSplashRect.width) / 2;
                    const initialTy = splashRect.top - baseSplashRect.top + (splashRect.height - baseSplashRect.height) / 2;

                    const finalScaleX = targetRect.width / baseSplashRect.width;
                    const finalScaleY = targetRect.height / baseSplashRect.height;
                    const finalTx = targetRect.left - baseSplashRect.left + (targetRect.width - baseSplashRect.width) / 2;
                    const finalTy = targetRect.top - baseSplashRect.top + (targetRect.height - baseSplashRect.height) / 2;

                    splashLogo.style.transform = `translate(${initialTx}px, ${initialTy}px) scale(${initialScaleX}, ${initialScaleY})`;

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            splashScreen.style.transition = 'background-color 0.8s ease';
                            splashScreen.style.backgroundColor = 'transparent';
                            
                            if (splashTagline) {
                                splashTagline.style.transition = 'opacity 0.4s ease';
                                splashTagline.style.opacity = '0';
                            }
                            if (splashGlow) {
                                splashGlow.style.transition = 'opacity 0.4s ease';
                                splashGlow.style.opacity = '0';
                            }

                            splashLogo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
                            splashLogo.style.transform = `translate(${finalTx}px, ${finalTy}px) scale(${finalScaleX}, ${finalScaleY})`;

                            const revealTransition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                            if (header) {
                                header.style.transition = revealTransition;
                                header.style.opacity = '1';
                                header.style.transform = 'translateY(0)';
                            }
                            setTimeout(() => {
                                if (main) {
                                    main.style.transition = revealTransition;
                                    main.style.opacity = '1';
                                    main.style.transform = 'translateY(0)';
                                }
                            }, 100);
                            setTimeout(() => {
                                if (nav) {
                                    nav.style.transition = revealTransition;
                                    nav.style.opacity = '1';
                                    nav.style.transform = 'translateY(0)';
                                }
                            }, 200);

                            setTimeout(() => {
                                splashScreen.remove();
                                if (header) { header.style.transition = ''; header.style.opacity = ''; header.style.transform = ''; }
                                if (main) { main.style.transition = ''; main.style.opacity = ''; main.style.transform = ''; }
                                if (nav) { nav.style.transition = ''; nav.style.opacity = ''; nav.style.transform = ''; }
                            }, 800);
                        });
                    });
                } else {
                    splashScreen.style.transition = 'opacity 0.5s ease';
                    splashScreen.style.opacity = '0';
                    setTimeout(() => splashScreen.remove(), 500);
                }
            }, 3800);
        } else {
            popupDelay = 0;
            splashScreen.style.animation = 'none';
            splashScreen.style.transition = 'opacity 0.3s ease';
            splashScreen.style.opacity = '0';
            setTimeout(() => splashScreen.remove(), 300);
        }
    }

    lucide.createIcons();
    applyTheme();
    updateGlobalUI(); 
    updateQuote();
    initStoreBoostInterval();
    initErrorBank();

    switchTab('dashboard');
    selectedScheduleDay = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][new Date().getDay()];

    const categoryBtns = document.querySelectorAll('.store-category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => {
                b.classList.remove('active', 'bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');
                b.classList.add('bg-white/5', 'text-white/50', 'border-white/5');
            });
            const target = e.currentTarget;
            target.classList.remove('bg-white/5', 'text-white/50', 'border-white/5');
            target.classList.add('active', 'bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');
            currentStoreCategory = target.dataset.category;
            renderStoreGrid();
        });
    });

    setTimeout(() => {
        if (state._needsCorruptionNotice) {
            if (state._recoverySaved) {
                showToast('تم اكتشاف تلف في البيانات السابقة. تم بدء ملف جديد لحمايتك، وتم حفظ نسخة من البيانات التالفة.', 'info');
            } else {
                showToast('تم اكتشاف تلف في البيانات السابقة. فشلت محاولة حفظ نسخة احتياطية محلياً بسبب امتلاء المساحة. تم بدء ملف جديد.', 'info');
            }
            delete state._needsCorruptionNotice;
            delete state._recoverySaved;
            saveState();
        }

        const hasRecap = checkDailyReset();
        const isPenaltyApplied = checkStreakAndPenaltyOnLoad();

        if (!isPenaltyApplied) {
            pendingRandomEvent = checkRandomEvents();
            
            if (hasRecap) {
                setTimeout(() => showDailyRecap(), 500);
            } else {
                if (pendingRandomEvent) {
                    setTimeout(() => showRandomEventModal(pendingRandomEvent), 1000);
                } else {
                    setTimeout(() => { showToast(`أهلاً بعودتك يا ${state.userName}! اليوم فرصة جديدة للمجد. 🚀`, 'info'); }, 1000);
                }
            }
        }
    }, popupDelay);

    if (state.activeSession && state.activeSession.pendingSave && state.activeSession.elapsedMs > 0) {
        const recoverPendingSessionModal = () => {
            const blockingModalIds = ['modal-penalty', 'modal-daily-recap', 'modal-random-event'];
            const hasBlockingModal = blockingModalIds.some(id => {
                const el = document.getElementById(id);
                return el && !el.classList.contains('hidden');
            });
            if (hasBlockingModal) {
                setTimeout(recoverPendingSessionModal, 700);
                return;
            }
            openSaveSessionModal();
        };
        setTimeout(recoverPendingSessionModal, Math.max(popupDelay, 600) + 700);
    }

    if (state.activeSession && state.activeSession.isRunning) {
        stopwatchInterval = setInterval(() => updateStopwatchUI(false), 1000);
        updateStopwatchUI(true);
    } else {
        updateStopwatchUI(true);
    }
    
    renderHeatmap();
    renderStudyTimeTable();
    renderRecentSessions();
};
