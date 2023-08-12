import { mongo } from "grove";

export interface IModel extends mongo.Document {
  _id: mongo.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
