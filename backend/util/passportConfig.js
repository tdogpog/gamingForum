const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//local strategy is login ONLY.
//removed serializing which is associated with sessions
const passportConfig = async (passport) => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        //hashing and salting
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          // passwords do not match!
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        //success, return user data
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
};

module.exports = { passportConfig };
