import { JSONFilePreset } from 'lowdb/node';
import { type Food, type FoodToAdd, type FoodToUpdate, type FoodWithId } from './food.ts';
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
  return `Added ${toHumanReadeableText(food)}`
}

export async function updateFood(item: FoodToUpdate) {
  if (item.quantity > 0) {
    return updateFoodQuantity(item);
  }

  return removeFood(item);

}

async function updateFoodQuantity(item: FoodToUpdate) {
  const db = await JSONFilePreset("db.json", defaultData);

  let foodName = "";
  let wasUpdated = true;
  db.update(data => {
    var food = data.food.find(x => x.id === item.id);
    if (food) {
      food.unit = item.unit;
      food.quantity = item.quantity;
      food.expiresAt = item.expiresAt;
      foodName = food.name;
    } else {
      wasUpdated = false
    }
  })

  if (!wasUpdated) {

    return `no food found with id ${item.id}`
  }

  await db.write();
  return `Set food with id: ${item.id} to ${toHumanReadeableText({ name: foodName, ...item })}`
}

export async function removeFood(item: FoodWithId) {
  const db = await JSONFilePreset("db.json", defaultData);

  db.update(data => {
    var index = data.food.findIndex(x => x.id === item.id);
    if (index >= 0) {
      data.food.splice(index, 1);
    }
  })

  await db.write();

  return `Removed food with id ${item.id}`;
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

