require("dotenv").config();

const prisma = require("./prismaClient");
const isCloseMatch = require("./Game/matching");
const spotifyPreviewFinder = require("spotify-preview-finder");

function cleanSongTitle(title = "") {
  return title
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAlternateVersion(title = "") {
  return /\b(live|acoustic|remix|karaoke|instrumental|demo|cover)\b/i.test(
    title,
  );
}

function splitArtistNames(artistName = "") {
  return artistName
    .split(",")
    .map(artist => artist.trim())
    .filter(Boolean);
}

function artistMatches(storedArtists, resultArtistName) {
  if (!Array.isArray(storedArtists)) return false;
  if (!resultArtistName) return false;

  const resultArtists = splitArtistNames(resultArtistName);

  return storedArtists.some(storedArtist => {
    const wholeArtistMatch = isCloseMatch(storedArtist, resultArtistName);

    const splitArtistMatch = resultArtists.some(resultArtist =>
      isCloseMatch(storedArtist, resultArtist),
    );

    return wholeArtistMatch || splitArtistMatch;
  });
}

function splitPackageName(name = "") {
  const parts = name.split(" - ");

  return {
    title: parts[0] || "",
    artist: parts.slice(1).join(" - ") || "",
  };
}

async function spotifyPreviewFallback() {
  let processed = 0;
  let updated = 0;
  let noResults = 0;
  let noMatch = 0;
  let errors = 0;

  const songs = await prisma.song.findMany({
    where: {
      previewUrl: null,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Found ${songs.length} songs missing preview URLs`);

  for (const song of songs) {
    processed++;

    console.log(
      `\nProcessing ${processed}/${songs.length}: ${song.title} - ${song.artist.join(", ")}`,
    );

    const searchArtist = song.artist?.[0];

    if (!searchArtist) {
      console.log("No artist found, skipping");
      noMatch++;
      continue;
    }

    try {
      const result = await spotifyPreviewFinder(song.title, searchArtist, 5);

      if (!result.success || !result.results || result.results.length === 0) {
        console.log("No Spotify preview finder results");
        noResults++;
        await sleep(1500);
        continue;
      }

      const originalTitle = cleanSongTitle(song.title);
      const originalIsAlternate = isAlternateVersion(song.title);

      let matchedResult = null;

      for (const item of result.results) {
        const { title: resultTitleRaw, artist: resultArtistRaw } =
          splitPackageName(item.name);

        const resultTitle = cleanSongTitle(resultTitleRaw);
        const resultArtist = resultArtistRaw;
        const previewUrl = item.previewUrls?.[0];

        if (!previewUrl) {
          console.log("Skipping result with no preview URL:", item.name);
          continue;
        }

        const resultIsAlternate = isAlternateVersion(item.name);

        if (!originalIsAlternate && resultIsAlternate) {
          console.log("Skipping alternate version:", item.name);
          continue;
        }

        const titleMatch = isCloseMatch(originalTitle, resultTitle);
        const artistMatch = artistMatches(song.artist, resultArtist);

        console.log({
          originalTitle,
          storedArtists: song.artist,
          resultTitle,
          resultArtist,
          titleMatch,
          artistMatch,
          hasPreviewUrl: Boolean(previewUrl),
        });

        if (titleMatch && artistMatch) {
          matchedResult = item;
          break;
        }
      }

      if (!matchedResult) {
        console.log(
          `No confident fallback match for: ${song.title} - ${song.artist.join(", ")}`,
        );
        noMatch++;
        await sleep(1500);
        continue;
      }

      await prisma.song.update({
        where: {
          id: song.id,
        },
        data: {
          previewUrl: matchedResult.previewUrls[0],
        },
      });

      updated++;

      console.log("Updated fallback preview:", {
        dbTitle: song.title,
        dbArtists: song.artist,
        matchedName: matchedResult.name,
        previewUrl: matchedResult.previewUrls[0],
      });

      await sleep(1500);
    } catch (err) {
      errors++;
      console.error(`Error processing ${song.title}:`, err.message);
      await sleep(1500);
    }
  }

  console.log("\nSpotify preview fallback finished");
  console.log("Processed:", processed);
  console.log("Updated:", updated);
  console.log("No results:", noResults);
  console.log("No confident match:", noMatch);
  console.log("Errors:", errors);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

spotifyPreviewFallback()
  .catch(err => {
    console.error("Fallback script failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
