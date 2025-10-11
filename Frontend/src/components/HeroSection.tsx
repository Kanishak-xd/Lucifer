export default function HeroSection() {
  return (
    <section className="dark:bg-gray-100 dark:text-gray-800 w-full">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-4xl">
        <h1 className="font-bold leading-none text-4xl sm:text-5xl md:text-5xl xl:text-6xl">
          Lucifer – Your Campus <br/>Companion
        </h1>
        <p className="mt-8 mb-12 text-xl xl:text-2xl font-normal  text-neutral-500 mx-5 sm:mx-20 md:mx-0 px-0 sm:px-0 md:px-37 xl:px-15">
          Meals, classes, and reminders made easy, Lucifer keeps campus life simple.
        </p>
        <div className="flex flex-wrap justify-center">
          <button className="px-8 py-3 m-2 text-lg font-semibold rounded-xl bg-black text-white dark:bg-violet-600 dark:text-gray-50 hover:bg-neutral-900 hover:cursor-pointer">
            Add to Discord
          </button>
          <button className="px-8 py-3 m-2 text-lg border rounded-xl bg-white text-black dark:text-gray-900 dark:border-gray-300 hover:bg-neutral-100">
            Explore Features
          </button>
        </div>
      </div>
    </section>
  );
}
