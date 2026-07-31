import React from 'react';
import { LOG_DATA } from '../mockData.js';

function LogContent() {
  return (
    <div className="w-full" data-ai-alt="日志表格容器" data-ai-changelog-id="func-log-table" data-ai-changelog-title="操作日志列表" data-ai-changelog-desc="记录操作人、操作内容和操作时间。">
      <table className="w-full text-sm text-left border-collapse" data-ai-alt="日志表格">
        <thead className="bg-gray-50 border-y" data-ai-alt="表头">
          <tr>
            <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-操作人">操作人</th>
            <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-操作内容">操作内容</th>
            <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-操作时间">操作时间</th>
          </tr>
        </thead>
        <tbody data-ai-list="true" data-ai-alt="表格主体">
          {LOG_DATA.map((log, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50" data-ai-alt={`日志行-${idx}`}>
              <td className="py-3 px-4" data-ai-alt="单元格-操作人">{log.operator}</td>
              <td className="py-3 px-4 text-blue-600" data-ai-alt="单元格-操作内容">{log.action}</td>
              <td className="py-3 px-4 text-gray-500" data-ai-alt="单元格-操作时间">{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogContent;