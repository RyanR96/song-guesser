const prisma = require("./prismaClient");

async function importTrackURL() {
  let count = 0;
  const songs = await prisma.song.findMany({
    where: {
      previewUrl: null,
    },
  });

  for (const song of songs) {
    count++;
    console.log(`Processing ${count}/${songs.length} : ${song.title}`);
    const query = encodeURIComponent(`${song.title} ${song.artist[0]}`);

    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`,
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("Failed to find URLs for song:", song.title);
      continue;
    }

    await prisma.song.update({
      where: {
        id: song.id,
      },
      data: {
        previewUrl: data.results[0].previewUrl,
        artworkUrl: data.results[0].artworkUrl100,
        trackViewUrl: data.results[0].trackViewUrl,
      },
    });

    await sleep(3500);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

importTrackURL();
