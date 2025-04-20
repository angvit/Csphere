import Image from "next/image";

export default function Home() {
  return (
    <div className="pt-serif-bold">
      <main className="h-screen w-screen  flex items-center justify-center bg-gray-900 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
        <div className="flex flex-col items-center justify-center w-10/12 md:w-8/12 h-full space-y-10 gap-10">
          <section className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl pt-serif-regular-italic  text-center  text-white  mb-8">
              Save and revist your favorite bookmarks with{" "}
              <span className="block mt-2 pt-serif-regular-italic font-bold">
                Cphere
              </span>
            </h1>

            <p className="text-xl text-center pt-serif-bold text-gray-300 mb-10 max-w-2xl mx-auto">
              Never miss out on saved content again.
            </p>
          </section>

          <section className="flex flex-col md:flex-row  justify-center h-[30px] gap-6 w-[300px] md:w-[400px] lg:w-[500px]">
            <button className="bg-white leading-2 text-gray-900 px-6 py-4 rounded-lg h-auto w-full text-center  hover:bg-gray-100 transition duration-300 ">
              Explore Solutions
            </button>
            <button className="text-white leading-2 px-6 py-4 w-full text-center hover:text-gray-200 transition duration-300 bg-[#202A29] rounded-lg">
              View a Demo
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
