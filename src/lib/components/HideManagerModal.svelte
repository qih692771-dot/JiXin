<script>
  import { getHideQuota } from '$lib/utils/visibility';

  /** @type {{ id: number; title: string; isHidden?: boolean; isGloballyPinned?: boolean }[]} */
  export let versions = [];
  /** @type {(hiddenIds: number[]) => void} */
  export let onConfirm = () => {};
  /** @type {() => void} */
  export let onClose = () => {};

  // 当前选中的要隐藏的版本 id 集合（与弹窗内勾选一致）
  let selectedHiddenIds = new Set();

  let inited = false;
  $: quota = getHideQuota(versions.length);
  $: selectedCount = selectedHiddenIds.size;
  $: visibleCount = versions.length - selectedCount;
  // 仅首次展示时根据当前 isHidden 初始化勾选
  $: if (versions.length >= 4 && !inited) {
    selectedHiddenIds = new Set(versions.filter((v) => v.isHidden).map((v) => v.id));
    inited = true;
  }

  function toggleHide(versionId) {
    const next = new Set(selectedHiddenIds);
    if (next.has(versionId)) {
      next.delete(versionId);
    } else {
      if (next.size >= quota) return;
      next.add(versionId);
    }
    selectedHiddenIds = next;
  }

  function submit() {
    if (visibleCount < 3) {
      alert('至少需保留 3 篇作品展示，请取消部分隐藏后再确认。');
      return;
    }
    onConfirm(Array.from(selectedHiddenIds));
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click={onClose}>
  <div class="modal-box" on:click|stopPropagation>
    <h2 class="modal-title">发布设置 - 第{versions.length}稿</h2>
    <p class="quota-hint">规则：始终至少展示 3 篇作品</p>
    <p class="quota-display">隐藏配额：<strong>{selectedCount}/{quota}</strong></p>

    <div class="version-list">
      {#each versions as version, index}
        {@const draftNum = versions.length - index}
        {@const isCurrent = index === 0}
        {@const isPinned = version.isGloballyPinned}
        {@const checked = selectedHiddenIds.has(version.id)}
        {@const disabled = !checked && selectedCount >= quota}
        <label class="version-row {disabled ? 'disabled' : ''}">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            on:change={() => toggleHide(version.id)}
          />
          <span class="draft-num">第{draftNum}稿</span>
          <span class="title">{version.title || '无标题'}</span>
          {#if isCurrent}<span class="badge current">当前发布</span>{/if}
          {#if isPinned}<span class="badge pin">代表作</span>{/if}
        </label>
      {/each}
    </div>

    <p class="summary">将展示 <strong>{visibleCount}</strong> 篇，隐藏 <strong>{selectedCount}</strong> 篇</p>

    <div class="actions">
      <button type="button" class="btn-cancel" on:click={onClose}>取消</button>
      <button type="button" class="btn-confirm" on:click={submit}>确认</button>
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
    max-width: 420px;
    width: 90%;
    max-height: 85vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .modal-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  .quota-hint {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #666;
  }
  .quota-display {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
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
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
  }
  .version-row:last-child {
    border-bottom: none;
  }
  .version-row.disabled {
    opacity: 0.7;
  }
  .version-row input {
    margin: 0;
  }
  .draft-num {
    flex-shrink: 0;
    font-weight: 600;
    color: #333;
  }
  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .badge {
    flex-shrink: 0;
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
  }
  .badge.current {
    background: #333;
    color: #fff;
  }
  .badge.pin {
    background: #f0e68c;
    color: #333;
  }
  .summary {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    color: #444;
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
