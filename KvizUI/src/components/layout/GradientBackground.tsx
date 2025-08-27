import React from "react";

type BackgroundLayoutProps = {
  children: React.ReactNode;
};

const GradientBackground: React.FC<BackgroundLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 w-full min-h-screen overflow-hidden">
        <div className="absolute inset-0 w-full h-full dark:bg-black bg-white -z-30" />

        {/* Blurred Circles */}
        <div
          className="absolute -z-10 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "27.770632768192694%",
            top: "78.79137349842803%",
            width: "650px",
            height: "650px",
            backgroundColor: "#6FBCB3",
            opacity: 0.4944838579669869,
            filter: "blur(82px)",
          }}
        />
        <div
          className="absolute -z-10 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "19.373535087281034%",
            top: "24.119895303409265%",
            width: "500px",
            height: "500px",
            backgroundColor: "#F9ABBA",
            opacity: 0.34491654810721395,
            filter: "blur(121px)",
          }}
        />
        <div
          className="absolute -z-10 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "68.83350951461723%",
            top: "47.00241853974334%",
            width: "500px",
            height: "500px",
            backgroundColor: "#34C6E9",
            opacity: 0.32676105781012277,
            filter: "blur(51px)",
          }}
        />
        <div
          className="absolute -z-10 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "15.42701960672428%",
            top: "39.896983748522295%",
            width: "500px",
            height: "500px",
            backgroundColor: "#33886C",
            opacity: 0.4476669360668498,
            filter: "blur(62px)",
          }}
        />
      </div>

      {/* Foreground Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
};

export default GradientBackground;
