const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs"); // Import bcrypt
const generateSlug = require("../util/generateSlug");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const actionSubgenres = ["2D Fighting", "3D Fighting", "Martial Arts"];

  // Find the parent genre
  const actionGenre = await prisma.genre.findUnique({
    where: { genreName: "Fighting" },
  });

  for (const subgenre of actionSubgenres) {
    const subgenreEntry = await prisma.genre.create({
      data: {
        genreName: subgenre,
        parentGenre: actionGenre.id,
      },
    });

    const slugGen = generateSlug(subgenre, subgenreEntry.id);

    await prisma.genre.update({
      where: { id: subgenreEntry.id },
      data: { slug: slugGen },
    });

    console.log(`Added subgenre '${subgenre}' with slug '${slugGen}'`);
  }

  console.log("Action subgenres added successfully.");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

//THESE ARE THE ONLY GENRE

//Action
//Platformer & Runner
//Shooter
//RPG
//Simulation
//Sandbox
//Strategy
//Adventure
//Themes
//Game Type
//Rhythm
//Card, Board, & Traditional Games
//Puzzle
//Sports
//Roguelike
//Racing
//Fighting
//Arcade
//Descriptors
//CHANGES STAGED
