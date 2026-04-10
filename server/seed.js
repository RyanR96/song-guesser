const prisma = require("./prismaClient");

async function main() {
  const songs = [
    {
      title: "I Miss You",
      artist: ["blink-182", "sum41"],
    },
    {
      title: "Feeling This",
      artist: ["blink-182"],
    },
    {
      title: "Sleepwalking",
      artist: ["Bring Me The Horizon"],
    },
    {
      title: "Sleepwalking",
      artist: ["All Time Low"],
    },
    {
      title: "Nerve",
      artist: ["The Story So Far"],
    },
    {
      title: "I Miss You",
      artist: ["blink-182", "sum41"],
    },
    {
      title: "Nerve",
      artist: ["The Story So Far"],
    },
  ];

  for (const song of songs) {
    await prisma.song.upsert({
      where: {
        unique_song: {
          title: song.title,
          artist: song.artist,
        },
      },
      update: {},
      create: song,
    });
  }
  /** 
  await Promise.all(
    songs.map(song =>
      prisma.song.upsert({
        where: {
          unique_song: {
            title: song.title,
            artist: song.artist,
          },
        },
        update: {},
        create: song,
      }),
    ),
  );
*/
  console.log("Seed ran");
}

main();
