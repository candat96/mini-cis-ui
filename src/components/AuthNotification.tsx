import { Alert } from 'antd';
import { useRouter } from 'next/router';

const AuthNotification = () => {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert
        message="Yêu cầu đăng nhập"
        description={
          <div>
            <p>Bạn cần đăng nhập để truy cập trang này.</p>
            <button 
              onClick={handleGoToLogin}
              className="mt-2 text-blue-500 underline"
            >
              Đi đến trang đăng nhập
            </button>
          </div>
        }
        type="warning"
        showIcon
        style={{ maxWidth: '400px' }}
      />
    </div>
  );
};

export default AuthNotification; 