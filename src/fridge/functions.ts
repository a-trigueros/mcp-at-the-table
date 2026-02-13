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
  return food;
}

export function toHumanReadeableText(food: Food) {
  let text = `${food.quantity}`;
  if (food.unit) {
    text = `${text} ${food.unit} of`;
  }
  text = `${text} ${food.name}`;

  if (food.expiresAt) {
    text = `${text} that expires at ${food.expiresAt}`;
  }
  return `${text} identified by ${food.id}`;
}

