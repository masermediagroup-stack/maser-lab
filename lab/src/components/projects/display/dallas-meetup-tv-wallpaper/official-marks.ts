/**
 * Official Cursor 2D mark. viewBox 0 0 466.73 532.09.
 * The second subpath is the cursor hole — fill evenodd so paper shows through.
 */

export const CURSOR_VB_W = 466.73;
export const CURSOR_VB_H = 532.09;
export const CURSOR_ASPECT = CURSOR_VB_W / CURSOR_VB_H;

export const CURSOR_PATH =
  "M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z";

export const CURSOR_FILL_RULE = "evenodd" as const;

export const CURSOR_MARK_SRC = "/assets/dallas-meetup-tv-wallpaper/CUBE_2D_DARK.svg";
export const GROK_FACE_SRC = "/assets/dallas-meetup-tv-wallpaper/grok-bot-face-tight.png";

/**
 * Organic Grok head in local coords, center at origin, 1 = half of the PNG box.
 * Matches grok-bot-face-tight.png. Used to clip kick ribbons. Not a circle.
 */
export const GROK_HEAD_PATH =
  "M -0.0078 -0.8750 L 0.2669 -0.8700 L 0.4061 -0.8558 L 0.5157 -0.8326 L 0.6073 -0.8003 L 0.6853 -0.7586 L 0.7516 -0.7073 L 0.8072 -0.6459 L 0.8528 -0.5732 L 0.8886 -0.4874 L 0.9146 -0.3844 L 0.9310 -0.2533 L 0.9375 0.0063 L 0.9310 0.2656 L 0.9146 0.3964 L 0.8886 0.4988 L 0.8528 0.5837 L 0.8072 0.6553 L 0.7516 0.7156 L 0.6853 0.7655 L 0.6073 0.8057 L 0.5157 0.8366 L 0.4061 0.8583 L 0.2669 0.8711 L -0.0078 0.8750 L -0.2821 0.8703 L -0.4201 0.8566 L -0.5278 0.8339 L -0.6168 0.8020 L -0.6915 0.7608 L -0.7539 0.7099 L -0.8054 0.6488 L -0.8464 0.5765 L -0.8775 0.4910 L -0.8990 0.3882 L -0.9110 0.2571 L -0.9141 -0.0023 L -0.9110 -0.2618 L -0.8990 -0.3927 L -0.8775 -0.4953 L -0.8464 -0.5805 L -0.8054 -0.6524 L -0.7539 -0.7130 L -0.6915 -0.7634 L -0.6168 -0.8040 L -0.5278 -0.8353 L -0.4201 -0.8575 L -0.2821 -0.8707 Z";
