export type Screen = {
  id: string;
  name: string;
  screenType: string;
  totalRows: number;
  totalCols: number;
};

export type Theater = {
  id: string;
  name: string;
  city: string;
  location: string;
  address?: string;
  phone?: string;
  screens: Screen[];
};

export type TheaterForm = {
  name: string;
  location: string;
  city: string;
  address: string;
  phone: string;
};

export type ScreenForm = {
  name: string;
  totalRows: number;
  totalCols: number;
  screenType: string;
};