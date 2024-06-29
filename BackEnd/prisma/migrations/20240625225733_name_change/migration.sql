/*
  Warnings:

  - You are about to drop the column `FirstName` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "FirstName",
DROP COLUMN "LastName";
