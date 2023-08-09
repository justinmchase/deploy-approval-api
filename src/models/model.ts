import { mongo } from "grove/mod.ts";

export interface IModel extends mongo.Document {
  _id: mongo.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
