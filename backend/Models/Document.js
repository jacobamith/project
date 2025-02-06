const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    _id: String,
    data: Object,
    name: {
      type: String,
      default: "Untitled",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "user",
      
    },
    allowedUser: {
      type: [{ String }],      
     }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
