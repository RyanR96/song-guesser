require("dotenv").config();
const prisma = require("./prismaClient");

async function importPlaylist() {
  const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  let skipped = 0;

  let url = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=10&offset=0`;
  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();

    if (data.error) {
      console.log(data.error);
      return;
    }

    console.dir(data.next, { depth: null });

    for (const item of data.items) {
      const song = item.item;
      if (!song) {
        console.log("Item failed:", item);
        skipped++;
        continue;
      }
      const songName = song.name.replace(/\(.*?\)/g, "").trim(); //removes brackets and trims whitespace
      const songArtists = song.artists.map(artist => artist.name);

      console.log(songName + " - " + songArtists);

      await prisma.song.upsert({
        where: {
          unique_song: {
            title: songName,
            artist: songArtists,
          },
        },
        update: {},
        create: {
          title: songName,
          artist: songArtists,
        },
      });
    }

    url = data.next;
  }

  console.log("Skipped:", skipped);
}
importPlaylist();
