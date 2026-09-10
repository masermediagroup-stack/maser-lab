"use client";

import UnicornScene from "unicornstudio-react/next";

/** Published Unicorn Studio scene — remix https://unicorn.studio/remix/1LkMxxXd5DbU0DwtQKjA */
export const UNICORN_PROJECT_ID = "tpUiHuNcrr2hbUdSbHSq";
export const UNICORN_REMIX_URL =
  "https://unicorn.studio/remix/1LkMxxXd5DbU0DwtQKjA";

/**
 * unicornstudio-react is published through 2.2.10; the live SDK is pinned to
 * unicornstudio.js 2.2.13 via sdkUrl (2.2.13 is not on npm for the wrapper).
 */
export const UNICORN_SDK_VERSION = "2.2.13";
export const UNICORN_SDK_URL = `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v${UNICORN_SDK_VERSION}/dist/unicornStudio.umd.js`;
export const UNICORN_DPI = 2;
export const UNICORN_FPS = 60;
export const UNICORN_STAGE_W = 1920;
export const UNICORN_STAGE_H = 1080;

export type UnicornGroundProps = {
  paused?: boolean;
};

export function UnicornGround({ paused = false }: UnicornGroundProps) {
  return (
    <UnicornScene
      projectId={UNICORN_PROJECT_ID}
      sdkUrl={UNICORN_SDK_URL}
      width={UNICORN_STAGE_W}
      height={UNICORN_STAGE_H}
      scale={1}
      dpi={UNICORN_DPI}
      fps={UNICORN_FPS}
      production
      lazyLoad={false}
      paused={paused}
      className="dallas-wallpaper-unicorn"
      ariaLabel=""
    />
  );
}
