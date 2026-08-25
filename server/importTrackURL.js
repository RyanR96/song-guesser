const prisma = require("./prismaClient");
const isCloseMatch = require("./Game/matching");

function cleanSongTitle(title) {
  return title
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .trim();
}

function artistMatches(storedArtists, itunesArtistName) {
  if (!Array.isArray(storedArtists)) return false;
  if (!itunesArtistName) return false;

  return storedArtists.some(artist => isCloseMatch(artist, itunesArtistName));
}

function isAlternateVersion(title) {
  return /\b(live|acoustic|remix|karaoke|instrumental|demo|cover)\b/i.test(
    title,
  );
}

async function importTrackURL() {
  let count = 0;
  let updated = 0;
  let notFound = 0;
  let noMatch = 0;

  const songs = await prisma.song.findMany({
    where: {
      previewUrl: null,
    },
  });

  for (const song of songs) {
    count++;

    console.log(
      `Processing ${count}/${songs.length}: ${song.title} - ${song.artist.join(", ")}`,
    );

    const searchArtist = song.artist?.[0];

    if (!searchArtist) {
      console.log("No artist found for song:", song.title);
      noMatch++;
      await sleep(3500);
      continue;
    }

    const cleanedSongTitle = cleanSongTitle(song.title);
    const query = encodeURIComponent(`${cleanedSongTitle} ${searchArtist}`);

    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=15`,
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("Failed to find iTunes results for song:", song.title);
      notFound++;
      await sleep(3500);
      continue;
    }

    let matchedResult = null;

    const originalIsAlternate = isAlternateVersion(song.title);

    for (const result of data.results) {
      const resultIsAlternate = isAlternateVersion(result.trackName || "");

      if (!originalIsAlternate && resultIsAlternate) {
        console.log("Skipping alternate version:", result.trackName);
        continue;
      }
      const itunesTitle = cleanSongTitle(result.trackName || "");
      const itunesArtist = result.artistName || "";

      const titleMatch = isCloseMatch(cleanedSongTitle, itunesTitle);
      const artistMatch = artistMatches(song.artist, itunesArtist);

      console.log({
        spotifyTitle: cleanedSongTitle,
        spotifyArtists: song.artist,
        itunesTitle,
        itunesArtist,
        titleMatch,
        artistMatch,
      });

      if (titleMatch && artistMatch && result.previewUrl) {
        matchedResult = result;
        break;
      }
    }

    if (!matchedResult) {
      console.log(
        `No confident iTunes match for: ${song.title} - ${song.artist.join(", ")}`,
      );
      noMatch++;
      await sleep(3500);
      continue;
    }

    await prisma.song.update({
      where: {
        id: song.id,
      },
      data: {
        previewUrl: matchedResult.previewUrl,
        artworkUrl: matchedResult.artworkUrl100,
        trackViewUrl: matchedResult.trackViewUrl,
      },
    });

    updated++;

    console.log("Updated with iTunes match:", {
      title: matchedResult.trackName,
      artist: matchedResult.artistName,
      previewUrl: matchedResult.previewUrl,
    });

    await sleep(3500);
  }

  console.log("Import finished");
  console.log("Updated:", updated);
  console.log("No iTunes results:", notFound);
  console.log("No confident match:", noMatch);
  console.log("Total processed:", count);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

importTrackURL();
