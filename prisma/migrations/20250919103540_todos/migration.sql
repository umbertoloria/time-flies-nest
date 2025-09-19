-- CreateTable
CREATE TABLE "public"."Todo" (
    "id" SERIAL NOT NULL,
    "calendar_id" INTEGER NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "done_date" VARCHAR(10),
    "notes" TEXT,
    "missed" BOOLEAN,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Todo" ADD CONSTRAINT "Todo_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "public"."Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
