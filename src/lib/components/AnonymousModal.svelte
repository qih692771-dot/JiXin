<script>
  /** @type {'real' | 'anonymous'} */
  export let initialChoice = 'real';
  /** @type {(choice: 'real' | 'anonymous') => void} */
  export let onConfirm = () => {};
  /** @type {() => void} */
  export let onClose = () => {};

  let selected = initialChoice;

  function submit() {
    onConfirm(selected);
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click={onClose}>
  <div class="modal-box" on:click|stopPropagation>
    <h2 class="modal-title">选择发布身份</h2>
    <p class="modal-subtitle">第1-3稿可选择匿名，第4稿起强制实名</p>

    <div class="identity-options">
      <label class="option-card {selected === 'real' ? 'selected' : ''}">
        <input type="radio" bind:group={selected} value="real" />
        <div class="option-icon">👤</div>
        <div class="option-content">
          <span class="option-title">公开身份</span>
          <span class="option-desc">使用用户名，建立个人品牌</span>
        </div>
      </label>

      <label class="option-card {selected === 'anonymous' ? 'selected' : ''}">
        <input type="radio" bind:group={selected} value="anonymous" />
        <div class="option-icon">🎭</div>
        <div class="option-content">
          <span class="option-title">匿名发布</span>
          <span class="option-desc">隐藏作者信息，更自由表达</span>
        </div>
      </label>
    </div>

    <div class="actions">
      <button type="button" class="btn-cancel" on:click={onClose}>取消</button>
      <button type="button" class="btn-confirm" on:click={submit}>确认发布</button>
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
    max-width: 380px;
    width: 90%;
  }
  .modal-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    text-align: center;
  }
  .modal-subtitle {
    margin: 0 0 1.5rem 0;
    font-size: 0.8rem;
    color: #666;
    text-align: center;
  }
  .identity-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .option-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .option-card:hover {
    border-color: #ccc;
  }
  .option-card.selected {
    border-color: #333;
    background: #fafafa;
  }
  .option-card input {
    display: none;
  }
  .option-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }
  .option-content {
    display: flex;
    flex-direction: column;
  }
  .option-title {
    font-weight: 600;
    color: #333;
  }
  .option-desc {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
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

