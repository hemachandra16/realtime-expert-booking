const Expert = require('../models/Expert');
const Slot = require('../models/Slot');

// GET /api/experts - List experts with pagination, search, category filter
exports.getExperts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [experts, total] = await Promise.all([
      Expert.find(filter).skip(skip).limit(limit).sort({ rating: -1 }),
      Expert.countDocuments(filter)
    ]);

    res.json({
      experts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/experts/:id - Expert detail with slots grouped by date
exports.getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    const allSlots = await Slot.find({ expertId: req.params.id }).sort({ date: 1, time: 1 });

    // Group slots by date
    const slots = {};
    const bookedSlots = [];

    allSlots.forEach(slot => {
      if (!slots[slot.date]) {
        slots[slot.date] = [];
      }
      slots[slot.date].push(slot.time);
      if (slot.isBooked) {
        bookedSlots.push(slot._id.toString());
      }
    });

    // Also provide full slot data for the frontend to map time -> slotId
    const slotDetails = {};
    allSlots.forEach(slot => {
      if (!slotDetails[slot.date]) {
        slotDetails[slot.date] = [];
      }
      slotDetails[slot.date].push({
        _id: slot._id,
        time: slot.time,
        isBooked: slot.isBooked
      });
    });

    res.json({ expert, slots, bookedSlots, slotDetails });
  } catch (err) {
    next(err);
  }
};

// GET /api/experts/:id/similar - Similar experts in same category
exports.getSimilarExperts = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    const similar = await Expert.find({
      category: expert.category,
      _id: { $ne: expert._id }
    }).limit(3);

    res.json(similar);
  } catch (err) {
    next(err);
  }
};
