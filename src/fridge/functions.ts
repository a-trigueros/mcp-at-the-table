import { JSONFilePreset } from 'lowdb/node';
import { type Food, type FoodToAdd } from './food.ts';
import { randomUUID } from "crypto";

type Data = {
  food: Food[]
}

const defaultData: Data = {
  food: []
}

export async function getAvailableFood() {
  const db = await JSONFilePreset("db.json", defaultData);
  return db.data.food;
}

export async function addFood(item: FoodToAdd) {
  const food: Food = { id: randomUUID(), ...item };
  const db = await JSONFilePreset("db.json", defaultData);
  db.update(data => data.food.push(food))
  await db.write();
}

