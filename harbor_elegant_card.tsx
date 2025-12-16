import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, Server, User, Lock, Zap } from 'lucide-react';

export default function HarborElegantCard() {
  const [activeTab, setActiveTab] = useState('light');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, testing, success, error

  // 浅色现代简洁版
  const LightVersion = () => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-8">
      <div className="max-w-3xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Harbor 连接配置</h1>
          <p className="text-gray-500 text-sm">配置并管理远程 Harbor 仓库连接</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* 连接状态指示 */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
            <span className="text-sm text-gray-600">已连接到 Harbor</span>
          </div>

          <div className="space-y-7">
            {/* Harbor 地址 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server size={18} className="text-blue-500" />
                <label className="text-sm font-semibold text-gray-800">Harbor 地址</label>
              </div>
              <input
                type="text"
                defaultValue="https://10.3.2.40"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400"
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500 mt-2">输入 Harbor 服务器的完整地址</p>
            </div>

            {/* 用户名 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-purple-500" />
                <label className="text-sm font-semibold text-gray-800">用户名</label>
              </div>
              <input
                type="text"
                defaultValue="kingo_oa"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition placeholder-gray-400"
                placeholder="输入用户名"
              />
              <p className="text-xs text-gray-500 mt-2">用于连接 Harbor 的用户账户</p>
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={18} className="text-pink-500" />
                <label className="text-sm font-semibold text-gray-800">密码</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition placeholder-gray-400"
                  placeholder="输入密码"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">安全存储，不会明文显示</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform active:scale-95">
                保存配置
              </button>
              <button 
                onClick={() => setConnectionStatus('testing')}
                className="px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition active:bg-gray-100"
              >
                测试连接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 深色专业版
  const DarkVersion = () => (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen p-8">
      <div className="max-w-3xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Harbor 连接配置</h1>
          <p className="text-slate-400 text-sm">配置并管理远程 Harbor 仓库连接</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-750 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* 连接状态指示 */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-cyan-400" />
              <span className="text-sm text-slate-300">连接就绪</span>
            </div>
          </div>

          <div className="space-y-7">
            {/* Harbor 地址 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server size={18} className="text-cyan-400" />
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Harbor 地址</label>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  defaultValue="https://10.3.2.40"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition group-focus-within:border-cyan-400"
                  placeholder="https://example.com"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">输入 Harbor 服务器的完整地址</p>
            </div>

            {/* 用户名 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-blue-400" />
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wide">用户名</label>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  defaultValue="kingo_oa"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition group-focus-within:border-blue-400"
                  placeholder="输入用户名"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">用于连接 Harbor 的用户账户</p>
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={18} className="text-purple-400" />
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wide">密码</label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition group-focus-within:border-purple-400"
                  placeholder="输入密码"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">安全存储，不会明文显示</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition active:scale-95">
                保存配置
              </button>
              <button className="px-6 py-3 border-2 border-slate-600 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 hover:border-slate-500 transition active:bg-slate-600">
                测试连接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* 版本切换标签 */}
      <div className="flex gap-2 bg-gray-200 dark:bg-gray-800 p-3 sticky top-0 z-50">
        <button
          onClick={() => setActiveTab('light')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'light'
              ? 'bg-white text-blue-600 shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-150'
          }`}
        >
          现代简洁版
        </button>
        <button
          onClick={() => setActiveTab('dark')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'dark'
              ? 'bg-slate-800 text-cyan-400 shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-150'
          }`}
        >
          深色专业版
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'light' ? <LightVersion /> : <DarkVersion />}
    </div>
  );
}