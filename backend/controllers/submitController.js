const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//fetch the unapproved games and all tickets on GameEdit
async function getQueue(req, res) {
  try {
    const gameEdits = await prisma.gameEdit.findMany({
      include: {
        game: true, //keep the existing approved content so admins can compare
        user: true, //include information about the user for logging
      },
    });

    const newGames = await prisma.game.findMany({
      where: {
        approved: false, // Only fetch games that are not approved
      },
    });

    const gameEditTickets = gameEdits.map((edit) => ({
      ...edit,
      type: "edit",
    }));

    const newGameTickets = newGames.map((game) => ({ ...game, type: "game" }));

    // spread the push or its going to treat this entire array as a single element
    // [1,2,3,[4,5,6]] for example
    // spread makes it
    // [1,2,3,4,5,6]
    gameEditTickets.push(...newGameTickets);

    //final combined array
    const tickets = gameEditTickets;

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "No unapproved tickets found" });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching queue:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

//posting a new game with false flag to db
async function postSubmitForm(req, res) {
  try {
  } catch (error) {}
}

//editing game info
async function editGameInfo(req, res) {
  try {
  } catch (error) {}
}

async function approveGame(req, res) {
  try {
  } catch (error) {}
}

async function approveGameEdit(req, res) {
  try {
  } catch (error) {}
}

async function deleteTicket(req, res) {
  try {
    const ticketID = req.params.ticketID;

    const { type } = req.body;

    if (!type || !ticketID) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (type === "edit") {
      // Delete from the GameEdit model
      const deletedEdit = await prisma.gameEdit.delete({
        where: { id: ticketID },
      });
      return res
        .status(200)
        .json({ message: "Game edit deleted", deletedEdit });
    } else if (type === "game") {
      const deletedGame = await prisma.game.delete({ where: { id: ticketID } });
      return res.status(200).json({ message: "Game deleted", deletedGame });
    } else {
      return res.status(400).json({ error: "Data error on ticket deletion" });
    }
  } catch (error) {
    console.error("Error deleting ticket:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getQueue,
  postSubmitForm,
  editGameInfo,
  approveGame,
  approveGameEdit,
  deleteTicket,
};

//gets
submitRouter.get("/queue", isAdmin, getQueue); //fetches all waiting edits and and new game submissions

//posts
submitRouter.post("/", isUser, postSubmitForm); //posting a new game ticket to the DB with false flag
submitRouter.post("/game/:gameID", isUser, editGameInfo);

//puts
submitRouter.post("/queue/:gameID", isAdmin, approveGame); //approves a game submission
submitRouter.post("/queue/:editID", isAdmin, approveGameEdit); //approves a game edit

//deletes
submitRouter.get("/queue/:ticketID", isAdmin, deleteTicket);
