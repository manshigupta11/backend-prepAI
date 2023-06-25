const express  = require("express");
const { HistoryModel } = require("../model/history.model");
const { UserModel } = require("../model/user.model");

const historyRoute = express.Router();


historyRoute.get("/",async(req,res)=>{
    console.log(req.body)
  try {
    const user = await UserModel.find({_id:req.body.userID});
    if(!user){
        return res.status(400).send({ msg: "User not found" });
    }
    const history = await HistoryModel.find({ userID:req.body.userID});
    res.status(200).send({"msg":"All history" , history})
  } catch (error) {
    console.log(error.message)
    return res.status(400).send({ msg: error.message });
  }
})

historyRoute.get("/feedback/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the history document by ID
    const history = await HistoryModel.findById({_id:id});

    if (!history) {
      return res.status(404).json({ error: "History not found" });
    }

    // Get the last conversation history entry
    const feedbackEntry = history.conversationHistory[history.conversationHistory.length - 1];
   console.log(feedbackEntry.content)
   const score = getFirstNumber(feedbackEntry.content)
    // Extract feedback and score from the content
   let text = feedbackEntry.content
    res.json({ text,score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

function getFirstNumber(sentence) {
  const regex = /\d+/; // Regular expression to match one or more digits
  const match = sentence.match(regex);
  
  if (match) {
    return parseInt(match[0], 10); // Parse the matched number as an integer
  } else {
    return null; // Return null if no number is found
  }
}

historyRoute.get("/:id",async(req,res)=>{
try {
  const {id}=req.params;
  const user = await UserModel.find({_id:req.body.userID});
  if(!user){
      return res.status(400).send({ msg: "User not found" });
  }
    const singleInterview = await HistoryModel.find({_id:id});
    if(!singleInterview){
        return res.status(400).send({ msg: "Interview not found" });
    }
    res.status(200).send({"msg":"Interview Details" , singleInterview})
} catch (error) {
  console.log(error.message)
  return res.status(400).send({ msg: error.message });
}
})


// update by id

historyRoute.patch("/update/:id",async(req,res)=>{
  try {
    const {id} = req.params
    const payload = req.body
    const user = await UserModel.find({_id:req.body.userID});
  if(!user){
      return res.status(400).send({ msg: "User not found" });
  }
    const updatedinterview = await HistoryModel.findOneAndUpdate({_id:id},payload, { new: true })
    res.status(200).send({"msg":"Interview Updated" , updatedinterview})
  } catch (error) {
    return res.status(400).send({ msg: error.message });

  }
})

const { ObjectId } = require('mongoose').Types;

historyRoute.get('/average/allscore', async (req, res) => {
  
  try {
    const user = await UserModel.findOne({ _id: req.body.userID });
    if (!user) {
      return res.status(400).send({ msg: 'User not found' });
    }

    const averageScore = await HistoryModel.aggregate([
      {
        $match: {
          userID: new ObjectId(req.body.userID)
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    if (averageScore.length === 0) {
      // No history or averageScore not found
      return res.status(404).send({ msg: 'No history found' });
    }

    res.status(200).send({ msg: 'Average score', averageScore: averageScore[0].averageScore });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({ msg: error.message });
  }
});


// historyRoute.get('/average/field', async (req, res) => {
//   console.log(req.body);
//   try {
//     const user = await UserModel.findOne({ _id: req.body.userID });
//     if (!user) {
//       return res.status(400).send({ msg: 'User not found' });
//     }

//     const averageScores = await HistoryModel.aggregate([
//       {
//         $match: {
//           userID: new ObjectId(req.body.userID)
//         }
//       },
//       {
//         $group: {
//           _id: '$field',
//           averageScore: { $avg: '$score' }
//         }
//       }
//     ]);

//     if (averageScores.length === 0) {
//       // No history or averageScores not found
//       return res.status(404).send({ msg: 'No history found' });
//     }

//     res.status(200).send({ msg: 'Average scores', averageScores });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(400).send({ msg: error.message });
//   }
// });


historyRoute.get('/average/field', async (req, res) => {
  console.log(req.body);
  try {
    const user = await UserModel.findOne({ _id: req.body.userID });
    if (!user) {
      return res.status(400).send({ msg: 'User not found' });
    }

    const averageScores = await HistoryModel.aggregate([
      {
        $match: {
          userID: new ObjectId(req.body.userID)
        }
      },
      {
        $group: {
          _id: '$field',
          averageScore: { $avg: '$score' }
        }
      },
      {
        $project: {
          _id: 0,
          field: '$_id',
          averageScore: 1
        }
      }
    ]);

    if (averageScores.length === 0) {
      // No history or averageScores not found
      return res.status(404).send({ msg: 'No history found' });
    }

    const formattedScores = averageScores.reduce((result, { field, averageScore }) => {
      result[field] = averageScore;
      return result;
    }, {});

    res.status(200).send({ msg: 'Average scores By Field', ...formattedScores });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({ msg: error.message });
  }
});

historyRoute.delete("/delete/:id",async(req,res)=>{
  try {
    const {id} = req.params
    const user = await UserModel.find({_id:req.body.userID});
  if(!user){
      return res.status(400).send({ msg: "User not found" });
  }
    const deletedinterview = await HistoryModel.findOneAndDelete({_id:id})
    res.status(200).send({"msg":"Interview Deleted"})
  } catch (error) {
    return res.status(400).send({ msg: error.message });

  }
})

module.exports={historyRoute}