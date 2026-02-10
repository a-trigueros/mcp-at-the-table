export type Quantity = {
  value: number;
  unit: string;
}

export type Food = {
  name: string;
  quantity: Quantity;
  expiresAt: Date;
}
