export interface Article {
  id: number;
  headline: string;
  source: string;
  published_at: string;
  article_text: string;
  summary: string;
  category: string;
  country_tag: string;
  created_at: string;
}

export interface ArticleListItem {
  id: number;
  headline: string;
  source: string;
  published_at: string;
  summary: string;
  category: string;
  country_tag: string;
}
