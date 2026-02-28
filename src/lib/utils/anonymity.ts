import type { Version } from '$lib/types';

/** 最大匿名配额（固定3个） */
export const MAX_ANONYMOUS_QUOTA = 3;

/** 获取当前匿名数量 */
export function getAnonymousCount(versions: Version[]): number {
  return versions.filter((v) => v.authorIdentity === 'anonymous').length;
}

/** 获取剩余匿名配额 */
export function getRemainingAnonymousQuota(versions: Version[]): number {
  return Math.max(0, MAX_ANONYMOUS_QUOTA - getAnonymousCount(versions));
}

/** 检查是否还能设置新的匿名 */
export function canMakeAnonymous(versions: Version[]): boolean {
  return getRemainingAnonymousQuota(versions) > 0;
}

/** 检查特定版本是否可以切换匿名状态 */
export function canToggleAnonymous(version: Version, versions: Version[]): boolean {
  if (version.authorIdentity === 'anonymous') {
    return true; // 解除匿名总是允许
  }
  return canMakeAnonymous(versions); // 设为匿名需要检查配额
}

