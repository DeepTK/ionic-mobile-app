export type UserAddress = {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: {
    lat: string;
    lng: string;
  };
};

export type UserCompany = {
  name: string;
  catchPhrase: string;
  bs: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: UserAddress;
  company: UserCompany;
};

const USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(USERS_API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return (await response.json()) as User[];
};

export const fetchUserById = async (userId: number): Promise<User> => {
  const response = await fetch(`${USERS_API_URL}/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return (await response.json()) as User;
};
