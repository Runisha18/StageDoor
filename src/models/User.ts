//We're importing Mongoose and two things from it:

//Schema → defines the structure of our MongoDB documents.
//Document → gives our TypeScript interface Mongoose document functionality.

import mongoose, { Schema, Document } from "mongoose";


//name → must be a string
//email → must be a string
//role → must be "user" or "admin"
export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  role: "user" | "admin";
}


const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String, //The value should be text.
      required: true, //The field must be provided.
      unique: true,//MongoDB should not allow duplicate values for this field.
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },//trim removes unnecessary whitespace around the value.

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"], //restricts the allowed role values.
      default: "user",
    },
  },
  {
    timestamps: true, // autometically ceates createdAt updatedAt

  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

  /**You might wonder:

Why not simply use mongoose.model()?

Next.js development mode can reload modules multiple times.

If we repeatedly try to create the same Mongoose model, we can get:OverwriteModelError

mongoose.models.User checks whether the model already exists.

If it exists:

use existing model
otherwise create the model

*/