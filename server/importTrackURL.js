const prisma = require("./prismaClient");

async function importTrackURL() {
  const songs = await prisma.song.findMany({
    where: {
      previewUrl: null,
    },
  });

  for (const song of songs) {
    const query = encodeURIComponent(`${song.title} ${song.artist[0]}`);

    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`,
    );

    const data = await response.json();

    if (!data.results) {
      console.log("Failed to find URLs for song:", song.title);
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
  }

  /** 
  const query = encodeURIComponent(`${title} ${artist}`);

  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`,
  );

  const data = await response.json();

  console.dir(data.results, { depth: null });
  */
}

importTrackURL();
