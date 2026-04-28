const prisma = require("./prismaClient");

async function importPlaylist() {
  const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

  let url = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=10&offset=830`;
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
      const songName = song.name.replace(/\(.*?\)/g, "").trim();
      const songArtists = song.artists.map(artist => artist.name);

      console.log(songName + " - " + songArtists);
    }

    url = data.next;
  }
}
importPlaylist();
