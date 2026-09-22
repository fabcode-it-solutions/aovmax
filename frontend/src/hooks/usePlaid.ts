import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const usePlaid = (onSuccess?: () => void) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createLinkToken = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const data = await api.createPlaidLinkToken(session.access_token);
      
      if (data.link_token) {
        setLinkToken(data.link_token);
      } else {
        throw new Error(data.error || 'Failed to create link token');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initialize Plaid',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const onPlaidSuccess = useCallback(async (public_token: string, metadata: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const data = await api.exchangePlaidToken(session.access_token, {
        public_token,
        account_id: metadata.account_id,
        institution_name: metadata.institution?.name,
        account_name: metadata.account?.name,
        account_subtype: metadata.account?.subtype,
        mask: metadata.account?.mask,
      });

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Bank account connected successfully!',
        });
        // Call the onSuccess callback to refetch data
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.error || 'Failed to connect account');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect account',
        variant: 'destructive',
      });
    }
  }, [toast, onSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });

  useEffect(() => {
    createLinkToken();
  }, [createLinkToken]);

  return {
    open,
    ready: ready && !loading,
    loading,
  };
};
