/**
 * Type definitions for Helix
 */

export interface Element {
  type: string | ((...args: any[]) => any);
  props: Record<string, any>;
  children: Array<Element | string | number | boolean | null>;
  key?: string | number;
  rendered?: Element;
}

export interface MountedComponent {
  element: Element;
  node: HTMLElement | Text;
  cleanup: Array<() => void>;
  children: Array<MountedComponent>;
}

export type Component<Props = Record<string, never>> = (props: Props) => Element | null;

export interface Context<T> {
  Provider: Component<{ value: T; children: any }>;
  use: () => T;
}

export interface Resource<T> {
  (): T | undefined;
  loading: () => boolean;
  error: () => Error | null;
}

export interface Store<T> {
  getState: <K extends keyof T>(key: K) => T[K];
  setState: <K extends keyof T>(
    key: K,
    value: T[K] | ((prev: T[K]) => T[K])
  ) => void;
  createActions: <A>(fn: (store: Store<T>) => A) => A;
}
