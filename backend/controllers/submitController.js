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
    const { title, releaseDate, coverImage, developer } = req.body;

    if (!title || !releaseDate || !developer || !coverImage) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const post = await prisma.game.create({
      data: {
        title,
        releaseDate,
        coverImage,
        developer,
        approved: false,
      },
    });
    res
      .status(201)
      .json({ message: "Game submitted for admin approval", post });
  } catch (error) {
    console.error("Error submitting game:", error.message);
    res.status(500).json({
      error: "An error occurred while creating game submission request",
    });
  }
}

//editing game info
async function editGameInfo(req, res) {
  try {
    const userID = req.user.id; //userID fed in by the isUser middleware
    const gameID = req.params.gameID;
    const { title, releaseDate, coverImage, developer } = req.body;

    if (!gameID) {
      return res.status(400).json({ error: "Game ID is required." });
    }

    const editTicket = await prisma.gameEdit.create({
      data: {
        gameID: gameID,
        title: title || null,
        releaseDate: releaseDate || null,
        coverImage: coverImage || null,
        developer: developer || null,
        submittedBy: userID,
      },
    });
    res.status(201).json({
      message: "Edit request submitted for admin approval.",
      editTicket,
    });
  } catch (error) {
    console.error("Error creating edit ticket:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while submitting the edit request." });
  }
}

async function approveGame(req, res) {
  try {
    const gameID = req.params.gameID;

    const game = await prisma.game.update({ where: gameID, data: req.body });
  } catch (error) {
    console.error("Error approving game:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while approving game for display" });
  }
}

async function approveGameEdit(req, res) {
  try {
    const editID = req.params.editID;

    //grab edit ticket
    const gameEdit = await prisma.gameEdit.findUnique({
      where: { id: editID },
    });

    if (!gameEdit) {
      return res.status(404).json({ error: "Edit request not found" });
    }

    //find game that corresponds with ticket
    const game = await prisma.game.findUnique({
      where: { id: gameEdit.gameID },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    //fill out object with ticket updates
    const updatedGame = {
      title: gameEdit.title || game.title,
      releaseDate: gameEdit.releaseDate || game.releaseDate,
      coverImage: gameEdit.coverImage || game.coverImage,
      developer: gameEdit.developer || game.developer,
      approved: true,
    };

    //update existing game with suggested updates
    const result = await prisma.game.update({
      where: { id: game.id },
      data: updatedGame,
    });

    //delete the ticket from db
    await prisma.gameEdit.delete({
      where: { id: gameEdit.id },
    });

    res.status(200).json({
      message: "Game edit approved and applied successfully",
      updatedGame: result,
    });
  } catch (error) {
    console.error("Error editing game info:", error);
    res
      .status(500)
      .json({ error: "An error occurred while approving the game edit" });
  }
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
