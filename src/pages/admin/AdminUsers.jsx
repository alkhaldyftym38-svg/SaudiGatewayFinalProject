import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  MessageSquare, Users, Mail, Clock, Shield, Ban, Trash2, RotateCcw,
  Reply, Check, CheckCheck, Send, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../lib/formatLocale';
import ListToolbar, { FilterSelect } from '../../components/ui/ListToolbar';
import Pagination from '../../components/ui/Pagination';
import ListState from '../../components/ui/ListState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { usePaginatedList } from '../../hooks/usePaginatedList';

const PAGE_SIZE = 10;

function UsersTab({ ar, t, language }) {
  const { sessionUser } = useApp();
  const [search, setSearch] = useState('');
  const [userRole, setUserRole] = useState('all');
  const [accountStatus, setAccountStatus] = useState('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [acting, setActing] = useState(false);

  const filters = useMemo(
    () => ({ search, userRole, accountStatus, includeDeleted }),
    [search, userRole, accountStatus, includeDeleted],
  );

  const {
    items: users,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    fetching,
    error,
    reload,
  } = usePaginatedList({
    table: 'profiles',
    pageSize: PAGE_SIZE,
    order: { column: 'created_at', ascending: false },
    filters,
    searchColumns: ['name', 'email'],
  });

  const roleOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'admin', label: ar ? 'مسؤول' : 'Admin' },
    { value: 'visitor', label: ar ? 'زائر' : 'Visitor' },
  ];

  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'active', label: ar ? 'نشط' : 'Active' },
    { value: 'blocked', label: ar ? 'محظور' : 'Blocked' },
  ];

  const canModerate = (user) => {
    if (user.id === sessionUser?.id) return false;
    if (user.role === 'admin') return false;
    return true;
  };

  const runAction = async () => {
    if (!confirm) return;
    setActing(true);
    const { user, action } = confirm;
    let patch = {};
    if (action === 'block') patch = { is_blocked: true };
    if (action === 'unblock') patch = { is_blocked: false };
    if (action === 'delete') patch = { deleted_at: new Date().toISOString() };
    if (action === 'restore') patch = { deleted_at: null, is_blocked: false };

    const { error: err } = await supabase.from('profiles').update(patch).eq('id', user.id);
    setActing(false);
    setConfirm(null);
    if (!err) reload();
  };

  const confirmCopy = () => {
    if (!confirm) return { title: '', message: '' };
    const { user, action } = confirm;
    const name = user.name;
    if (action === 'block') {
      return {
        title: ar ? 'حظر المستخدم؟' : 'Block user?',
        message: ar
          ? `هل تريد حظر «${name}»؟ لن يتمكن من تسجيل الدخول.`
          : `Block "${name}"? They will not be able to sign in.`,
      };
    }
    if (action === 'unblock') {
      return {
        title: ar ? 'إلغاء الحظر؟' : 'Unblock user?',
        message: ar ? `إلغاء حظر «${name}»؟` : `Unblock "${name}"?`,
      };
    }
    if (action === 'delete') {
      return {
        title: ar ? 'حذف المستخدم؟' : 'Delete user?',
        message: ar
          ? `حذف «${name}» من القائمة؟ (حذف منطقي — يبقى في Auth)`
          : `Remove "${name}" from the list? (Soft delete — Auth account remains)`,
      };
    }
    return {
      title: ar ? 'استعادة المستخدم؟' : 'Restore user?',
      message: ar ? `استعادة «${name}»؟` : `Restore "${name}"?`,
    };
  };

  const fmt = (d) => d
    ? formatDate(d, ar ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={ar ? 'بحث بالاسم أو البريد...' : 'Search name or email...'}
        ar={ar}
      >
        <FilterSelect
          value={userRole}
          onChange={setUserRole}
          options={roleOptions}
          label={ar ? 'الدور' : 'Role'}
          ar={ar}
        />
        <FilterSelect
          value={accountStatus}
          onChange={setAccountStatus}
          options={statusOptions}
          label={ar ? 'الحالة' : 'Status'}
          ar={ar}
        />
      </ListToolbar>

      <label className="flex items-center gap-2 mb-4 text-sm text-on-surface-variant cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={includeDeleted}
          onChange={e => setIncludeDeleted(e.target.checked)}
          className="rounded border-outline-variant/40 text-primary focus:ring-primary/30"
        />
        {ar ? 'إظهار المحذوفين' : 'Show deleted users'}
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
          {ar
            ? `تعذّر تحميل المستخدمين: ${error}. شغّل ترحيل 009 و 010 في Supabase SQL Editor.`
            : `Could not load users: ${error}. Run migrations 009 and 010 in Supabase SQL Editor.`}
        </p>
      )}

      <ListState
        loading={loading}
        fetching={fetching}
        isEmpty={!error && users.length === 0}
        emptyMessage={t('common.noResults')}
        minHeight="min-h-[280px]"
      >
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15 bg-surface-container-low">
                  <th className="text-start px-5 py-3 text-on-surface-variant font-semibold">{ar ? 'الاسم' : 'Name'}</th>
                  <th className="text-start px-4 py-3 text-on-surface-variant font-semibold hidden sm:table-cell">{ar ? 'البريد' : 'Email'}</th>
                  <th className="text-start px-4 py-3 text-on-surface-variant font-semibold">{ar ? 'الدور' : 'Role'}</th>
                  <th className="text-start px-4 py-3 text-on-surface-variant font-semibold hidden md:table-cell">{ar ? 'تاريخ التسجيل' : 'Joined'}</th>
                  <th className="px-4 py-3 text-on-surface-variant font-semibold">{ar ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className={clsx(
                      'border-b border-outline-variant/10 last:border-0 hover:bg-surface-container',
                      user.deleted_at && 'opacity-60',
                    )}
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-on-surface">{user.name}</p>
                      {user.id === sessionUser?.id && (
                        <span className="text-[10px] text-on-surface-variant">{ar ? '(أنت)' : '(you)'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{user.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded-full text-xs font-semibold',
                            user.role === 'admin'
                              ? 'bg-primary/15 text-primary'
                              : 'bg-surface-container text-on-surface-variant',
                          )}
                        >
                          {user.role === 'admin' ? (ar ? 'مسؤول' : 'Admin') : (ar ? 'زائر' : 'Visitor')}
                        </span>
                        {user.is_blocked && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            {ar ? 'محظور' : 'Blocked'}
                          </span>
                        )}
                        {user.deleted_at && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                            {ar ? 'محذوف' : 'Deleted'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">{fmt(user.created_at)}</td>
                    <td className="px-4 py-3">
                      {user.deleted_at ? (
                        canModerate(user) && (
                          <button
                            type="button"
                            onClick={() => setConfirm({ user, action: 'restore' })}
                            className="p-1.5 rounded-lg hover:bg-surface-container text-primary"
                            title={ar ? 'استعادة' : 'Restore'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )
                      ) : canModerate(user) ? (
                        <div className="flex gap-1">
                          {user.is_blocked ? (
                            <button
                              type="button"
                              onClick={() => setConfirm({ user, action: 'unblock' })}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                              title={ar ? 'إلغاء الحظر' : 'Unblock'}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirm({ user, action: 'block' })}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"
                              title={ar ? 'حظر' : 'Block'}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setConfirm({ user, action: 'delete' })}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title={ar ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          lang={language}
        />
      </ListState>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => !acting && setConfirm(null)}
        onConfirm={runAction}
        loading={acting}
        {...confirmCopy()}
        confirmLabel={ar ? 'نعم' : 'Yes'}
        cancelLabel={ar ? 'إلغاء' : 'Cancel'}
        variant="danger"
      />
    </>
  );
}

const MESSAGE_STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-800',
  read: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

function isFunctionUnavailable(error) {
  if (!error) return false;
  const msg = `${error.message ?? ''} ${error.name ?? ''}`.toLowerCase();
  return msg.includes('404')
    || msg.includes('failed to send')
    || msg.includes('functionsfetcherror')
    || msg.includes('cors')
    || msg.includes('preflight');
}

async function saveReplyLocally(messageId, adminId, replyText) {
  const { error: insertErr } = await supabase.from('support_message_replies').insert({
    message_id: messageId,
    admin_id: adminId,
    body: replyText,
  });
  if (insertErr) return insertErr;
  const { error: updateErr } = await supabase
    .from('support_messages')
    .update({ status: 'read', last_reply_at: new Date().toISOString() })
    .eq('id', messageId);
  return updateErr;
}

function MessageReplyPanel({ msg, ar, t, acting, setActing, onSent, fmt }) {
  const { sessionUser } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [history, setHistory] = useState([]);
  const [sendError, setSendError] = useState('');
  const [sendOk, setSendOk] = useState(false);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('support_message_replies')
      .select('id, body, created_at')
      .eq('message_id', msg.id)
      .order('created_at', { ascending: true });
    setHistory(data ?? []);
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    setSendError('');
    setSendOk(false);
    if (next) loadHistory();
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!draft.trim() || acting) return;
    const text = draft.trim();
    setActing(true);
    setSendError('');
    setSendOk(false);

    const finishOk = async (notice) => {
      setDraft('');
      setSendOk(true);
      if (notice) setSendError(notice);
      await loadHistory();
      onSent();
    };

    const { data, error } = await supabase.functions.invoke('send-support-reply', {
      body: { messageId: msg.id, replyText: text },
    });

    if (error) {
      if (isFunctionUnavailable(error) && sessionUser?.id) {
        const localErr = await saveReplyLocally(msg.id, sessionUser.id, text);
        setActing(false);
        if (!localErr) {
          await finishOk(t('adminSupport.functionNotDeployed'));
          return;
        }
      }
      setActing(false);
      setSendError(
        isFunctionUnavailable(error)
          ? t('adminSupport.functionNotDeployed')
          : t('adminSupport.replyError'),
      );
      return;
    }

    if (data?.error === 'save_failed') {
      setActing(false);
      setSendError(t('adminSupport.replyError'));
      return;
    }

    if (data?.error) {
      setActing(false);
      setSendError(t('adminSupport.replyError'));
      return;
    }

    setActing(false);
    if (data?.ok && data?.emailSent === false) {
      let notice = t('adminSupport.emailNotConfigured');
      if (data.warning === 'send_failed') {
        const parts = [t('adminSupport.emailSendFailed')];
        if (data.fromEmail && data.toEmail) {
          parts.push(t('adminSupport.emailRoute', { from: data.fromEmail, to: data.toEmail }));
        }
        if (data.detail) parts.push(t('adminSupport.emailSendFailedDetail', { detail: data.detail }));
        if (data.hintCode === 'invalid_credentials' || data.hintCode === 'app_password_required') {
          parts.push(t('adminSupport.hintInvalidCredentials'));
          parts.push(t('adminSupport.hintGmailSetup'));
        } else if (data.warning === 'email_not_configured') {
          parts.push(t('adminSupport.hintGmailSetup'));
        }
        notice = parts.join(' ');
      }
      setSendError(notice);
      return;
    }
    await finishOk('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-outline-variant/15">
      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        <Reply className="w-3.5 h-3.5" />
        {t('adminSupport.reply')}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-on-surface-variant mb-2">{t('adminSupport.replyHistory')}</p>
              <div className="space-y-2">
                {history.map((r) => (
                  <div key={r.id} className="bg-primary/5 rounded-xl px-4 py-3 text-sm text-on-surface">
                    <p className="text-[10px] text-on-surface-variant mb-1">{fmt(r.created_at)}</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={sendReply} className="space-y-3">
            <textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('adminSupport.replyPlaceholder')}
              className="input-field resize-none w-full text-sm"
              required
            />
            {sendError && (
              <p className={clsx(
                'text-xs rounded-lg px-3 py-2',
                sendOk ? 'text-amber-800 bg-amber-500/10' : 'text-red-600 bg-red-500/10',
              )}
              >
                {sendError}
              </p>
            )}
            {sendOk && !sendError && (
              <p className="text-xs text-green-700 bg-green-500/10 rounded-lg px-3 py-2">{t('adminSupport.replySent')}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={acting || !draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:brightness-105 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {acting ? (ar ? 'جارٍ الإرسال...' : 'Sending...') : t('adminSupport.sendReply')}
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setDraft(''); setSendError(''); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              >
                <X className="w-3.5 h-3.5" />
                {t('adminSupport.cancelReply')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MessagesTab({ ar, t, language }) {
  const [search, setSearch] = useState('');
  const [messageStatus, setMessageStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [acting, setActing] = useState(false);

  const filters = useMemo(() => ({ search, messageStatus }), [search, messageStatus]);

  const {
    items: messages,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    fetching,
    error,
    reload,
  } = usePaginatedList({
    table: 'support_messages',
    pageSize: PAGE_SIZE,
    order: { column: 'created_at', ascending: false },
    filters,
    searchColumns: ['name', 'email', 'subject', 'message'],
  });

  const statusOptions = [
    { value: 'all', label: t('adminSupport.statusAll') },
    { value: 'pending', label: t('adminSupport.statusPending') },
    { value: 'read', label: t('adminSupport.statusRead') },
    { value: 'resolved', label: t('adminSupport.statusResolved') },
  ];

  const statusLabel = (status) => {
    if (status === 'read') return t('adminSupport.statusRead');
    if (status === 'resolved') return t('adminSupport.statusResolved');
    return t('adminSupport.statusPending');
  };

  const updateStatus = async (id, status) => {
    setActing(true);
    const { error: err } = await supabase.from('support_messages').update({ status }).eq('id', id);
    setActing(false);
    if (!err) reload();
  };

  const deleteMessage = async () => {
    if (!confirmDelete) return;
    setActing(true);
    const { error: err } = await supabase.from('support_messages').delete().eq('id', confirmDelete.id);
    setActing(false);
    setConfirmDelete(null);
    if (!err) reload();
  };

  const fmt = (d) => d
    ? formatDate(d, ar ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const needsMigration = error?.includes('status') || error?.includes('column');

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={ar ? 'بحث بالاسم أو البريد أو الرسالة...' : 'Search name, email, or message...'}
        ar={ar}
      >
        <FilterSelect
          value={messageStatus}
          onChange={setMessageStatus}
          options={statusOptions}
          label={t('adminSupport.filterStatus')}
          ar={ar}
        />
      </ListToolbar>

      {error && (
        <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-3 py-2 mb-4" role="alert">
          {error}
          {needsMigration && (
            <span className="block mt-1 text-on-surface-variant">{t('adminSupport.migrateHint')}</span>
          )}
        </p>
      )}

      <ListState
        loading={loading}
        fetching={fetching}
        isEmpty={!error && messages.length === 0}
        emptyMessage={t('common.noResults')}
        minHeight="min-h-[280px]"
      >
        <div className="space-y-4">
          {messages.map(msg => {
            const status = msg.status ?? 'pending';
            return (
            <div
              key={msg.id}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-bold text-on-surface">{msg.name}</p>
                    {msg.subject && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs text-on-surface-variant">
                        {msg.subject}
                      </span>
                    )}
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        MESSAGE_STATUS_STYLE[status] ?? MESSAGE_STATUS_STYLE.pending,
                      )}
                    >
                      {statusLabel(status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{msg.email}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(msg.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {status === 'pending' && (
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => updateStatus(msg.id, 'read')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t('adminSupport.statusRead')}
                    </button>
                  )}
                  {status !== 'resolved' && (
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => updateStatus(msg.id, 'resolved')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t('adminSupport.statusResolved')}
                    </button>
                  )}
                  {status === 'resolved' && (
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => updateStatus(msg.id, 'pending')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {t('adminSupport.reopen')}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => setConfirmDelete(msg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('adminSupport.delete')}
                  </button>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed bg-surface rounded-xl px-4 py-3">
                {msg.message}
              </p>
              <MessageReplyPanel
                msg={msg}
                ar={ar}
                t={t}
                acting={acting}
                setActing={setActing}
                onSent={reload}
                fmt={fmt}
              />
            </div>
            );
          })}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          lang={language}
        />
      </ListState>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => !acting && setConfirmDelete(null)}
        onConfirm={deleteMessage}
        loading={acting}
        title={t('adminSupport.deleteTitle')}
        message={t('adminSupport.deleteMessage')}
        confirmLabel={ar ? 'نعم' : 'Yes'}
        cancelLabel={ar ? 'إلغاء' : 'Cancel'}
        variant="danger"
      />
    </>
  );
}

export default function AdminUsers() {
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(() => (
    searchParams.get('tab') === 'messages' ? 'messages' : 'users'
  ));

  useEffect(() => {
    setTab(searchParams.get('tab') === 'messages' ? 'messages' : 'users');
  }, [searchParams]);

  const selectTab = (id) => {
    setTab(id);
    if (id === 'messages') {
      setSearchParams({ tab: 'messages' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const tabs = [
    { id: 'users', label: ar ? 'المستخدمون' : 'Users', icon: Users },
    { id: 'messages', label: ar ? 'رسائل الدعم' : 'Support Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-on-surface">
            {ar ? 'المستخدمون والدعم' : 'Users & Support'}
          </h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors',
                tab === id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'users' ? (
          <UsersTab ar={ar} t={t} language={language} />
        ) : (
          <MessagesTab ar={ar} t={t} language={language} />
        )}
      </div>
    </div>
  );
}
