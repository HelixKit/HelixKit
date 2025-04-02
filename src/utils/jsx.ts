/**
 * JSX runtime utilities for Helix
 */

import { h } from '../core/component';
// We need Fragment for JSX, it's referenced in transformed code
import { Fragment as _Fragment } from '../core/component';
import type { Element as CoreElement } from '../core/types';

/**
 * JSX types for TypeScript
 */
// Define interfaces separately
export interface JSXElement extends CoreElement {}

export interface JSXIntrinsicElements {
    // HTML elements
    a: any;
    abbr: any;
    address: any;
    area: any;
    article: any;
    aside: any;
    audio: any;
    b: any;
    base: any;
    bdi: any;
    bdo: any;
    big: any;
    blockquote: any;
    body: any;
    br: any;
    button: any;
    canvas: any;
    caption: any;
    cite: any;
    code: any;
    col: any;
    colgroup: any;
    data: any;
    datalist: any;
    dd: any;
    del: any;
    details: any;
    dfn: any;
    dialog: any;
    div: any;
    dl: any;
    dt: any;
    em: any;
    embed: any;
    fieldset: any;
    figcaption: any;
    figure: any;
    footer: any;
    form: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    head: any;
    header: any;
    hgroup: any;
    hr: any;
    html: any;
    i: any;
    iframe: any;
    img: any;
    input: any;
    ins: any;
    kbd: any;
    keygen: any;
    label: any;
    legend: any;
    li: any;
    link: any;
    main: any;
    map: any;
    mark: any;
    menu: any;
    menuitem: any;
    meta: any;
    meter: any;
    nav: any;
    noscript: any;
    object: any;
    ol: any;
    optgroup: any;
    option: any;
    output: any;
    p: any;
    param: any;
    picture: any;
    pre: any;
    progress: any;
    q: any;
    rp: any;
    rt: any;
    ruby: any;
    s: any;
    samp: any;
    script: any;
    section: any;
    select: any;
    small: any;
    source: any;
    span: any;
    strong: any;
    style: any;
    sub: any;
    summary: any;
    sup: any;
    table: any;
    tbody: any;
    td: any;
    textarea: any;
    tfoot: any;
    th: any;
    thead: any;
    time: any;
    title: any;
    tr: any;
    track: any;
    u: any;
    ul: any;
    var: any;
    video: any;
    wbr: any;

    // SVG elements
    svg: any;
    animate: any;
    animateMotion: any;
    animateTransform: any;
    circle: any;
    clipPath: any;
    defs: any;
    desc: any;
    ellipse: any;
    feBlend: any;
    feColorMatrix: any;
    feComponentTransfer: any;
    feComposite: any;
    feConvolveMatrix: any;
    feDiffuseLighting: any;
    feDisplacementMap: any;
    feDistantLight: any;
    feDropShadow: any;
    feFlood: any;
    feFuncA: any;
    feFuncB: any;
    feFuncG: any;
    feFuncR: any;
    feGaussianBlur: any;
    feImage: any;
    feMerge: any;
    feMergeNode: any;
    feMorphology: any;
    feOffset: any;
    fePointLight: any;
    feSpecularLighting: any;
    feSpotLight: any;
    feTile: any;
    feTurbulence: any;
    filter: any;
    foreignObject: any;
    g: any;
    image: any;
    line: any;
    linearGradient: any;
    marker: any;
    mask: any;
    metadata: any;
    path: any;
    pattern: any;
    polygon: any;
    polyline: any;
    radialGradient: any;
    rect: any;
    stop: any;
    symbol: any;
    text: any;
    textPath: any;
    tspan: any;
    use: any;
    view: any;
}

// Export Fragment for JSX support
export const Fragment = _Fragment;

// Export types individually (ES2015 style)
export type Element = JSXElement;
export type IntrinsicElements = JSXIntrinsicElements;

// TypeScript still needs the namespace for JSX
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export interface Element extends JSXElement {}
  export interface IntrinsicElements extends JSXIntrinsicElements {}
}

/**
 * JSX factory function for Babel
 */
export function jsx(
  type: string | ((...args: any[]) => any),
  props: any,
  key?: string
): CoreElement {
  props = props || {};

  if (key !== undefined) {
    props.key = key;
  }

  return h(type, props, ...(props.children ? [props.children] : []));
}

/**
 * JSX fragment factory
 */
export function jsxs(
  type: string | ((...args: any[]) => any),
  props: any,
  key?: string
): CoreElement {
  return jsx(type, props, key);
}

/**
 * JSX DEV factory (for development only)
 */
export function jsxDEV(
  type: string | ((...args: any[]) => any),
  props: any,
  key?: string,
  _isStaticChildren?: boolean,
  _source?: any,
  _self?: any
): CoreElement {
  // Development-specific JSX transform
  // This would typically include additional debug info
  return jsx(type, props, key);
}