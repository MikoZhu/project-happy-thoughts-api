import express from "express";
import { HappyThoughts } from "../model/happyThoughts";
import listEndpoints from "express-list-endpoints";

const router = express.Router();

//All endpoints
router.get("/", (req, res) => {
  res.status(200).send({
    sucess: true,
    message: "Ok✅",
    body: {
      content: "Miko's Happy Thoughts API",
      endpoints: listEndpoints(router),
    },
  });
});

//Get thoughts
router.get("/thoughts", async (req, res) => {
  try {
    let sortOption = {};
    if (req.query.sort === "hearts") {
      sortOption.hearts = -1; //sort by hearts in decending order(highest first)
    }
    // Pagination options
    const page = parseInt(req.query.page) || 1;
    // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 20;
    // Default to 20 thoughts per page if not provided

    const skip = (page - 1) * limit;
    const thoughts = await HappyThoughts.find()
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    // .sort({ createdAt: "desc" })
    // .limit(20)
    // .exec();
    res.status(201).json({ sucess: true, body: thoughts });
  } catch (error) {
    console.error("Error fetching thoughts:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
// Post thoughts
router.post("/thoughts", async (req, res) => {
  // Retrieve the information sent by the client to our API endpoint
  const { message, username } = req.body;

  // Check if the message is provided in the request body
  if (!message) {
    return res
      .status(400)
      .json({ success: false, error: "Message is required." });
  }

  // Use our mongoose model to create the database entry
  const thought = new HappyThoughts({ message, username });
  try {
    // Respond with the saved thought object, including its _id
    const savedThought = await thought.save();
    res.status(201).json(savedThought);
  } catch (error) {
    // Handle validation errors or other database-related errors
    res.status(400).json({ success: false, message: error });
  }
});

// Post like
router.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params;
  try {
    const thought = await HappyThoughts.findById(thoughtId);
    // Check if the thought was found
    if (!thought) {
      return res
        .status(404)
        .json({ success: false, error: "Thought not found." });
    }
    // Update the hearts property
    thought.hearts += 1;
    // Save the updated thought to the database
    const updatedThought = await thought.save();
    res.status(201).json(updatedThought);
  } catch (error) {
    res.status(400).json({ sucess: false, message: error });
  }
});

export default router;
