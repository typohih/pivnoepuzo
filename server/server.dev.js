import app, { ensureStorage, port } from "./app.js";

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`[dev] Catalog server listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("[dev] Failed to start catalog server", error);
    process.exit(1);
  });
