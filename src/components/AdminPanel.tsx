import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { LAUNCHER_ADDRESS, LAUNCHER_ABI } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminPanel() {
  const { address } = useAccount();
  const [newMinEth, setNewMinEth] = useState('');
  const [tokenToWithdraw, setTokenToWithdraw] = useState('');

  const { data: owner } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'owner',
  });

  const { data: currentMinEth } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'minLaunchEth',
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  if (!address || !isOwner) return null;

  const handleSetMinEth = async () => {
    if (!newMinEth || isNaN(Number(newMinEth)) || Number(newMinEth) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: LAUNCHER_ADDRESS,
        abi: LAUNCHER_ABI,
        functionName: 'setMinLaunchEth',
        args: [parseEther(newMinEth)],
      } as any);
      setTxHash(hash);
      toast.success('Min launch ETH updated!');
      setNewMinEth('');
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const handleEmergencyWithdraw = async () => {
    try {
      const hash = await writeContractAsync({
        address: LAUNCHER_ADDRESS,
        abi: LAUNCHER_ABI,
        functionName: 'emergencyWithdraw',
      } as any);
      setTxHash(hash);
      toast.success('ETH withdrawn!');
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const handleEmergencyWithdrawToken = async () => {
    if (!isAddress(tokenToWithdraw)) {
      toast.error('Please enter a valid token address');
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: LAUNCHER_ADDRESS,
        abi: LAUNCHER_ABI,
        functionName: 'emergencyWithdrawToken',
        args: [tokenToWithdraw as `0x${string}`],
      } as any);
      setTxHash(hash);
      toast.success('Tokens withdrawn!');
      setTokenToWithdraw('');
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Admin Panel</CardTitle>
        </div>
        <CardDescription>Owner-only contract management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Set Minimum Launch ETH</label>
          <p className="text-xs text-muted-foreground">Current: {currentMinEth ? formatEther(currentMinEth) : '0.1'} ETH</p>
          <div className="flex gap-2">
            <Input type="number" step="0.01" placeholder="0.1" value={newMinEth} onChange={(e) => setNewMinEth(e.target.value)} />
            <Button variant="outline" onClick={handleSetMinEth} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />Emergency Withdraw ETH
          </label>
          <Button variant="destructive" onClick={handleEmergencyWithdraw} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Withdraw All ETH
          </Button>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />Emergency Withdraw Token
          </label>
          <div className="flex gap-2">
            <Input placeholder="Token address (0x...)" value={tokenToWithdraw} onChange={(e) => setTokenToWithdraw(e.target.value)} />
            <Button variant="destructive" onClick={handleEmergencyWithdrawToken} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
