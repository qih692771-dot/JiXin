<script>
  import { onMount } from 'svelte';
  
  let versions = [];
  let stats = {
    totalVersions: 0,
    totalQuestions: 0,
    totalResponses: 0,
    totalWords: 0
  };
  
  onMount(() => {
    const saved = localStorage.getItem('jixin_versions');
    if (saved) {
      versions = JSON.parse(saved);
      calculateStats();
    }
  });
  
  function calculateStats() {
    stats.totalVersions = versions.length;
    stats.totalQuestions = versions.reduce((sum, v) => sum + (v.questions?.length || 0), 0);
    stats.totalResponses = versions.reduce((sum, v) => {
      return sum + (v.questions?.filter(q => q.response).length || 0);
    }, 0);
    stats.totalWords = versions.reduce((sum, v) => sum + (v.content?.length || 0), 0);
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
    <h1>我的成长轨迹</h1>
    <p class="level">当前身份：{getLevel()}</p>
  </header>
  
  <!-- 统计卡片 -->
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-number">{stats.totalVersions}</span>
      <span class="stat-label">发布版本</span>
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
  
  <!-- 成长时间线 -->
  {#if versions.length > 0}
    <div class="timeline-section">
      <h2>输出历程</h2>
      <div class="timeline">
        {#each versions as version, index}
          <div class="timeline-item">
            <div class="timeline-marker">{versions.length - index}</div>
            <div class="timeline-content">
              <h3>{version.title}</h3>
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