import Head from 'next/head';
import { Typography, Card } from 'antd';
import AppLayout from '../components/AppLayout';

const { Title, Paragraph } = Typography;

export default function ReceptionPage() {
  return (
    <AppLayout>
      <Head>
        <title>Tiếp đón - Mini CIS</title>
      </Head>
      
      <div className="mb-6">
        <Title level={2}>Tiếp đón</Title>
      </div>
      
      <Card>
        <Paragraph>Nội dung trang tiếp đón sẽ được hiển thị tại đây.</Paragraph>
      </Card>
    </AppLayout>
  );
} 