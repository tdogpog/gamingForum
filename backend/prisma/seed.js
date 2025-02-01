const { PrismaClient } = require('@prisma/client');
require('dotenv').config();


const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'securepassword',
    },
  });

  const game = await prisma.game.create({
    data: {
      title: 'Game Title',
      releaseDate: new Date(),
      coverImage: 'url_to_image',
      developer: 'Game Dev Studio',
      avgRating: 4.5,
      reviewCount: 0,
      ratingCount: 0,
      approved: true,
    },
  });

  await prisma.rating.create({
    data: {
      score: 5,
      userID: user.id,
      gameID: game.id,
    },
  });

  console.log('Database seeded');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
