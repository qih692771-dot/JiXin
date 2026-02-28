<script>
  let title = "集薪";
  let subtitle = "让输出和追问成为自然反应";
</script>

<main class="container">
  <h1>{title}</h1>
  <p class="subtitle">{subtitle}</p>
  
  <div class="actions">
    <a href="/write" class="btn-primary">写下第1稿</a>
    <a href="/explore" class="btn-secondary">浏览引子</a>
    <a href="/profile" class="btn-secondary">我的轨迹</a>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 4rem 2rem;
    text-align: center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .subtitle {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 3rem;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn-primary, .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: #333;
    color: white;
  }
  
  .btn-primary:hover {
    background: #000;
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    border: 1px solid #333;
    color: #333;
  }
  
  .btn-secondary:hover {
    background: #f5f5f5;
  }
</style>