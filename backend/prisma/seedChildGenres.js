const { PrismaClient } = require("@prisma/client");
const generateSlug = require("../util/generateSlug");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const actionSubgenres = [
    "Hack & Slash",
    "Beat 'em up",
    "Combat",
    "Spectacle fighter",
  ];

  // Find the parent genre
  const actionGenre = await prisma.genre.findUnique({
    where: { genreName: "Action" },
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
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
