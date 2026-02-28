<script>
  import { onMount } from 'svelte';
  
  let title = '';
  let content = '';
  let tags = '';
  
  // 合集管理（新增）
  let collections = []; // 所有合集
  let currentCollectionId = null; // 当前正在写的合集ID
  let newCollectionName = ''; // 新建合集名称
  
  let versions = [];
  
  onMount(() => {
    // 读取合集
    const savedCollections = localStorage.getItem('jixin_collections');
    if (savedCollections) {
      collections = JSON.parse(savedCollections);
    }
    // 读取版本
    const savedVersions = localStorage.getItem('jixin_versions');
    if (savedVersions) {
      versions = JSON.parse(savedVersions);
    }
    // 如果有合集，默认使用最后一个（继续写）
    if (collections.length > 0 && !currentCollectionId) {
      currentCollectionId = collections[collections.length - 1].id;
    }
  });
  
  // 自动保存
  $: {
    if (versions.length > 0) {
      localStorage.setItem('jixin_versions', JSON.stringify(versions));
    }
    if (collections.length > 0) {
      localStorage.setItem('jixin_collections', JSON.stringify(collections));
    }
  }
  
  // 当前合集信息
  $: currentCollection = collections.find(c => c.id === currentCollectionId);
  
  // 当前合集的版本
  $: currentCollectionVersions = versions.filter(v => v.collectionId === currentCollectionId);
  
  let activeQuestionVersion = null;
  let questionType = '';
  let questionContent = '';
  let activeResponseQuestion = null;
  let responseContent = '';
  
  const questionTypes = [
    { id: 'expand', label: '请求展开', placeholder: '你提到的...能具体说说吗？' },
    { id: 'contradict', label: '指出矛盾', placeholder: '这里似乎与...有矛盾，你怎么看？' },
    { id: 'connect', label: '关联其他', placeholder: '这让我想到...你认为有关联吗？' },
    { id: 'resonate', label: '情感共鸣', placeholder: '我也有类似感受，特别是...' }
  ];
  
  // 创建新合集（新增）
  function createCollection() {
    if (!newCollectionName.trim()) {
      alert('请输入合集名称');
      return;
    }
    
    const newCollection = {
      id: Date.now(),
      name: newCollectionName,
      createdAt: new Date().toLocaleString('zh-CN')
    };
    
    collections = [...collections, newCollection];
    currentCollectionId = newCollection.id;
    newCollectionName = '';
    
    // 提示用户
    alert(`已创建合集"${newCollection.name}"，新版本将保存到此合集`);
  }
  
  // 切换当前合集（新增）
  function switchCollection(collectionId) {
    currentCollectionId = collectionId;
    const c = collections.find(col => col.id === collectionId);
    if (c) {
      alert(`已切换到合集"${c.name}"`);
    }
  }
  
  function saveVersion() {
    if (!content.trim()) return;
    
    // 如果没有选择合集，提示创建（新增）
    if (!currentCollectionId) {
      alert('请先创建或选择一个合集');
      return;
    }
    
    const tagList = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    const newVersion = {
      id: Date.now(),
      collectionId: currentCollectionId, // 关联合集ID（新增）
      title: title || '无标题',
      content: content,
      tags: tagList,
      savedAt: new Date().toLocaleString('zh-CN'),
      questions: []
    };
    
    versions = [newVersion, ...versions];
    title = '';
    content = '';
    tags = '';
  }
  
  function submitQuestion(versionId) {
    if (!questionContent.trim()) return;
    
    versions = versions.map(v => {
      if (v.id === versionId) {
        return {
          ...v,
          questions: [...v.questions, {
            id: Date.now(),
            type: questionType,
            content: questionContent,
            response: '',
            askedAt: new Date().toLocaleString('zh-CN')
          }]
        };
      }
      return v;
    });
    
    questionContent = '';
    questionType = '';
    activeQuestionVersion = null;
  }
  
  function submitResponse(versionId, questionId) {
    if (!responseContent.trim()) return;
    
    versions = versions.map(v => {
      if (v.id === versionId) {
        return {
          ...v,
          questions: v.questions.map(q => {
            if (q.id === questionId) {
              return { ...q, response: responseContent };
            }
            return q;
          })
        };
      }
      return v;
    });
    
    responseContent = '';
    activeResponseQuestion = null;
  }
  
  function deleteVersion(versionId) {
    if (confirm('确定删除这个版本吗？')) {
      versions = versions.filter(v => v.id !== versionId);
    }
  }
  
  function exportData() {
    const data = {
      collections: collections,
      versions: versions,
      exportTime: new Date().toLocaleString('zh-CN')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `集薪备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.versions && Array.isArray(data.versions)) {
            if (confirm(`确定导入备份吗？`)) {
              versions = data.versions || [];
              collections = data.collections || [];
              if (collections.length > 0) {
                currentCollectionId = collections[collections.length - 1].id;
              }
              alert('导入成功！');
            }
          } else {
            alert('文件格式错误');
          }
        } catch (err) {
          alert('读取文件失败');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
</script>

<main class="write-container">
  <h1>写下第1稿</h1>
  
  <!-- 合集管理区（新增） -->
  <div class="collection-section">
    <h3>📁 合集管理</h3>
    
    <!-- 当前合集显示 -->
    {#if currentCollection}
      <div class="current-collection">
        <span class="label">当前合集：</span>
        <span class="name">{currentCollection.name}</span>
        <span class="count">({currentCollectionVersions.length} 个版本)</span>
      </div>
    {:else}
      <div class="current-collection empty">
        <span class="label">当前合集：</span>
        <span class="name">未选择</span>
      </div>
    {/if}
    
    <!-- 创建新合集 -->
    <div class="create-collection">
      <input 
        bind:value={newCollectionName} 
        placeholder="新合集名称（如：哲学思考、读书笔记）" 
        class="collection-input"
      />
      <button on:click={createCollection} class="btn-create">
        ➕ 创建新合集
      </button>
    </div>
    
    <!-- 切换合集（如果有多个） -->
    {#if collections.length > 1}
      <div class="switch-collection">
        <span class="label">切换到：</span>
        {#each collections as collection}
          <button 
            on:click={() => switchCollection(collection.id)}
            class="collection-btn {currentCollectionId === collection.id ? 'active' : ''}"
          >
            {collection.name}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- 输入区 -->
  <div class="editor">
    <input 
      bind:value={title} 
      placeholder="标题（不必完美）" 
      class="title-input"
    />
    
    <input 
      bind:value={tags} 
      placeholder="标签：哲学, 写作, 心理学（用逗号分隔）" 
      class="tags-input"
    />
    
    <textarea 
      bind:value={content} 
      placeholder="从这里开始写...（保存后会清空，可在下方查看历史版本）" 
      rows="8"
      class="content-input"
    />
    
    <button on:click={saveVersion} class="btn-save">
      保存到"{currentCollection?.name || '未命名合集'}": 第 {currentCollectionVersions.length + 1} 稿
    </button>
  </div>
  
  <!-- 版本历史（按合集分组显示） -->
  {#if collections.length > 0}
    <div class="versions">
      <h2>版本历史（按合集分组）</h2>
      
      {#each collections as collection}
        {@const collectionVersions = versions.filter(v => v.collectionId === collection.id)}
        
        <div class="collection-group">
          <div class="collection-header">
            <h3>📁 {collection.name}</h3>
            <span class="collection-meta">{collectionVersions.length} 个版本 · {collection.createdAt}</span>
          </div>
          
          {#if collectionVersions.length > 0}
            <div class="collection-versions">
              {#each collectionVersions as version, index}
                <div class="version-card">
                  <div class="version-header">
                    <span class="version-num">第 {collectionVersions.length - index} 稿</span>
                    <span class="version-time">{version.savedAt}</span>
                  </div>
                  
                  <h3 class="version-title">{version.title}</h3>
                  
                  {#if version.tags && version.tags.length > 0}
                    <div class="version-tags">
                      {#each version.tags as tag}
                        <span class="tag">{tag}</span>
                      {/each}
                    </div>
                  {/if}
                  
                  <p class="version-preview">{version.content}</p>
                  
                  <div class="version-actions">
                    <a href="/version/{version.id}" class="btn-detail">📄 查看详情</a>
                    <button 
                      on:click={() => activeQuestionVersion = version.id} 
                      class="btn-question"
                    >
                      💬 追问（{version.questions.length}）
                    </button>
                    <button on:click={() => deleteVersion(version.id)} class="btn-delete">
                      🗑️
                    </button>
                  </div>
                  
                  <!-- 追问表单和列表（与之前相同，省略...） -->
                  {#if activeQuestionVersion === version.id}
                    <div class="question-form">
                      <h4>选择追问类型：</h4>
                      <div class="question-types">
                        {#each questionTypes as type}
                          <button 
                            on:click={() => questionType = type.id}
                            class="type-btn {questionType === type.id ? 'active' : ''}"
                          >
                            {type.label}
                          </button>
                        {/each}
                      </div>
                      
                      {#if questionType}
                        <textarea
                          bind:value={questionContent}
                          placeholder={questionTypes.find(t => t.id === questionType).placeholder}
                          rows="3"
                          class="question-input"
                        />
                        <div class="form-actions">
                          <button on:click={() => submitQuestion(version.id)} class="btn-submit">
                            发送追问
                          </button>
                          <button on:click={() => activeQuestionVersion = null} class="btn-cancel">
                            取消
                          </button>
                        </div>
                      {/if}
                    </div>
                  {/if}
                  
                  {#if version.questions.length > 0}
                    <div class="questions-list">
                      {#each version.questions as q}
                        <div class="question-item">
                          <div class="question-meta">
                            <span class="question-type">
                              {questionTypes.find(t => t.id === q.type)?.label}
                            </span>
                            <span class="question-time">{q.askedAt}</span>
                          </div>
                          <p class="question-content">{q.content}</p>
                          {#if q.response}
                            <div class="response">
                              <strong>作者回应：</strong>
                              <p>{q.response}</p>
                            </div>
                          {:else}
                            {#if activeResponseQuestion === q.id}
                              <div class="response-form">
                                <textarea
                                  bind:value={responseContent}
                                  placeholder="输入你的回应..."
                                  rows="2"
                                  class="response-input"
                                />
                                <div class="form-actions">
                                  <button on:click={() => submitResponse(version.id, q.id)} class="btn-submit-small">
                                    发送回应
                                  </button>
                                  <button on:click={() => activeResponseQuestion = null} class="btn-cancel-small">
                                    取消
                                  </button>
                                </div>
                              </div>
                            {:else}
                              <button on:click={() => activeResponseQuestion = q.id} class="btn-response">
                                回应此追问
                              </button>
                            {/if}
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-collection">
              <p>该合集暂无版本</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  
  <!-- 数据管理 -->
  <div class="data-actions">
    <button on:click={exportData} class="btn-export">📥 导出备份（含合集）</button>
    <button on:click={importData} class="btn-import">📤 导入备份</button>
  </div>
  
  <a href="/" class="btn-back">返回首页</a>
</main>

<style>
  .write-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  /* 合集管理区样式（新增） */
  .collection-section {
    background: #f0f0f0;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    border-left: 4px solid #666;
  }
  
  .collection-section h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #333;
  }
  
  .current-collection {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: white;
    border-radius: 0.25rem;
  }
  
  .current-collection.empty {
    color: #999;
  }
  
  .current-collection .label {
    color: #666;
    font-size: 0.875rem;
  }
  
  .current-collection .name {
    font-weight: bold;
    color: #333;
    margin-left: 0.5rem;
  }
  
  .current-collection .count {
    color: #999;
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }
  
  .create-collection {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .collection-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .btn-create {
    padding: 0.75rem 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap;
  }
  
  .switch-collection {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .switch-collection .label {
    color: #666;
    font-size: 0.875rem;
  }
  
  .collection-btn {
    padding: 0.25rem 0.75rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 1rem;
    cursor: pointer;
    font-size: 0.75rem;
    color: #666;
  }
  
  .collection-btn.active {
    background: #333;
    color: white;
    border-color: #333;
  }
  
  /* 编辑区样式 */
  .editor {
    background: #f9f9f9;
    padding: 2rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .title-input, .content-input, .tags-input {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    font-size: 1rem;
  }
  
  .title-input {
    font-size: 1.25rem;
  }
  
  .tags-input {
    font-size: 0.875rem;
    color: #666;
  }
  
  .content-input {
    resize: vertical;
  }
  
  .btn-save {
    width: 100%;
    padding: 0.75rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
  }
  
  /* 版本历史样式 */
  .versions {
    margin-bottom: 2rem;
  }
  
  .versions h2 {
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.25rem;
  }
  
  /* 合集分组样式（新增） */
  .collection-group {
    margin-bottom: 2rem;
    background: white;
    border: 1px solid #eee;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .collection-header {
    background: #fafafa;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .collection-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .collection-meta {
    font-size: 0.75rem;
    color: #999;
  }
  
  .collection-versions {
    padding: 1.5rem;
  }
  
  .empty-collection {
    padding: 2rem;
    text-align: center;
    color: #999;
    font-size: 0.875rem;
  }
  
  /* 版本卡片样式 */
  .version-card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    border-left: 4px solid #333;
  }
  
  .version-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 0.875rem;
  }
  
  .version-num {
    font-weight: bold;
    color: #333;
  }
  
  .version-title {
    margin: 0.5rem 0;
    font-size: 1.25rem;
  }
  
  .version-tags {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }
  
  .version-tags .tag {
    padding: 0.25rem 0.5rem;
    background: #e0e0e0;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #666;
  }
  
  .version-preview {
    color: #444;
    line-height: 1.6;
    margin-bottom: 1rem;
    white-space: pre-wrap;
  }
  
  .version-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
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
  
  .btn-detail:hover {
    background: #f5f5f5;
  }
  
  .btn-question {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .btn-delete {
    padding: 0.5rem;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    margin-left: auto;
  }
  
  .btn-delete:hover {
    background: #fcc;
  }
  
  /* 追问相关样式（与之前相同） */
  .question-form {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
    border: 1px solid #ddd;
  }
  
  .question-form h4 {
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #666;
  }
  
  .question-types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .type-btn {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .type-btn.active {
    background: #333;
    color: white;
    border-color: #333;
  }
  
  .question-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }
  
  .form-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-submit {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .btn-cancel {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .questions-list {
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    padding-top: 1rem;
  }
  
  .question-item {
    background: #f0f0f0;
    padding: 1rem;
    border-radius: 0.25rem;
    margin-bottom: 0.75rem;
  }
  
  .question-meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    color: #666;
  }
  
  .question-type {
    background: #e0e0e0;
    padding: 0.125rem 0.5rem;
    border-radius: 0.125rem;
  }
  
  .question-content {
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }
  
  .btn-response {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    background: white;
    border: 1px solid #999;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .response {
    background: #e8e8e8;
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .response-form {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 0.25rem;
    border: 1px solid #ddd;
  }
  
  .response-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    resize: vertical;
  }
  
  .btn-submit-small, .btn-cancel-small {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .btn-submit-small {
    background: #333;
    color: white;
    border: none;
    margin-right: 0.5rem;
  }
  
  .btn-cancel-small {
    background: white;
    border: 1px solid #ddd;
  }
  
  .data-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin: 2rem 0;
  }
  
  .btn-export, .btn-import {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    border: 1px solid #ddd;
    background: white;
  }
  
  .btn-back {
    display: block;
    text-align: center;
    padding: 1rem;
    color: #666;
    text-decoration: none;
  }
</style>