export type Album = {
  userId: number;
  id: number;
  title: string;
};

const ALBUMS_API_URL = 'https://jsonplaceholder.typicode.com/albums';

export const fetchAlbums = async (limit = 20): Promise<Album[]> => {
  const response = await fetch(ALBUMS_API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }

  const albums = (await response.json()) as Album[];
  return albums.slice(0, limit);
};
