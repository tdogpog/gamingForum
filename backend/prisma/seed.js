const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs"); // Import bcrypt
const generateSlug = require("../util/generateSlug");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("securepassword", 10); // Hash the password
  const user = await prisma.user.create({
    data: {
      username: "john_doe",
      email: "john@example.com",
      password: hashedPassword,
    },
  });

  const game = await prisma.game.create({
    data: {
      title: "Game Title",
      releaseDate: new Date(),
      coverImage: "url_to_image",
      developer: "Game Dev Studio",
      avgRating: 4.5,
      reviewCount: 0,
      ratingCount: 0,
      approved: true,
    },
  });

  slug = generateSlug(game.title, game.id);

  prisma.game.update({ where: { id: game.id }, data: { slug: slug } });

  console.log("Database seeded");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
