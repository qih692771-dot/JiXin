<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let versionId = null;
  let version = null;
  let notFound = false;
  
  // 从 URL 获取 id 参数
  $: versionId = $page.params.id;
  
  onMount(() => {
    const saved = localStorage.getItem('jixin_versions');
    if (saved) {
      const versions = JSON.parse(saved);
      version = versions.find(v => v.id.toString() === versionId.toString());
      if (!version) {
        notFound = true;
      }
    } else {
      notFound = true;
    }
  });
  
  // 追问类型标签映射
  const typeLabels = {
    'expand': '请求展开',
    'contradict': '指出矛盾',
    'connect': '关联其他',
    'resonate': '情感共鸣'
  };
  
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('zh-CN');
  }
</script>

<main class="version-detail">
  {#if notFound}
    <div class="error-state">
      <h1>版本未找到</h1>
      <p>该版本可能已被删除或不存在</p>
      <a href="/write" class="btn-primary">返回写作页</a>
    </div>
  {:else if version}
    <header class="version-header">
      <div class="breadcrumb">
        <a href="/">首页</a> / <a href="/write">写作</a> / <span>版本详情</span>
      </div>
      <h1>{version.title}</h1>
      <div class="meta">
        <span class="time">🕐 {version.savedAt}</span>
        <span class="word-count">📝 {version.content.length} 字</span>
        <span class="questions-count">💬 {version.questions?.length || 0} 个追问</span>
      </div>
    </header>
    
    <!-- 版本内容 -->
    <section class="content-section">
      <div class="content-box">
        {version.content}
      </div>
    </section>
    
    <!-- 追问-回应时间线 -->
    {#if version.questions && version.questions.length > 0}
      <section class="conversation-section">
        <h2>追问与回应</h2>
        <div class="timeline">
          {#each version.questions as q, index}
            <div class="timeline-item">
              <div class="timeline-marker">{index + 1}</div>
              
              <!-- 追问 -->
              <div class="question-card">
                <div class="card-header">
                  <span class="type-tag">{typeLabels[q.type] || q.type}</span>
                  <span class="time">{q.askedAt}</span>
                </div>
                <div class="card-content">
                  {q.content}
                </div>
              </div>
              
              <!-- 回应（如果有） -->
              {#if q.response}
                <div class="response-arrow">↓</div>
                <div class="response-card">
                  <div class="card-header">
                    <span class="author">作者回应</span>
                  </div>
                  <div class="card-content">
                    {q.response}
                  </div>
                </div>
              {:else}
                <div class="no-response">
                  <span>等待回应...</span>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {:else}
      <section class="empty-section">
        <p>暂无追问，回到写作页添加追问</p>
      </section>
    {/if}
    
    <div class="actions">
      <a href="/write" class="btn-secondary">← 返回写作页</a>
      <a href="/" class="btn-secondary">返回首页</a>
    </div>
  {:else}
    <div class="loading">
      <p>加载中...</p>
    </div>
  {/if}
</main>

<style>
  .version-detail {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }
  
  .breadcrumb {
    font-size: 0.875rem;
    color: #999;
    margin-bottom: 1rem;
  }
  
  .breadcrumb a {
    color: #666;
    text-decoration: none;
  }
  
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  
  .breadcrumb span {
    color: #333;
  }
  
  .version-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #eee;
  }
  
  .version-header h1 {
    font-size: 2rem;
    margin: 1rem 0;
  }
  
  .meta {
    display: flex;
    gap: 1.5rem;
    color: #666;
    font-size: 0.875rem;
    flex-wrap: wrap;
  }
  
  .content-section {
    margin-bottom: 3rem;
  }
  
  .content-box {
    background: #f9f9f9;
    padding: 2rem;
    border-radius: 0.5rem;
    line-height: 1.8;
    font-size: 1.125rem;
    white-space: pre-wrap;
    border-left: 4px solid #333;
  }
  
  .conversation-section h2 {
    margin-bottom: 2rem;
    font-size: 1.5rem;
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
    background: #ddd;
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: 2rem;
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
    z-index: 1;
  }
  
  .question-card, .response-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .question-card {
    border-left: 4px solid #666;
  }
  
  .response-card {
    border-left: 4px solid #333;
    background: #fafafa;
    margin-left: 1rem;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }
  
  .type-tag {
    background: #e0e0e0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: #666;
  }
  
  .time {
    color: #999;
    font-size: 0.75rem;
  }
  
  .author {
    color: #333;
    font-weight: bold;
  }
  
  .card-content {
    line-height: 1.6;
    color: #333;
  }
  
  .response-arrow {
    text-align: center;
    color: #999;
    margin: 0.5rem 0;
    font-size: 1.5rem;
  }
  
  .no-response {
    margin-left: 1rem;
    padding: 1rem;
    color: #999;
    font-style: italic;
    font-size: 0.875rem;
  }
  
  .empty-section {
    text-align: center;
    padding: 3rem;
    color: #999;
    background: #f9f9f9;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
  }
  
  .btn-primary, .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    text-align: center;
    display: inline-block;
  }
  
  .btn-primary {
    background: #333;
    color: white;
  }
  
  .btn-secondary {
    border: 1px solid #333;
    color: #333;
  }
  
  .error-state {
    text-align: center;
    padding: 4rem 2rem;
  }
  
  .loading {
    text-align: center;
    padding: 4rem;
    color: #999;
  }
</style>