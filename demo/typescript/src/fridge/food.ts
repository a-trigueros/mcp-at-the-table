export type FoodWithId = {
  id: string;
}

export type FoodWithName = {
  name: string;
}

export type FoodWithQuantity = {
  quantity: number;
  unit?: string | undefined;
  expiresAt?: Date | undefined;
}

export type FoodToAdd = FoodWithName & FoodWithQuantity;

export type Food = FoodWithName & FoodWithQuantity & FoodWithId;

export type FoodToUpdate = FoodWithId & FoodWithQuantity;
