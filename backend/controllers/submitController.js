const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const generateSlug = require("../util/generateSlug");

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
async function newGameSubmitForm(req, res) {
  try {
    const { title, releaseDate, developer } = req.body;

    if (!title || !releaseDate || !developer || !req.file) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //unique filename using timestamp and original name
    coverImagePath = `coverImage/${Date.now()}-${req.file.originalname}`;

    //rename and move the uploaded file to the desired location
    fs.renameSync(req.file.path, path.join("uploads", coverImagePath));

    const gameSubmission = await prisma.game.create({
      data: {
        title,
        releaseDate,
        coverImage: coverImagePath,
        developer,
        approved: false,
      },
    });

    const slug = generateSlug(title, gameSubmission.id);

    await prisma.game.update({
      where: { id: post.id },
      data: { slug: slug },
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
    const slug = req.params.slug;
    const { title, releaseDate, developer } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "Game ID is required." });
    }

    const currentGame = await prisma.game.findUnique({
      where: { slug: slug },
      select: { coverImage: true },
    });

    if (!currentGame) {
      return res
        .status(404)
        .json({ error: "Game not found for edit request." });
    }

    let coverImagePath = currentGame.coverImage; //default to current cover image if not changing

    if (req.file) {
      //unique filename using timestamp and original name
      coverImagePath = `coverImage/${Date.now()}-${req.file.originalname}`;

      //rename and move the uploaded file to the desired location
      fs.renameSync(req.file.path, path.join("uploads", coverImagePath));
    }

    //on the front end check the existing data vs the input data
    // ONLY send the differences, so not send field will default to null
    //so when we merge, if its a null field, game model keeps its data bc that was unchanged on front
    //if not null, game model takes in data
    //this way we can save on payload to the backend and merge efficiently across
    //null and not null fields
    const editTicket = await prisma.gameEdit.create({
      data: {
        gameID: currentGame.id,
        title: title || null,
        releaseDate: releaseDate || null,
        coverImage: coverImagePath || null,
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
    const slug = req.params.slug;

    const game = await prisma.game.update({
      where: { slug: slug },
      data: req.body,
    });

    res.status(200).json({
      message: "Game approved successfully",
      game,
    });
  } catch (error) {
    console.error("Error approving game:", error.message);
    res.status(500).json({
      error: "An error occurred while approving game for display",
    });
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

    //if there was an edit to the title,
    //we need to generate a newSlug from the new title
    //and the existing primary ID of the game we're editing
    //this handles that
    let newSlug = null;
    if (gameEdit.title) {
      newSlug = generateSlug(gameEdit.title, game.id);
    }

    //fill out object with ticket updates
    // ?? is if left is null return right
    //this matches our edit ticketing process for nulling unchanged fields
    const updatedGame = {
      title: gameEdit.title ?? game.title,
      slug: newSlug ?? game.slug,
      releaseDate: gameEdit.releaseDate ?? game.releaseDate,
      coverImage: gameEdit.coverImage ?? game.coverImage,
      developer: gameEdit.developer ?? game.developer,
      approved: true,
    };

    //if cover image has changed, delete the old one
    if (gameEdit.coverImage) {
      const oldFilePath = path.join("uploads", game.coverImage);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // delete old image from filesystem
      }
      updatedGame.coverImage = gameEdit.coverImage; // update with the new cover image
    }

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
  newGameSubmitForm,
  editGameInfo,
  approveGame,
  approveGameEdit,
  deleteTicket,
};
