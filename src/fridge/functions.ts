import { JSONFilePreset } from 'lowdb/node';
import { type Food, type FoodToAdd, type FoodToUpdate } from './food.ts';
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

export async function updateFood(item: FoodToUpdate) {
  const db = await JSONFilePreset("db.json", defaultData);

  let foodName = "";
  db.update(data => {
    var food = data.food.find(x => x.id === item.id);
    if (food) {
      food.unit = item.unit;
      food.quantity = item.quantity;
      food.expiresAt = item.expiresAt;
      foodName = food.name;
    } else {
      throw new Error("Food not found");
    }
  })

  await db.write();

  return {
    name: foodName,
    ...item
  };
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

