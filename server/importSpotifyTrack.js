const prisma = require("./prismaClient");

async function importPlaylist() {
  const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=10&offset=862`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();

  if (data.error) {
    console.log(data.error);
    return;
  }

  console.dir(data.items[0].item.artists[0].name);

  for (const item of data.items) {
    const song = item.item;
    const songName = song.name;
    const songArtists = song.artists.map(artist => artist.name);

    const cleanedName = songName.replace(/\(.*?\)/g, "").trim();

    console.log(cleanedName + " - " + songArtists);
  }
}

importPlaylist();
