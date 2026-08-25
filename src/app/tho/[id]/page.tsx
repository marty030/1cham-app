'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from "../../../lib/supabase";

export default function ThoPanelPage() {
  const params = useParams();
  const thoId = params?.thoId as string;

  const [tinNhanList, setTinNhanList] = useState<any[]>([]);
  const [noiDung, setNoiDung] = useState('');

  // 1. Fetch danh sách tin nhắn ban đầu
  useEffect(() => {
    if (!thoId) return;

    const fetchTinNhan = async () => {
      const { data, error } = await supabase
        .from('tin_nhan')
        .select('*')
        .eq('tho_id', thoId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setTinNhanList(data);
      }
    };

    fetchTinNhan();
  }, [thoId]);

  // 2. Lắng nghe Realtime tin nhắn mới
  useEffect(() => {
    if (!thoId) return;

    const channel = supabase
      .channel(`tho-panel-${thoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tin_nhan',
          filter: `tho_id=eq.${thoId}`,
        },
        (payload: any) => {
          if (payload.new) {
            setTinNhanList((prev) => {
              const isExist = prev.some((item) => item.id === payload.new.id);
              if (isExist) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thoId]);

  // 3. Hàm gửi tin nhắn phía Thợ (Đánh dấu sender_type là 'tho')
  const handlePhanHoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiDung.trim()) return;

    const currentText = noiDung;
    setNoiDung('');

    const { data, error } = await supabase
      .from('tin_nhan')
      .insert([
        {
          tho_id: thoId,
          noi_dung: currentText,
          sender_type: 'tho',
        },
      ])
      .select();

    if (error) {
      alert("Lỗi gửi: " + error.message);
      setNoiDung(currentText);
    } else if (data && data.length > 0) {
      setTinNhanList((prev) => [...prev, data[0]]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-xl mx-auto p-4">
      <h1 className="text-lg font-bold mb-2 text-center text-gray-800">
        Panel Trả Lời Tin Nhắn (Dành Cho Thợ)
      </h1>

      {/* Khung hiển thị danh sách tin nhắn */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 border rounded-t-xl bg-white shadow-inner">
        {tinNhanList.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Chưa có tin nhắn nào.</div>
        ) : (
          tinNhanList.map((msg, index) => {
            const isTho = msg.sender_type === 'tho';
            return (
              <div
                key={msg.id || index}
                className={`flex ${isTho ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[80%] text-sm shadow-sm ${
                    isTho
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-black rounded-bl-none'
                  }`}
                >
                  {msg.noi_dung}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form trả lời của Thợ */}
      <form onSubmit={handlePhanHoi} className="p-3 bg-gray-100 border border-t-0 rounded-b-xl flex gap-2">
        <input
          type="text"
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          placeholder="Thợ trả lời..."
          className="flex-1 border p-2 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Trả lời
        </button>
      </form>
    </div>
  );
}