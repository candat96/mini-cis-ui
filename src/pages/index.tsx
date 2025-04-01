import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getStoreData } from "../lib/localStorage";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getStoreData('token');
      
      if (token) {
        // User is logged in, redirect to reception
        router.replace('/reception');
      } else {
        // User is not logged in, redirect to login
        router.replace('/login');
      }
      setIsLoading(false);
    };

    // checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  // This return is just a placeholder as the component will redirect
  return null;
}
