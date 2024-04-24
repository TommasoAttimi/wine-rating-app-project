//index.js
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import {
  addOrUpdateWine,
  getAllWines,
  deleteWineById,
  updateWineById,
  getWineById,
  addPicture,
  updatePicturesByWineId,
  addVariety,
  getVarieties,
  getCountries,
  addCountry,
  addAppellation,
  getAllAppellations,
  addVintage,
  getAllVintages,
  addRegion,
  getAllRegions,
  addProducer,
  getAllProducers,
} from "./db.js";

const app = express();
const port = 3000;
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
};

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors(corsOptions));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    name: "your-custom-cookie-name",
  })
);

const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const imagesDir = "images";
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/upload-front-label/:sessionId",
  upload.single("picture"),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { filename } = req.file;
      const sourcePath = `uploads/${filename}`;
      const destinationPath = `images/front-label-${filename}`;
      fs.renameSync(sourcePath, destinationPath);
      const imageUrl = `/images/front-label-${filename}`;
      const pictureData = {
        filename: req.file.filename,
        contentType: req.file.mimetype,
        size: req.file.size,
        frontImageUrl: imageUrl,
        sessionId: sessionId,
      };
      const pictureId = await addPicture(pictureData);
      res
        .status(201)
        .json({ pictureId, message: "Front label uploaded successfully" });
    } catch (error) {
      console.error("Error uploading front label:", error);
      res.status(500).json({ message: "Failed to upload front label" });
    }
  }
);

app.post(
  "/upload-back-label/:sessionId",
  upload.single("picture"),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { filename } = req.file;
      const sourcePath = `uploads/${filename}`;
      const destinationPath = `images/back-label-${filename}`;
      fs.renameSync(sourcePath, destinationPath);
      const imageUrl = `/images/back-label-${filename}`;
      const pictureData = {
        filename: req.file.filename,
        contentType: req.file.mimetype,
        size: req.file.size,
        backImageUrl: imageUrl,
        sessionId: sessionId,
      };
      const pictureId = await addPicture(pictureData);
      res
        .status(201)
        .json({ pictureId, message: "Back label uploaded successfully" });
    } catch (error) {
      console.error("Error uploading back label:", error);
      res.status(500).json({ message: "Failed to upload back label" });
    }
  }
);

app.get("/wines", async (req, res) => {
  try {
    const wines = await getAllWines();
    res.json(wines);
  } catch (error) {
    console.error("Error fetching wines:", error);
    res.status(500).send("Failed to fetch wines");
  }
});

app.post("/add-wine", async (req, res) => {
  try {
    const wineId = await addOrUpdateWine(req.body, req.session.id); //added req.session.id
    res
      .status(201)
      .json({ wineId: wineId, message: "Wine added successfully" });
  } catch (error) {
    console.error("Error adding wine:", error);
    res.status(500).json({ message: "Failed to add wine" });
  }
});

app.post("/color-rating/:wineId", async (req, res) => {
  try {
    const wineId = req.params.wineId;
    const colorRatingData = req.body;
    const updatedWineId = await addOrUpdateWine({
      _id: wineId,
      colorRating: colorRatingData,
    });
    console.log("Color rating submitted:", colorRatingData);
    res.status(201).json({
      message: "Color rating submitted successfully",
      insertedId: updatedWineId,
    });
  } catch (error) {
    console.error("Error submitting color rating:", error);
    res.status(500).json({ message: "Failed to submit color rating" });
  }
});

app.post("/nose-rating/:wineId", async (req, res) => {
  try {
    const wineId = req.params.wineId;
    const noseRatingData = req.body;
    const updatedWineId = await addOrUpdateWine({
      _id: wineId,
      noseRating: noseRatingData,
    });
    console.log("Nose rating submitted:", noseRatingData);
    res.status(201).json({
      message: "Nose rating submitted successfully",
      insertedId: updatedWineId,
    });
  } catch (error) {
    console.error("Error submitting nose rating:", error);
    res.status(500).json({ message: "Failed to submit nose rating" });
  }
});

app.post("/palate-rating/:wineId", async (req, res) => {
  try {
    const wineId = req.params.wineId;
    const palateRatingData = req.body;
    const updatedWineId = await addOrUpdateWine({
      _id: wineId,
      palateRating: palateRatingData,
    });
    console.log("Palate rating submitted:", palateRatingData);
    res.status(201).json({
      message: "Palate rating submitted successfully",
      insertedId: updatedWineId,
    });
  } catch (error) {
    console.error("Error submitting palate rating:", error);
    res.status(500).json({ message: "Failed to submit palate rating" });
  }
});

app.post("/overall-rating/:wineId", async (req, res) => {
  try {
    const wineId = req.params.wineId;
    const overallRatingData = req.body;
    const updatedWineId = await addOrUpdateWine({
      _id: wineId,
      overallRating: overallRatingData,
    });
    console.log("Overall rating submitted:", overallRatingData);
    res.status(201).json({
      message: "Overall rating submitted successfully",
      insertedId: updatedWineId,
    });
  } catch (error) {
    console.error("Error submitting overall rating:", error);
    res.status(500).json({ message: "Failed to submit overall rating" });
  }
});

app.delete("/wines/:wineId", async (req, res) => {
  const wineId = req.params.wineId;
  try {
    const deletedCount = await deleteWineById(wineId);
    if (deletedCount === 1) {
      res.status(200).json({ message: "Wine deleted successfully" });
    } else {
      res.status(404).json({ message: "Wine not found" });
    }
  } catch (error) {
    console.error("Error deleting wine:", error);
    res.status(500).json({ message: "Failed to delete wine" });
  }
});

app.put("/wines/:wineId", async (req, res) => {
  const wineId = req.params.wineId;
  const updatedWineData = { ...req.body }; //replaced = req.body with this and the line below to fix some issues
  delete updatedWineData._id;
  try {
    await updateWineById(wineId, updatedWineData, req.session.id); // added req.session.id
    if (updatedWineData.frontLabel || updatedWineData.backLabel) {
      await updatePicturesByWineId(wineId, updatedWineData, req.session.id);
    }
    res.status(200).json({ message: "Wine updated successfully" });
  } catch (error) {
    console.error("Error updating wine:", error);
    res.status(500).json({ message: "Failed to update wine" });
  }
});

app.get("/wines/:wineId", async (req, res) => {
  const wineId = req.params.wineId;
  try {
    const wine = await getWineById(wineId);
    if (!wine) {
      return res.status(404).json({ message: "Wine not found" });
    }
    res.json(wine);
  } catch (error) {
    console.error("Error fetching wine details:", error);
    res.status(500).json({ message: "Failed to fetch wine details" });
  }
});

app.get("/pictures/:wineId", async (req, res) => {
  const wineId = req.params.wineId;
  try {
    const pictures = await getPicturesByWineId(wineId);
    res.json(pictures);
  } catch (error) {
    console.error("Error fetching pictures:", error);
    res.status(500).json({ message: "Failed to fetch pictures" });
  }
});

app.post("/wine-varieties", async (req, res) => {
  try {
    const { variety } = req.body;
    const varietyId = await addVariety({ variety });
    res.status(201).json({ varietyId, message: "Variety added successfully" });
  } catch (error) {
    console.error("Error adding variety:", error);
    res.status(500).json({ message: "Failed to add variety" });
  }
});

app.get("/wine-varieties", async (req, res) => {
  try {
    const varieties = await getVarieties();
    res.json(varieties);
  } catch (error) {
    console.error("Error fetching varieties:", error);
    res.status(500).json({ message: "Failed to fetch varieties" });
  }
});

app.post("/countries", async (req, res) => {
  try {
    const { country } = req.body;
    const countryId = await addCountry({ country });
    res.status(201).json({ countryId, message: "Country added successfully" });
  } catch (error) {
    console.error("Error adding country:", error);
    res.status(500).json({ message: "Failed to add country" });
  }
});

app.get("/countries", async (req, res) => {
  try {
    const countries = await getCountries();
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Failed to fetch countries" });
  }
});

app.post("/appellations", async (req, res) => {
  try {
    const { appellation } = req.body;
    const appellationId = await addAppellation({ appellation });
    res
      .status(201)
      .json({ appellationId, message: "Appellation added successfully" });
  } catch (error) {
    console.error("Error adding appellation:", error);
    res.status(500).json({ message: "Failed to add appellation" });
  }
});

app.get("/appellations", async (req, res) => {
  try {
    const appellations = await getAllAppellations();
    res.json(appellations);
  } catch (error) {
    console.error("Error fetching appellations:", error);
    res.status(500).json({ message: "Failed to fetch appellations" });
  }
});

app.post("/vintages", async (req, res) => {
  try {
    const { vintage } = req.body;
    const vintageId = await addVintage({ vintage });
    res.status(201).json({ vintageId, message: "Vintage added successfully" });
  } catch (error) {
    console.error("Error adding vintage:", error);
    res.status(500).json({ message: "Failed to add vintage" });
  }
});

app.get("/vintages", async (req, res) => {
  try {
    const vintages = await getAllVintages();
    res.json(vintages);
  } catch (error) {
    console.error("Error fetching vintages:", error);
    res.status(500).json({ message: "Failed to fetch vintages" });
  }
});

app.post("/regions", async (req, res) => {
  try {
    const { region } = req.body;
    const regionId = await addRegion({ region });
    res.status(201).json({ regionId, message: "Region added successfully" });
  } catch (error) {
    console.error("Error adding region:", error);
    res.status(500).json({ message: "Failed to add region" });
  }
});

app.get("/regions", async (req, res) => {
  try {
    const regions = await getAllRegions();
    res.json(regions);
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ message: "Failed to fetch regions" });
  }
});

app.post("/producers", async (req, res) => {
  try {
    const { producer } = req.body;
    const producerId = await addProducer({ producer });
    res
      .status(201)
      .json({ producerId, message: "Producer added successfully" });
  } catch (error) {
    console.error("Error adding producer:", error);
    res.status(500).json({ message: "Failed to add producer" });
  }
});

app.get("/producers", async (req, res) => {
  try {
    const producers = await getAllProducers();
    res.json(producers);
  } catch (error) {
    console.error("Error fetching producers:", error);
    res.status(500).json({ message: "Failed to fetch producers" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const db = client.db("users");
  const users = db.collection("users");
  try {
    await users.insertOne({ username, password });
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Error registering user");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = client.db("users");
  const users = db.collection("users");
  const user = await users.findOne({ username, password });
  if (user) {
    res.status(200).send("Login successful");
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
