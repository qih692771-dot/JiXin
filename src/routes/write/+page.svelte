<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  let loaded = false;
  let title = '';
  let content = '';
  let tags = '';
  let versions = [];
  let collections = [];
  
  let showCollectionModal = false;
  let activeVersionId = null;
  let newCollectionName = '';
  
  onMount(() => {
    if (browser) {
      try {
        const saved = localStorage.getItem('jixin_versions');
        const savedCollections = localStorage.getItem('jixin_collections');
        if (saved) versions = JSON.parse(saved);
        if (savedCollections) collections = JSON.parse(savedCollections);
      } catch (e) {
        console.warn('localStorage 解析失败', e);
      }
      loaded = true;
    }
  });
  
  $: if (browser && loaded && versions.length >= 0) {
    try {
      localStorage.setItem('jixin_versions', JSON.stringify(versions));
      localStorage.setItem('jixin_collections', JSON.stringify(collections));
    } catch (e) {
      console.warn('localStorage 保存失败', e);
    }
  }
  
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
  
  function saveVersion() {
    if (!content.trim()) {
      alert('请输入内容');
      return;
    }
    
    const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
    
    const newVersion = {
      id: Date.now(),
      title: title || '无标题',
      content: content,
      tags: tagList,
      collectionId: null,
      savedAt: new Date().toLocaleString('zh-CN'),
      questions: []
    };
    
    versions = [newVersion, ...versions];
    title = '';
    content = '';
    tags = '';
  }
  
  function openCollectionModal(versionId) {
    activeVersionId = versionId;
    showCollectionModal = true;
    newCollectionName = '';
  }
  
  function addToCollection(collectionId) {
    versions = versions.map(v => {
      if (v.id === activeVersionId) return { ...v, collectionId };
      return v;
    });
    showCollectionModal = false;
    activeVersionId = null;
  }
  
  function createAndAddToCollection() {
    if (!newCollectionName.trim()) return;
    const newCollection = {
      id: Date.now(),
      name: newCollectionName,
      createdAt: new Date().toLocaleString('zh-CN')
    };
    collections = [newCollection, ...collections];
    versions = versions.map(v => {
      if (v.id === activeVersionId) return { ...v, collectionId: newCollection.id };
      return v;
    });
    showCollectionModal = false;
    newCollectionName = '';
    activeVersionId = null;
  }
  
  function removeFromCollection(versionId) {
    versions = versions.map(v => {
      if (v.id === versionId) return { ...v, collectionId: null };
      return v;
    });
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
            if (q.id === questionId) return { ...q, response: responseContent };
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
    const data = { versions, collections, exportTime: new Date().toLocaleString('zh-CN') };
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
          if (data.versions) {
            if (confirm('确定导入备份吗？')) {
              versions = data.versions || [];
              collections = data.collections || [];
              alert('导入成功！');
            }
          }
        } catch (err) {
          alert('导入失败');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
</script>

<main class="write-container">
  <h1>写下第1稿</h1>
  
  <div class="editor">
    <input bind:value={title} placeholder="标题（不必完美）" class="title-input"/>
    <input bind:value={tags} placeholder="标签：哲学, 写作（用逗号分隔）" class="tags-input"/>
    <textarea bind:value={content} placeholder="从这里开始写...随时保存，随时归集" rows="8" class="content-input"/>
    <button on:click={saveVersion} class="btn-save">
      保存为第 {versions.length + 1} 稿
    </button>
  </div>
  
  {#if versions.length > 0}
    <div class="versions">
      <h2>版本历史 {#if collections.length > 0}<span class="subtitle">（点击 📁 归集）</span>{/if}</h2>
      
      <!-- 未归集 -->
      {#each [versions.filter(v => !v.collectionId)] as ungrouped}
        {#if ungrouped.length > 0}
          <div class="collection-group ungrouped">
            <div class="collection-header">
              <h3>📂 未归集 ({ungrouped.length})</h3>
            </div>
            <div class="collection-versions">
              {#each ungrouped as version, index}
                <div class="version-card">
                  <div class="version-header">
                    <span class="version-num">第 {ungrouped.length - index} 稿</span>
                    <span>{version.savedAt}</span>
                  </div>
                  <h3 class="version-title">{version.title}</h3>
                  {#if version.tags?.length > 0}
                    <div class="version-tags">
                      {#each version.tags as tag}<span class="tag">{tag}</span>{/each}
                    </div>
                  {/if}
                  <p class="version-preview">{version.content}</p>
                  <div class="version-actions">
                    <a href="/version/{version.id}" class="btn-detail">📄 详情</a>
                    <button on:click={() => activeQuestionVersion = version.id} class="btn-question">💬 追问({version.questions.length})</button>
                    <button on:click={() => openCollectionModal(version.id)} class="btn-collection">📁 归集</button>
                    <button on:click={() => deleteVersion(version.id)} class="btn-delete">🗑️</button>
                  </div>
                  
                  {#if activeQuestionVersion === version.id}
                    <div class="question-form">
                      <h4>选择追问类型：</h4>
                      <div class="question-types">
                        {#each questionTypes as type}
                          <button on:click={() => questionType = type.id} class="type-btn {questionType === type.id ? 'active' : ''}">{type.label}</button>
                        {/each}
                      </div>
                      {#if questionType}
                        <textarea bind:value={questionContent} placeholder={questionTypes.find(t => t.id === questionType).placeholder} rows="3" class="question-input"/>
                        <div class="form-actions">
                          <button on:click={() => submitQuestion(version.id)} class="btn-submit">发送追问</button>
                          <button on:click={() => activeQuestionVersion = null} class="btn-cancel">取消</button>
                        </div>
                      {/if}
                    </div>
                  {/if}
                  
                  {#if version.questions.length > 0}
                    <div class="questions-list">
                      {#each version.questions as q}
                        <div class="question-item">
                          <div class="question-meta">
                            <span class="question-type">{questionTypes.find(t => t.id === q.type)?.label}</span>
                            <span>{q.askedAt}</span>
                          </div>
                          <p>{q.content}</p>
                          {#if q.response}
                            <div class="response"><strong>回应：</strong>{q.response}</div>
                          {:else if activeResponseQuestion === q.id}
                            <textarea bind:value={responseContent} placeholder="输入回应..." rows="2" class="response-input"/>
                            <button on:click={() => submitResponse(version.id, q.id)} class="btn-submit-small">发送</button>
                            <button on:click={() => activeResponseQuestion = null} class="btn-cancel-small">取消</button>
                          {:else}
                            <button on:click={() => activeResponseQuestion = q.id} class="btn-response">回应此追问</button>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
      
      <!-- 已归集合集 -->
      {#each collections as collection}
        {#each [versions.filter(v => v.collectionId === collection.id)] as collectionVersions}
          {#if collectionVersions.length > 0}
            <div class="collection-group">
              <div class="collection-header">
                <h3>📁 {collection.name} ({collectionVersions.length})</h3>
                <span class="collection-meta">{collection.createdAt}</span>
              </div>
              <div class="collection-versions">
                {#each collectionVersions as version, index}
                  <div class="version-card">
                    <div class="version-header">
                      <span class="version-num">第 {collectionVersions.length - index} 稿</span>
                      <span>{version.savedAt}</span>
                    </div>
                    <h3 class="version-title">{version.title}</h3>
                    {#if version.tags?.length > 0}
                      <div class="version-tags">
                        {#each version.tags as tag}<span class="tag">{tag}</span>{/each}
                      </div>
                    {/if}
                    <p class="version-preview">{version.content}</p>
                    <div class="version-actions">
                      <a href="/version/{version.id}" class="btn-detail">📄 详情</a>
                      <button on:click={() => activeQuestionVersion = version.id} class="btn-question">💬 追问({version.questions.length})</button>
                      <button on:click={() => removeFromCollection(version.id)} class="btn-ungroup">📂 取出</button>
                      <button on:click={() => deleteVersion(version.id)} class="btn-delete">🗑️</button>
                    </div>
                    
                    {#if activeQuestionVersion === version.id}
                      <div class="question-form">
                        <h4>选择追问类型：</h4>
                        <div class="question-types">
                          {#each questionTypes as type}
                            <button on:click={() => questionType = type.id} class="type-btn {questionType === type.id ? 'active' : ''}">{type.label}</button>
                          {/each}
                        </div>
                        {#if questionType}
                          <textarea bind:value={questionContent} placeholder={questionTypes.find(t => t.id === questionType).placeholder} rows="3" class="question-input"/>
                          <div class="form-actions">
                            <button on:click={() => submitQuestion(version.id)} class="btn-submit">发送追问</button>
                            <button on:click={() => activeQuestionVersion = null} class="btn-cancel">取消</button>
                          </div>
                        {/if}
                      </div>
                    {/if}
                    
                    {#if version.questions.length > 0}
                      <div class="questions-list">
                        {#each version.questions as q}
                          <div class="question-item">
                            <div class="question-meta">
                              <span class="question-type">{questionTypes.find(t => t.id === q.type)?.label}</span>
                              <span>{q.askedAt}</span>
                            </div>
                            <p>{q.content}</p>
                            {#if q.response}
                              <div class="response"><strong>回应：</strong>{q.response}</div>
                            {:else if activeResponseQuestion === q.id}
                              <textarea bind:value={responseContent} placeholder="输入回应..." rows="2" class="response-input"/>
                              <button on:click={() => submitResponse(version.id, q.id)} class="btn-submit-small">发送</button>
                              <button on:click={() => activeResponseQuestion = null} class="btn-cancel-small">取消</button>
                            {:else}
                              <button on:click={() => activeResponseQuestion = q.id} class="btn-response">回应此追问</button>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  {/if}
  
  {#if showCollectionModal}
    <div class="modal-overlay" on:click={() => showCollectionModal = false}>
      <div class="modal-content" on:click|stopPropagation>
        <h3>📁 归入合集</h3>
        {#if collections.length > 0}
          <div class="collection-list">
            <p class="modal-hint">选择已有合集：</p>
            {#each collections as coll}
              <button on:click={() => addToCollection(coll.id)} class="collection-option">
                <span>{coll.name}</span>
                <span>{versions.filter(v => v.collectionId === coll.id).length} 篇</span>
              </button>
            {/each}
          </div>
          <div class="modal-divider">或</div>
        {/if}
        <div class="create-collection">
          <p class="modal-hint">创建新合集：</p>
          <input bind:value={newCollectionName} placeholder="合集名称" class="collection-name-input"/>
          <button on:click={createAndAddToCollection} class="btn-create" disabled={!newCollectionName.trim()}>创建并归入</button>
        </div>
        <button on:click={() => showCollectionModal = false} class="btn-close">取消</button>
      </div>
    </div>
  {/if}
  
  <div class="data-actions">
    <button on:click={exportData} class="btn-export">📥 导出备份</button>
    <button on:click={importData} class="btn-import">📤 导入备份</button>
  </div>
  
  <a href="/" class="btn-back">返回首页</a>
</main>

<style>
  .write-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
  h1 { margin-bottom: 2rem; text-align: center; }
  .subtitle { font-size: 0.875rem; color: #999; font-weight: normal; margin-left: 0.5rem; }
  
  .editor { background: #f9f9f9; padding: 2rem; border-radius: 0.5rem; margin-bottom: 2rem; }
  .title-input, .content-input, .tags-input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 1rem; }
  .title-input { font-size: 1.25rem; }
  .tags-input { font-size: 0.875rem; color: #666; }
  .content-input { resize: vertical; }
  .btn-save { width: 100%; padding: 0.75rem; background: #333; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
  
  .versions { margin-bottom: 2rem; }
  .versions h2 { margin-bottom: 1.5rem; color: #333; font-size: 1.25rem; display: flex; align-items: center; }
  
  .collection-group { margin-bottom: 2rem; background: white; border: 1px solid #eee; border-radius: 0.5rem; overflow: hidden; }
  .collection-group.ungrouped { border-color: #ddd; }
  .collection-group.ungrouped .collection-header { background: #f5f5f5; }
  
  .collection-header { background: #fafafa; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
  .collection-header h3 { margin: 0; font-size: 1.1rem; color: #333; }
  .collection-meta { font-size: 0.75rem; color: #999; }
  
  .collection-versions { padding: 1.5rem; }
  
  .version-card { background: #f9f9f9; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 4px solid #333; position: relative; }
  .version-card:last-child { margin-bottom: 0; }
  /* 未归集卡片：蓝色角标 */
  .collection-group.ungrouped .version-card { border-left-color: #2563eb; }
  .collection-group.ungrouped .version-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    border-width: 0 14px 14px 0;
    border-style: solid;
    border-color: transparent #2563eb transparent transparent;
    border-radius: 0 0.5rem 0 0;
  }
  
  .version-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #666; font-size: 0.875rem; }
  .version-num { font-weight: bold; color: #333; }
  .version-title { margin: 0.5rem 0; font-size: 1.25rem; }
  
  .version-tags { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .tag { padding: 0.25rem 0.5rem; background: #e0e0e0; border-radius: 0.25rem; font-size: 0.75rem; color: #666; }
  
  .version-preview { color: #444; line-height: 1.6; margin-bottom: 1rem; white-space: pre-wrap; }
  
  .version-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .btn-detail { padding: 0.5rem 1rem; background: white; border: 1px solid #333; color: #333; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; text-decoration: none; display: inline-block; }
  .btn-question { padding: 0.5rem 1rem; background: #333; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
  .btn-collection { padding: 0.5rem 1rem; background: #666; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
  .btn-collection:hover { background: #444; }
  .btn-ungroup { padding: 0.5rem 1rem; background: #999; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
  .btn-delete { padding: 0.5rem; background: #fee; border: 1px solid #fcc; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; margin-left: auto; }
  
  .question-form { background: white; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; border: 1px solid #ddd; }
  .question-form h4 { margin-bottom: 0.75rem; font-size: 0.875rem; color: #666; }
  .question-types { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .type-btn { padding: 0.5rem 0.75rem; border: 1px solid #ddd; background: white; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
  .type-btn.active { background: #333; color: white; border-color: #333; }
  .question-input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.25rem; margin-bottom: 0.75rem; font-size: 0.875rem; }
  .form-actions { display: flex; gap: 0.5rem; }
  .btn-submit { padding: 0.5rem 1rem; background: #333; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
  .btn-cancel { padding: 0.5rem 1rem; background: white; border: 1px solid #ddd; border-radius: 0.25rem; cursor: pointer; }
  
  .questions-list { margin-top: 1rem; border-top: 1px solid #ddd; padding-top: 1rem; }
  .question-item { background: #f0f0f0; padding: 1rem; border-radius: 0.25rem; margin-bottom: 0.75rem; }
  .question-meta { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.75rem; color: #666; }
  .question-type { background: #e0e0e0; padding: 0.125rem 0.5rem; border-radius: 0.125rem; }
  .btn-response { padding: 0.25rem 0.75rem; font-size: 0.75rem; background: white; border: 1px solid #999; border-radius: 0.25rem; cursor: pointer; }
  .response { background: #e8e8e8; padding: 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; margin-top: 0.5rem; }
  .response-input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.25rem; margin-bottom: 0.5rem; font-size: 0.875rem; resize: vertical; }
  .btn-submit-small, .btn-cancel-small { padding: 0.25rem 0.75rem; font-size: 0.75rem; border-radius: 0.25rem; cursor: pointer; }
  .btn-submit-small { background: #333; color: white; border: none; margin-right: 0.5rem; }
  .btn-cancel-small { background: white; border: 1px solid #ddd; }
  
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal-content { background: white; padding: 2rem; border-radius: 0.5rem; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
  .modal-content h3 { margin-bottom: 1.5rem; text-align: center; }
  .modal-hint { font-size: 0.875rem; color: #666; margin-bottom: 0.75rem; }
  .collection-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
  .collection-option { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #ddd; background: white; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
  .collection-option:hover { background: #f5f5f5; border-color: #333; }
  .modal-divider { text-align: center; color: #999; margin: 1rem 0; font-size: 0.875rem; }
  .collection-name-input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.25rem; margin-bottom: 0.75rem; font-size: 0.875rem; }
  .btn-create { width: 100%; padding: 0.75rem; background: #333; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
  .btn-create:disabled { background: #ccc; cursor: not-allowed; }
  .btn-close { width: 100%; padding: 0.75rem; margin-top: 1rem; background: white; border: 1px solid #ddd; border-radius: 0.25rem; cursor: pointer; }
  
  .data-actions { display: flex; gap: 0.5rem; justify-content: center; margin: 2rem 0; }
  .btn-export, .btn-import { padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; border: 1px solid #ddd; background: white; }
  .btn-back { display: block; text-align: center; padding: 1rem; color: #666; text-decoration: none; }
</style>