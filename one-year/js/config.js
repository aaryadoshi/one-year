/* ============================================================================
 *  config.js  —  THIS IS THE ONLY FILE YOU NEED TO EDIT.
 *  Everything on the site is generated from the data below.
 *  Edit, save, push. No other file needs touching.
 * ========================================================================== */

const CONFIG = {

  /* ------------------------------------------------------------------
   * 1. THE BASICS
   * ---------------------------------------------------------------- */
  yourName: "Aarya",
  theirName: "You",              // <- his name goes here
  startDate: "2025-08-22",       // the day it all began (YYYY-MM-DD)
  anniversary: { year: 2026, month: 8, day: 22 },   // heart lands here on the calendar


  /* ------------------------------------------------------------------
   * 2. THE PASSWORD
   *
   *   The password is NOT stored in this file. Only its SHA-256 hash is.
   *   That means even if he reads the source code, he can't read the password.
   *
   *   TO SET YOUR OWN:  open  tools/hash.html  in a browser, type your
   *   password, copy the hash it prints, paste it below.
   *
   *   Current hash below = the password  "iloveyou"   <-- CHANGE THIS
   * ---------------------------------------------------------------- */
  passwordHash: "e4ad93ca07acb8d908a3aa41e920ea4f4ef4f26e7f86cf8291c5db289780a5ae",
  passwordPrompt: "enter the password",
  passwordHint: "hint: the thing you always say before you hang up",   // shown after 3 wrong tries

  // Fallback: if you'd rather not bother with hashing, put the plain password
  // here and it will be used instead of the hash above. (Less secret, but fine.)
  passwordPlain: "iloveyou",


  /* ------------------------------------------------------------------
   * 3. THE LETTER  (opens when he taps the envelope)
   *    Each string is one paragraph. Add or remove as many as you like.
   * ---------------------------------------------------------------- */
  letter: {
    greeting: "my favourite person,",
    paragraphs: [
      "One year. Three hundred and sixty five days of you being the best part of mine.",
      "I don't really know how to fit a whole year into a letter. So instead I built you this — a little corner of the internet that only you can get into, full of all the things that remind me of us.",
      "Thank you for the songs stuck in my head, the photos I keep re-opening, and every ordinary Tuesday you somehow made feel like something.",
      "Take your time in here. I made every part of it thinking about you.",
    ],
    signoff: "all my love,",
    signature: "Aarya",
  },


  /* ------------------------------------------------------------------
   * 4. JAR ONE — SONGS THAT REMIND ME OF YOU
   *
   *    youtubeId = the bit after "v=" in a YouTube URL.
   *    e.g.  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  "dQw4w9WgXcQ"
   * ---------------------------------------------------------------- */
  songs: [
    {
      title: "Yellow💛",
      artist: "Coldplay",
      youtubeId: "h7FN5dU9ROo&list=RDh7FN5dU9ROo&start_radio=1",
      note: "Our one month. In the car. This was on.",
    },
    {
      title: "Sample Song Two",
      artist: "Another Artist",
      youtubeId: "dQw4w9WgXcQ",
      note: "I can't hear the first ten seconds of this without thinking of you.",
    },
    {
      title: "Stand by me",
      artist: "Ben E King",
      youtubeId: "7rZyI7kPZMI&list=RD7rZyI7kPZMI&start_radio=1",
      note: "Our song. Obviously.",
    },
    // add as many as you want — just copy a block
  ],


  /* ------------------------------------------------------------------
   * 5. JAR TWO — PHOTO COLLAGE
   *
   *    Drop your image files into the  photos/  folder in this repo,
   *    then list the filenames here.  Captions are optional.
   * ---------------------------------------------------------------- */
  photos: [
    { src: "photos/1.jpg", caption: "the first one" },
    { src: "photos/2.jpg", caption: "you, laughing at nothing" },
    { src: "photos/3.jpg", caption: "that day" },
    { src: "photos/4.jpg", caption: "us" },
    { src: "photos/5.jpg", caption: "my favourite" },
    { src: "photos/6.jpg", caption: "3am" },
    { src: "photos/7.jpg", caption: "" },
    { src: "photos/8.jpg", caption: "" },
    { src: "photos/9.jpg", caption: "" },
    { src: "photos/10.jpg", caption: "" },
    { src: "photos/11.jpg", caption: "" },
    { src: "photos/12.jpg", caption: "" },
    // add more — the collage lays itself out automatically
  ],


  /* ------------------------------------------------------------------
   * 6. JAR THREE — MEMORY MATCH GAME
   *
   *    8 pairs. Use emoji, OR use photos from your photos/ folder by
   *    writing  { img: "photos/1.jpg" }  instead of a string.
   * ---------------------------------------------------------------- */
  memoryCards: ["🍓", "🌙", "☕️", "🎧", "🐧", "🌻", "🫧", "🍰"],

  memoryWinMessage: "you found every single one. like you always do.",


  /* ------------------------------------------------------------------
   * 7. JAR FOUR — THE TERMINAL  (my pick: `love.exe`)
   *
   *    A tiny fake shell he can type commands into.
   *    `reasons` are pulled at random by the `why` command.
   * ---------------------------------------------------------------- */
  reasons: [
    "the way you say my name when you're half asleep",
    "you remember the smallest things I mention once",
    "you laugh at your own jokes before you finish them",
    "you make me feel like the easiest person in the world to love",
    "your hands",
    "you never make me explain myself twice",
    "the face you make when you're concentrating",
    "you text me things you saw that reminded you of me",
    "you're kind when no one is watching",
    "somehow you make me want to be less mean to myself",
  ],

  // answers for the `whoami` command
  whoami: "the best thing that happened to me on a completely ordinary friday",

  // the secret command — he has to find it
  secretCommand: "sudo hug",
  secretResponse: "permission granted. consider yourself squeezed. 🫂",
};
