import { io } from "socket.io-client";

// Thay URL bằng địa chỉ Backend của bạn
const SOCKET_URL = "https://zq33c53q-5000.asse.devtunnels.ms/"; 

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Không kết nối ngay lập tức, đợi khi có User ID
  reconnection: true,
  reconnectionAttempts: 5,
});


/**
  lỗi cần fixx:
  reload mất call 
  trong bính luận detail post, avatar bị ẩn khi nó không set hide
 */
