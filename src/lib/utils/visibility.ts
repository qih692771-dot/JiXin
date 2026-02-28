import type { Version } from '$lib/types';

/** 计算可隐藏配额：第4稿=1, 第5稿=2, 第6稿=3... 始终至少展示 3 篇 */
export function getHideQuota(totalVersions: number): number {
  return Math.max(0, totalVersions - 3);
}

/** 获取当前已隐藏数量 */
export function getHiddenCount(versions: Version[]): number {
  return versions.filter((v) => v.isHidden).length;
}

/** 获取剩余可隐藏配额 */
export function getRemainingHides(versions: Version[]): number {
  return getHideQuota(versions.length) - getHiddenCount(versions);
}
