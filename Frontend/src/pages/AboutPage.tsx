export default function AboutPage() {
    return (
      <div className='flex justify-center items-start h-full pb-20'>
        <div className="max-w-5xl justify-start items-start w-full px-4 sm:px-6 md:px-8 py-24 sm:py-28 md:py-32 flex-col">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">About</h2>
          <p className="mb-4 leading-relaxed text-sm sm:text-base">
            I built this platform during my final year at NIIT University, where I'm pursuing a B.Tech in
            Computer Science Engineering with a specialization in Cybersecurity.
          </p>
          <p className="mb-4 leading-relaxed text-sm sm:text-base">
            It started with a simple problem: my friends and I had to open 
            our emails or the Excel app every single day just to check the 
            mess menu. The university shared the menu in a spreadsheet, 
            and honestly, doing that daily felt like a ridiculous ritual. 
            So, I decided to automate it.
          </p>
          <p className="mb-4 leading-relaxed text-sm sm:text-base">
            What began as a small bot to save us a few clicks turned into 
            something that actually made student life easier. Once it worked 
            well, I figured — why not make it available for everyone else too? 
            That's how this website came to be: a quick, simple setup that 
            gets the job done without any fuss.
          </p>
          <p className="leading-relaxed text-sm sm:text-base">
            And because I didn't want it to look or feel boring, I gave the 
            project a little personality — inspired by Lucifer from the game 
            Helltaker. Just a touch of attitude to keep things fun while it 
            quietly takes care of the mundane.
          </p>
        </div>
      </div>
    )
  }