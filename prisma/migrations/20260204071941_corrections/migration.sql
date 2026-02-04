/*
  Warnings:

  - A unique constraint covering the columns `[project_id]` on the table `Contracts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contract_id,order_index]` on the table `Milestones` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[project_id,freelancer_id]` on the table `Proposals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contract_id,reviewer_id]` on the table `Reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Milestones" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reviews" ALTER COLUMN "comment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "hourly_rate" DROP NOT NULL,
ALTER COLUMN "profile_image" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contracts_project_id_key" ON "Contracts"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "Milestones_contract_id_order_index_key" ON "Milestones"("contract_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "Proposals_project_id_freelancer_id_key" ON "Proposals"("project_id", "freelancer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_contract_id_reviewer_id_key" ON "Reviews"("contract_id", "reviewer_id");
