/**
 * Counter-based body-scroll lock.
 *
 * Multiple overlays (CommandPalette, KeyboardHelp, future modals) can be open
 * at once — e.g. open the command palette, hit `?` to see shortcuts. If each
 * one stashes `document.body.style.overflow` independently, you get classic
 * stack-cleanup bugs:
 *
 *   1. Palette opens, captures "" (prev), sets "hidden".
 *   2. KeyboardHelp opens, captures "hidden" (prev), sets "hidden".
 *   3. Palette closes, restores "" — scroll unlocks while KeyboardHelp is
 *      still open.
 *   4. KeyboardHelp closes, restores "hidden" — scroll stays locked even
 *      though everything is dismissed.
 *
 * Refcounting fixes it: every lock-holder increments the counter, every
 * release decrements. We apply `overflow: hidden` while the counter is > 0
 * and restore the original value when it hits 0.
 *
 * Each holder calls `lockBodyScroll()` and stores the returned release
 * function — typically inside a useEffect cleanup.
 */

let count = 0;
let originalOverflow: string | null = null;

export function lockBodyScroll(): () => void {
  // SSR guard.
  if (typeof document === "undefined") return () => {};

  if (count === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  count++;

  let released = false;
  return () => {
    // Idempotent release — calling the returned fn twice should not
    // underflow the counter (StrictMode double-invokes effect cleanups).
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (count === 0) {
      document.body.style.overflow = originalOverflow ?? "";
      originalOverflow = null;
    }
  };
}
