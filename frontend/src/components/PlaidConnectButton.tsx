import { usePlaid } from '@/hooks/usePlaid';
import { Loader2 } from 'lucide-react';

interface PlaidConnectButtonProps {
  onSuccess?: () => void;
}

export const PlaidConnectButton = ({ onSuccess }: PlaidConnectButtonProps) => {
  const { open, ready, loading } = usePlaid(onSuccess);

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: ready && !loading ? "#10B981" : "#9CA3AF" }}
      onMouseEnter={(e) => {
        if (ready && !loading) e.currentTarget.style.background = "#059669";
      }}
      onMouseLeave={(e) => {
        if (ready && !loading) e.currentTarget.style.background = "#10B981";
      }}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        '+ Add Bank Account'
      )}
    </button>
  );
};
