import React from 'react';
import { User, sanitizeFlagEmoji } from '../types';

interface StandingsProps {
  users: (User & { totalPoints: number; weekPoints?: number; avgPoints?: number })[];
}

const Standings: React.FC<StandingsProps> = ({ users }) => {
  return (
    <div className="card-base overflow-hidden">
      <div className="bg-[#006d32]/5 p-4 border-b border-[#e0e3e6]">
        <h2 className="text-[#006d32] font-black uppercase tracking-widest text-lg font-display">PUAN DURUMU</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-tighter border-b border-[#e0e3e6]">
              <th className="px-6 py-4 font-bold">#</th>
              <th className="px-6 py-4 font-bold">Kullanıcı</th>
              <th className="px-6 py-4 font-bold text-center">Toplam Puan</th>
              <th className="px-6 py-4 font-bold text-center">Bu Hafta</th>
              <th className="px-6 py-4 font-bold text-center">Ortalama Puan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              let rowStyle = "border-b border-gray-100 hover:bg-gray-50 transition-colors";
              if (index === 0) rowStyle = "bg-[#006d32]/5 border-b border-[#006d32]/25 hover:bg-[#006d32]/10 transition-colors font-bold";
              else if (index === 1) rowStyle = "bg-[#0058bc]/5 border-b border-[#0058bc]/15 hover:bg-[#0058bc]/10 transition-colors";
              else if (index === 2) rowStyle = "bg-amber-500/5 border-b border-amber-500/15 hover:bg-amber-500/10 transition-colors";

              return (
                <tr key={user.id} className={rowStyle}>
                  <td className="px-6 py-4 font-bold text-gray-400">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl relative">
                        {sanitizeFlagEmoji(user.flagEmoji)}
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
                      <span className="font-bold text-[#191c1e] tracking-tight">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[#0058bc] font-black text-lg">{user.totalPoints}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.weekPoints !== undefined ? (
                      <span className="bg-[#006d32]/10 text-[#006d32] px-2.5 py-1 rounded-xl text-xs font-black tracking-wide border border-[#006d32]/15">
                        +{user.weekPoints}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 text-sm">
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
