import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import viVN from "antd/lib/locale/vi_VN";
import "dayjs/locale/vi";
import "~/styles/globals.css";
import updateLocale from "dayjs/plugin/updateLocale";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Đăng ký plugins
dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);

// Cấu hình dayjs sử dụng locale tiếng Việt
dayjs.locale('vi');

// Cập nhật định dạng ngày tháng mặc định
dayjs.updateLocale('vi', {
  formats: {
    L: 'DD/MM/YYYY', // định dạng mặc định cho DatePicker
  }
});

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
      form={{ validateMessages: viVN.Form?.defaultValidateMessages }}
      componentSize="middle"
    >
      <div className={geist.className}>
        <Component {...pageProps} />
      </div>
    </ConfigProvider>
  );
};

export default MyApp;
