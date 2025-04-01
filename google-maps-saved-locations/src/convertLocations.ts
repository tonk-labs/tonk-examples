import { Client } from "@googlemaps/google-maps-services-js";
import { parse } from "csv-parse/sync";
import { nanoid } from "nanoid";
import * as fs from "fs/promises";
import * as dotenv from "dotenv";

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

async function extractPlaceId(url: string): Promise<string> {
  // Extract CID (Client ID) from Google Maps URL
  // This is in the format 0x48761a61e122b21d:0x96affb5e294f9905
  const match = url.match(/!1s([0-9a-fx:]+)/);
  if (match) {
    console.log(`Extracted CID from URL: ${match[1]}`);
    return match[1];
  }

  // Fallback: try to extract from the URL path for other URL formats
  const placeNameMatch = url.match(/place\/([^\/]+)\//);
  if (placeNameMatch) {
    const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));
    console.log(`Extracted place name from URL: ${placeName}`);
    return `name:${placeName}`;
  }

  console.log(`Could not extract identifier from URL: ${url}`);
  return "";
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
    const placeId = await extractPlaceId(record.URL);

    if (!placeId) {
      console.error(`Could not extract identifier from URL: ${record.URL}`);
      continue;
    }

    try {
      // If we have a name-based reference instead of a direct CID
      if (placeId.startsWith("name:")) {
        const placeName = placeId.substring(5);
        console.log(`Searching for place by name: ${placeName}`);

        // Use the Places API to search for the place by name
        const searchResponse = await client.findPlaceFromText({
          params: {
            input: placeName,
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
            `Could not find place ID for: ${placeName}`,
            searchResponse.data,
          );
          continue;
        }

        // Use the first result
        const candidate = searchResponse.data.candidates[0];
        console.log(`Found place for ${placeName}: ${candidate.name}`);

        // Create a location entry using the search result
        const locationId = nanoid(10);
        output.locations[locationId] = {
          addedBy: "7fn52mcm1f5", // Default to Jack
          category: "favorite", // Default category
          createdAt: Date.now(),
          description: record.Note || "",
          id: locationId,
          latitude: candidate.geometry?.location.lat || 0,
          longitude: candidate.geometry?.location.lng || 0,
          name: record.Title || candidate.name || "",
          placeId: candidate.place_id || "",
        };
        continue;
      }

      // For CID-based URLs, we'll use a different approach
      // Google Maps API doesn't directly support CID lookups, so we'll use a text search
      // based on the title from the CSV
      console.log(`Using title "${record.Title}" to search for place details`);

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
}

main().catch(console.error);
