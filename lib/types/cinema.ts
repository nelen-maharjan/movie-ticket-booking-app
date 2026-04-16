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
  location: string;
  city: string;
  address: string;
  phone: string | null;
  screens: Screen[];
};