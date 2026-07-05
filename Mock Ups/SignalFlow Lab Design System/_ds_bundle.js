/* @ds-bundle: {"format":3,"namespace":"SignalFlowLabDesignSystem_4c48cf","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"SectionLabel","sourcePath":"components/core/SectionLabel.jsx"},{"name":"StatItem","sourcePath":"components/core/StatItem.jsx"},{"name":"ThemeToggle","sourcePath":"components/core/ThemeToggle.jsx"},{"name":"CodeBlock","sourcePath":"components/lesson/CodeBlock.jsx"},{"name":"FieldGuideRow","sourcePath":"components/lesson/FieldGuideRow.jsx"},{"name":"ValidationRow","sourcePath":"components/lesson/ValidationRow.jsx"},{"name":"Stepper","sourcePath":"components/workflow/Stepper.jsx"},{"name":"WorkflowNode","sourcePath":"components/workflow/WorkflowNode.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"96260e5fd8c0","components/core/Button.jsx":"2a34ff78a749","components/core/Card.jsx":"23c020bdbe62","components/core/Chip.jsx":"6bd56887b238","components/core/Icon.jsx":"b58c00e5ff57","components/core/Logo.jsx":"11a9f18beefe","components/core/SectionLabel.jsx":"9f9676781e97","components/core/StatItem.jsx":"9cd1668fbd67","components/core/ThemeToggle.jsx":"097c53910f35","components/lesson/CodeBlock.jsx":"c214dc3a5e6c","components/lesson/FieldGuideRow.jsx":"f79f2ac4e74b","components/lesson/ValidationRow.jsx":"978279403eb1","components/workflow/Stepper.jsx":"59700a3910b3","components/workflow/WorkflowNode.jsx":"22ee853a9ae7","ui_kits/signalflow-lab/App.jsx":"1233a0a43f9a","ui_kits/signalflow-lab/LessonWorkspace.jsx":"eff4eabcc0a1","ui_kits/signalflow-lab/NodeDetailPanel.jsx":"8e2421c640de","ui_kits/signalflow-lab/WorkflowMap.jsx":"24c4fdfabd63","ui_kits/signalflow-lab/workflowData.js":"91ddfeceafb5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SignalFlowLabDesignSystem_4c48cf = window.SignalFlowLabDesignSystem_4c48cf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * Surface card — the workspace panel primitive. Hairline border, soft radius,
 * subtle shadow. `accent` adds the left type-color strip the node-detail panel
 * uses; `tone` tints the whole card for success/notice surfaces.
 */
const TONES = {
  default: {
    bg: 'var(--sf-surface)',
    border: 'var(--sf-border)'
  },
  success: {
    bg: 'var(--sf-success-weak)',
    border: 'var(--sf-green-300)'
  },
  warning: {
    bg: 'var(--sf-warning-weak)',
    border: 'var(--sf-amber-300)'
  },
  info: {
    bg: 'var(--sf-info-weak)',
    border: 'var(--sf-indigo-200)'
  },
  subtle: {
    bg: 'var(--sf-surface-subtle)',
    border: 'var(--sf-border)'
  }
};
const PADS = {
  sm: 'var(--sf-space-3)',
  md: 'var(--sf-space-4)',
  lg: 'var(--sf-space-5)'
};
function Card({
  children,
  tone = 'default',
  padding = 'md',
  accent,
  shadow = true,
  className = '',
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.default;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderLeft: accent ? `var(--sf-border-accent) solid ${accent}` : `1px solid ${t.border}`,
      borderRadius: 'var(--sf-radius-xl)',
      padding: PADS[padding] || PADS.md,
      boxShadow: shadow ? 'var(--sf-shadow-sm)' : 'none',
      color: 'var(--sf-text-body)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * Concept chip / tag — the muted pills used for lesson concepts and inline tags.
 * `mono` renders a field name or filename in the code font.
 */
function Chip({
  children,
  mono = false,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 6px',
      borderRadius: 'var(--sf-radius-sm)',
      background: 'var(--sf-surface-inset)',
      color: 'var(--sf-text-muted)',
      fontFamily: mono ? 'var(--sf-font-mono)' : 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-10)',
      fontWeight: mono ? 'var(--sf-weight-normal)' : 'var(--sf-weight-medium)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * SignalFlow Lab icon set.
 * A curated subset of Lucide (https://lucide.dev, ISC) — the closest match to
 * the product's screenshot iconography. 24×24 viewBox, 2px stroke, round caps.
 * Stroke inherits `currentColor`, so color it with CSS `color`.
 *
 * NOTE on substitution: the SignalFlow-Lab repo ships no UI icon set of its own
 * (its public/icons.svg is unrelated purple social glyphs). The product UI in the
 * reference screenshots uses Lucide-style line icons, so we embed a Lucide subset.
 */
const PATHS = {
  // node types & workflow
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  'line-chart': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  'git-branch': '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  // status & actions
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'circle-check-big': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  'circle-play': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  circle: '<circle cx="12" cy="12" r="10"/>'
};
function Icon({
  name,
  size = 16,
  strokeWidth = 2,
  className = '',
  style,
  ...rest
}) {
  const d = PATHS[name];
  if (!d) {
    if (typeof console !== 'undefined') console.warn(`[Icon] unknown name "${name}"`);
    return null;
  }
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    style: {
      flexShrink: 0,
      display: 'block',
      ...style
    },
    "aria-hidden": "true",
    dangerouslySetInnerHTML: {
      __html: d
    }
  }, rest));
}
const ICON_NAMES = Object.keys(PATHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * Status / lesson badge — the small rounded-full pill the product uses to mark
 * a node's progress or a lesson's maturity. Tone maps to a semantic token pair.
 */
const TONES = {
  context: {
    bg: 'var(--sf-context-weak)',
    fg: 'var(--sf-context-text)'
  },
  locked: {
    bg: 'var(--sf-locked-weak)',
    fg: 'var(--sf-text-muted)'
  },
  ready: {
    bg: 'var(--sf-ready-weak)',
    fg: 'var(--sf-ready-text)'
  },
  progress: {
    bg: 'var(--sf-progress-weak)',
    fg: 'var(--sf-progress-text)'
  },
  complete: {
    bg: 'var(--sf-complete-weak)',
    fg: 'var(--sf-complete-text)'
  },
  info: {
    bg: 'var(--sf-info-weak)',
    fg: 'var(--sf-info)'
  },
  neutral: {
    bg: 'var(--sf-surface-inset)',
    fg: 'var(--sf-text-muted)'
  }
};
function Badge({
  children,
  tone = 'neutral',
  icon,
  className = '',
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: 'var(--sf-radius-full)',
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-9)',
      fontWeight: 'var(--sf-weight-semibold)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 11,
    strokeWidth: 2.5
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * SignalFlow Lab button.
 * Variants mirror the product's action language: primary (blue), success
 * (emerald), warning (amber), neutral (hairline border), ghost, and link.
 */
const SIZES = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--sf-text-xs)',
    gap: '6px',
    icon: 14,
    radius: 'var(--sf-radius-md)'
  },
  md: {
    padding: '8px 16px',
    fontSize: 'var(--sf-text-sm)',
    gap: '8px',
    icon: 16,
    radius: 'var(--sf-radius-lg)'
  }
};
function variantStyle(variant) {
  switch (variant) {
    case 'success':
      return {
        background: 'var(--sf-success)',
        color: '#fff',
        border: '1px solid transparent',
        '--hov': 'var(--sf-emerald-700)'
      };
    case 'warning':
      return {
        background: 'var(--sf-progress)',
        color: '#fff',
        border: '1px solid transparent',
        '--hov': 'var(--sf-amber-600)'
      };
    case 'neutral':
      return {
        background: 'var(--sf-surface)',
        color: 'var(--sf-text-body)',
        border: '1px solid var(--sf-border-strong)',
        '--hov': 'var(--sf-surface-subtle)'
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--sf-text-body)',
        border: '1px solid transparent',
        '--hov': 'var(--sf-surface-subtle)'
      };
    case 'link':
      return {
        background: 'transparent',
        color: 'var(--sf-accent-text)',
        border: '1px solid transparent',
        padding: '0',
        '--hov': 'transparent'
      };
    case 'primary':
    default:
      return {
        background: 'var(--sf-accent)',
        color: '#fff',
        border: '1px solid transparent',
        '--hov': 'var(--sf-accent-hover)'
      };
  }
}
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  className = '',
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = variantStyle(variant);
  const isLink = variant === 'link';
  const [hover, setHover] = React.useState(false);
  const bg = hover && !disabled && v['--hov'] !== 'transparent' ? v['--hov'] : v.background;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    className: className,
    style: {
      display: isLink ? 'inline-flex' : fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      padding: isLink ? 0 : s.padding,
      fontFamily: 'var(--sf-font-sans)',
      fontSize: s.fontSize,
      fontWeight: 'var(--sf-weight-semibold)',
      lineHeight: 1.1,
      color: v.color,
      background: bg,
      border: v.border,
      borderRadius: isLink ? 0 : s.radius,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      textDecoration: isLink && hover && !disabled ? 'underline' : 'none',
      boxShadow: variant === 'neutral' || variant === 'primary' ? 'var(--sf-shadow-sm)' : 'none',
      transition: 'background .15s ease, opacity .15s ease, color .15s ease',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
/*
 * SignalFlow Lab brand mark — an equalizer / "signal bars" glyph in brand blue,
 * recreated from the product's reference screenshots (the repo ships no logo
 * file of its own). Pair with the "SignalFlow Lab" wordmark.
 */
function Logo({
  size = 28,
  showWordmark = true,
  wordmark = 'SignalFlow Lab',
  uppercase = false,
  color = 'var(--sf-accent)',
  className = '',
  style
}) {
  // Four bars of varying height, like a live signal / equalizer.
  const bars = [{
    x: 1,
    y: 9,
    h: 11
  }, {
    x: 7,
    y: 4,
    h: 16
  }, {
    x: 13,
    y: 12,
    h: 8
  }, {
    x: 19,
    y: 6,
    h: 14
  }];
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sf-space-2_5)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    style: {
      display: 'block'
    }
  }, bars.map((b, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: b.x,
    y: b.y,
    width: 4,
    height: b.h,
    rx: 1.5,
    fill: color,
    opacity: i === 1 ? 1 : 0.55 + i * 0.12
  }))), showWordmark && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--sf-font-sans)',
      fontWeight: 'var(--sf-weight-semibold)',
      fontSize: uppercase ? 'var(--sf-text-sm)' : 'var(--sf-text-lg)',
      letterSpacing: uppercase ? 'var(--sf-tracking-widest)' : '-0.01em',
      textTransform: uppercase ? 'uppercase' : 'none',
      color: 'var(--sf-text)',
      lineHeight: 1,
      whiteSpace: 'nowrap'
    }
  }, wordmark));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * Section label — the tiny uppercase tracked eyebrow used to title panels and
 * sections all over the product ("WORKFLOW MAP", "PURPOSE", "CONCEPTS").
 */
function SectionLabel({
  children,
  as = 'h4',
  size = 'sm',
  className = '',
  style,
  ...rest
}) {
  const Tag = as;
  const fontSize = size === 'xs' ? 'var(--sf-text-9)' : 'var(--sf-text-10)';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: className,
    style: {
      margin: 0,
      fontFamily: 'var(--sf-font-sans)',
      fontSize,
      fontWeight: 'var(--sf-weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--sf-tracking-wide)',
      color: 'var(--sf-text-subtle)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { SectionLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionLabel.jsx", error: String((e && e.message) || e) }); }

// components/core/StatItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * Stat item — the icon + big number + label metric used in the header summary
 * and the bottom "Workflow Health" bar. `tone` colors the icon + number.
 */
const TONES = {
  default: 'var(--sf-text)',
  complete: 'var(--sf-complete)',
  ready: 'var(--sf-ready)',
  progress: 'var(--sf-progress)',
  locked: 'var(--sf-locked)',
  accent: 'var(--sf-accent)'
};
function StatItem({
  icon,
  value,
  label,
  tone = 'default',
  className = '',
  style,
  ...rest
}) {
  const color = TONES[tone] || TONES.default;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sf-space-2_5)',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-xl)',
      fontWeight: 'var(--sf-weight-semibold)',
      color
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-text-muted)'
    }
  }, label)));
}
Object.assign(__ds_scope, { StatItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatItem.jsx", error: String((e && e.message) || e) }); }

// components/core/ThemeToggle.jsx
try { (() => {
/*
 * Light / Dark theme toggle — the segmented control from the product top bar.
 * Controlled: pass `value` ('light' | 'dark') and `onChange`.
 */
function ThemeToggle({
  value = 'light',
  onChange,
  className = '',
  style
}) {
  const options = [{
    id: 'light',
    label: 'Light',
    icon: 'sun'
  }, {
    id: 'dark',
    label: 'Dark',
    icon: 'moon'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    role: "group",
    "aria-label": "Theme",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      padding: '3px',
      borderRadius: 'var(--sf-radius-lg)',
      background: 'var(--sf-surface-inset)',
      border: '1px solid var(--sf-border)',
      ...style
    }
  }, options.map(o => {
    const active = value === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      type: "button",
      "aria-pressed": active,
      onClick: () => onChange && onChange(o.id),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: 'var(--sf-radius-md)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--sf-font-sans)',
        fontSize: 'var(--sf-text-xs)',
        fontWeight: 'var(--sf-weight-medium)',
        background: active ? 'var(--sf-surface)' : 'transparent',
        color: active ? 'var(--sf-text)' : 'var(--sf-text-muted)',
        boxShadow: active ? 'var(--sf-shadow-sm)' : 'none',
        transition: 'background .15s ease, color .15s ease'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: o.icon,
      size: 14
    }), o.label);
  }));
}
Object.assign(__ds_scope, { ThemeToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ThemeToggle.jsx", error: String((e && e.message) || e) }); }

// components/lesson/CodeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * CodeBlock — the inset mono well the product uses for JSON examples, artifact
 * previews, and source notes. `wrap` keeps prose notes from overflowing.
 */
function CodeBlock({
  children,
  wrap = false,
  label,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("pre", _extends({
    className: className,
    style: {
      margin: 0,
      padding: 'var(--sf-space-3)',
      borderRadius: 'var(--sf-radius-md)',
      background: 'var(--sf-surface-subtle)',
      border: '1px solid var(--sf-border-subtle)',
      color: 'var(--sf-text-body)',
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-sm)',
      lineHeight: 'var(--sf-leading-snug)',
      whiteSpace: wrap ? 'pre-wrap' : 'pre',
      overflow: 'auto',
      ...style
    }
  }, rest), typeof children === 'string' ? children : JSON.stringify(children, null, 2));
}
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/lesson/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/lesson/FieldGuideRow.jsx
try { (() => {
/*
 * FieldGuideRow — one entry in a lesson's Field Guide: the field name (mono
 * chip), its JSON type, plain-language meaning, an example, and a hint.
 */
function FieldGuideRow({
  field,
  type,
  meaning,
  example,
  hint,
  divider = true,
  className = '',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      paddingTop: divider ? 'var(--sf-space-3)' : 0,
      borderTop: divider ? '1px solid var(--sf-border-subtle)' : 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--sf-space-2)'
    }
  }, /*#__PURE__*/React.createElement("code", {
    style: {
      padding: '2px 6px',
      borderRadius: 'var(--sf-radius-sm)',
      background: 'var(--sf-surface-inset)',
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-text)'
    }
  }, field), type && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--sf-text-10)',
      fontWeight: 'var(--sf-weight-medium)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--sf-tracking-wide)',
      color: 'var(--sf-text-subtle)'
    }
  }, type)), meaning && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-text-body)',
      lineHeight: 'var(--sf-leading-snug)'
    }
  }, meaning), example != null && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-text-muted)'
    }
  }, "Example: ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--sf-font-mono)',
      color: 'var(--sf-text-body)'
    }
  }, example)), hint && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-text-muted)'
    }
  }, "Hint: ", hint));
}
Object.assign(__ds_scope, { FieldGuideRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/lesson/FieldGuideRow.jsx", error: String((e && e.message) || e) }); }

// components/lesson/ValidationRow.jsx
try { (() => {
/*
 * ValidationRow — one deterministic check result, pass (green) or fail (red),
 * with an optional hint shown only on failure. Used in the lesson's results pane.
 */
function ValidationRow({
  label,
  message,
  passed = false,
  hint,
  className = '',
  style
}) {
  const skin = passed ? {
    border: 'var(--sf-green-300)',
    bg: 'var(--sf-success-weak)',
    fg: 'var(--sf-complete-text)'
  } : {
    border: 'var(--sf-red-200)',
    bg: 'var(--sf-danger-weak)',
    fg: 'var(--sf-danger)'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '8px 12px',
      borderRadius: 'var(--sf-radius-md)',
      border: `1px solid ${skin.border}`,
      background: skin.bg,
      color: skin.fg,
      fontFamily: 'var(--sf-font-sans)',
      fontSize: 'var(--sf-text-sm)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginTop: '1px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: passed ? 'check' : 'x',
    size: 15,
    strokeWidth: 2.5
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      lineHeight: 'var(--sf-leading-snug)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--sf-weight-semibold)'
    }
  }, label, ": "), message)), !passed && hint && /*#__PURE__*/React.createElement("span", {
    style: {
      paddingLeft: '23px',
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-danger)'
    }
  }, "Hint: ", hint));
}
Object.assign(__ds_scope, { ValidationRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/lesson/ValidationRow.jsx", error: String((e && e.message) || e) }); }

// components/workflow/Stepper.jsx
try { (() => {
/*
 * Stepper — the Intro → Exercise → Takeaway progress pills from the lesson
 * workspace. Pass ordered `steps` and the active index.
 */
function Stepper({
  steps = [],
  current = 0,
  className = '',
  style
}) {
  return /*#__PURE__*/React.createElement("ol", {
    className: className,
    "aria-label": "Lesson steps",
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--sf-space-2)',
      listStyle: 'none',
      margin: 0,
      padding: 0
    }
  }, steps.map((label, i) => {
    const done = i < current;
    const active = i === current;
    const colors = active ? {
      border: 'var(--sf-accent)',
      bg: 'var(--sf-accent-weak)',
      fg: 'var(--sf-accent-text)'
    } : done ? {
      border: 'var(--sf-green-300)',
      bg: 'var(--sf-success-weak)',
      fg: 'var(--sf-complete-text)'
    } : {
      border: 'var(--sf-border)',
      bg: 'var(--sf-surface)',
      fg: 'var(--sf-text-muted)'
    };
    return /*#__PURE__*/React.createElement("li", {
      key: label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sf-space-2)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: 'var(--sf-radius-full)',
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.fg,
        fontFamily: 'var(--sf-font-sans)',
        fontSize: 'var(--sf-text-xs)',
        fontWeight: 'var(--sf-weight-medium)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 13,
      strokeWidth: 2.5
    }) : i + 1), label), i < steps.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--sf-text-subtle)',
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "arrow-right",
      size: 14
    })));
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workflow/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/workflow/WorkflowNode.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * WorkflowNode — the signature object on the SignalFlow Lab canvas.
 * A type icon + uppercase type label, the node label, and (for artifacts) a
 * mono filename. Border/fill come from STATUS; a ring marks the node's
 * relationship to the current selection (selected / upstream / downstream).
 *
 * Signal-flow state model:
 *   ready        — task can be started; all inputs present
 *   in-progress  — started but not yet validated
 *   complete     — validation passed; artifact saved
 *                  (type=artifact → emerald/cyan emphasis via artifact-trusted tokens)
 *   needs-inputs — can reuse upstream artifact but is not yet build-ready
 *   upcoming     — visible future node; not currently actionable
 *   context      — inspectable; no build action available
 *   locked       — not accessible in this session
 *
 * Signal-flow ring semantics:
 *   selected   — blue double ring (current focus)
 *   upstream   — amber ring (raw signal source; --sf-signal-raw)
 *   downstream — teal ring (reuse/feed path; --sf-signal-reuse)
 */
const TYPE_META = {
  source: {
    color: 'var(--sf-type-source)',
    icon: 'file-text',
    label: 'Source'
  },
  reference: {
    color: 'var(--sf-type-reference)',
    icon: 'shield',
    label: 'Reference'
  },
  artifact: {
    color: 'var(--sf-type-artifact)',
    icon: 'braces',
    label: 'Artifact'
  },
  process: {
    color: 'var(--sf-type-process)',
    icon: 'line-chart',
    label: 'Process'
  },
  decision: {
    color: 'var(--sf-type-decision)',
    icon: 'user-check',
    label: 'Decision'
  },
  handoff: {
    color: 'var(--sf-type-handoff)',
    icon: 'send',
    label: 'Handoff'
  },
  output: {
    color: 'var(--sf-type-output)',
    icon: 'file-text',
    label: 'Output'
  },
  archive: {
    color: 'var(--sf-type-archive)',
    icon: 'archive',
    label: 'Archive'
  }
};
function statusSkin(status, type, typeColor) {
  /* Trusted artifact: type=artifact + complete → emerald/cyan emphasis.
     This distinguishes "structured signal object" (type identity, cyan) from
     "validated trusted artifact" (completion state, emerald + cyan border). */
  if (status === 'complete' && type === 'artifact') {
    return {
      border: 'var(--sf-artifact-trusted-border)',
      /* cyan */
      bg: 'var(--sf-artifact-trusted-weak)' /* emerald-50 */
    };
  }
  switch (status) {
    case 'complete':
      return {
        border: 'var(--sf-complete)',
        bg: 'var(--sf-complete-weak)'
      };
    case 'in-progress':
      return {
        border: 'var(--sf-progress)',
        bg: 'var(--sf-surface)'
      };
    case 'ready':
      return {
        border: 'var(--sf-accent-border)',
        bg: 'var(--sf-surface)'
      };
    case 'needs-inputs':
      return {
        border: 'var(--sf-needs-inputs)',
        bg: 'var(--sf-needs-inputs-weak)'
      };
    case 'upcoming':
      return {
        border: 'var(--sf-upcoming)',
        bg: 'var(--sf-surface-subtle)'
      };
    case 'context':
      return {
        border: 'color-mix(in srgb, ' + typeColor + ' 45%, transparent)',
        bg: 'color-mix(in srgb, ' + typeColor + ' 9%, var(--sf-surface))'
      };
    case 'locked':
    default:
      return {
        border: 'var(--sf-border)',
        bg: 'var(--sf-surface-subtle)'
      };
  }
}
function WorkflowNode({
  type = 'artifact',
  label,
  artifactName,
  status = 'ready',
  relation = 'none',
  // 'selected' | 'upstream' | 'downstream' | 'none'
  dimmed = false,
  icon,
  onClick,
  className = '',
  style,
  ...rest
}) {
  const meta = TYPE_META[type] || TYPE_META.artifact;
  const skin = statusSkin(status, type, meta.color);
  const locked = status === 'locked';
  const muted = locked || status === 'upcoming';

  // Ring uses signal-flow semantics: amber upstream, teal downstream, blue selected
  let ring = 'none';
  if (relation === 'selected') ring = '0 0 0 2px var(--sf-surface), 0 0 0 4px var(--sf-accent)';else if (relation === 'downstream') ring = '0 0 0 2px var(--sf-signal-reuse)';else if (relation === 'upstream') ring = '0 0 0 2px var(--sf-signal-raw)';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    title: label,
    "aria-pressed": relation === 'selected',
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      width: 'var(--sf-node-w)',
      minHeight: 'var(--sf-node-h)',
      padding: '10px',
      textAlign: 'left',
      borderRadius: 'var(--sf-radius-xl)',
      border: `1px solid ${skin.border}`,
      background: skin.bg,
      color: muted ? 'var(--sf-text-subtle)' : 'var(--sf-text)',
      boxShadow: ring === 'none' ? 'var(--sf-shadow-sm)' : ring,
      opacity: dimmed ? 0.45 : 1,
      cursor: 'pointer',
      transition: 'box-shadow .15s ease, opacity .15s ease, border-color .15s ease',
      fontFamily: 'var(--sf-font-sans)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: meta.color,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || meta.icon,
    size: 13,
    strokeWidth: 2.25
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--sf-text-10)',
      fontWeight: 'var(--sf-weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--sf-tracking-wide)',
      color: meta.color
    }
  }, meta.label)), status === 'complete' && type === 'artifact' && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-artifact-trusted)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-check",
    size: 15,
    strokeWidth: 2.25
  })), status === 'complete' && type !== 'artifact' && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-complete)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-check",
    size: 15,
    strokeWidth: 2.25
  })), status === 'needs-inputs' && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-needs-inputs)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alert-circle",
    size: 15,
    strokeWidth: 2.25
  })), locked && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-text-subtle)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "lock",
    size: 13
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 'var(--sf-weight-semibold)',
      lineHeight: 'var(--sf-leading-tight)'
    }
  }, label), artifactName && /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 'auto',
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-10)',
      color: 'var(--sf-text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, artifactName));
}
Object.assign(__ds_scope, { WorkflowNode });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workflow/WorkflowNode.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signalflow-lab/App.jsx
try { (() => {
/* SignalFlow Lab UI kit — orchestrator: theme, view routing, progress state. */
const {
  Button,
  Icon,
  SectionLabel,
  Badge
} = window.SignalFlowLabDesignSystem_4c48cf;
function ArtifactViewer({
  node,
  onBack
}) {
  const artifact = node.id === 'market-intake-record' ? {
    hub: 'ERCOT',
    peakPrice: '$187/MWh',
    settledPrice: '$142/MWh',
    generationFlag: 'Wind underperformed',
    approvalRequired: true
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--sf-bg)',
      color: 'var(--sf-text)',
      fontFamily: 'var(--sf-font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    icon: "arrow-left",
    onClick: onBack
  }, "Back to Canvas"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '6px 0 2px',
      fontSize: 'var(--sf-text-2xl)',
      fontWeight: 600
    }
  }, node.label, " Artifact"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-text-muted)'
    }
  }, node.artifactName), /*#__PURE__*/React.createElement(Badge, {
    tone: "complete",
    icon: "circle-check"
  }, "Built"))), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      padding: 16,
      borderRadius: 'var(--sf-radius-xl)',
      border: '1px solid var(--sf-border)',
      background: 'var(--sf-surface)',
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-text-body)',
      overflow: 'auto',
      boxShadow: 'var(--sf-shadow-sm)'
    }
  }, JSON.stringify(artifact, null, 2))));
}
function App() {
  const [theme, setTheme] = React.useState('light');
  const [nodes, setNodes] = React.useState(() => window.SF_NODES.map(n => ({
    ...n
  })));
  const [selectedId, setSelectedId] = React.useState('market-intake-record');
  const [view, setView] = React.useState('canvas'); // canvas | lesson | artifact
  const [activeNode, setActiveNode] = React.useState(null);
  const phases = window.SF_PHASES;
  const edges = window.SF_EDGES;
  function startLesson(node) {
    if (node.lessonId !== 'lesson-intake') return; // only Intake is fully interactive
    setActiveNode(node);
    setNodes(prev => prev.map(n => n.id === node.id ? {
      ...n,
      status: 'in-progress'
    } : n));
    setView('lesson');
  }
  function completeLesson(nodeId) {
    setNodes(prev => prev.map(n => n.id === nodeId ? {
      ...n,
      status: 'complete'
    } : n));
  }
  function viewArtifact(node) {
    setActiveNode(node);
    setView('artifact');
  }
  function backToCanvas() {
    setView('canvas');
  }
  function reset() {
    setNodes(window.SF_NODES.map(n => ({
      ...n
    })));
    setSelectedId('market-intake-record');
    setView('canvas');
  }
  const WorkflowMap = window.WorkflowMap;
  const LessonWorkspace = window.LessonWorkspace;
  let screen;
  if (view === 'lesson' && activeNode) {
    screen = /*#__PURE__*/React.createElement(LessonWorkspace, {
      lesson: window.SF_LESSON_INTAKE,
      onBack: backToCanvas,
      onComplete: completeLesson
    });
  } else if (view === 'artifact' && activeNode) {
    screen = /*#__PURE__*/React.createElement(ArtifactViewer, {
      node: nodes.find(n => n.id === activeNode.id),
      onBack: backToCanvas
    });
  } else {
    screen = /*#__PURE__*/React.createElement(WorkflowMap, {
      nodes: nodes,
      phases: phases,
      edges: edges,
      selectedId: selectedId,
      onSelect: setSelectedId,
      theme: theme,
      onToggleTheme: setTheme,
      onStart: startLesson,
      onViewArtifact: viewArtifact,
      onReset: reset
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    "data-theme": theme === 'dark' ? 'dark' : undefined,
    style: {
      minHeight: '100vh',
      background: 'var(--sf-bg)'
    }
  }, view === 'canvas' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 20
    }
  }, !nodes.find(n => n.id === 'market-intake-record').status.includes('complete') && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--sf-surface)',
      border: '1px solid var(--sf-border)',
      borderRadius: 'var(--sf-radius-lg)',
      boxShadow: 'var(--sf-shadow-lg)',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      maxWidth: 280
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-accent)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-help",
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-text-body)',
      lineHeight: 1.4
    }
  }, "Try it: select ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--sf-text)'
    }
  }, "Market Intake Record"), " and Start lesson."))), screen);
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signalflow-lab/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signalflow-lab/LessonWorkspace.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* SignalFlow Lab UI kit — the three-step Lesson Workspace (Intro → Exercise → Takeaway). */
const {
  Stepper,
  Card,
  CodeBlock,
  FieldGuideRow,
  ValidationRow,
  Button,
  Badge,
  SectionLabel,
  Icon,
  Chip
} = window.SignalFlowLabDesignSystem_4c48cf;
function validateIntake(answerText, lesson) {
  let obj;
  try {
    obj = JSON.parse(answerText);
  } catch {
    return {
      ok: false,
      results: [{
        label: 'JSON',
        message: 'Could not parse — check for missing quotes or commas.',
        passed: false,
        hint: 'Every key and string value needs double quotes.'
      }]
    };
  }
  const norm = v => String(v == null ? '' : v).toLowerCase().trim();
  const checks = [{
    id: 'hub',
    label: 'hub',
    test: () => norm(obj.hub).includes('ercot'),
    msg: () => obj.hub ? 'Matches expected hub ERCOT.' : 'Missing or wrong hub.',
    hint: 'Look for the named trading hub or region.'
  }, {
    id: 'peakPrice',
    label: 'peakPrice',
    test: () => norm(obj.peakPrice).includes('187'),
    msg: () => 'Peak price captured.',
    hint: 'Find the spike value before it settled ($187).'
  }, {
    id: 'settledPrice',
    label: 'settledPrice',
    test: () => norm(obj.settledPrice).includes('142'),
    msg: () => 'Settled price captured.',
    hint: 'Find the price the note says it settled near ($142).'
  }, {
    id: 'generationFlag',
    label: 'generationFlag',
    test: () => norm(obj.generationFlag).includes('wind') && norm(obj.generationFlag).includes('under'),
    msg: () => 'Generation status captured.',
    hint: 'Name the source and that it underperformed.'
  }, {
    id: 'approvalRequired',
    label: 'approvalRequired',
    test: () => obj.approvalRequired === true,
    msg: () => 'Approval flag correctly set to true.',
    hint: 'The trader flagged it — use the boolean true.'
  }];
  const results = checks.map(c => {
    const passed = c.test();
    return {
      label: c.label,
      message: passed ? c.msg() : 'Value not recognized.',
      passed,
      hint: c.hint
    };
  });
  return {
    ok: results.every(r => r.passed),
    results
  };
}
function CopilotPromptCard({
  prompt
}) {
  const [copied, setCopied] = React.useState(false);
  return /*#__PURE__*/React.createElement(Card, {
    tone: "info",
    padding: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-info)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "braces",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-info)'
    }
  }, "Copilot Prompt Coach")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(CodeBlock, {
    wrap: true
  }, prompt)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "neutral",
    icon: copied ? 'check' : 'copy',
    onClick: () => {
      try {
        navigator.clipboard.writeText(prompt);
      } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }, copied ? 'Copied!' : 'Copy Prompt')));
}
function LessonWorkspace({
  lesson,
  onBack,
  onComplete
}) {
  const STEPS = ['Intro', 'Exercise', 'Takeaway'];
  const [step, setStep] = React.useState(0);
  const [answer, setAnswer] = React.useState(lesson.starterAnswer);
  const [results, setResults] = React.useState(null);
  const [passed, setPassed] = React.useState(false);
  const [checked, setChecked] = React.useState(lesson.instructions.map(() => false));
  function handleValidate() {
    const r = validateIntake(answer, lesson);
    setResults(r.results);
    setPassed(r.ok);
    if (r.ok) onComplete(lesson.nodeId, lesson.solution);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--sf-bg)',
      color: 'var(--sf-text)',
      fontFamily: 'var(--sf-font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    icon: "arrow-left",
    onClick: onBack
  }, "Back to Canvas"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '6px 0 2px',
      fontSize: 'var(--sf-text-2xl)',
      fontWeight: 600
    }
  }, lesson.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, lesson.difficulty), " ", lesson.skill)), /*#__PURE__*/React.createElement(Stepper, {
    steps: STEPS,
    current: step
  }), step === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--sf-text-lg)',
      fontWeight: 600,
      color: 'var(--sf-text)'
    }
  }, lesson.intro.heading), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, lesson.intro.sections.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.title
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-text)'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--sf-text-sm)',
      lineHeight: 1.5,
      color: 'var(--sf-text-body)'
    }
  }, s.body))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "JSON Example"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(CodeBlock, null, lesson.jsonExample))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "You will produce"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-text)',
      fontFamily: 'var(--sf-font-mono)'
    }
  }, lesson.nodeId === 'lesson-intake' ? 'market-intake.json' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Skill you are practicing")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-text)'
    }
  }, lesson.skill))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconRight: "arrow-right",
    onClick: () => setStep(1)
  }, "Continue to Exercise"))), step === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr 0.9fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, lesson.inputLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(CodeBlock, {
    wrap: true
  }, lesson.input))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Instructions"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: '8px 0 0',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, lesson.instructions.map((ins, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 8,
      cursor: 'pointer',
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-text-body)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked[i],
    onChange: () => setChecked(p => p.map((v, j) => j === i ? !v : v)),
    style: {
      marginTop: 2,
      accentColor: 'var(--sf-accent)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      textDecoration: checked[i] ? 'line-through' : 'none',
      color: checked[i] ? 'var(--sf-text-subtle)' : 'var(--sf-text-body)'
    }
  }, ins)))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Field Guide"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, lesson.fieldGuide.map((f, i) => /*#__PURE__*/React.createElement(FieldGuideRow, _extends({
    key: f.field,
    divider: i !== 0
  }, f)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Your Answer (JSON)"), /*#__PURE__*/React.createElement("textarea", {
    value: answer,
    onChange: e => setAnswer(e.target.value),
    spellCheck: false,
    rows: 13,
    style: {
      marginTop: 8,
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical',
      borderRadius: 'var(--sf-radius-md)',
      border: '1px solid var(--sf-border-strong)',
      background: 'var(--sf-surface)',
      color: 'var(--sf-text)',
      padding: 12,
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-sm)',
      lineHeight: 1.5,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "circle-check",
    onClick: handleValidate
  }, "Validate"))), passed && /*#__PURE__*/React.createElement(Card, {
    tone: "success"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-green-800)'
    }
  }, lesson.successMessage), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "success",
    iconRight: "arrow-right",
    onClick: () => setStep(2)
  }, "Continue to Takeaway"))), /*#__PURE__*/React.createElement(CopilotPromptCard, {
    prompt: lesson.copilotPrompt
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Validation Results"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, results ? results.map((r, i) => /*#__PURE__*/React.createElement(ValidationRow, _extends({
    key: i
  }, r))) : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-text-muted)'
    }
  }, "Validate your answer to see per-field results and hints here."))), passed && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Output Preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(CodeBlock, null, lesson.solution))))), step === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "success",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-complete)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 22
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--sf-text-lg)',
      fontWeight: 600,
      color: 'var(--sf-green-900)'
    }
  }, lesson.takeaway.heading)), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: '14px 0 0',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, lesson.takeaway.points.map((p, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 'var(--sf-text-sm)',
      color: 'var(--sf-green-900)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-complete)',
      display: 'inline-flex',
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    strokeWidth: 2.5
  })), p))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "success",
    icon: "workflow",
    onClick: onBack
  }, "Return to Canvas"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Artifact produced"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-text)'
    }
  }, "market-intake.json"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(CodeBlock, null, lesson.solution))))));
}
window.LessonWorkspace = LessonWorkspace;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signalflow-lab/LessonWorkspace.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signalflow-lab/NodeDetailPanel.jsx
try { (() => {
/* SignalFlow Lab UI kit — selected-node detail panel (right rail). */
const {
  Badge,
  Chip,
  SectionLabel,
  Button,
  Icon
} = window.SignalFlowLabDesignSystem_4c48cf;
const TYPE_LABEL = {
  source: 'Source object',
  reference: 'Reference object',
  artifact: 'Artifact',
  process: 'Process step',
  decision: 'Decision point',
  handoff: 'Handoff',
  output: 'Output',
  archive: 'Archive'
};
const TYPE_VAR = {
  source: 'var(--sf-type-source)',
  reference: 'var(--sf-type-reference)',
  artifact: 'var(--sf-type-artifact)',
  process: 'var(--sf-type-process)',
  decision: 'var(--sf-type-decision)',
  handoff: 'var(--sf-type-handoff)',
  output: 'var(--sf-type-output)',
  archive: 'var(--sf-type-archive)'
};
const STATUS_BADGE = {
  context: {
    tone: 'context',
    label: 'Context'
  },
  locked: {
    tone: 'locked',
    label: 'Upcoming'
  },
  upcoming: {
    tone: 'locked',
    label: 'Upcoming'
  },
  ready: {
    tone: 'ready',
    label: 'Ready'
  },
  'in-progress': {
    tone: 'progress',
    label: 'In progress'
  },
  'needs-inputs': {
    tone: 'progress',
    label: 'Needs inputs'
  },
  complete: {
    tone: 'complete',
    label: 'Complete'
  }
};
function PanelSection({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--sf-border-subtle)',
      paddingTop: 10,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    size: "xs"
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      fontSize: 'var(--sf-text-11)',
      lineHeight: 'var(--sf-leading-snug)',
      color: 'var(--sf-text-body)'
    }
  }, children));
}
function LinkRow({
  items,
  color,
  onSelect
}) {
  if (!items.length) return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-text-subtle)'
    }
  }, "\u2014");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px 8px'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    type: "button",
    onClick: () => onSelect(it.id),
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      font: 'inherit',
      fontWeight: 600,
      color
    }
  }, it.label, i < items.length - 1 ? ' ·' : '')));
}
function NodeDetailPanel({
  node,
  nodesById,
  edges,
  onSelect,
  onStart,
  onViewArtifact
}) {
  if (!node) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--sf-surface)',
        border: '1px solid var(--sf-border)',
        borderRadius: 'var(--sf-radius-xl)',
        padding: 16,
        fontSize: 12,
        color: 'var(--sf-text-muted)'
      }
    }, "Select a node in the workflow map to inspect it.");
  }
  const accent = TYPE_VAR[node.type];
  const badge = STATUS_BADGE[node.status] || STATUS_BADGE.locked;
  const feedsInto = edges.filter(e => e.from === node.id).map(e => ({
    id: e.to,
    label: nodesById[e.to].label
  }));
  const dependsOn = edges.filter(e => e.to === node.id).map(e => ({
    id: e.from,
    label: nodesById[e.from].label
  }));
  const buildable = !!node.lessonId;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--sf-surface)',
      border: '1px solid var(--sf-border)',
      borderLeft: `var(--sf-border-accent) solid ${accent}`,
      borderRadius: 'var(--sf-radius-xl)',
      padding: 14,
      boxShadow: 'var(--sf-shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--sf-text-9)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--sf-tracking-wide)',
      color: accent
    }
  }, TYPE_LABEL[node.type]), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 700,
      lineHeight: 1.2,
      color: 'var(--sf-text)'
    }
  }, node.label), node.artifactName && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      fontFamily: 'var(--sf-font-mono)',
      fontSize: 'var(--sf-text-10)',
      color: 'var(--sf-text-muted)'
    }
  }, node.artifactName)), /*#__PURE__*/React.createElement(Badge, {
    tone: badge.tone,
    icon: node.status === 'complete' ? 'circle-check' : node.status === 'needs-inputs' ? 'alert-circle' : node.status === 'locked' || node.status === 'upcoming' ? 'lock' : undefined
  }, badge.label)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: 'var(--sf-text-11)',
      lineHeight: 'var(--sf-leading-snug)',
      color: 'var(--sf-text-muted)'
    }
  }, node.description), /*#__PURE__*/React.createElement(PanelSection, {
    title: "What you'll do"
  }, node.intent), /*#__PURE__*/React.createElement(PanelSection, {
    title: "Concepts"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4
    }
  }, node.concepts.map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c
  }, c)))), /*#__PURE__*/React.createElement(PanelSection, {
    title: "In the lab"
  }, node.labVersion), /*#__PURE__*/React.createElement(PanelSection, {
    title: "Depends on"
  }, dependsOn.length === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-text-subtle)'
    }
  }, "Entry point") : /*#__PURE__*/React.createElement(LinkRow, {
    items: dependsOn,
    color: "var(--sf-signal-raw)",
    onSelect: onSelect
  })), /*#__PURE__*/React.createElement(PanelSection, {
    title: "Feeds into"
  }, feedsInto.length === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-text-subtle)'
    }
  }, "Nothing downstream") : /*#__PURE__*/React.createElement(LinkRow, {
    items: feedsInto,
    color: "var(--sf-signal-reuse)",
    onSelect: onSelect
  })), /*#__PURE__*/React.createElement(PanelSection, {
    title: "Governance"
  }, node.governance), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, buildable && node.status === 'ready' && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    iconRight: "arrow-right",
    onClick: () => onStart(node)
  }, "Start lesson"), buildable && node.status === 'complete' && /*#__PURE__*/React.createElement(Button, {
    variant: "success",
    fullWidth: true,
    icon: "braces",
    onClick: () => onViewArtifact(node)
  }, "View artifact"), !buildable && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: '8px 10px',
      borderRadius: 'var(--sf-radius-lg)',
      background: 'var(--sf-surface-subtle)',
      fontSize: 'var(--sf-text-11)',
      lineHeight: 1.4,
      color: 'var(--sf-text-muted)'
    }
  }, node.status === 'context' ? 'Inspection node — read its provenance and reuse; nothing to build here.' : 'Lesson defined — the interaction is coming in a later pass.')));
}
window.NodeDetailPanel = NodeDetailPanel;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signalflow-lab/NodeDetailPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signalflow-lab/WorkflowMap.jsx
try { (() => {
/* SignalFlow Lab UI kit — the Workflow Map (home screen). */
const {
  WorkflowNode,
  Logo,
  ThemeToggle,
  Button,
  Icon,
  SectionLabel,
  StatItem,
  Badge
} = window.SignalFlowLabDesignSystem_4c48cf;
const PHASE_DOT = {
  complete: 'var(--sf-complete)',
  'in-progress': 'var(--sf-progress)',
  ready: 'var(--sf-ready)'
};
function phaseStatus(nodes, phaseId) {
  const ns = nodes.filter(n => n.phaseId === phaseId);
  if (ns.some(n => n.status === 'in-progress')) return 'in-progress';
  if (ns.some(n => n.status === 'ready')) return 'ready';
  if (ns.some(n => n.lessonId) && ns.filter(n => n.lessonId).every(n => n.status === 'complete')) return 'complete';
  return 'locked';
}
function edgeColor(edge, selectedId, statusById) {
  if (edge.from === selectedId) return {
    c: 'var(--sf-edge-downstream)',
    w: 2.5,
    o: 1
  };
  if (edge.to === selectedId) return {
    c: 'var(--sf-edge-upstream)',
    w: 2.5,
    o: 1
  };
  if (statusById[edge.from] === 'complete') return {
    c: 'var(--sf-edge-completed)',
    w: 1.5,
    o: 0.7
  };
  return {
    c: 'var(--sf-edge-muted)',
    w: 1.5,
    o: 0.5
  };
}
function Canvas({
  nodes,
  phases,
  edges,
  selectedId,
  onSelect,
  statusById
}) {
  const contentRef = React.useRef(null);
  const nodeRefs = React.useRef({});
  const [paths, setPaths] = React.useState([]);
  const [dims, setDims] = React.useState({
    w: 0,
    h: 0
  });
  const measure = React.useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const base = content.getBoundingClientRect();
    setDims({
      w: content.scrollWidth,
      h: content.scrollHeight
    });
    const next = [];
    edges.forEach(e => {
      const a = nodeRefs.current[e.from];
      const b = nodeRefs.current[e.to];
      if (!a || !b) return;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const sx = ra.right - base.left,
        sy = ra.top - base.top + ra.height / 2;
      const tx = rb.left - base.left,
        ty = rb.top - base.top + rb.height / 2;
      let d;
      if (tx <= sx) {
        // same/earlier column — bow out to the right
        const bx = Math.max(sx, sx) + 30;
        d = `M ${sx} ${sy} C ${bx} ${sy}, ${bx} ${ty}, ${tx + rb.width} ${ty}`;
        d = `M ${sx} ${sy} C ${sx + 34} ${sy}, ${tx - 34} ${ty}, ${tx} ${ty}`;
      } else {
        const dx = (tx - sx) * 0.5;
        d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
      }
      next.push({
        key: `${e.from}->${e.to}`,
        d,
        ...edgeColor(e, selectedId, statusById)
      });
    });
    setPaths(next);
  }, [edges, selectedId, statusById]);
  React.useLayoutEffect(() => {
    measure();
  }, [measure, nodes]);
  React.useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);
  const related = React.useMemo(() => {
    if (!selectedId) return null;
    const s = new Set([selectedId]);
    edges.forEach(e => {
      if (e.from === selectedId) s.add(e.to);
      if (e.to === selectedId) s.add(e.from);
    });
    return s;
  }, [selectedId, edges]);
  const EDGE_MARKERS = ['var(--sf-edge-downstream)', 'var(--sf-edge-upstream)', 'var(--sf-edge-completed)', 'var(--sf-edge-muted)'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      borderRadius: 'var(--sf-radius-xl)',
      border: '1px solid var(--sf-border)',
      background: 'var(--sf-surface)',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: contentRef,
    style: {
      position: 'relative',
      display: 'inline-flex',
      gap: 18,
      minWidth: '100%'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'visible'
    },
    width: dims.w,
    height: dims.h,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, EDGE_MARKERS.map((c, i) => /*#__PURE__*/React.createElement("marker", {
    key: i,
    id: `sf-arrow-${i}`,
    viewBox: "0 0 10 10",
    refX: "8",
    refY: "5",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto-start-reverse"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 0 L10 5 L0 10 z",
    fill: c
  })))), paths.map(p => /*#__PURE__*/React.createElement("path", {
    key: p.key,
    d: p.d,
    fill: "none",
    stroke: p.c,
    strokeWidth: p.w,
    opacity: p.o,
    markerEnd: `url(#sf-arrow-${EDGE_MARKERS.indexOf(p.c)})`
  }))), phases.map((phase, i) => {
    const ns = nodes.filter(n => n.phaseId === phase.id);
    const ps = phaseStatus(nodes, phase.id);
    const sel = selectedId && nodes.find(n => n.id === selectedId)?.phaseId === phase.id;
    return /*#__PURE__*/React.createElement("div", {
      key: phase.id,
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: 210,
        flexShrink: 0,
        padding: '10px 10px 16px',
        borderRadius: 'var(--sf-radius-2xl)',
        background: sel ? 'var(--sf-phase-band-sel)' : i % 2 === 0 ? 'var(--sf-phase-band)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: PHASE_DOT[ps] || 'var(--sf-locked)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--sf-text-10)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 'var(--sf-tracking-widest)',
        color: sel ? 'var(--sf-accent-text)' : 'var(--sf-text-subtle)'
      }
    }, "Phase ", phase.order)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        fontSize: 'var(--sf-text-xs)',
        fontWeight: 600,
        color: 'var(--sf-text)',
        lineHeight: 1.2
      }
    }, phase.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--sf-text-10)',
        color: 'var(--sf-text-muted)'
      }
    }, phase.goal)), ns.map(n => {
      let relation = 'none';
      if (n.id === selectedId) relation = 'selected';else if (selectedId) {
        if (edges.some(e => e.from === selectedId && e.to === n.id)) relation = 'downstream';else if (edges.some(e => e.to === selectedId && e.from === n.id)) relation = 'upstream';
      }
      const dimmed = related ? !related.has(n.id) : false;
      return /*#__PURE__*/React.createElement("div", {
        key: n.id,
        ref: el => {
          nodeRefs.current[n.id] = el;
        }
      }, /*#__PURE__*/React.createElement(WorkflowNode, {
        type: n.type,
        label: n.label,
        artifactName: n.artifactName,
        status: n.status,
        relation: relation,
        dimmed: dimmed,
        onClick: () => onSelect(n.id),
        style: {
          width: '100%'
        }
      }));
    }));
  })));
}
function WorkflowMap({
  nodes,
  phases,
  edges,
  selectedId,
  onSelect,
  theme,
  onToggleTheme,
  onStart,
  onViewArtifact,
  onReset
}) {
  const nodesById = React.useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  const statusById = React.useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n.status])), [nodes]);
  const selected = nodesById[selectedId];
  const buildable = nodes.filter(n => n.lessonId);
  const built = buildable.filter(n => n.status === 'complete').length;
  const ready = nodes.filter(n => n.status === 'ready').length;
  const waiting = nodes.filter(n => n.status === 'locked' && n.artifactName).length;
  const locked = nodes.filter(n => n.status === 'locked').length;
  const NodeDetailPanel = window.NodeDetailPanel;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--sf-bg)',
      color: 'var(--sf-text)',
      fontFamily: 'var(--sf-font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '12px 24px',
      background: 'var(--sf-surface)',
      borderBottom: '1px solid var(--sf-border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    uppercase: true,
    size: 22
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--sf-border)',
      paddingLeft: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--sf-text-9)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--sf-tracking-wide)',
      color: 'var(--sf-text-subtle)'
    }
  }, "Project"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--sf-text-sm)',
      fontWeight: 600,
      color: 'var(--sf-text)'
    }
  }, "Meridian Morning Market Brief ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--sf-text-xs)',
      color: 'var(--sf-text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 14
  }), " 6:15 AM CT"), /*#__PURE__*/React.createElement(ThemeToggle, {
    value: theme,
    onChange: onToggleTheme
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "neutral",
    size: "sm",
    icon: "rotate-cw",
    onClick: onReset
  }, "Start Over"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--sf-text-2xl)',
      fontWeight: 600,
      color: 'var(--sf-text)'
    }
  }, "Meridian Morning Market Brief"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 'var(--sf-text-sm)',
      lineHeight: 1.5,
      color: 'var(--sf-text-muted)'
    }
  }, "Build a workplace automation that turns messy overnight market inputs into an approval-ready 7:00 AM brief. The map below is the real dependency graph \u2014 phases on the left feed objects that get reused, evaluated, and routed downstream."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 'var(--sf-text-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--sf-text-body)',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clipboard-list",
    size: 15
  }), " Interactive tasks built: ", built, " of ", buildable.length), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sf-border-strong)'
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--sf-text-muted)',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "workflow",
    size: 15
  }), " Workflow lessons defined: ", nodes.length, " of ", nodes.length)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, {
    style: {
      marginBottom: 10
    }
  }, "Workflow Map"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) var(--sf-detail-w)',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Canvas, {
    nodes: nodes,
    phases: phases,
    edges: edges,
    selectedId: selectedId,
    onSelect: onSelect,
    statusById: statusById
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 24
    }
  }, /*#__PURE__*/React.createElement(NodeDetailPanel, {
    node: selected,
    nodesById: nodesById,
    edges: edges,
    onSelect: onSelect,
    onStart: onStart,
    onViewArtifact: onViewArtifact
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 40,
      flexWrap: 'wrap',
      padding: '16px 20px',
      background: 'var(--sf-surface)',
      border: '1px solid var(--sf-border)',
      borderRadius: 'var(--sf-radius-xl)',
      boxShadow: 'var(--sf-shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Workflow Health"), /*#__PURE__*/React.createElement(StatItem, {
    icon: "circle-check-big",
    value: built,
    label: "Artifacts built",
    tone: "complete"
  }), /*#__PURE__*/React.createElement(StatItem, {
    icon: "circle-play",
    value: ready,
    label: "Tasks ready",
    tone: "ready"
  }), /*#__PURE__*/React.createElement(StatItem, {
    icon: "clock",
    value: waiting,
    label: "Waiting on inputs",
    tone: "progress"
  }), /*#__PURE__*/React.createElement(StatItem, {
    icon: "lock",
    value: locked,
    label: "Future nodes locked",
    tone: "locked"
  }))));
}
window.WorkflowMap = WorkflowMap;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signalflow-lab/WorkflowMap.jsx", error: String((e && e.message) || e) }); }

// ui_kits/signalflow-lab/workflowData.js
try { (() => {
/*
 * SignalFlow Lab — Meridian Morning Market Brief workflow data.
 * Condensed from the source repo's src/data/*.json (workflowNodes, phases,
 * edges) plus lesson-intake.json. Used by the UI-kit recreation.
 */

window.SF_PHASES = [{
  id: 'intake-layer',
  order: 1,
  title: 'Intake Layer',
  goal: 'Capture raw signals'
}, {
  id: 'data-structure-layer',
  order: 2,
  title: 'Data Structure Layer',
  goal: 'Build trusted records'
}, {
  id: 'evaluation-layer',
  order: 3,
  title: 'Evaluation Layer',
  goal: 'Assess and analyze'
}, {
  id: 'routing-layer',
  order: 4,
  title: 'Routing Layer',
  goal: 'Decide and route'
}, {
  id: 'brief-assembly-layer',
  order: 5,
  title: 'Brief Assembly Layer',
  goal: 'Assemble and deliver'
}];

// status: 'context' | 'ready' | 'in-progress' | 'complete' | 'locked'
window.SF_NODES = [{
  id: 'analyst-notes',
  label: 'Analyst Notes',
  type: 'source',
  phaseId: 'intake-layer',
  status: 'context',
  artifactName: null,
  description: 'Unstructured overnight market commentary from the trading desk. The raw input the whole workflow starts from.',
  intent: 'Inspect where this raw note comes from, its real-world sources, and the access ingesting it would require.',
  concepts: ['Source provenance', 'Unstructured input', 'Ingestion'],
  labVersion: 'Local text fixture stored in lesson-intake.json (the note you read in the Intake task).',
  governance: 'Ingesting from inbox, Teams, or a terminal needs access and permission; provenance must be retained for audit.'
}, {
  id: 'trader-flag',
  label: 'Trader Flag',
  type: 'source',
  phaseId: 'intake-layer',
  status: 'context',
  artifactName: null,
  description: 'An escalation signal a trader raises when overnight movement may need a closer look.',
  intent: 'Interpret a human escalation signal and map it to the structured approvalRequired field the workflow acts on.',
  concepts: ['Escalation signals', 'Boolean/event flags', 'Human judgment as data'],
  labVersion: 'Represented as the approval cue inside the analyst note fixture.',
  governance: 'Requires agreement on what counts as a flag, and ownership of the escalation channel.'
}, {
  id: 'market-intake-record',
  label: 'Market Intake Record',
  type: 'artifact',
  phaseId: 'intake-layer',
  status: 'ready',
  artifactName: 'market-intake.json',
  description: 'A structured JSON record created from the analyst notes and trader flag. The first machine-readable artifact in the workflow.',
  intent: 'Extract hub, peakPrice, settledPrice, generationFlag, and approvalRequired from a messy note into valid JSON and pass field validation.',
  concepts: ['JSON', 'Named fields / schema', 'Field extraction', 'Deterministic validation'],
  labVersion: 'Built by you in the Intake task by extracting fields from the analyst note.',
  governance: 'Requires agreement on the required intake fields; the schema is the contract every downstream step trusts.',
  lessonId: 'lesson-intake'
}, {
  id: 'price-feed',
  label: 'Price Feed / CSV Rows',
  type: 'source',
  phaseId: 'data-structure-layer',
  status: 'context',
  artifactName: null,
  description: 'Raw overnight price rows for the relevant hubs, usually delivered as CSV or a market feed.',
  intent: 'Inspect where numeric data enters, its column format, and the access a real feed or export would require.',
  concepts: ['Tabular/CSV ingestion', 'Feed scheduling', 'Column formats'],
  labVersion: 'Not wired up yet — shown to reveal where numeric data enters the workflow.',
  governance: 'Needs access to the feed or export and knowledge of the column contract.'
}, {
  id: 'forecast-data',
  label: 'Forecast Data',
  type: 'source',
  phaseId: 'data-structure-layer',
  status: 'context',
  artifactName: null,
  description: 'Expected generation and price forecasts used to judge how the actual overnight numbers compare.',
  intent: 'Inspect a second numeric input and judge why "which forecast is authoritative" matters before it is compared.',
  concepts: ['Comparison inputs', 'Joining datasets by key', 'Authoritative source'],
  labVersion: 'Not wired up yet — shown as a second numeric input.',
  governance: 'Requires agreement on which forecast is authoritative (ownership of source-of-truth).'
}, {
  id: 'prior-day-reference',
  label: 'Prior Day Reference',
  type: 'reference',
  phaseId: 'data-structure-layer',
  status: 'context',
  artifactName: null,
  description: "Yesterday's normalized prices, kept as a baseline so today's movement has something to compare against.",
  intent: 'Inspect how a saved prior run is retained and reused as today\u2019s comparison baseline.',
  concepts: ['Baselines', 'Historical retention', 'Temporal reuse'],
  labVersion: 'Stubbed reference object for now.',
  governance: 'Needs read access to prior runs and a retention location; retention policy is a governance decision.'
}, {
  id: 'clean-price-data',
  label: 'Clean Price Data',
  type: 'artifact',
  phaseId: 'data-structure-layer',
  status: 'ready',
  artifactName: 'clean-prices.json',
  description: 'Normalized, validated price values pulled into a consistent table the rules engine can trust.',
  intent: 'Coerce and validate raw price rows into a trusted, normalized clean-prices.json table.',
  concepts: ['Normalization', 'Validation', 'Data quality', 'Type coercion'],
  labVersion: 'Built by you in the Clean Price Data task by normalizing messy price rows into a numeric table.',
  governance: 'Read access to the feed plus a store for the cleaned table; data-quality rules are the trust boundary downstream.',
  lessonId: 'lesson-clean-price-data'
}, {
  id: 'threshold-policy',
  label: 'Threshold Policy',
  type: 'reference',
  phaseId: 'evaluation-layer',
  status: 'ready',
  artifactName: 'threshold-policy.json',
  description: 'Reusable business rules that define when market movement requires attention. Referenced by several downstream steps.',
  intent: 'Set and version the threshold values reused by three downstream nodes, and decide their ownership and approval path.',
  concepts: ['Business rules as config', 'Parameterization', 'Policy vs logic'],
  labVersion: 'Built by you in the Threshold Policy task by setting and versioning the threshold values.',
  governance: 'Strongest governance node on the map: needs business-owner approval, risk-policy access, and versioning.',
  lessonId: 'lesson-threshold-policy'
}, {
  id: 'variance-check',
  label: 'Variance Check',
  type: 'process',
  phaseId: 'evaluation-layer',
  status: 'locked',
  artifactName: 'variance-summary.json',
  description: 'Compares actuals against forecast and the prior day to surface meaningful variance before the risk rules run.',
  intent: 'Compute actual-vs-forecast and actual-vs-prior deltas and flag material variance.',
  concepts: ['Comparison steps', 'Materiality thresholds', 'Flagging deltas'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: 'Requires agreement on what variance is material (a business rule overlapping Threshold Policy).'
}, {
  id: 'risk-evaluation',
  label: 'Risk Evaluation',
  type: 'process',
  phaseId: 'evaluation-layer',
  status: 'locked',
  artifactName: 'risk-evaluation.json',
  description: 'Applies the threshold policy to the intake record, clean prices, and variance to produce a decision-ready risk view.',
  intent: 'Apply the threshold policy to the intake record, clean prices, and variance to emit the reusable risk-evaluation.json record.',
  concepts: ['Rules engine', 'Applying policy to data', 'Decision-ready record'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: 'Needs the agreed threshold values and read access to four upstream artifacts; the risk record should be auditable.'
}, {
  id: 'approval-template',
  label: 'Approval Template',
  type: 'reference',
  phaseId: 'routing-layer',
  status: 'context',
  artifactName: 'approval-template.json',
  description: 'A reusable template that shapes how an approval request is written when sign-off is needed.',
  intent: 'Define the reusable approval format and the required fields a sign-off request must contain.',
  concepts: ['Output templating', 'Reusable formats', 'Required-field standards'],
  labVersion: 'Stubbed reference object for now.',
  governance: 'Needs agreement on required approval fields; the template standardizes what every approver sees.'
}, {
  id: 'approval-decision',
  label: 'Approval Decision',
  type: 'decision',
  phaseId: 'routing-layer',
  status: 'locked',
  artifactName: null,
  description: 'The branch point: does this movement require sign-off, or can it flow straight to the brief as routine?',
  intent: 'Encode the if/else branch from the risk evaluation and log each decision for audit.',
  concepts: ['Branching logic', 'Thresholds', 'Decision audit logging'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: 'Needs the escalation threshold and knowledge of who can approve; every decision should be logged for audit.'
}, {
  id: 'approval-route',
  label: 'Approval Route',
  type: 'handoff',
  phaseId: 'routing-layer',
  status: 'locked',
  artifactName: 'approval-route.json',
  description: 'When sign-off is needed, the request is routed to an approver and the response is captured before the brief goes out.',
  intent: 'Route a sign-off request to an approver and capture the yes/no response as approval-route.json.',
  concepts: ['Handoff', 'Human-in-the-loop approval', 'Capturing a response'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: 'Needs the ability to message the approver and a place to record the response; the response is an audit record.'
}, {
  id: 'routine-update-path',
  label: 'Routine Update Path',
  type: 'handoff',
  phaseId: 'routing-layer',
  status: 'locked',
  artifactName: null,
  description: 'The other side of the branch: when no approval is needed, movement is logged as a routine note for the brief.',
  intent: 'Handle the no-approval branch: write a routine note when below threshold and keep it for the audit trail.',
  concepts: ['Alternate-branch handling', 'No-action logging', 'Path symmetry'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: "Needs a place to record routine outcomes; 'no action' must still be auditable."
}, {
  id: 'prior-day-brief-template',
  label: 'Prior Day Brief Template',
  type: 'reference',
  phaseId: 'brief-assembly-layer',
  status: 'context',
  artifactName: null,
  description: "The brief's reusable structure, carried over from prior days so the morning output stays consistent.",
  intent: 'Inspect the reusable brief structure and how it keeps the daily output consistent before assembly.',
  concepts: ['Output structure', 'Consistency', 'Templating across runs'],
  labVersion: 'Stubbed reference object for now.',
  governance: 'Needs agreement on the brief sections; template versioning keeps output consistent.'
}, {
  id: 'morning-brief',
  label: 'Morning Brief',
  type: 'output',
  phaseId: 'brief-assembly-layer',
  status: 'locked',
  artifactName: 'market-brief.md',
  description: 'The approval-ready 7:00 AM summary that joins intake, clean prices, risk, and approval status into one business output.',
  intent: 'Assemble the intake record, clean prices, risk, approval status, and template into one approval-ready market-brief.md.',
  concepts: ['Aggregation / assembly', 'Joining artifacts', 'Rendering output'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: 'Needs read access to all upstream artifacts plus the template; the assembled brief is the record of the day.'
}, {
  id: 'distribution-archive',
  label: 'Distribution / Archive',
  type: 'archive',
  phaseId: 'brief-assembly-layer',
  status: 'locked',
  artifactName: null,
  description: "The finished brief is delivered to the desk and stored for the record, seeding tomorrow's prior-day reference.",
  intent: "Deliver the brief to the desk, archive it for the record, and seed tomorrow's prior-day baseline.",
  concepts: ['Delivery', 'Retention', 'Audit trail', 'Feedback loop'],
  labVersion: 'Built in a future phase — shown to reveal the full workflow shape.',
  governance: 'Needs send permission to the distribution list and write access to the archive; retention/audit policy applies.'
}];
window.SF_EDGES = [{
  from: 'analyst-notes',
  to: 'market-intake-record'
}, {
  from: 'trader-flag',
  to: 'market-intake-record'
}, {
  from: 'market-intake-record',
  to: 'risk-evaluation'
}, {
  from: 'market-intake-record',
  to: 'approval-decision'
}, {
  from: 'market-intake-record',
  to: 'morning-brief'
}, {
  from: 'price-feed',
  to: 'clean-price-data'
}, {
  from: 'forecast-data',
  to: 'variance-check'
}, {
  from: 'prior-day-reference',
  to: 'variance-check'
}, {
  from: 'clean-price-data',
  to: 'risk-evaluation'
}, {
  from: 'clean-price-data',
  to: 'morning-brief'
}, {
  from: 'threshold-policy',
  to: 'risk-evaluation'
}, {
  from: 'threshold-policy',
  to: 'approval-decision'
}, {
  from: 'threshold-policy',
  to: 'morning-brief'
}, {
  from: 'variance-check',
  to: 'risk-evaluation'
}, {
  from: 'risk-evaluation',
  to: 'approval-decision'
}, {
  from: 'risk-evaluation',
  to: 'morning-brief'
}, {
  from: 'approval-template',
  to: 'approval-route'
}, {
  from: 'approval-decision',
  to: 'approval-route'
}, {
  from: 'approval-decision',
  to: 'routine-update-path'
}, {
  from: 'approval-route',
  to: 'morning-brief'
}, {
  from: 'routine-update-path',
  to: 'morning-brief'
}, {
  from: 'prior-day-brief-template',
  to: 'morning-brief'
}, {
  from: 'morning-brief',
  to: 'distribution-archive'
}];

// The fully-built Intake lesson (from lesson-intake.json).
window.SF_LESSON_INTAKE = {
  id: 'lesson-intake',
  nodeId: 'market-intake-record',
  title: 'Turn Analyst Notes into Structured JSON',
  difficulty: 'Beginner',
  skill: 'Field extraction',
  inputLabel: 'Source Note',
  input: 'Checked overnight prices. ERCOT hub spiked around 2am, hit $187/MWh briefly then settled near $142/MWh. Wind generation underperformed, about 60% of forecast. Gas prices up slightly. Trader flagged the hub spike for review. No action taken yet. Need approval if we move on this.',
  instructions: ['Identify the market hub referenced.', 'Find the peak price and the settled price.', 'Find the generation source and performance status.', 'Determine whether approval was flagged.', 'Return a valid JSON object with those fields.'],
  starterAnswer: '{\n  "hub": "",\n  "peakPrice": "",\n  "settledPrice": "",\n  "generationFlag": "",\n  "approvalRequired": false\n}',
  solution: {
    hub: 'ERCOT',
    peakPrice: '$187/MWh',
    settledPrice: '$142/MWh',
    generationFlag: 'Wind underperformed',
    approvalRequired: true
  },
  jsonExample: '{\n  "city": "Austin",\n  "temperature": 98,\n  "alertSent": true\n}',
  copilotPrompt: 'Extract structured JSON from this analyst note. Return fields for hub, peakPrice, settledPrice, generationFlag, and approvalRequired. Use true or false for boolean fields.',
  successMessage: 'Intake record built. The workflow now has structured data to work with.',
  fieldGuide: [{
    field: 'hub',
    type: 'string',
    meaning: 'The market hub mentioned in the note.',
    example: '"ERCOT"',
    hint: 'Look for the named trading hub or region.'
  }, {
    field: 'peakPrice',
    type: 'string',
    meaning: 'The highest price mentioned in the note.',
    example: '"$187/MWh"',
    hint: 'Find the spike or peak value before it settled.'
  }, {
    field: 'settledPrice',
    type: 'string',
    meaning: 'The later price the market settled near.',
    example: '"$142/MWh"',
    hint: 'Find the price the note says it settled at.'
  }, {
    field: 'generationFlag',
    type: 'string',
    meaning: 'The generation source plus its performance status.',
    example: '"Wind underperformed"',
    hint: 'Name the source and whether it over- or underperformed.'
  }, {
    field: 'approvalRequired',
    type: 'boolean',
    meaning: 'Whether approval is needed before acting.',
    example: 'true',
    hint: 'Use true or false based on whether the note flags approval.'
  }],
  intro: {
    heading: 'Before you build: structured intake',
    sections: [{
      title: 'What is JSON?',
      body: 'JSON is a simple text format for structured data. It stores information as named fields and values, so software can read it reliably instead of guessing.'
    }, {
      title: 'Why structured data matters',
      body: 'Automation cannot act on a messy paragraph. Turning notes into named fields lets every later step run consistently without re-reading the original text.'
    }, {
      title: 'How this workflow uses it',
      body: 'Your Intake output is the first record in the Meridian workflow. Structure, Evaluate, Route, and Brief all build on the fields you extract here.'
    }]
  },
  takeaway: {
    heading: 'Intake complete',
    points: ['You turned an unstructured note into structured JSON.', 'Each named field is now reliable input for the rest of the workflow.', 'Field extraction is the foundation every later automation step depends on.']
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/signalflow-lab/workflowData.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.SectionLabel = __ds_scope.SectionLabel;

__ds_ns.StatItem = __ds_scope.StatItem;

__ds_ns.ThemeToggle = __ds_scope.ThemeToggle;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.FieldGuideRow = __ds_scope.FieldGuideRow;

__ds_ns.ValidationRow = __ds_scope.ValidationRow;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.WorkflowNode = __ds_scope.WorkflowNode;

})();
