import { flow, getEnv, Instance, SnapshotIn, types } from "mobx-state-tree";

/**
 * EDM DJ Copilot State Machine
 *
 * This file models the core DJ logic using MobX-State-Tree.
 * It does not directly play audio or call OpenAI. Instead, it depends on
 * injected services so the state machine stays deterministic and testable.
 */

// -----------------------------------------------------------------------------
// Environment / service contracts
// -----------------------------------------------------------------------------

export type TrackAnalysisInput = {
    filePath: string;
};

export type TrackAnalysisResult = {
    bpm?: number;
    musicalKey?: string;
    durationSec: number;
    energy?: number;
    sections?: SectionSnapshotIn[];
};

export type SetRecommendationRequest = {
    currentTrackId?: string;
    recentTrackIds: string[];
    candidateTracks: TrackSnapshotIn[];
    crowd: CrowdStateSnapshotIn;
    objective: DJObjective;
};

export type SetRecommendation = {
    trackId: string;
    confidence: number;
    intent: TransitionIntent;
    reason: string;
    transitionPlan: string;
    crowdSignalToWatch: string;
};

export type DJEnvironment = {
    audio: {
        loadDeck(deckId: DeckId, filePath: string): Promise<void>;
        play(deckId: DeckId): Promise<void>;
        pause(deckId: DeckId): Promise<void>;
        stop(deckId: DeckId): Promise<void>;
        setGain(deckId: DeckId, gain: number): void;
        setTempo(deckId: DeckId, tempo: number): void;
        seek(deckId: DeckId, seconds: number): Promise<void>;
    };
    analyzer: {
        analyzeTrack(input: TrackAnalysisInput): Promise<TrackAnalysisResult>;
    };
    ai: {
        recommendNextTracks(request: SetRecommendationRequest): Promise<SetRecommendation[]>;
    };
    clock?: {
        now(): number;
    };
};

// -----------------------------------------------------------------------------
// Enumerations
// -----------------------------------------------------------------------------

export const DeckIdModel = types.enumeration("DeckId", ["A", "B"]);
export type DeckId = "A" | "B";

export const PlaybackStatusModel = types.enumeration("PlaybackStatus", [
    "empty",
    "loading",
    "ready",
    "playing",
    "paused",
    "error",
]);
export type PlaybackStatus = "empty" | "loading" | "ready" | "playing" | "paused" | "error";

export const DJMachineStateModel = types.enumeration("DJMachineState", [
    "idle",
    "scanningLibrary",
    "analyzingLibrary",
    "planningSet",
    "ready",
    "loadingDeck",
    "performing",
    "transitioning",
    "recovering",
    "error",
]);
export type DJMachineState =
    | "idle"
    | "scanningLibrary"
    | "analyzingLibrary"
    | "planningSet"
    | "ready"
    | "loadingDeck"
    | "performing"
    | "transitioning"
    | "recovering"
    | "error";

export const DJObjectiveModel = types.enumeration("DJObjective", [
    "warmup",
    "build",
    "sustain",
    "peak",
    "rain",
    "reset",
    "close",
]);
export type DJObjective = "warmup" | "build" | "sustain" | "peak" | "rain" | "reset" | "close";

export const TransitionIntentModel = types.enumeration("TransitionIntent", [
    "safeContinuation",
    "energyLift",
    "energyDrop",
    "genrePivot",
    "harmonicBlend",
    "reset",
    "peakMoment",
    "rainDrop",
]);
export type TransitionIntent =
    | "safeContinuation"
    | "energyLift"
    | "energyDrop"
    | "genrePivot"
    | "harmonicBlend"
    | "reset"
    | "peakMoment"
    | "rainDrop";

export const SectionLabelModel = types.enumeration("SectionLabel", [
    "intro",
    "groove",
    "breakdown",
    "build",
    "drop",
    "outro",
    "unknown",
]);
export type SectionLabel = "intro" | "groove" | "breakdown" | "build" | "drop" | "outro" | "unknown";

// -----------------------------------------------------------------------------
// Core models
// -----------------------------------------------------------------------------

export const SectionModel = types.model("Section", {
    label: SectionLabelModel,
    startSec: types.number,
    endSec: types.number,
    confidence: types.optional(types.number, 0.5),
});
export type SectionSnapshotIn = SnapshotIn<typeof SectionModel>;

export const CuePointModel = types.model("CuePoint", {
    id: types.identifier,
    label: types.string,
    timeSec: types.number,
    kind: types.optional(
        types.enumeration("CueKind", ["hotCue", "mixIn", "mixOut", "drop", "breakdown", "loop"]),
        "hotCue"
    ),
});

export const TrackModel = types
    .model("Track", {
        id: types.identifier,
        title: types.string,
        artist: types.maybe(types.string),
        filePath: types.string,
        bpm: types.maybe(types.number),
        musicalKey: types.maybe(types.string),
        durationSec: types.maybe(types.number),
        energy: types.maybe(types.number),
        analyzed: types.optional(types.boolean, false),
        sections: types.optional(types.array(SectionModel), []),
        cues: types.optional(types.array(CuePointModel), []),
        tags: types.optional(types.array(types.string), []),
    })
    .actions((self) => ({
        applyAnalysis(result: TrackAnalysisResult) {
            self.bpm = result.bpm;
            self.musicalKey = result.musicalKey;
            self.durationSec = result.durationSec;
            self.energy = result.energy;
            self.sections.replace(result.sections ?? []);
            self.analyzed = true;
        },
        addTag(tag: string) {
            if (!self.tags.includes(tag)) self.tags.push(tag);
        },
        addCue(cue: SnapshotIn<typeof CuePointModel>) {
            self.cues.push(cue);
        },
    }));
export type TrackSnapshotIn = SnapshotIn<typeof TrackModel>;

export const DeckModel = types
    .model("Deck", {
        id: DeckIdModel,
        trackId: types.maybe(types.string),
        status: types.optional(PlaybackStatusModel, "empty"),
        positionSec: types.optional(types.number, 0),
        gain: types.optional(types.number, 1),
        tempo: types.optional(types.number, 1),
        error: types.maybe(types.string),
    })
    .views((self) => ({
        get isLoaded() {
            return Boolean(self.trackId) && self.status !== "empty";
        },
        get canPlay() {
            return self.status === "ready" || self.status === "paused";
        },
    }))
    .actions((self) => ({
        markLoading(trackId: string) {
            self.trackId = trackId;
            self.status = "loading";
            self.error = undefined;
            self.positionSec = 0;
        },
        markReady() {
            self.status = "ready";
        },
        markPlaying() {
            self.status = "playing";
        },
        markPaused() {
            self.status = "paused";
        },
        markEmpty() {
            self.trackId = undefined;
            self.status = "empty";
            self.positionSec = 0;
            self.error = undefined;
        },
        markError(error: string) {
            self.status = "error";
            self.error = error;
        },
        setGain(gain: number) {
            self.gain = clamp(gain, 0, 1);
        },
        setTempo(tempo: number) {
            self.tempo = clamp(tempo, 0.5, 2);
        },
        setPosition(seconds: number) {
            self.positionSec = Math.max(0, seconds);
        },
    }));

export const CrowdStateModel = types
    .model("CrowdState", {
        energy: types.optional(types.number, 3),
        engagement: types.optional(types.number, 3),
        density: types.optional(types.number, 3),
        riskAppetite: types.optional(types.number, 2),
        vocalAppetite: types.optional(types.number, 3),
        aggressionTolerance: types.optional(types.number, 3),
        dropFatigue: types.optional(types.number, 1),
        lastTrackReaction: types.optional(types.enumeration("Reaction", ["unknown", "hit", "neutral", "miss"]), "unknown"),
        notes: types.optional(types.string, ""),
    })
    .views((self) => ({
        get averageHeat() {
            return round1((self.energy + self.engagement + self.density) / 3);
        },
        get isRaining() {
            return self.energy >= 4 && self.engagement >= 4 && self.riskAppetite >= 4 && self.dropFatigue <= 3;
        },
        get needsReset() {
            return self.dropFatigue >= 4 || self.engagement <= 2 || self.lastTrackReaction === "miss";
        },
        get canPush() {
            return self.energy >= 4 && self.engagement >= 4 && self.riskAppetite >= 3 && self.dropFatigue <= 2;
        },
    }))
    .actions((self) => ({
        update(patch: Partial<CrowdStateSnapshotIn>) {
            if (patch.energy !== undefined) self.energy = clampInt(patch.energy, 1, 5);
            if (patch.engagement !== undefined) self.engagement = clampInt(patch.engagement, 1, 5);
            if (patch.density !== undefined) self.density = clampInt(patch.density, 1, 5);
            if (patch.riskAppetite !== undefined) self.riskAppetite = clampInt(patch.riskAppetite, 1, 5);
            if (patch.vocalAppetite !== undefined) self.vocalAppetite = clampInt(patch.vocalAppetite, 1, 5);
            if (patch.aggressionTolerance !== undefined) self.aggressionTolerance = clampInt(patch.aggressionTolerance, 1, 5);
            if (patch.dropFatigue !== undefined) self.dropFatigue = clampInt(patch.dropFatigue, 1, 5);
            if (patch.lastTrackReaction !== undefined) self.lastTrackReaction = patch.lastTrackReaction;
            if (patch.notes !== undefined) self.notes = patch.notes;
        },
    }));
export type CrowdStateSnapshotIn = SnapshotIn<typeof CrowdStateModel>;

export const RecommendationModel = types.model("Recommendation", {
    trackId: types.string,
    confidence: types.number,
    intent: TransitionIntentModel,
    reason: types.string,
    transitionPlan: types.string,
    crowdSignalToWatch: types.string,
});

export const TransitionModel = types
    .model("Transition", {
        id: types.identifier,
        fromDeckId: DeckIdModel,
        toDeckId: DeckIdModel,
        fromTrackId: types.string,
        toTrackId: types.string,
        intent: TransitionIntentModel,
        plan: types.string,
        startedAtMs: types.maybe(types.number),
        completedAtMs: types.maybe(types.number),
        status: types.optional(types.enumeration("TransitionStatus", ["queued", "active", "complete", "aborted"]), "queued"),
    })
    .actions((self) => ({
        start(nowMs: number) {
            self.status = "active";
            self.startedAtMs = nowMs;
        },
        complete(nowMs: number) {
            self.status = "complete";
            self.completedAtMs = nowMs;
        },
        abort(nowMs: number) {
            self.status = "aborted";
            self.completedAtMs = nowMs;
        },
    }));

export const SetHistoryItemModel = types.model("SetHistoryItem", {
    trackId: types.string,
    deckId: DeckIdModel,
    startedAtMs: types.number,
    endedAtMs: types.maybe(types.number),
    crowdReaction: types.optional(types.enumeration("Reaction", ["unknown", "hit", "neutral", "miss"]), "unknown"),
});

// -----------------------------------------------------------------------------
// Root state machine
// -----------------------------------------------------------------------------

export const DJMachineModel = types
    .model("DJMachine", {
        state: types.optional(DJMachineStateModel, "idle"),
        objective: types.optional(DJObjectiveModel, "warmup"),
        library: types.map(TrackModel),
        deckA: types.optional(DeckModel, { id: "A" }),
        deckB: types.optional(DeckModel, { id: "B" }),
        crowd: types.optional(CrowdStateModel, {}),
        recommendations: types.optional(types.array(RecommendationModel), []),
        activeTransition: types.maybe(TransitionModel),
        history: types.optional(types.array(SetHistoryItemModel), []),
        error: types.maybe(types.string),
    })
    .views((self) => ({
        get tracks() {
            return Array.from(self.library.values());
        },
        get analyzedTracks() {
            return Array.from(self.library.values()).filter((track) => track.analyzed);
        },
        get activeDeck() {
            if (self.deckA.status === "playing") return self.deckA;
            if (self.deckB.status === "playing") return self.deckB;
            return undefined;
        },
        get standbyDeck() {
            const active = this.activeDeck;
            if (!active) return self.deckA.status === "empty" ? self.deckA : self.deckB;
            return active.id === "A" ? self.deckB : self.deckA;
        },
        get currentTrack() {
            const deck = this.activeDeck;
            return deck?.trackId ? self.library.get(deck.trackId) : undefined;
        },
        get recentTrackIds() {
            return self.history.slice(-8).map((item) => item.trackId);
        },
        get canPlan() {
            return self.state === "ready" || self.state === "performing";
        },
    }))
    .actions((self) => {
        const setState = (next: DJMachineState) => {
            self.state = next;
        };

        const fail = (error: unknown) => {
            self.error = error instanceof Error ? error.message : String(error);
            self.state = "error";
        };

        const now = () => getEnv<DJEnvironment>(self).clock?.now() ?? Date.now();

        return {
            addTrack(track: TrackSnapshotIn) {
                self.library.set(track.id, track);
            },

            addTracks(tracks: TrackSnapshotIn[]) {
                for (const track of tracks) self.library.set(track.id, track);
            },

            setObjective(objective: DJObjective) {
                self.objective = objective;
            },

            updateCrowd(patch: Partial<CrowdStateSnapshotIn>) {
                self.crowd.update(patch);

                if (self.crowd.needsReset && self.objective !== "close") {
                    self.objective = "reset";
                } else if (self.crowd.isRaining) {
                    self.objective = "rain";
                } else if (self.crowd.canPush) {
                    self.objective = "build";
                }
            },

            makeItRain() {
                self.objective = "rain";
                self.crowd.update({
                    energy: Math.max(self.crowd.energy, 4),
                    engagement: Math.max(self.crowd.engagement, 4),
                    riskAppetite: Math.max(self.crowd.riskAppetite, 4),
                    dropFatigue: Math.min(self.crowd.dropFatigue, 2),
                    notes: [self.crowd.notes, "Rain mode engaged: push drops and crowd peaks."]
                        .filter(Boolean)
                        .join(" | "),
                });
            },

            analyzeLibrary: flow(function* analyzeLibrary() {
                const env = getEnv<DJEnvironment>(self);
                setState("analyzingLibrary");
                self.error = undefined;

                try {
                    for (const track of Array.from(self.library.values())) {
                        if (track.analyzed) continue;
                        const result: TrackAnalysisResult = yield env.analyzer.analyzeTrack({ filePath: track.filePath });
                        track.applyAnalysis(result);
                    }
                    setState("ready");
                } catch (error) {
                    fail(error);
                }
            }),

            requestRecommendations: flow(function* requestRecommendations() {
                if (!self.canPlan && self.state !== "ready") return;

                const env = getEnv<DJEnvironment>(self);
                setState("planningSet");
                self.error = undefined;

                try {
                    const candidates = Array.from(self.library.values())
                        .filter((track) => track.analyzed)
                        .filter((track) => !self.recentTrackIds.includes(track.id))
                        .map((track) => ({
                            id: track.id,
                            title: track.title,
                            artist: track.artist,
                            filePath: track.filePath,
                            bpm: track.bpm,
                            musicalKey: track.musicalKey,
                            durationSec: track.durationSec,
                            energy: track.energy,
                            analyzed: track.analyzed,
                            sections: track.sections.map((section) => ({
                                label: section.label,
                                startSec: section.startSec,
                                endSec: section.endSec,
                                confidence: section.confidence,
                            })),
                            tags: Array.from(track.tags),
                            cues: track.cues.map((cue) => ({
                                id: cue.id,
                                label: cue.label,
                                timeSec: cue.timeSec,
                                kind: cue.kind,
                            })),
                        }));

                    const result: SetRecommendation[] = yield env.ai.recommendNextTracks({
                        currentTrackId: self.currentTrack?.id,
                        recentTrackIds: self.recentTrackIds,
                        candidateTracks: candidates,
                        crowd: {
                            energy: self.crowd.energy,
                            engagement: self.crowd.engagement,
                            density: self.crowd.density,
                            riskAppetite: self.crowd.riskAppetite,
                            vocalAppetite: self.crowd.vocalAppetite,
                            aggressionTolerance: self.crowd.aggressionTolerance,
                            dropFatigue: self.crowd.dropFatigue,
                            lastTrackReaction: self.crowd.lastTrackReaction,
                            notes: self.crowd.notes,
                        },
                        objective: self.objective,
                    });

                    const evolvedResult =
                        self.objective === "rain"
                            ? evolveRainRecommendations(result, candidates, self.currentTrack?.id)
                            : result;
                    self.recommendations.replace(evolvedResult);
                    setState(self.activeDeck ? "performing" : "ready");
                } catch (error) {
                    fail(error);
                }
            }),

            loadDeck: flow(function* loadDeck(deckId: DeckId, trackId: string) {
                const env = getEnv<DJEnvironment>(self);
                const deck = deckId === "A" ? self.deckA : self.deckB;
                const track = self.library.get(trackId);

                if (!track) {
                    fail(new Error(`Track not found: ${trackId}`));
                    return;
                }

                setState("loadingDeck");
                deck.markLoading(trackId);

                try {
                    yield env.audio.loadDeck(deckId, track.filePath);
                    deck.markReady();
                    setState(self.activeDeck ? "performing" : "ready");
                } catch (error) {
                    deck.markError(error instanceof Error ? error.message : String(error));
                    fail(error);
                }
            }),

            playDeck: flow(function* playDeck(deckId: DeckId) {
                const env = getEnv<DJEnvironment>(self);
                const deck = deckId === "A" ? self.deckA : self.deckB;

                if (!deck.canPlay || !deck.trackId) return;

                try {
                    yield env.audio.play(deckId);
                    deck.markPlaying();
                    setState("performing");

                    self.history.push({
                        trackId: deck.trackId,
                        deckId,
                        startedAtMs: now(),
                    });
                } catch (error) {
                    deck.markError(error instanceof Error ? error.message : String(error));
                    fail(error);
                }
            }),

            pauseDeck: flow(function* pauseDeck(deckId: DeckId) {
                const env = getEnv<DJEnvironment>(self);
                const deck = deckId === "A" ? self.deckA : self.deckB;
                if (deck.status !== "playing") return;

                try {
                    yield env.audio.pause(deckId);
                    deck.markPaused();
                    setState(self.activeDeck ? "performing" : "ready");
                } catch (error) {
                    deck.markError(error instanceof Error ? error.message : String(error));
                    fail(error);
                }
            }),

            setDeckGain(deckId: DeckId, gain: number) {
                const env = getEnv<DJEnvironment>(self);
                const deck = deckId === "A" ? self.deckA : self.deckB;
                deck.setGain(gain);
                env.audio.setGain(deckId, deck.gain);
            },

            setDeckTempo(deckId: DeckId, tempo: number) {
                const env = getEnv<DJEnvironment>(self);
                const deck = deckId === "A" ? self.deckA : self.deckB;
                deck.setTempo(tempo);
                env.audio.setTempo(deckId, deck.tempo);
            },

            queueRecommendedTrack(index = 0) {
                const recommendation = self.recommendations[index];
                if (!recommendation) return undefined;

                const toDeck = self.standbyDeck;
                if (!toDeck) return undefined;

                return {
                    deckId: toDeck.id,
                    trackId: recommendation.trackId,
                };
            },

            startTransition(intent?: TransitionIntent, plan?: string) {
                const fromDeck = self.activeDeck;
                const toDeck = self.standbyDeck;

                if (!fromDeck?.trackId || !toDeck?.trackId) return;

                const recommendation = self.recommendations.find((item) => item.trackId === toDeck.trackId);

                self.activeTransition = TransitionModel.create({
                    id: `transition-${now()}`,
                    fromDeckId: fromDeck.id,
                    toDeckId: toDeck.id,
                    fromTrackId: fromDeck.trackId,
                    toTrackId: toDeck.trackId,
                    intent: intent ?? recommendation?.intent ?? "safeContinuation",
                    plan: plan ?? recommendation?.transitionPlan ?? "Manual transition.",
                });

                self.activeTransition.start(now());
                setState("transitioning");
            },

            completeTransition(reaction: "unknown" | "hit" | "neutral" | "miss" = "unknown") {
                if (!self.activeTransition) return;

                self.activeTransition.complete(now());

                const fromDeck = self.activeTransition.fromDeckId === "A" ? self.deckA : self.deckB;
                const toDeck = self.activeTransition.toDeckId === "A" ? self.deckA : self.deckB;

                fromDeck.markPaused();
                toDeck.markPlaying();

                const latest = self.history[self.history.length - 1];
                if (latest && latest.trackId === self.activeTransition.fromTrackId) {
                    latest.endedAtMs = now();
                    latest.crowdReaction = reaction;
                }

                self.crowd.update({ lastTrackReaction: reaction });
                self.activeTransition = undefined;
                setState("performing");
            },

            abortTransition() {
                if (!self.activeTransition) return;
                self.activeTransition.abort(now());
                self.activeTransition = undefined;
                setState(self.activeDeck ? "performing" : "ready");
            },

            recover() {
                self.error = undefined;
                if (self.deckA.status === "error") self.deckA.markEmpty();
                if (self.deckB.status === "error") self.deckB.markEmpty();
                setState(self.activeDeck ? "performing" : "ready");
            },
        };
    });

export type DJMachine = Instance<typeof DJMachineModel>;
export type DJMachineSnapshotIn = SnapshotIn<typeof DJMachineModel>;

// -----------------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------------

export function createDJMachine(env: DJEnvironment, snapshot?: Partial<DJMachineSnapshotIn>) {
    return DJMachineModel.create(
        {
            state: "idle",
            objective: "warmup",
            library: {},
            deckA: { id: "A" },
            deckB: { id: "B" },
            crowd: {},
            recommendations: [],
            history: [],
            ...snapshot,
        },
        env
    );
}

// -----------------------------------------------------------------------------
// Tiny utilities
// -----------------------------------------------------------------------------

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function clampInt(value: number, min: number, max: number) {
    return Math.round(clamp(value, min, max));
}

function round1(value: number) {
    return Math.round(value * 10) / 10;
}

function evolveRainRecommendations(
    existing: SetRecommendation[],
    candidates: TrackSnapshotIn[],
    currentTrackId?: string
): SetRecommendation[] {
    const byTrackId = new Map(existing.map((item) => [item.trackId, item]));
    const rainCandidates = candidates
        .filter((track) => track.id !== currentTrackId)
        .map((track) => ({
            track,
            score:
                (track.energy ?? 0) * 2 +
                (hasSection(track, "drop") ? 1.5 : 0) +
                (hasSection(track, "build") ? 1 : 0) +
                (track.tags.includes("festival") || track.tags.includes("banger") ? 0.75 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ track, score }) => {
            const fromAI = byTrackId.get(track.id);
            return {
                trackId: track.id,
                confidence: clamp(fromAI?.confidence ?? 0.72 + score * 0.03, 0, 0.99),
                intent: "rainDrop" as const,
                reason:
                    fromAI?.reason ??
                    "High-energy selection with strong drop/build profile to maximize peak crowd momentum.",
                transitionPlan:
                    fromAI?.transitionPlan ??
                    "Tease the build, carve the low-end, then slam on phrase boundary for maximum impact.",
                crowdSignalToWatch:
                    fromAI?.crowdSignalToWatch ?? "Hands up, chant density, and post-drop floor compression.",
            };
        });

    return dedupeRecommendations([...rainCandidates, ...existing]);
}

function hasSection(track: TrackSnapshotIn, label: SectionLabel) {
    return track.sections.some((section) => section.label === label);
}

function dedupeRecommendations(recommendations: SetRecommendation[]) {
    const seen = new Set<string>();
    const deduped: SetRecommendation[] = [];
    for (const recommendation of recommendations) {
        if (seen.has(recommendation.trackId)) continue;
        seen.add(recommendation.trackId);
        deduped.push(recommendation);
    }
    return deduped;
}
