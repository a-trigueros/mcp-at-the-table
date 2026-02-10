import { JSONFilePreset } from 'lowdb/node';
import { type Food } from './food.ts';

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

