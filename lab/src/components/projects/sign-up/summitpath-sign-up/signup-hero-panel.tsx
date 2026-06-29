"use client";

import Image from "next/image";
import { SUMMITPATH_ASSETS } from "./constants";

export function SignupHeroPanelDesktop() {
  return (
    <div className="relative h-full w-[960px] shrink-0 overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 w-[1046px] overflow-hidden">
        <div className="absolute -left-[183px] -top-[226px] h-[1953px] w-[1464px]">
          <Image
            src={SUMMITPATH_ASSETS.heroDesktop}
            alt="Mountain trail summit path"
            fill
            priority
            sizes="960px"
            className="object-cover"
          />
        </div>
        <div className="pointer-events-none absolute -left-[276px] -top-[427px] h-[2080px] w-[494px]">
          <Image
            src={SUMMITPATH_ASSETS.vector2}
            alt=""
            fill
            aria-hidden
            className="object-contain"
          />
        </div>
        <div className="pointer-events-none absolute -left-[214px] -top-[427px] h-[2080px] w-[298px]">
          <Image
            src={SUMMITPATH_ASSETS.vector3}
            alt=""
            fill
            aria-hidden
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export function SignupHeroPanelMobile() {
  return (
    <div className="relative h-[338px] w-full shrink-0">
      <div className="absolute left-[13px] top-[11px] h-[322px] w-[425px] overflow-hidden rounded-[30px]">
        <Image
          src={SUMMITPATH_ASSETS.heroMobileA}
          alt="Mountain trail"
          fill
          priority
          sizes="425px"
          className="rounded-[30px] object-cover"
        />
        <Image
          src={SUMMITPATH_ASSETS.heroMobileB}
          alt=""
          fill
          aria-hidden
          sizes="425px"
          className="rounded-[30px] object-cover mix-blend-multiply opacity-0"
        />
      </div>
    </div>
  );
}
