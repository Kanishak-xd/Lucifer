export default function HeroSection() {
  return (
    <section className="">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-4xl">
        <h1 className="font-bold leading-none text-4xl sm:text-5xl md:text-5xl xl:text-6xl dark:text-white">
          Lucifer – Your Campus <br/>Companion
        </h1>
        <p className="mt-8 mb-12 text-lg sm:text-xl xl:text-2xl font-normal text-neutral-500 max-w-2xl px-4">
          Meals, classes, and reminders made easy, Lucifer keeps campus life simple.
        </p>
        <div className="flex flex-wrap justify-center">
          <button className="px-8 py-3 m-2 text-lg font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer">
            Add to Discord
          </button>
          <button className="px-8 py-3 m-2 text-lg border rounded-xl text-black hover:bg-neutral-100 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-950">
            Explore Features
          </button>
        </div>
      </div>
    </section>
  );
}
