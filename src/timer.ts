import { nowMs } from "./time";

export interface TimerState {
  isRunning: boolean;
  startedAtMs: number | null;
  accumulatedMs: number;
  wallClockStartMs: number | null;
  wallClockEndMs: number | null;
}

export function createTimer(): TimerState {
  return {
    isRunning: false,
    startedAtMs: null,
    accumulatedMs: 0,
    wallClockStartMs: null,
    wallClockEndMs: null,
  };
}

export function getElapsedMs(state: TimerState): number {
  if (!state.isRunning || state.startedAtMs == null) return state.accumulatedMs;
  return state.accumulatedMs + (nowMs() - state.startedAtMs);
}

export function startTimer(state: TimerState): void {
  if (state.isRunning) return;
  if (state.accumulatedMs === 0) {
    state.wallClockStartMs = nowMs();
    state.wallClockEndMs = null;
  }
  state.isRunning = true;
  state.startedAtMs = nowMs();
}

export function stopTimer(state: TimerState): void {
  if (!state.isRunning || state.startedAtMs == null) return;
  state.accumulatedMs += nowMs() - state.startedAtMs;
  state.startedAtMs = null;
  state.isRunning = false;
}

export function finalizeTimer(state: TimerState): void {
  stopTimer(state);
  state.wallClockEndMs = nowMs();
}

export function resetTimer(state: TimerState): void {
  state.isRunning = false;
  state.startedAtMs = null;
  state.accumulatedMs = 0;
  state.wallClockStartMs = null;
  state.wallClockEndMs = null;
}
