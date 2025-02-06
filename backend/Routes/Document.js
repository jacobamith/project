const express = require("express");
const authorization = require("../middleware/aut");
const documentModel = require("../Models/Document");
const route = express.Router();

route.post("/:id", authorization, async (req, res) => {
  const userId = req.user.id;
  const documentId = req.params.id;
  const data = req.body.tesxt;
  console.log(data);
  
  const model = await documentModel.find({ name: data });
  
 
  
  
  await documentModel.findByIdAndUpdate(documentId, { name: data });

  const m = await documentModel.findById(documentId);

  });

route.get("/:id", authorization, async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await documentModel.findById(documentId);
    const docname = document.name;
   

    res.status(200).json(docname);
  } catch (e) {
    console.log(e);
  }
});

module.exports = route;
