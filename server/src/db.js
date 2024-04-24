//db.js
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import "dotenv/config";
const uri = process.env.MONGODB_CONNECTION_STRING;
import { v4 as uuidv4 } from "uuid";

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationError: true,
  },
});

let db = null;
let sessionId;

export async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("wine-app");
    sessionId = uuidv4();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connect();

export async function addOrUpdateWine(wineData, sessionId) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("wines");
    const { _id, ...updateData } = wineData;
    const existingWine = await collection.findOne({ _id: new ObjectId(_id) });
    let updatedWineData;
    if (existingWine) {
      updatedWineData = {
        ...existingWine,
        ...updateData,
      };
      await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updatedWineData }
      );
    } else {
      updatedWineData = wineData;
      await collection.insertOne(updatedWineData);
    }
    await associatePicturesWithWine(sessionId, updatedWineData._id);
    console.log("Wine document updated:", updatedWineData);
    return updatedWineData._id;
  } catch (error) {
    console.error("Error adding or updating wine:", error);
    throw error;
  }
}

async function associatePicturesWithWine(sessionId, wineId) {
  try {
    const database = client.db("wine-app");
    const pictureCollection = database.collection("pictures");
    const winesCollection = database.collection("wines");
    const pictures = await pictureCollection.find({ sessionId }).toArray();
    for (const picture of pictures) {
      await pictureCollection.updateOne(
        { _id: picture._id },
        { $set: { wineId } }
      );
    }
  } catch (error) {
    console.error("Error associating pictures with wine:", error);
    throw error;
  }
}

export async function getAllWines() {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("wines");
    const wines = await collection.find({}).toArray();
    return wines;
  } catch (error) {
    console.error("Error fetching wines:", error);
    throw error;
  }
}

export async function deleteWineById(wineId) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("wines");
    const wine = await collection.findOne({ _id: new ObjectId(wineId) });
    if (!wine) {
      console.log("Wine not found");
      return 0;
    }
    const frontLabelPictureId = wine.frontLabelPictureId;
    const backLabelPictureId = wine.backLabelPictureId;
    const result = await collection.deleteOne({ _id: new ObjectId(wineId) });
    console.log(`Deleted ${result.deletedCount} wine(s)`);
    await deletePictureById(frontLabelPictureId);
    await deletePictureById(backLabelPictureId);
    return result.deletedCount;
  } catch (error) {
    console.error("Error deleting wine:", error);
    throw error;
  }
}

export async function deletePictureById(pictureId) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("pictures");
    const result = await collection.deleteOne({ _id: new ObjectId(pictureId) });
    console.log(`Deleted ${result.deletedCount} picture(s)`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error deleting picture:", error);
    throw error;
  }
}

export async function getWineById(wineId) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("wines");
    const wine = await collection.findOne({ _id: new ObjectId(wineId) });
    return wine;
  } catch (error) {
    console.error("Error fetching wine by id:", error);
    throw error;
  }
}

export async function updateWineById(wineId, updateData) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("wines");
    const result = await collection.updateOne(
      { _id: new ObjectId(wineId) },
      { $set: updateData }
    );
    console.log(`Updated ${result.modifiedCount} wine(s)`);
    if (updateData.frontLabel || updateData.backLabel) {
      await updatePicturesByWineId(wineId, updateData);
    }
    return result.modifiedCount;
  } catch (error) {
    console.error("Error updating wine:", error);
    throw error;
  }
}

export async function addPicture(pictureData) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("pictures");
    const result = await collection.insertOne(pictureData);
    console.log("Picture added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding picture:", error);
    throw error;
  }
}

export async function updatePicturesByWineId(wineId, updateData) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("pictures");
    if (updateData.frontLabel) {
      await collection.updateOne(
        { _id: new ObjectId(updateData.frontLabelPictureId) },
        { $set: { filename: updateData.frontLabel } }
      );
    }
    if (updateData.backLabel) {
      await collection.updateOne(
        { _id: new ObjectId(updateData.backLabelPictureId) },
        { $set: { filename: updateData.backLabel } }
      );
    }
    console.log("Pictures updated for wine:", wineId);
  } catch (error) {
    console.error("Error updating pictures:", error);
    throw error;
  }
}

export async function getPictureById(pictureId) {
  try {
    const database = client.db("wine-app");
    const collection = database.collection("pictures");
    const picture = await collection.findOne({ _id: new ObjectId(pictureId) });
    return picture;
  } catch (error) {
    console.error("Error fetching picture by id:", error);
    throw error;
  }
}

export async function addVariety(varietyData) {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("varieties");
    const result = await collection.insertOne(varietyData);
    console.log("Variety added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding variety:", error);
    throw error;
  }
}

export async function getVarieties() {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("varieties");
    const varieties = await collection.find({}).toArray();
    return varieties;
  } catch (error) {
    console.error("Error fetching varieties:", error);
    throw error;
  }
}

export async function addCountry(countryData) {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("countries");
    const result = await collection.insertOne(countryData);
    console.log("Country added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding country:", error);
    throw error;
  }
}

export async function getCountries() {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("countries");
    const countries = await collection.find({}).toArray();
    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}

export async function addAppellation(appellationData) {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("appellations");
    const result = await collection.insertOne(appellationData);
    console.log("Appellation added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding appellation:", error);
    throw error;
  }
}

export async function getAllAppellations() {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("appellations");
    const appellations = await collection.find({}).toArray();
    return appellations;
  } catch (error) {
    console.error("Error fetching appellations:", error);
    throw error;
  }
}

export async function addVintage(vintageData) {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("vintages");
    const result = await collection.insertOne(vintageData);
    console.log("Vintage added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding vintage:", error);
    throw error;
  }
}

export async function getAllVintages() {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("vintages");
    const vintages = await collection.find({}).toArray();
    return vintages;
  } catch (error) {
    console.error("Error fetching vintages:", error);
    throw error;
  }
}

export async function addRegion(regionData) {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("regions");
    const result = await collection.insertOne(regionData);
    console.log("Region added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding region:", error);
    throw error;
  }
}

export async function getAllRegions() {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("regions");
    const regions = await collection.find({}).toArray();
    return regions;
  } catch (error) {
    console.error("Error fetching regions:", error);
    throw error;
  }
}

export async function addProducer(producerData) {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("producers");
    const result = await collection.insertOne(producerData);
    console.log("Producer added:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding producer:", error);
    throw error;
  }
}

export async function getAllProducers() {
  try {
    const db = client.db("wine-app");
    const collection = db.collection("producers");
    const producers = await collection.find({}).toArray();
    return producers;
  } catch (error) {
    console.error("Error fetching producers:", error);
    throw error;
  }
}

process.on("SIGINT", () => {
  client.close().then(() => {
    console.log("MongoDB client disconnected");
    process.exit(0);
  });
});
