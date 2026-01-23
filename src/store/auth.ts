import { create } from 'zustand';
import { api } from '../api/client';

export type User = { 
  id: string; 
  email: string; 
  role: 'academic' | 'student'; 
  subRole?: 'faculty' | 'administrative';
  name?: string;
  avatarUrl?: string;
  department?: string;
  contact?: {
    phone?: string;
    address?: string;
  };
} | null;

type SignupData = {
  email: string;
  password: string;
  role: 'academic' | 'student';
  subRole?: 'faculty' | 'administrative';
  name?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  contact?: { phone?: string; address?: string; city?: string; state?: string; zip?: string };
  department?: string;
  year?: number;
  avatarUrl?: string;
};

type State = {
  user: User;
  initialized: boolean;
  setUser: (u: User) => void;
  login: (email: string, password: string, role: 'academic' | 'student') => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
};

export const useAuthStore = create<State>((set) => ({
  user: null,
  initialized: false,
  setUser: (u) => set({ user: u }),
  async login(email, password, role) {
    const { data } = await api.post('/auth/login', { email, password, role });
    set({ user: data.user });
    return data.user;
  },
  async signup(signupData) {
    const { data } = await api.post('/auth/register', signupData);
    set({ user: data.user });
    return data.user;
  },
  async logout() {
    await api.post('/auth/logout');
    set({ user: null });
  },
  async init() {
    try {
      const { data } = await api.post('/auth/refresh');
      set({ user: data.user, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },
}));


