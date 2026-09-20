-- CreateIndex
CREATE INDEX "evento_status_idx" ON "evento"("status");

-- CreateIndex
CREATE INDEX "evento_tipo_cuidado_idx" ON "evento"("tipo_cuidado");

-- CreateIndex
CREATE INDEX "evento_pet_id_data_hora_idx" ON "evento"("pet_id", "data_hora");

-- CreateIndex
CREATE INDEX "evento_tipo_cuidado_data_hora_idx" ON "evento"("tipo_cuidado", "data_hora");
