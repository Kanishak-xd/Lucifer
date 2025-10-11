export default function CTASection() {
  return (
    <section className="py-6 bg-black dark:bg-white">
        <div className="container mx-auto flex flex-col items-center justify-center p-4 space-y-11 md:p-10 px-10 sm:px-16 md:px-24 xl:px-48">
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-5xl font-bold leading-none text-center text-white dark:text-black">Make Campus Life Easier Today</h1>
            <button className="px-8 py-3 text-lg font-bold rounded-xl bg-white text-black dark:bg-black dark:text-gray-50 hover:cursor-pointer dark:hover:bg-neutral-900 hover:bg-neutral-200">Add to Server</button>
        </div>
    </section>
  )
}
