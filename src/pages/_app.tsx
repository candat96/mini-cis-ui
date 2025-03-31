import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import viVN from "antd/lib/locale/vi_VN";
import "dayjs/locale/vi";
import "~/styles/globals.css";

// Cấu hình dayjs sử dụng locale tiếng Việt
dayjs.locale('vi');

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
      locale={viVN}
    >
      <div className={geist.className}>
        <Component {...pageProps} />
      </div>
    </ConfigProvider>
  );
};

export default MyApp;
