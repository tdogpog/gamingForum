const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Example Game data
  const games = [
    {
      title: "Super Action Game",
      slug: "super-action-game",
      releaseDate: new Date("2023-01-15T00:00:00.000Z"),
      coverImage: "https://example.com/super-action.jpg",
      developer: "Action Dev Studios",
      avgRating: 4.2,
      approved: true,
      genreIDs: [422, 435],
    },
    {
      title: "Epic RPG Quest",
      slug: "epic-rpg-quest",
      releaseDate: new Date("2023-03-10T00:00:00.000Z"),
      coverImage: "https://example.com/epic-rpg.jpg",
      developer: "Fantasy Studios",
      avgRating: 4.8,
      approved: true,
      genreIDs: [425],
    },
  ];

  for (const game of games) {
    const createdGame = await prisma.game.create({
      data: {
        title: game.title,
        slug: game.slug,
        releaseDate: game.releaseDate,
        coverImage: game.coverImage,
        developer: game.developer,
        avgRating: game.avgRating,
        approved: game.approved,
        genres: {
          create: game.genreIDs.map((genreID) => ({
            genre: {
              connect: { id: genreID },
            },
          })),
        },
      },
    });
    console.log(`Created game: ${createdGame.title}`);
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
