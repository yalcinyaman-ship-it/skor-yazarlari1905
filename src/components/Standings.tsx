import React from 'react';
import { User } from '../types';
import UserFlag from './UserFlag';

interface StandingsProps {
  users: (User & { totalPoints: number; weekPoints?: number; avgPoints?: number })[];
}

const Standings: React.FC<StandingsProps> = ({ users }) => {
  return (
    <div className="card-base overflow-hidden border border-[#EAE6DF]">
      <div className="bg-[#FAF8F5] p-4 border-b border-[#EAE6DF]">
        <h2 className="text-[#1A1A1A] font-bold uppercase tracking-wider text-base font-display">Puan Durumu</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[#6B6760] text-xs uppercase tracking-wider border-b border-[#EAE6DF] bg-[#FAF8F5]/50">
              <th className="px-6 py-4 font-bold">#</th>
              <th className="px-6 py-4 font-bold">Kullanıcı</th>
              <th className="px-6 py-4 font-bold text-center">Toplam Puan</th>
              <th className="px-6 py-4 font-bold text-center">Bu Hafta</th>
              <th className="px-6 py-4 font-bold text-center">Ortalama Puan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              let rowStyle = "border-b border-[#EAE6DF] hover:bg-[#FAF8F5] transition";
              if (index === 0) rowStyle = "bg-[#FDF4F0]/60 border-b border-[#F3DCD2] hover:bg-[#FDF4F0] transition font-bold";

              return (
                <tr key={user.id} className={rowStyle}>
                  <td className="px-6 py-4 font-bold text-[#6B6760]">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
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
                      <span className="font-bold text-[#1A1A1A] tracking-tight">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[#D96B43] font-bold text-lg">{user.totalPoints}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.weekPoints !== undefined ? (
                      <span className="bg-[#EDF7F2] text-[#2D8A66] px-2.5 py-1 rounded-xl text-xs font-bold tracking-wide border border-[#D0EADB]">
                        +{user.weekPoints}
                      </span>
                    ) : (
                      <span className="text-[#6B6760]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-[#6B6760] text-sm font-medium">
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
