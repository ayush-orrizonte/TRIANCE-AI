import { Schema, model, Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { MongoCollections, Status } from "../enums";
import { MongoDBUtils } from "gm-commons";
import { IAdmin } from "../types/custom";

export type IUserDocument = IAdmin;

const mongoDBUtils = MongoDBUtils.getInstance();

const userSchema = new Schema<IAdmin>(
  {
    userId: { type: String, required: true, unique: true, default: uuidv4 },
    userName: { type: String, required: true },
    displayName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    mobileNumber: { type: Number },
    emailId: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: "Invalid email format",
      },
    },
    gender: { type: Number },
    dob: { type: String },
    roleId: { type: String },
    password: { type: String },
    invalidAttempts: { type: Number },
    status: {
      type: Number,
      required: true,
      enum: Object.values(Status.UserStatus).filter(val => typeof val === "number"),
    },
    lastLoggedIn: { type: String },
    dateCreated: { type: String },
    dateUpdated: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
    profilePicUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const userModel: Model<IAdmin> = mongoDBUtils.createModel<IAdmin>(
  MongoCollections.USERS,
  userSchema
);

export { userModel };
