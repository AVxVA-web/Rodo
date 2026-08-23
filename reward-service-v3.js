/*
 * Rodo Economy v3 — Architectural Specification Revision 1.2
 * Core reward/idempotency engine.
 *
 * This module is intentionally UI-agnostic. It expects the host application to
 * expose a mutable `state` object and a persistence callback.
 */
(function (global) {
    'use strict';

    const EconomyConfig = {
        version: 3,
        storageKey: 'hsQuestPremium_v4',
        ledgerLimit: 500,
        focus: {
            maxDailyMinutesCap: 720,
            xpPerMinute: 2.0,
            coinsPerMinute: 0.75
        },
        tasks: {
            easy: { xp: 15, coins: 10 },
            normal: { xp: 25, coins: 15 },
            hard: { xp: 40, coins: 25 }
        },
        habits: { xp: 10, coins: 6, allBonusXp: 25, allBonusCoins: 20 },
        schedule: { xp: 15, coins: 8 },
        achievements: {
            first_task: { xp: 50, coins: 25, rank: 'برونزي' },
            focus_50: { xp: 100, coins: 50, rank: 'فضي' },
            streak_3: { xp: 75, coins: 40, rank: 'برونزي' },
            schedule_pro: { xp: 50, coins: 25, rank: 'برونزي' },
            gold_master: { xp: 150, coins: 100, rank: 'ذهبي' }
        }
    };

    const BOOSTABLE = new Set([
        'task', 'focus_session', 'habit', 'goal', 'schedule', 'exam',
        'error_review', 'error_repeat', 'error_master'
    ]);

    const NON_REVERSIBLE = new Set([
        'achievement', 'error_master', 'random_event', 'wheel',
        'chest_duplicate', 'chest_fallback', 'shard_redeem', 'habit_all'
    ]);

    const DAILY = new Set(['habit']);
    const ENTITY_REVERSIBLE = new Set(['task', 'goal', 'schedule', 'exam']);

    function clone(value) {
        return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    }

    function localDateStr(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function ensureEconomyState(state) {
        if (!state.rewardClaims || typeof state.rewardClaims !== 'object') state.rewardClaims = {};
        if (!Array.isArray(state.ledger)) state.ledger = [];
        if (!state.todayStats) state.todayStats = { tasks: 0, xp: 0, focus: 0 };
        if (!state.weeklyStats) state.weeklyStats = { tasks: 0, xp: 0, focus: 0 };
        if (!state.heatmapData || typeof state.heatmapData !== 'object') state.heatmapData = {};
        if (!Number.isFinite(state.xp)) state.xp = 0;
        if (!Number.isFinite(state.coins)) state.coins = 0;
        return state;
    }

    function claimKey(sourceType, claimKeyOrSourceId) {
        return claimKeyOrSourceId && claimKeyOrSourceId.indexOf(':') >= 0
            ? claimKeyOrSourceId
            : `${sourceType}:${claimKeyOrSourceId}`;
    }

    function getDailyRewardedFocusMinutes(state, dateStr) {
        let total = 0;
        (state.studySubjects || []).forEach(sub => {
            if (!Array.isArray(sub.history)) return;
            sub.history.forEach(session => {
                if (session.date === dateStr && session.rewardTransactionId && session.rewardTransactionId !== 'legacy') {
                    total += Number(session.rewardedMinutes || session.minutes || 0);
                }
            });
        });
        return total;
    }

    function getRemainingDailyFocusMinutes(state, dateStr) {
        return Math.max(0, EconomyConfig.focus.maxDailyMinutesCap - getDailyRewardedFocusMinutes(state, dateStr));
    }

    function policyFor(sourceType) {
        if (ENTITY_REVERSIBLE.has(sourceType)) return 'A';
        if (DAILY.has(sourceType)) return 'B';
        if (NON_REVERSIBLE.has(sourceType)) return sourceType === 'achievement' || sourceType === 'error_master' ? 'D' : 'C';
        if (sourceType === 'focus_session') return 'C';
        if (sourceType === 'error_review' || sourceType === 'error_repeat') return 'C';
        return 'A';
    }

    function getMultiplier(sourceType, metadata) {
        if (!BOOSTABLE.has(sourceType)) return { xp: 1, coins: 1 };
        const multiplier = metadata && Number.isFinite(metadata.boostMultiplier) ? metadata.boostMultiplier : 1;
        return { xp: Math.max(0, multiplier), coins: Math.max(0, multiplier) };
    }

    function makeTxId() {
        return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    function snapshot(state, key) {
        return {
            xp: state.xp,
            coins: state.coins,
            todayStats: clone(state.todayStats),
            weeklyStats: clone(state.weeklyStats),
            heatmapData: clone(state.heatmapData),
            ledgerLength: state.ledger.length,
            existingClaim: clone(state.rewardClaims[key])
        };
    }

    function rollback(state, snap, key) {
        state.xp = snap.xp;
        state.coins = snap.coins;
        state.todayStats = snap.todayStats;
        state.weeklyStats = snap.weeklyStats;
        state.heatmapData = snap.heatmapData;
        state.ledger.length = snap.ledgerLength;
        if (snap.existingClaim === undefined) delete state.rewardClaims[key];
        else state.rewardClaims[key] = snap.existingClaim;
    }

    function persist(state, persistFn) {
        if (typeof persistFn === 'function') return persistFn(state);
        localStorage.setItem(EconomyConfig.storageKey, JSON.stringify(state));
        return true;
    }

    function grant(state, request, persistFn) {
        ensureEconomyState(state);
        const sourceType = String(request.sourceType || 'unknown');
        const sourceId = String(request.sourceId ?? '');
        const key = claimKey(sourceType, String(request.claimKey ?? sourceId));
        const metadata = request.metadata || request;
        const existing = state.rewardClaims[key];

        // Immutable legacy guard: this is intentionally checked before all other policy logic.
        if (metadata.isLegacy === true) return null;
        if (existing && existing.isLegacy === true) return null;

        const policy = policyFor(sourceType);
        if (existing) {
            if (policy === 'D' || (policy === 'C' && sourceType !== 'focus_session')) return null;
            if (existing.status === 'claimed') return null;
        }

        const multiplier = request.applyBoosts === false ? { xp: 1, coins: 1 } : getMultiplier(sourceType, metadata);
        const baseXp = Number(request.baseDeltaXp || 0);
        const baseCoins = Number(request.baseDeltaCoins || 0);
        const finalXp = Math.max(0, Math.floor(baseXp * multiplier.xp));
        const finalCoins = Math.max(0, Math.floor(baseCoins * multiplier.coins));
        const tx = {
            id: makeTxId(),
            sourceType,
            sourceId,
            claimKey: key,
            xpDelta: finalXp,
            coinDelta: finalCoins,
            timestamp: Date.now(),
            reversible: sourceType === 'focus_session' || ENTITY_REVERSIBLE.has(sourceType) || sourceType === 'habit',
            policy
        };
        const claim = {
            txId: tx.id,
            status: 'claimed',
            sourceType,
            sourceId,
            claimedAt: tx.timestamp,
            xpDelta: finalXp,
            coinDelta: finalCoins,
            reversible: tx.reversible
        };

        const snap = snapshot(state, key);
        try {
            state.xp += finalXp;
            state.coins += finalCoins;
            state.todayStats.xp = (state.todayStats.xp || 0) + finalXp;
            state.weeklyStats.xp = (state.weeklyStats.xp || 0) + finalXp;
            const today = localDateStr();
            state.heatmapData[today] = (state.heatmapData[today] || 0) + finalXp;
            state.ledger.push(tx);
            if (state.ledger.length > EconomyConfig.ledgerLimit) state.ledger = state.ledger.slice(-EconomyConfig.ledgerLimit);
            state.rewardClaims[key] = claim;
            const persisted = persist(state, persistFn);
            if (persisted === false) throw new Error('Persistence rejected');
            return tx;
        } catch (error) {
            rollback(state, snap, key);
            try { console.warn('[RewardService] Persistence failed; state rolled back.', error); } catch (_) {}
            return null;
        }
    }

    function findClaimByTxId(state, txId) {
        if (!txId || txId === 'legacy') return null;
        const claims = state.rewardClaims || {};
        for (const key of Object.keys(claims)) {
            if (claims[key] && claims[key].txId === txId) return { key, claim: claims[key] };
        }
        return null;
    }

    function revoke(state, txId, persistFn) {
        ensureEconomyState(state);
        if (!txId || txId === 'legacy') return false;
        const found = findClaimByTxId(state, txId);
        if (!found) return false;
        const { key, claim } = found;
        if (claim.isLegacy === true || claim.status !== 'claimed' || claim.reversible === false) return false;

        const snap = snapshot(state, key);
        try {
            state.xp = Math.max(0, state.xp - Number(claim.xpDelta || 0));
            state.coins = Math.max(0, state.coins - Number(claim.coinDelta || 0));
            state.todayStats.xp = Math.max(0, (state.todayStats.xp || 0) - Number(claim.xpDelta || 0));
            state.weeklyStats.xp = Math.max(0, (state.weeklyStats.xp || 0) - Number(claim.xpDelta || 0));
            const today = localDateStr();
            state.heatmapData[today] = Math.max(0, (state.heatmapData[today] || 0) - Number(claim.xpDelta || 0));
            state.rewardClaims[key] = { ...claim, status: 'revoked', revokedAt: Date.now() };
            const persisted = persist(state, persistFn);
            if (persisted === false) throw new Error('Persistence rejected');
            return true;
        } catch (error) {
            rollback(state, snap, key);
            try { console.warn('[RewardService] Revocation failed; state rolled back.', error); } catch (_) {}
            return false;
        }
    }

    function buildFocusReward(state, minutes, metadata = {}) {
        const dateStr = metadata.dateStr || localDateStr();
        const rawMinutes = Math.max(0, Number(minutes) || 0);
        const rewardableMinutes = Math.min(rawMinutes, getRemainingDailyFocusMinutes(state, dateStr));
        return {
            minutes: rawMinutes,
            rewardedMinutes: rewardableMinutes,
            baseDeltaXp: Math.floor(rewardableMinutes * EconomyConfig.focus.xpPerMinute),
            baseDeltaCoins: Math.floor(rewardableMinutes * EconomyConfig.focus.coinsPerMinute),
            dateStr
        };
    }

    function claimRandomEvent(state, eventData, persistFn) {
        const dateStr = localDateStr();
        const eventInstanceId = `${eventData.id}_${dateStr}`;
        return grant(state, {
            sourceType: 'random_event',
            sourceId: eventInstanceId,
            claimKey: `random_event:${eventInstanceId}`,
            baseDeltaXp: eventData.xp,
            baseDeltaCoins: eventData.coins,
            applyBoosts: false,
            metadata: { isLegacy: false }
        }, persistFn);
    }

    function migrateLegacy(state, persistFn) {
        ensureEconomyState(state);
        const todayStr = localDateStr();
        const seed = (type, id) => {
            const key = `${type}:${id}`;
            if (!state.rewardClaims[key]) {
                state.rewardClaims[key] = {
                    txId: 'legacy', status: 'legacy', sourceType: type,
                    sourceId: String(id), claimedAt: Date.now(), xpDelta: 0,
                    coinDelta: 0, isLegacy: true, reversible: false
                };
            }
            return key;
        };

        (state.tasks || []).forEach(t => {
            if (t.completed || t.rewardTransactionId === 'legacy') {
                t.isLegacy = true; t.rewardTransactionId = 'legacy'; seed('task', t.id);
            } else {
                if (t.isLegacy === undefined) t.isLegacy = false;
                if (t.rewardTransactionId === undefined) t.rewardTransactionId = null;
            }
            if (!t.difficulty) t.difficulty = 'normal';
        });
        (state.goals || []).forEach(g => {
            if (g.completed || g.rewardTransactionId === 'legacy') {
                g.isLegacy = true; g.rewardTransactionId = 'legacy'; seed('goal', g.id);
            } else {
                if (g.isLegacy === undefined) g.isLegacy = false;
                if (g.rewardTransactionId === undefined) g.rewardTransactionId = null;
            }
        });
        (state.lessons || []).concat(state.studyPlan || []).forEach(i => {
            if (i.completed || i.rewardTransactionId === 'legacy') {
                i.isLegacy = true; i.rewardTransactionId = 'legacy'; seed('schedule', i.id);
            } else if (i.rewardTransactionId === undefined) i.rewardTransactionId = null;
        });
        (state.habits || []).forEach(h => {
            if (h.completed) seed('habit', `${h.id}_${todayStr}`);
            if (h.isLegacy === undefined) h.isLegacy = false;
        });
        (state.unlockedAchievements || []).forEach(id => seed('achievement', id));
        (state.bosses || []).forEach(b => { if (b.rewardTransactionId === undefined) b.rewardTransactionId = null; });

        // Historical exams/focus sessions may live under subjects; preserve them without retroactive economy deltas.
        (state.studySubjects || []).forEach(sub => {
            (sub.exams || []).forEach(exam => {
                if (exam.rewardTransactionId === undefined) {
                    exam.isLegacy = true; exam.rewardTransactionId = 'legacy'; seed('exam', exam.id);
                }
            });
            (sub.history || []).forEach(session => {
                if (session.rewardTransactionId === undefined) {
                    session.isLegacy = true; session.rewardTransactionId = 'legacy';
                }
            });
        });

        state.economyVersion = EconomyConfig.version;
        persist(state, persistFn);
        return state;
    }

    const RewardService = {
        EconomyConfig,
        localDateStr,
        ensureEconomyState,
        getDailyRewardedFocusMinutes,
        getRemainingDailyFocusMinutes,
        buildFocusReward,
        grant,
        revoke,
        claimRandomEvent,
        migrateLegacy,
        policyFor,
        claimKey
    };

    global.RodoEconomyV3 = RewardService;
    global.RewardServiceV3 = RewardService;
})(window);
