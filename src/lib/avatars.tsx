import { ComponentType } from "react";
import { GymGuyAvatar } from "@/components/GymGuyAvatar";
import { GymGirlAvatar } from "@/components/avatars/GymGirlAvatar";
import { RizzlerAvatar } from "@/components/avatars/RizzlerAvatar";
import { RunnerAvatar } from "@/components/avatars/RunnerAvatar";
import { YogiAvatar } from "@/components/avatars/YogiAvatar";

export type AvatarId = "gym_guy" | "gym_girl" | "runner" | "yogi" | "chef";

export const DEFAULT_AVATAR_ID: AvatarId = "gym_guy";

interface AvatarComponentProps {
  size?: number;
  className?: string;
}

export const AVATARS: Record<AvatarId, { label: string; Component: ComponentType<AvatarComponentProps> }> = {
  gym_guy: { label: "Chad", Component: GymGuyAvatar },
  gym_girl: { label: "Annabel", Component: GymGirlAvatar },
  runner: { label: "Goggins", Component: RunnerAvatar },
  yogi: { label: "Chud", Component: YogiAvatar },
  chef: { label: "Rizzler", Component: RizzlerAvatar },
};

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === "string" && value in AVATARS;
}

export function getAvatarComponent(avatarId: string | undefined | null): ComponentType<AvatarComponentProps> {
  return isAvatarId(avatarId) ? AVATARS[avatarId].Component : AVATARS[DEFAULT_AVATAR_ID].Component;
}
