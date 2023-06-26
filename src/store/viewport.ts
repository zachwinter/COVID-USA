import type { ComputedRef, Ref } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';

export const MOBILE_BREAKPOINT: number = 320;
export const TABLET_BREAKPOINT: number = 768;
export const LAPTOP_BREAKPOINT: number = 1280;
export const DESKTOP_BREAKPOINT: number = 1650;

export const useViewport = defineStore('viewport', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const d = window.devicePixelRatio;
  const focused: Ref<boolean> = ref(false);
  const forceFocus: Ref<boolean> = ref(false);
  const forcedBlur: Ref<boolean> = ref(false);
  const width: Ref<number> = ref(w);
  const height: Ref<number> = ref(h);
  const dpr: Ref<number> = ref(d);
  const screen: Ref<number> = ref(w * h * d);
  const refreshRate: any = ref(null);
  const fullScreen = ref(false);
  const scale = ref(1);
  const touch = ref('ontouchstart' in window);

  const setScale = (val: number): void => {
    document.documentElement.style.setProperty('--viewport-scale', `${val}`);
    scale.value = val;
  };

  const orientation: ComputedRef<'LANDSCAPE' | 'PORTRAIT'> = computed(() => {
    if (width.value >= height.value) return 'LANDSCAPE';
    return 'PORTRAIT';
  });

  const landscape: ComputedRef<boolean> = computed(() => {
    return orientation.value === 'LANDSCAPE';
  });

  const portrait: ComputedRef<boolean> = computed(() => {
    return orientation.value === 'PORTRAIT';
  });

  const mobile: ComputedRef<boolean> = computed(() => {
    return (
      (width.value <= 500 && height.value <= 1000) ||
      (width.value <= 1000 && height.value <= 500)
    );
  });

  const tablet: ComputedRef<boolean> = computed(() => {
    return !mobile.value && width.value * height.value <= 1024 * 1366;
  });

  const setBreakpoint = () => {
    document.documentElement.style.setProperty('--viewport-width', `${w}px`);

    if (mobile.value) {
      if (portrait.value) return setScale(3.5);
      return setScale(1.75);
    }

    if (tablet.value) {
      if (portrait.value) return setScale(0.85);
      return setScale(0.7);
    }

    return setScale(.8);
  };

  document.documentElement.style.setProperty('--viewport-width', `${w}px`);
  document.documentElement.style.setProperty('--viewport-height', `${h}px`);

  setBreakpoint();

  const set = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const d = window.devicePixelRatio;
    width.value = w;
    height.value = h;
    dpr.value = d;
    screen.value = w * h * d;
    document.documentElement.style.setProperty('--viewport-width', `${w}px`);
    document.documentElement.style.setProperty('--viewport-height', `${h}px`);
    document.documentElement.style.setProperty(
      '--element-height',
      mobile.value
        ? 'var(--mobile-element-height)'
        : 'var(--desktop-element-height)'
    );
    setBreakpoint();
  };

  set();

  window.addEventListener('resize', () => set());
  window.addEventListener('orientationchange', () => set());

  return {
    width,
    height,
    dpr,
    screen,
    orientation,
    landscape,
    portrait,
    scroll,
    focused,
    forceFocus,
    mobile,
    tablet,
    forcedBlur,
    refreshRate,
    fullScreen,
    scale,
    touch,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useViewport, import.meta.hot));
