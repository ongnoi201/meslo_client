import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  MessageSquare, FileText, Users, Bell, 
  TrendingUp, Layout
} from 'lucide-react';
import apiClient from '@/utils/apiClient';


const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/stats'); // Đường dẫn route của bạn
        setData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-10 text-center">Không có dữ liệu.</div>;

  // 1. Format dữ liệu cho AreaChart (Biểu đồ tin nhắn hàng tuần)
  const activityData = data.weeklyMessages.map(item => ({
    name: new Date(item._id).toLocaleDateString('vi-VN', { weekday: 'short' }),
    messages: item.count
  }));

  // 2. Format dữ liệu cho PieChart (Tương tác: Like vs Comment)
  const pieData = [
    { name: 'Lượt thích', value: data.interactions.totalLikes },
    { name: 'Bình luận', value: data.interactions.totalComments },
  ];
  
  const COLORS = ['#6366f1', '#ec4899'];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-center items-end">
            <p className="text-center text-gray-500 text-sm">Dữ liệu phân tích mạng xã hội của bạn</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tin nhắn', val: data.summary.totalMessages, icon: MessageSquare, color: 'bg-blue-500' },
            { label: 'Bài viết', val: data.summary.totalPosts, icon: FileText, color: 'bg-pink-500' },
            { label: 'Bạn bè', val: data.summary.totalFriends, icon: Users, color: 'bg-indigo-500' },
            { label: 'Thông báo', val: data.summary.totalNotifys, icon: Bell, color: 'bg-orange-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${s.color} text-white rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={20} />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <h2 className="text-xl font-black text-gray-800">{s.val.toLocaleString()}</h2>
            </div>
          ))}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AREA CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-gray-800">
              <TrendingUp size={18} className="text-indigo-600" /> Hoạt động tin nhắn (7 ngày qua)
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={3} fill="url(#colorMsg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
            <h3 className="font-bold mb-6 text-gray-800">Phân bổ tương tác</h3>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {pieData.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 font-medium text-gray-500">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                    {d.name}
                  </div>
                  <span className="font-bold text-gray-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;