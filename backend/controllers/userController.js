const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function getUserProfile(req, res) {
  try {
    const username = req.params.username;
    const userData = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture: true,
        bio: true,
        createdAt: true,
        role: true,
        //who user is following
        following: {
          select: {
            id: true,
            //instances where the user followed someone
            followed: {
              select: {
                id: true,
                username: true,
                profile_picture: true,
              },
            },
            createdAt: true,
          },
        },
        //users followers
        followers: {
          select: {
            id: true,
            //instances of followers on the user
            follower: {
              select: {
                id: true,
                username: true,
                profile_picture: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ error: "An error occurred while fetching profile" });
  }
}

async function createUser(req, res) {
  try {
    const { username, email, password, passwordconfirm, profile_picture } =
      req.body;

    if (!username || !email || !password || !passwordconfirm) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (password !== passwordconfirm) {
      return res.status(400).json({ error: "Passwords must match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile_picture,
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error("Error creating account:", error.message);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the account" });
  }
}

async function updateUserSettings(req, res) {
  try {
    const userID = req.user.id;

    const updateProfile = await prisma.user.update({
      where: { id: userID },
      data: req.body,
    });
    res.status(200).json({ message: "Profile updated", updateProfile });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: "An error occurred while updating profile" });
  }
}
async function deleteUserAccount(req, res) {
  try {
    const userID = req.user.id;

    await deleteUser({ where: { id: userID } }); //deletion cascades to all user records

    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ error: "An error occurred while deleting account" });
  }
}

module.exports = {
  getUserProfile,
  createUser,
  updateUserSettings,
  deleteUserAccount,
};
