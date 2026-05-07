export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

const POSTS_API_URL = 'https://jsonplaceholder.typicode.com/posts';

export const fetchPosts = async (limit = 10): Promise<Post[]> => {
  const response = await fetch(POSTS_API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  const posts = (await response.json()) as Post[];
  return posts.slice(0, limit);
};
