import React from "react";

function page() {
  return (
    <main className="h-screen w-screen flex items-center justify-center bg-gray-900 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      <div className="flex flex-col items-center justify-center w-10/12 md:w-8/12 h-full space-y-10 gap-10">
        <section className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-center text-white  mb-8">
            Innovate Faster with
            <span className="block mt-2">Amane Soft</span>
          </h1>

          <p className="text-xl text-center text-gray-300 mb-10 max-w-2xl mx-auto">
            Empowering businesses with cutting-edge software solutions. From
            AI-driven analytics to seamless cloud integrations, we're shaping
            the future of technology.
          </p>
        </section>

        <section className="flex  justify-center h-[30px] gap-6 w-[300px] md:w-[400px] lg:w-[500px]">
          <button className="bg-white text-gray-900 px-6 py-3 rounded-lg h-auto w-full text-center  hover:bg-gray-100 transition duration-300 ">
            Explore Solutions
          </button>
          <button className="text-white leading-2 px-6 py-3 w-full text-center hover:text-gray-200 transition duration-300 bg-black rounded-lg">
            Schedule a Demo
          </button>
        </section>
      </div>
    </main>
  );
}

export default page;
