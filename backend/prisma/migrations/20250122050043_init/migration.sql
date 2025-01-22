-- CreateTable
CREATE TABLE "GameEdit" (
    "id" SERIAL NOT NULL,
    "gameID" INTEGER NOT NULL,
    "title" TEXT,
    "releaseDate" TIMESTAMP(3),
    "coverImage" TEXT,
    "developer" TEXT,
    "submittedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEdit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameEdit" ADD CONSTRAINT "GameEdit_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEdit" ADD CONSTRAINT "GameEdit_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
