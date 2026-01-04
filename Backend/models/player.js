import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    wins: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
