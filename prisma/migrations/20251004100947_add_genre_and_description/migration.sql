-- AlterTable
ALTER TABLE "posts" ADD COLUMN "genre" TEXT NOT NULL DEFAULT 'Unspecified',
ADD COLUMN "description" TEXT NOT NULL DEFAULT 'No description provided.';

