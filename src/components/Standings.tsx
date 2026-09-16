import React from 'react';
import { User } from '../types';
import UserFlag from './UserFlag';
import { Trophy } from 'lucide-react';

interface StandingsProps {
  users: (User & { totalPoints: number; weekPoints?: number; avgPoints?: number })[];
}

const Standings: React.FC<StandingsProps> = ({ users }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#1E3A8A]" />
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#0F172A]">
            Puan Durumu
          </h2>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
          {users.length} Yazar
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/70 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <th className="px-6 py-3.5 font-bold">#</th>
              <th className="px-6 py-3.5 font-bold">Kullanıcı</th>
              <th className="px-6 py-3.5 font-bold text-center">Toplam Puan</th>
              <th className="px-6 py-3.5 font-bold text-center">Bu Hafta</th>
              <th className="px-6 py-3.5 font-bold text-center">Ortalama Puan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {users.map((user, index) => {
              let rowStyle = "hover:bg-[#F8FAFC] transition duration-150";
              if (index === 0) rowStyle = "bg-amber-50/40 hover:bg-amber-50/70 transition font-bold";

              return (
                <tr key={user.id} className={rowStyle}>
                  <td className="px-6 py-4 font-bold text-[#475569]">
                    {index === 0 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-xs font-black text-white shadow-xs">
                        1
                      </span>
                    ) : index === 1 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white shadow-2xs">
                        2
                      </span>
                    ) : index === 2 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white shadow-2xs">
                        3
                      </span>
                    ) : (
                      <span className="pl-1.5 text-xs text-[#64748B]">{index + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex items-center justify-center">
                        <UserFlag flagEmoji={user.flagEmoji} className="h-7 w-7 text-2xl" />
                        {user.colors && user.colors.length > 0 && (
                          <div 
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full opacity-80"
                            style={{
                              background: user.colors.length > 1 
                                ? `linear-gradient(to right, ${user.colors.join(', ')})`
                                : user.colors[0]
                            }}
                          />
                        )}
                      </span>
                      <span className={`font-bold tracking-tight text-[#0F172A] ${index === 0 ? "text-base font-serif" : "text-sm"}`}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-mono text-lg font-black ${index === 0 ? "text-[#1E3A8A]" : "text-[#0F172A]"}`}>
                      {user.totalPoints}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.weekPoints !== undefined ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-bold text-[#047857]">
                        +{user.weekPoints}
                      </span>
                    ) : (
                      <span className="text-[#94A3B8]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-sm font-semibold text-[#475569]">
                    {user.avgPoints?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;
