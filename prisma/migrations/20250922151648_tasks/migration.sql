-- CreateTable
CREATE TABLE "public"."Task" (
    "id" SERIAL NOT NULL,
    "calendar_id" INTEGER NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "public"."Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
