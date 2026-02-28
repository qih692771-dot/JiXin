# 集薪 (JiXin) 开发备忘录

**当前版本**: v0.6（第4稿分水岭已完成）  
**日期**: 2026-02-28  
**GitHub**: https://github.com/qihb692771-dot/JiXin

## 🎯 当前状态

**刚完成**: 第4稿分水岭 + 私密作品标记
- 第4稿保存时弹出隐藏管理弹窗
- 可隐藏前3稿中的1篇（配额 0/1）
- 私密版本带"🔒"标记，统计区分公开/私密（如：4总版本(3/1)）

**待开发**:
1. ⭐ 第5稿+隐藏配额（第5稿可隐藏2篇，第6稿3篇...）
2. ⭐ 第1-3稿匿名选择（公开身份/匿名发布）
3. 个人页可见性管理面板（随时调整历史版本）
4. Supabase云端迁移（长期）

## 💾 数据模型

```typescript
// versions 关键字段
{
  // ...原有字段...
  isGloballyPinned: boolean,  // 代表作置顶
  visibility: 'public'|'private'|'anonymous',
  isHidden: boolean,          // true=私密（第4稿+可设置）
  authorIdentity: 'real'|'anonymous'  // 第4稿+强制'real'
}