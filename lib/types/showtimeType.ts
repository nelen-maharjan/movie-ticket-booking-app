export type Screen = {
  id: string;
  name: string;
  screenType: string;
};

export type Theater = {
  id: string;
  name: string;
  screens: Screen[];
};