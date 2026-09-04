/**
 * Official Cursor 2D mark. viewBox 0 0 466.73 532.09.
 * The second subpath is the cursor hole — fill evenodd so paper shows through.
 * Grok is geometry (black disc + white stadiums), not this file.
 */

export const CURSOR_VB_W = 466.73;
export const CURSOR_VB_H = 532.09;
export const CURSOR_ASPECT = CURSOR_VB_W / CURSOR_VB_H;

export const CURSOR_PATH =
  "M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z";

export const CURSOR_FILL_RULE = "evenodd" as const;

export const CURSOR_MARK_SRC = "/assets/dallas-meetup-tv-wallpaper/CUBE_2D_DARK.svg";
