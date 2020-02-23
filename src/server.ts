
import app from "./app";
import { PORT } from "./constants/media-server.constants";


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));