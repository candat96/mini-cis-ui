import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { ConfigProvider } from "antd";
import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <div className={geist.className}>
        <Component {...pageProps} />
      </div>
    </ConfigProvider>
  );
};

export default MyApp;
