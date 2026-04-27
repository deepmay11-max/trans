const Party = require("../models/Party");

const User = require("../../models/User");
const notificationService = require("../services/notification.service");

async function listParties(req, res, next) {
  try {
    const { partyType } = req.query;
    const filter = { owner: req.user.id };
    if (partyType) filter.partyType = partyType;
    
    const parties = await Party.find(filter).sort({ name: 1 });
    return res.json({ success: true, parties });
  } catch (e) {
    return next(e);
  }
}

async function createParty(req, res, next) {
  try {
    const data = { ...req.body, owner: req.user.id };
    const party = await Party.create(data);

    // Notify the Owner
    const owner = await User.findById(req.user.id);
    if (owner) {
      await notificationService.sendToUser(owner, {
        title: "New Party Created",
        body: `Party "${party.name}" has been added to your list.`,
        data: { type: "new_party", partyId: party._id.toString() }
      });
    }

    return res.json({ success: true, party });
  } catch (e) {
    return next(e);
  }
}

async function updateParty(req, res, next) {
  try {
    const party = await Party.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!party) return res.status(404).json({ success: false, message: "Party not found" });
    return res.json({ success: true, party });
  } catch (e) {
    return next(e);
  }
}

async function deleteParty(req, res, next) {
  try {
    const party = await Party.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!party) return res.status(404).json({ success: false, message: "Party not found" });
    return res.json({ success: true, message: "Party deleted" });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  listParties,
  createParty,
  updateParty,
  deleteParty,
};
