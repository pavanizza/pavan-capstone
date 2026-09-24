import { ComponentType } from "react";
import { GymGuyAvatar } from "@/components/GymGuyAvatar";
import { ChefAvatar } from "@/components/avatars/ChefAvatar";
import { GymGirlAvatar } from "@/components/avatars/GymGirlAvatar";
import { RunnerAvatar } from "@/components/avatars/RunnerAvatar";
import { YogiAvatar } from "@/components/avatars/YogiAvatar";

export type AvatarId = "gym_guy" | "gym_girl" | "runner" | "yogi" | "chef";

export const DEFAULT_AVATAR_ID: AvatarId = "gym_guy";

interface AvatarComponentProps {
  size?: number;
  className?: string;
}

export const AVATARS: Record<AvatarId, { label: string; Component: ComponentType<AvatarComponentProps> }> = {
  gym_guy: { label: "Gym guy", Component: GymGuyAvatar },
  gym_girl: { label: "Gym girl", Component: GymGirlAvatar },
  runner: { label: "Runner", Component: RunnerAvatar },
  yogi: { label: "Yogi", Component: YogiAvatar },
  chef: { label: "Chef", Component: ChefAvatar },
};

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === "string" && value in AVATARS;
}

export function getAvatarComponent(avatarId: string | undefined | null): ComponentType<AvatarComponentProps> {
  return isAvatarId(avatarId) ? AVATARS[avatarId].Component : AVATARS[DEFAULT_AVATAR_ID].Component;
}
