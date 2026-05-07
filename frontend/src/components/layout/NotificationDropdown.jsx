import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle2, Info, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { usePageTranslation } from '../../hooks/usePageTranslation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationDropdown({ onClose, anchorRef }) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, loading } = useNotifications();
  const { getTranslatedText } = usePageTranslation([
    'Notifications', 'Mark all as read', 'View all', 'No notifications', 
    'Just now', 'Today', 'Yesterday', 'Clear'
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} color="#16A34A" />;
      case 'warning': return <AlertTriangle size={16} color="#EAB308" />;
      default: return <Info size={16} color="#3B82F6" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'success': return '#DCFCE7';
      case 'warning': return '#FEF9C3';
      default: return '#DBEAFE';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 1000 }} 
        onClick={onClose} 
      />
      
      {/* Dropdown Container */}
      <div style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: -10,
        width: '320px',
        maxHeight: '480px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.06)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInUp 0.2s ease both'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              {getTranslatedText('Notifications')}
            </h3>
            {unreadCount > 0 && (
              <span style={{ 
                background: '#EF4444', color: 'white', fontSize: '0.65rem', 
                padding: '2px 6px', borderRadius: '6px', fontWeight: 900 
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markRead('all')}
              style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {getTranslatedText('Clear')}
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Loader2 size={24} className="spin" color="#6366F1" />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Bell size={20} color="#94A3B8" />
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>{getTranslatedText('No notifications')}</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div 
                key={n._id}
                onClick={() => {
                  markRead(n._id);
                  if (n.link) navigate(n.link);
                  onClose();
                }}
                style={{
                  padding: '12px 20px',
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                  transition: 'background 0.2s',
                  borderLeft: n.read ? '3px solid transparent' : '3px solid #6366F1'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)'}
              >
                <div style={{ 
                  width: 32, height: 32, borderRadius: '10px', 
                  background: getBg(n.type), display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: n.read ? 600 : 800, color: '#1E293B', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
                    {dayjs(n.createdAt).fromNow()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <button 
          onClick={() => { navigate('/notifications'); onClose(); }}
          style={{ 
            padding: '14px', borderTop: '1px solid #F1F5F9', 
            background: '#F8FAFC', border: 'none', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, color: '#6366F1', fontSize: '0.8rem', fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {getTranslatedText('View all')} <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
