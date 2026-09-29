import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // A aplicação usa a URL com pool no runtime. A CLI prefere a ligação
    // direta para migrações, quando ela estiver configurada.
    url: process.env["DIRECT_URL"] ?? env("DATABASE_URL"),
  },
});
