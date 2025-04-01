import { Client } from "@googlemaps/google-maps-services-js";
import { parse } from "csv-parse/sync";
import { nanoid } from "nanoid";
import * as fs from "fs/promises";
import * as dotenv from "dotenv";
import * as Automerge from "@automerge/automerge";

dotenv.config();

interface Location {
  addedBy: string;
  category: string;
  createdAt: number;
  description: string;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  placeId: string;
}

interface OutputFormat {
  locations: {
    [key: string]: Location;
  };
  userNames: {
    [key: string]: string;
  };
}

async function loadAutomergeDoc(filePath: string): Promise<Automerge.Doc<any>> {
  try {
    // Check if the file exists
    await fs.access(filePath);

    // Read the binary file
    const binary = await fs.readFile(filePath);

    // Load the document from binary
    return Automerge.load(binary);
  } catch (error) {
    // If file doesn't exist or can't be loaded, create a new document
    console.log(`Creating new Automerge document (${error})`);
    return Automerge.init();
  }
}

async function saveAutomergeDoc(
  doc: Automerge.Doc<any>,
  filePath: string,
): Promise<void> {
  // Convert the document to binary
  const binary = Automerge.save(doc);

  // Write the binary to file
  await fs.writeFile(filePath, binary);
  console.log(`Saved Automerge document to ${filePath}`);
}

async function main() {
  // Check for API key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Please set GOOGLE_MAPS_API_KEY in your .env file");
  }

  // Initialize Google Maps client
  const client = new Client({});

  // Read and parse CSV file
  const csvContent = await fs.readFile("locations.csv", "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const output: OutputFormat = {
    locations: {},
    userNames: {
      "7fn52mcm1f5": "Jack",
      n605c98uyhd: "Default User",
    },
  };

  // Process each location
  for (const record of records) {
    try {
      const searchResponse = await client.findPlaceFromText({
        params: {
          input: record.Title,
          inputtype: "textquery",
          fields: ["place_id", "name", "geometry"],
          key: apiKey,
        },
      });

      if (
        searchResponse.data.status !== "OK" ||
        !searchResponse.data.candidates ||
        searchResponse.data.candidates.length === 0
      ) {
        console.error(
          `Could not find place for: ${record.Title}`,
          searchResponse.data,
        );
        continue;
      }

      // Use the first result
      const candidate = searchResponse.data.candidates[0];
      console.log(`Found place for ${record.Title}: ${candidate.name}`);

      // Get detailed information using the place_id
      const response = await client.placeDetails({
        params: {
          place_id: candidate.place_id,
          key: apiKey,
        },
      });

      if (response.data.status !== "OK") {
        console.error(`API error for ${record.Title}:`, response.data);
        continue;
      }

      const place = response.data.result;
      const locationId = nanoid(10);

      output.locations[locationId] = {
        addedBy: "7fn52mcm1f5", // Default to Jack
        category: "favorite", // Default category
        createdAt: Date.now(),
        description: record.Note || "",
        id: locationId,
        latitude: place.geometry?.location.lat || 0,
        longitude: place.geometry?.location.lng || 0,
        name: record.Title || place.name || "",
        placeId: place.place_id || "",
      };
    } catch (error) {
      console.error(`Error processing ${record.Title}:`, error);
    }
  }

  // Write the output to a file
  await fs.writeFile("output.json", JSON.stringify(output, null, 2));
  console.log("Conversion complete! Check output.json");

  // Load or create Automerge document
  const automergeFilePath = process.argv[2] || "locations.bin";
  console.log(`Loading Automerge document from ${automergeFilePath}`);
  let doc = await loadAutomergeDoc(automergeFilePath);

  // Patch the output into the Automerge document
  doc = Automerge.change(doc, "Add imported locations", (doc) => {
    // Initialize document structure if it doesn't exist
    if (!doc.locations) doc.locations = {};
    if (!doc.userNames) doc.userNames = {};

    // Add user names
    for (const [userId, userName] of Object.entries(output.userNames)) {
      doc.userNames[userId] = userName;
    }

    // Add locations
    for (const [locationId, location] of Object.entries(output.locations)) {
      doc.locations[locationId] = location;
    }
  });

  // Save the updated Automerge document
  await saveAutomergeDoc(doc, automergeFilePath);
  console.log(`Updated Automerge document saved to ${automergeFilePath}`);
}

main().catch(console.error);
