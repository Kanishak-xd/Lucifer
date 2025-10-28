export default function CTASection() {
  return (
    <section className="py-6 bg-black dark:bg-red-950">
        <div className="container mx-auto flex flex-col items-center justify-center p-4 space-y-11 md:p-10 px-10 sm:px-16 md:px-24 xl:px-48">
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-5xl font-bold leading-none text-center text-white dark:text-white">Make Campus Life Easier Today</h1>
            <a href="https://discord.com/oauth2/authorize?client_id=1338873280941129789&permissions=257024&integration_type=0&scope=bot+applications.commands" className="px-8 py-3 text-lg font-bold rounded-xl bg-white text-black dark:bg-black dark:text-white hover:cursor-pointer dark:hover:bg-neutral-900 hover:bg-neutral-200">Add to Server</a>
        </div>
    </section>
  )
}
