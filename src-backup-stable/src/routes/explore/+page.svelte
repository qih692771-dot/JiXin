<script>
  // 示例数据（模拟其他用户的内容）
  const examplePosts = [
    {
      id: 1,
      author: "chen",
      title: "关于斯多葛控制二分法的困惑",
      preview: "第1稿：我觉得这个理论很有用，但分不清边界...",
      versions: 3,
      questions: 5,
      tags: ["哲学", "斯多葛"],
      updatedAt: "2小时前"
    },
    {
      id: 2,
      author: "liang",
      title: "读《规训与惩罚》笔记",
      preview: "第2稿：福柯的'凝视'概念让我想到现代职场...",
      versions: 5,
      questions: 3,
      tags: ["哲学", "社会学"],
      updatedAt: "5小时前"
    },
    {
      id: 3,
      author: "匿名",
      title: "为什么我总是写不出第1稿？",
      preview: "第1稿：在集薪写了3天，还是不敢发布...",
      versions: 2,
      questions: 8,
      tags: ["写作", "心理"],
      updatedAt: "1天前"
    }
  ];
  
  let filter = 'all';
  
  $: filteredPosts = filter === 'all' 
    ? examplePosts 
    : examplePosts.filter(p => p.tags.includes(filter === 'philosophy' ? '哲学' : '写作'));
</script>

<main class="explore-container">
  <header>
    <h1>浏览引子</h1>
    <p class="subtitle">看看其他人在思考什么，从回应开始你的第1稿</p>
  </header>
  
  <!-- 筛选标签 -->
  <div class="filters">
    <button 
      class="filter-btn {filter === 'all' ? 'active' : ''}" 
      on:click={() => filter = 'all'}
    >
      全部
    </button>
    <button 
      class="filter-btn {filter === 'philosophy' ? 'active' : ''}" 
      on:click={() => filter = 'philosophy'}
    >
      哲学
    </button>
    <button 
      class="filter-btn {filter === 'writing' ? 'active' : ''}" 
      on:click={() => filter = 'writing'}
    >
      写作
    </button>
  </div>
  
  <!-- 内容列表 -->
  <div class="posts-list">
    {#each filteredPosts as post}
      <div class="post-card">
        <div class="post-header">
          <span class="author">@{post.author}</span>
          <span class="time">{post.updatedAt}</span>
        </div>
        
        <h2 class="post-title">{post.title}</h2>
        <p class="post-preview">{post.preview}</p>
        
        <div class="post-meta">
          <span class="meta-item">📄 {post.versions} 个版本</span>
          <span class="meta-item">💬 {post.questions} 个追问</span>
        </div>
        
        <div class="post-tags">
          {#each post.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="actions">
    <a href="/" class="btn-secondary">返回首页</a>
    <a href="/write" class="btn-primary">写下第1稿</a>
  </div>
</main>

<style>
  .explore-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #666;
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    justify-content: center;
  }
  
  .filter-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 2rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .filter-btn.active {
    background: #333;
    color: white;
    border-color: #333;
  }
  
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .post-card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    transition: border-color 0.2s;
  }
  
  .post-card:hover {
    border-color: #333;
  }
  
  .post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #666;
  }
  
  .author {
    font-weight: 500;
    color: #333;
  }
  
  .post-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #111;
  }
  
  .post-preview {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .post-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #666;
  }
  
  .post-tags {
    display: flex;
    gap: 0.5rem;
  }
  
  .tag {
    padding: 0.25rem 0.5rem;
    background: #e0e0e0;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #666;
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
    border: 1px solid #333;
    color: #333;
  }
</style>