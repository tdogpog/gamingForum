const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = { passportConfig };
