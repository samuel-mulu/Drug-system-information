interface UserStatusActionProps {
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  loading?: boolean;
}

export default function UserStatusAction({ isActive, onActivate, onDeactivate, loading }: UserStatusActionProps) {
  if (isActive) {
    return (
      <button
        onClick={onDeactivate}
        disabled={loading}
        style={{
          padding: '6px 12px',
          backgroundColor: loading ? '#9ca3af' : '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Deactivating...' : 'Deactivate'}
      </button>
    );
  }

  return (
    <button
      onClick={onActivate}
      disabled={loading}
      style={{
        padding: '6px 12px',
        backgroundColor: loading ? '#9ca3af' : '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Activating...' : 'Activate'}
    </button>
  );
}
