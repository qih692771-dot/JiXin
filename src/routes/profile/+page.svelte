<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { getUserProfile, saveUserProfile } from '$lib/utils/user';
  import VisibilityManagerModal from '$lib/components/VisibilityManagerModal.svelte';
  import { getAnonymousCount, getRemainingAnonymousQuota, MAX_ANONYMOUS_QUOTA } from '$lib/utils/anonymity.ts';
  
  let versions = [];
  let username = '作者';
  let stats = {
    totalVersions: 0,
    totalQuestions: 0,
    totalResponses: 0,
    totalWords: 0
  };
  let showVisibilityModal = false;
  
  onMount(() => {
    if (browser) {
      const profile = getUserProfile();
      username = profile.username;

      const saved = localStorage.getItem('jixin_versions');
      if (saved) {
        versions = JSON.parse(saved);
      }
    }
  });

  /** 公开 = 对外展示；私密 = 仅自己可见 */
  $: visibleVersions = versions.filter((v) => !v.isHidden);
  $: hiddenVersions = versions.filter((v) => v.isHidden);

  /** 统计基于全部版本（包括私密） */
  $: stats = {
    totalVersions: versions.length,
    totalQuestions: versions.reduce((sum, v) => sum + (v.questions?.length || 0), 0),
    totalResponses: versions.reduce((sum, v) => sum + (v.questions?.filter((q) => q.response).length || 0), 0),
    totalWords: versions.reduce((sum, v) => sum + (v.content?.length || 0), 0)
  };

  /** 匿名配额统计（仅在浏览器端计算） */
  let anonymousCount = 0;
  let remainingAnonymous = MAX_ANONYMOUS_QUOTA;
  $: if (browser) {
    anonymousCount = getAnonymousCount(versions);
    remainingAnonymous = getRemainingAnonymousQuota(versions);
  }

  function editUsername() {
    const next = prompt('请输入用户名', username);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    username = trimmed;
    const current = getUserProfile();
    saveUserProfile({ ...current, username: trimmed });
  }

  function handleVisibilityConfirm(updates) {
    if (!updates || updates.length === 0) {
      showVisibilityModal = false;
      return;
    }

    versions = versions.map((v) => {
      const update = updates.find((u) => u.id === v.id);
      if (update) {
        return { ...v, ...update };
      }
      return v;
    });

    if (browser) {
      try {
        localStorage.setItem('jixin_versions', JSON.stringify(versions));
      } catch (e) {
        console.warn('保存可见性修改失败', e);
      }
    }

    showVisibilityModal = false;
    alert('修改已保存');
  }
  
  function getLevel() {
    if (stats.totalVersions >= 20) return '抱薪者';
    if (stats.totalVersions >= 10) return '拾柴人';
    if (stats.totalVersions >= 5) return '点燃者';
    return '初燃者';
  }
  
  function getLevelIcon() {
    if (stats.totalVersions >= 20) return '🔥';
    if (stats.totalVersions >= 10) return '🧱';
    if (stats.totalVersions >= 5) return '🕯️';
    return '✨';
  }
</script>

<main class="profile-container">
  <header class="profile-header">
    <div class="avatar">{getLevelIcon()}</div>
    <div class="title-row">
      <h1>👤 {username} 的集薪</h1>
      <button class="btn-edit" type="button" on:click={editUsername}>编辑</button>
    </div>
    <p class="level">当前身份：{getLevel()}</p>
  </header>
  
  <!-- 统计卡片 -->
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-number">{stats.totalVersions}</span>
      <span class="stat-label">总版本</span>
      <small class="stat-hint">({visibleVersions.length} 公开 / {hiddenVersions.length} 私密)</small>
    </div>
    <div class="stat-card">
      <span class="stat-number">{stats.totalQuestions}</span>
      <span class="stat-label">收到追问</span>
    </div>
    <div class="stat-card">
      <span class="stat-number">{stats.totalResponses}</span>
      <span class="stat-label">回应追问</span>
    </div>
    <div class="stat-card">
      <span class="stat-number">{stats.totalWords}</span>
      <span class="stat-label">累计字数</span>
    </div>
  </div>

  <div class="visibility-summary">
    <span class="visibility-text">
      🎭 匿名 {anonymousCount}/{MAX_ANONYMOUS_QUOTA}（剩余 {remainingAnonymous}）
    </span>
    <button on:click={() => showVisibilityModal = true} class="btn-manage" type="button">
      管理可见性
    </button>
  </div>
  
  <!-- 成长时间线：显示所有版本，私密项带标记 -->
  {#if versions.length > 0}
    <div class="timeline-section">
      <h2>输出历程</h2>
      <div class="timeline">
        {#each versions as version, index}
          <div class="timeline-item" class:private={version.isHidden}>
            <div class="timeline-marker">{versions.length - index}</div>
            <div class="timeline-content">
              {#if version.isHidden}
                <span class="privacy-badge">🔒 私密</span>
              {/if}
              {#if version.authorIdentity === 'anonymous'}
                <span class="anonymous-badge">🎭 匿名</span>
              {/if}
              <h3>{version.title || '无标题'}</h3>
              <p class="timeline-meta">
                {version.savedAt} · {version.content.length} 字 · {version.questions?.length || 0} 个追问
              </p>
              {#if version.questions && version.questions.length > 0}
                <div class="timeline-questions">
                  {#each version.questions.slice(0, 2) as q}
                    <span class="mini-tag">{q.type === 'expand' ? '展开' : q.type === 'contradict' ? '矛盾' : q.type === 'connect' ? '关联' : '共鸣'}</span>
                  {/each}
                  {#if version.questions.length > 2}
                    <span class="mini-tag">+{version.questions.length - 2}</span>
                  {/if}
                </div>
              {/if}
              <div class="timeline-actions">
                <a href="/version/{version.id}" class="btn-detail">📄 详情</a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <p>还没有记录，去写下第1稿吧</p>
      <a href="/write" class="btn-primary">开始写作</a>
    </div>
  {/if}
  
  <div class="actions">
    <a href="/" class="btn-secondary">返回首页</a>
    <a href="/write" class="btn-primary">继续写作</a>
  </div>

  {#if showVisibilityModal}
    <VisibilityManagerModal
      versions={versions}
      onConfirm={handleVisibilityConfirm}
      onClose={() => (showVisibilityModal = false)}
    />
  {/if}
</main>

<style>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .profile-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .avatar {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .profile-header h1 {
    margin-bottom: 0.5rem;
  }

  .title-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-edit {
    padding: 0.35rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
    color: #333;
  }

  .btn-edit:hover {
    border-color: #333;
  }
  
  .level {
    color: #666;
    font-size: 0.875rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .visibility-summary {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-bottom: 2rem;
    font-size: 0.875rem;
  }

  .visibility-text {
    color: #666;
  }

  .btn-manage {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-manage:hover {
    background: #555;
  }
  
  @media (max-width: 600px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .stat-card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
    border: 1px solid #eee;
  }
  
  .stat-number {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #666;
  }

  .stat-hint {
    display: block;
    font-size: 0.75rem;
    color: #999;
    margin-top: 0.25rem;
    font-weight: normal;
  }

  .timeline-item.private {
    opacity: 0.9;
  }

  .timeline-item.private .timeline-content {
    background: #f5f5f5;
    border-left: 3px solid #999;
    padding-left: calc(1rem - 3px);
  }

  .privacy-badge {
    font-size: 0.75rem;
    color: #666;
    background: #e0e0e0;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  .anonymous-badge {
    font-size: 0.75rem;
    color: #4338ca;
    background: #e0e7ff;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    margin-left: 0.25rem;
    display: inline-block;
  }

  .timeline-section h2 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    color: #333;
  }
  
  .timeline {
    position: relative;
    padding-left: 2rem;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #eee;
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
  }
  
  .timeline-marker {
    position: absolute;
    left: -2rem;
    width: 1.5rem;
    height: 1.5rem;
    background: #333;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .timeline-content {
    flex: 1;
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  
  .timeline-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  .timeline-meta {
    font-size: 0.75rem;
    color: #999;
    margin-bottom: 0.5rem;
  }
  
  .timeline-questions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .timeline-actions {
    margin-top: 0.75rem;
  }

  .btn-detail {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #333;
    color: #333;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    text-decoration: none;
    display: inline-block;
  }
  
  .mini-tag {
    padding: 0.125rem 0.5rem;
    background: #e0e0e0;
    border-radius: 0.125rem;
    font-size: 0.75rem;
    color: #666;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: #f9f9f9;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .empty-state p {
    color: #666;
    margin-bottom: 1rem;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 3rem;
  }
  
  .btn-primary, .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    text-align: center;
  }
  
  .btn-primary {
    background: #333;
    color: white;
  }
  
  .btn-secondary {
    background: white;
    border: 1px solid #333;
    color: #333;
  }
</style>