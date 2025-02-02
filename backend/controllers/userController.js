const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const fs = require("fs");

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
            //instances where the user followed someone
            followed: {
              select: {
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
            //instances of followers on the user
            follower: {
              select: {
                username: true,
                profile_picture: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    //GOOD METHOD FOR FLATTENING A NESTED QUERY:
    //MAP TO CREATE A NEW ARRAY WHERE YOU EXTRACT EACH ENTRY
    //INSIDE OF FOLLOWING
    //   "following": [
    //   { "followed": { "username": "john_smith", "profile_picture": "/path/to/john.jpg" } },
    //   { "followed": { "username": "jane_doe", "profile_picture": "/path/to/jane.jpg" } }
    // ],

    // [
    //   { "username": "john_smith", "profile_picture": "/path/to/john.jpg" },
    //   { "username": "jane_doe", "profile_picture": "/path/to/jane.jpg" }
    // ]

    const flattenedFollowing = userData.following.map(
      (follow) => follow.followed
    );
    const flattenedFollowers = userData.followers.map(
      (follow) => follow.follower
    );

    //THEN ALIAS THE FLATTENED ARRAYS TO OVERWRITE THE NESTED DATA VIA THE SPREAD
    const userDataFlat = {
      ...userData,
      following: flattenedFollowing,
      followers: flattenedFollowers,
    };

    res.status(200).json(userDataFlat);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ error: "An error occurred while fetching profile" });
  }
}

async function createUser(req, res) {
  try {
    const { username, email, password, passwordconfirm } = req.body;

    if (!username || !email || !password || !passwordconfirm) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (password !== passwordconfirm) {
      return res.status(400).json({ error: "Passwords must match" });
    }

    //allow a reassign if the file exists
    let profilePicturePath = null;
    if (req.file) {
      //unique filename using timestamp and original name
      profilePicturePath = `profile_pictures/${Date.now()}-${
        req.file.originalname
      }`;

      //rename and move the uploaded file to the desired location
      fs.renameSync(req.file.path, path.join("uploads", profilePicturePath));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile_picture: profilePicturePath,
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
  //allow a reassign if the file exists
  let profilePicturePath = null;

  try {
    const userID = req.user.id;

    const currentUserProfilePic = await prisma.user.findUnique({
      where: { id: userID },
      select: { profile_picture: true },
    });

    //process to delete the old user profile picture if it exists and if they uploaded a file
    // if they have a pic and they send a req with a file, it has to be a profile picture

    if (currentUserProfilePic.profile_picture && req.file) {
      const oldFilePath = path.join(
        "uploads",
        currentUserProfilePic.profile_picture
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    if (req.file) {
      //unique filename using timestamp and original name
      profilePicturePath = `profile_pictures/${Date.now()}-${
        req.file.originalname
      }`;

      //rename and move the uploaded file to the desired location
      fs.renameSync(req.file.path, path.join("uploads", profilePicturePath));
    }

    const updateData = {
      ...req.body, //spread the existing body data
      ...(profilePicturePath && { profile_picture: profilePicturePath }), //conditionally add profile_picture
    };

    const updateProfile = await prisma.user.update({
      where: { id: userID },
      data: updateData,
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
async function followUser(req, res) {
  try {
  } catch (error) {}
}
async function unfollowUser(req, res) {
  try {
  } catch (error) {}
}

module.exports = {
  getUserProfile,
  createUser,
  updateUserSettings,
  deleteUserAccount,
  followUser,
  unfollowUser,
};
