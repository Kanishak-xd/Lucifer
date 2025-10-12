export default function FeaturesSection() {
  return (
    <section id="features" className="py-8 px-4 lg:py-16 lg:px-8">
        <div className="container mx-auto space-y-8 lg:space-y-12 max-w-6xl">
            <div className="flex flex-col overflow-hidden rounded-md lg:flex-row gap-x-5">
                <img src="#" alt="" className="h-64 sm:h-80 w-full object-cover dark:bg-neutral-900 bg-neutral-100 lg:w-1/2" />
                <div className="flex flex-col justify-center flex-1 p-4 sm:p-6 text-center xl:text-left md:text-left sm:text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold">Mess Menu Notification</h3>
                    <p className="my-4 sm:my-6 text-neutral-500 dark:text-white text-xl">Lucifer auto-sends the daily mess menu before meals</p>
                    <div className="flex justify-center sm:justify-center md:justify-start xl:justify-start">
                        <button className="px-10 py-3 m-0 text-lg font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer">
                            Add to Discord
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col overflow-hidden rounded-md lg:flex-row-reverse">
                <img src="#" alt="" className="h-64 sm:h-80 w-full object-cover dark:bg-neutral-900 bg-neutral-100 lg:w-1/2" />
                <div className="flex flex-col justify-center flex-1 p-4 sm:p-6 text-center xl:text-left md:text-left sm:text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold">Smart Reminders</h3>
                    <p className="my-4 sm:my-6 text-neutral-500 dark:text-white text-xl">Reminders for daily classes, laundry, and TMP menu</p>
                    <div className="flex justify-center sm:justify-center md:justify-start xl:justify-start">
                        <button className="px-10 py-3 m-0 text-lg font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer">
                            Add to Discord
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col overflow-hidden rounded-md lg:flex-row gap-x-5">
                <img src="#" alt="" className="h-64 sm:h-80 w-full object-cover dark:bg-neutral-900 bg-neutral-100 lg:w-1/2" />
                <div className="flex flex-col justify-center flex-1 p-4 sm:p-6 text-center xl:text-left md:text-left sm:text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold">Lyrics on Demand</h3>
                    <p className="my-4 sm:my-6 text-neutral-500 dark:text-white text-xl">Search for your favourite song lyrics right inside Discord</p>
                    <div className="flex justify-center sm:justify-center md:justify-start xl:justify-start">
                        <button className="px-10 py-3 m-0 text-lg font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer">
                            Add to Discord
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col overflow-hidden rounded-md lg:flex-row-reverse">
                <img src="#" alt="" className="h-64 sm:h-80 w-full object-cover dark:bg-neutral-900 bg-neutral-100 lg:w-1/2" />
                <div className="flex flex-col justify-center flex-1 p-4 sm:p-6 text-center xl:text-left md:text-left sm:text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold">Slash Command Support</h3>
                    <p className="my-4 sm:my-6 text-neutral-500 dark:text-white text-xl">All features run with clean, modern slash commands for a smooth Discord experience</p>
                    <div className="flex justify-center sm:justify-center md:justify-start xl:justify-start">
                        <button className="px-10 py-3 m-0 text-lg font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer">
                            Add to Discord
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}
