const recordModel = require('../models/recordModel');
//
exports.createRecord=async (req,res)=>{
    try {
        const {userId,type,symptoms,diagnosis,prescription,date,location}=req.body;
        const record=new recordModel({
            userId,
            type,
            symptoms,
            diagnosis,
            prescription,
            date,
            location,
        });
        await record.save();
        return res.status(200).json({message:'record created successfully'});
    } catch (error) {
        return res.status(500).json({message:'internal server error in create record'});
    }
}
//
exports.getRecords=async (req,res)=>{
    try {
        const {_id}=req.user;
        const records=await recordModel.find({userId:_id});
        return res.status(200).json({records});
    } catch (error) {
        return res.status(500).json({message:'internal server error in get records'});
    }
}

exports.getCommunityTrends = async (req, res) => {
  try {
    const data = await Record.aggregate([
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLocationTrends = async (req, res) => {
  try {
    const data = await Record.aggregate([
      {
        $group: {
          _id: "$location",
          cases: { $sum: 1 },
          diseases: { $addToSet: "$diagnosis" },
        },
      },
      { $sort: { cases: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHealthComparison = async (req, res) => {
  try {
    const data = await Record.aggregate([
      {
        $group: {
          _id: "$type", // "human" or "animal"
          totalCases: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWeeklyTrends = async (req, res) => {
  try {
    const data = await Record.aggregate([
      {
        $group: {
          _id: { $week: "$date" },
          totalReports: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

