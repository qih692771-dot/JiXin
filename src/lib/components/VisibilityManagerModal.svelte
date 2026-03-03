<script lang="ts">
  import { getHideQuota, getHiddenCount } from '$lib/utils/visibility';
  import { MAX_ANONYMOUS_QUOTA, getAnonymousCount, getRemainingAnonymousQuota } from '$lib/utils/anonymity';
  import type { Version } from '$lib/types';

  export let versions: Version[] = [];
  export let onConfirm: (updates: {id: number; authorIdentity?: 'real' | 'anonymous'; isHidden?: boolean}[]) => void = () => {};
  export let onClose: () => void = () => {};

  // 计算配额
  $: anonymousCount = getAnonymousCount(versions);
  $: remainingAnonymous = getRemainingAnonymousQuota(versions);
  $: hiddenCount = getHiddenCount(versions);
  $: visibleCount = versions.length - hiddenCount;
  $: hideQuota = getHideQuota(versions.length);

  // 本地修改状态（不直接修改versions，等确认后一次性提交）
  let pendingChanges = new Map<number, { authorIdentity?: 'real' | 'anonymous'; isHidden?: boolean }>(); // key: versionId

 function toggleAnonymous(version: Version) {
  const current = pendingChanges.get(version.id)?.authorIdentity ?? version.authorIdentity;
  const next: 'real' | 'anonymous' = current === 'anonymous' ? 'real' : 'anonymous';
  
  // 计算当前实际匿名数量（实时统计所有作品当前状态）
  const currentAnonymousCount = versions.filter((v: any) => {
    const change = pendingChanges.get(v.id);
    const identity = change?.authorIdentity ?? v.authorIdentity;
    return identity === 'anonymous';
  }).length;
  
  // 如果是改为匿名，且改完会超过配额，则阻止
  if (next === 'anonymous' && currentAnonymousCount >= MAX_ANONYMOUS_QUOTA) {
    alert(`匿名名额已满（${currentAnonymousCount}/${MAX_ANONYMOUS_QUOTA}），请先解除其他匿名作品`);
    return;
  }
  
  pendingChanges.set(version.id, {
    ...pendingChanges.get(version.id),
    authorIdentity: next
  });
  pendingChanges = new Map(pendingChanges);
}

function toggleHidden(version: Version) {
  const current = pendingChanges.get(version.id)?.isHidden ?? version.isHidden;
  const next = !current;
  
  // 计算当前实际可见数量（实时统计）
  const currentVisibleCount = versions.filter((v: any) => {
    const change = pendingChanges.get(v.id);
    const hidden = change?.isHidden ?? v.isHidden;
    return !hidden;
  }).length;
  
  // 如果是改为私密（隐藏），且改完会少于3篇可见，则阻止
  if (next && currentVisibleCount <= 3) {
    alert(`至少需保留 3 篇作品对外可见（当前可见 ${currentVisibleCount}）`);
    return;
  }
  
  pendingChanges.set(version.id, {
    ...pendingChanges.get(version.id),
    isHidden: next
  });
  pendingChanges = new Map(pendingChanges);
}

  function getDisplayState(version: Version) {
    const change = pendingChanges.get(version.id);
    return {
      authorIdentity: change?.authorIdentity ?? version.authorIdentity,
      isHidden: change?.isHidden ?? version.isHidden
    };
  }

  function submit() {
    const updates = Array.from(pendingChanges.entries()).map(([id, changes]) => ({
      id,
      ...changes
    }));
    onConfirm(updates);
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click={onClose}>
  <div class="modal-box" on:click|stopPropagation>
    <h2 class="modal-title">管理作品可见性</h2>
    
    <div class="quota-info">
      <div class="quota-item">
        <span class="quota-label">🎭 匿名配额：</span>
        <span class="quota-value {remainingAnonymous === 0 ? 'full' : ''}">
          已用 {anonymousCount}/{MAX_ANONYMOUS_QUOTA}，剩余 {remainingAnonymous}
        </span>
      </div>
      <div class="quota-item">
        <span class="quota-label">👁️ 可见性配额：</span>
        <span class="quota-value">
          已隐藏 {hiddenCount}，至少保留 3 篇可见（当前可见 {visibleCount}）
        </span>
      </div>
    </div>

    <div class="version-list">
     {#each versions as version, index}
  {@const draftNum = versions.length - index}
  {@const pending = pendingChanges.get(version.id)}  <!-- ✅ 直接读取 Map，建立依赖 -->
  {@const authorIdentity = pending?.authorIdentity ?? version.authorIdentity}
  {@const isHidden = pending?.isHidden ?? version.isHidden}
  {@const isAnonymous = authorIdentity === 'anonymous'} 
        
        <div class="version-row">
          <div class="version-info">
            <span class="draft-num">第{draftNum}稿</span>
            <span class="title">{version.title || '无标题'}</span>
            {#if version.isGloballyPinned}
              <span class="badge pin">📌 代表作</span>
            {/if}
          </div>
          
          <div class="toggles">
           <button 
  class="toggle-btn anonymous {isAnonymous ? 'active' : ''}"
  on:click={() => toggleAnonymous(version)}
  title={isAnonymous ? '点击解除匿名' : '点击设为匿名'}
>
  {isAnonymous ? '🎭 匿名中' : '👤 实名'}
</button>

<button 
  class="toggle-btn privacy {isHidden ? 'active' : ''}"
  on:click={() => toggleHidden(version)}
  title={isHidden ? '点击取消私密' : '点击设为私密'}
>
  {isHidden ? '🔒 私密' : '👁️ 公开'}
</button> 
          </div>
        </div>
      {/each}
    </div>

    <div class="actions">
      <button type="button" class="btn-cancel" on:click={onClose}>取消</button>
      <button type="button" class="btn-confirm" on:click={submit}>确认修改</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }
  .modal-box {
    background: #fff;
    border-radius: 0.5rem;
    padding: 1.5rem;
    max-width: 520px;
    width: 90%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  }
  .modal-title {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    text-align: center;
  }
  .quota-info {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  .quota-item {
    margin-bottom: 0.5rem;
  }
  .quota-item:last-child {
    margin-bottom: 0;
  }
  .quota-label {
    font-weight: 600;
  }
  .quota-value {
    color: #333;
  }
  .quota-value.full {
    color: #dc2626;
    font-weight: 600;
  }
  .version-list {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }
  .version-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    gap: 1rem;
  }
  .version-row:last-child {
    border-bottom: none;
  }
  .version-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }
  .draft-num {
    font-weight: 600;
    color: #333;
    flex-shrink: 0;
  }
  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #666;
  }
  .badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    background: #f0e68c;
    color: #333;
    flex-shrink: 0;
  }
  .toggles {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .toggle-btn {
    padding: 0.4rem 0.75rem;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.8rem;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .toggle-btn:hover {
    border-color: #999;
  }
  .toggle-btn.anonymous.active {
  background: #8b5cf6;    /* 紫色实心 */
  border-color: #8b5cf6;
  color: #ffffff;         /* 白色文字 */
  font-weight: 600;
}

.toggle-btn.privacy.active {
  background: #ef4444;    /* 红色实心 */
  border-color: #ef4444;
  color: #ffffff;         /* 白色文字 */
  font-weight: 600;
}
  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  .btn-cancel {
    padding: 0.5rem 1rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .btn-confirm {
    padding: 0.5rem 1rem;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
</style>

