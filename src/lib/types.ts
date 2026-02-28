/**
 * 追问项（版本下的单条追问与回应）
 */
export interface Question {
  id: number;
  type: string;
  content: string;
  response: string;
  askedAt: string;
}

/**
 * 版本可见性：公开 / 私密 / 匿名
 */
export type Visibility = 'public' | 'private' | 'anonymous';

/**
 * 作者身份：实名 / 匿名（第1-3稿可选，第4稿+强制 real）
 */
export type AuthorIdentity = 'real' | 'anonymous';

/**
 * 版本（单稿）数据结构
 * 第4稿分水岭：第4稿及以后强制 authorIdentity 为 'real'
 */
export interface Version {
  id: number;
  title: string;
  content: string;
  tags: string[];
  collectionId: number | null;
  savedAt: string;
  questions: Question[];
  isGloballyPinned: boolean;
  /** 默认 'public' */
  visibility: Visibility;
  /** true = 被用户主动隐藏 */
  isHidden: boolean;
  /** 第1-3稿可选，第4稿+强制 'real' */
  authorIdentity: AuthorIdentity;
}
