import express from "express"
import { baseMiddlewaresLoader } from "@loaders/base_middlewares/base_middlewares.loader";

const PORT = 3000;
const app = express()

baseMiddlewaresLoader(app);

app.listen(PORT, () => {
    console.log('App escuchando puerto 3000')
})