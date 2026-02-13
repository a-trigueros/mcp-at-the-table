export type FoodToAdd = {
  name: string;
  quantity: number;
  unit?: string | undefined;
  expiresAt?: Date | undefined;
}

export type Food = FoodToAdd & {
  id: string;
}
