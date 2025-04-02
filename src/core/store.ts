/**
 * State management for Helix
 * Global state with fine-grained reactivity
 */

import { createSignal } from './reactivity';

/**
 * Creates a store for global state management
 */
export function createStore<T extends Record<string, any>>(initialState: T) {
  const state: Record<keyof T, ReturnType<typeof createSignal>> = {} as any;

  // Create signals for each state property
  for (const [key, value] of Object.entries(initialState)) {
    state[key as keyof T] = createSignal(value);
  }

  // Store accessor and updater
  const getState = <K extends keyof T>(key: K): T[K] => {
    return (state[key][0] as () => T[K])();
  };

  const setState = <K extends keyof T>(
    key: K,
    value: T[K] | ((prev: T[K]) => T[K])
  ): void => {
    const setter = state[key][1] as (v: T[K] | ((prev: T[K]) => T[K])) => void;
    setter(value);
  };

  // Actions system
  const createActions = <A extends Record<string, (payload: any) => void>>(
    actionDefinitions: (store: {
      getState: typeof getState;
      setState: typeof setState;
    }) => A
  ): A => {
    return actionDefinitions({ getState, setState });
  };

  return {
    getState,
    setState,
    createActions,
  };
}
