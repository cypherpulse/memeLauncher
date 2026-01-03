import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, parseUnits } from 'viem';
import { LAUNCHER_ADDRESS, LAUNCHER_ABI, BASESCAN_URL, UNISWAP_URL } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Loader2, Copy, Check, ExternalLink, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface LaunchSuccessData {
  tokenAddress: string;
  txHash: string;
  name: string;
  symbol: string;
}

export function LauncherInterface() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('1000000000');
  const [liquidityPercent, setLiquidityPercent] = useState('20');
  const [ethAmount, setEthAmount] = useState('0.1');
  const [launchSuccess, setLaunchSuccess] = useState<LaunchSuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: minLaunchEth } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'minLaunchEth',
  });

  const minEth = minLaunchEth ? Number(formatEther(minLaunchEth)) : 0.1;
  const ethValue = parseFloat(ethAmount) || 0;
  const launchFee = ethValue * 0.01;
  const netLiquidity = ethValue - launchFee;

  const isValidForm = name.trim().length > 0 && symbol.trim().length > 0 && parseFloat(totalSupply) > 0 &&
    parseFloat(liquidityPercent) > 0 && parseFloat(liquidityPercent) <= 100 && ethValue >= minEth;

  const { writeContractAsync, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: txReceipt } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash && txReceipt) {
      const tokenAddress = txReceipt.logs[0]?.topics?.[2] 
        ? `0x${txReceipt.logs[0].topics[2].slice(26)}` : null;
      if (tokenAddress) {
        setLaunchSuccess({ tokenAddress, txHash, name, symbol });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00FFD1', '#A855F7', '#22C55E'] });
      }
    }
  }, [isSuccess, txHash, txReceipt, name, symbol]);

  const handleLaunch = async () => {
    if (!isValidForm) { toast.error('Please fill all fields correctly'); return; }
    try {
      const supplyInWei = parseUnits(totalSupply, 18);
      await writeContractAsync({
        address: LAUNCHER_ADDRESS,
        abi: LAUNCHER_ABI,
        functionName: 'launchMeme',
        args: [name, symbol, supplyInWei, BigInt(liquidityPercent)],
        value: parseEther(ethAmount),
      } as any);
    } catch (error: any) {
      toast.error(`Launch failed: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleShare = () => {
    if (!launchSuccess) return;
    const text = `🚀 Just launched ${launchSuccess.name} ($${launchSuccess.symbol}) on @base!\n\nToken: ${launchSuccess.tokenAddress}\n\n#Base #Memecoins`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleNewLaunch = () => { setLaunchSuccess(null); setName(''); setSymbol(''); setTotalSupply('1000000000'); setLiquidityPercent('20'); setEthAmount('0.1'); reset(); };

  if (launchSuccess) {
    return (
      <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary text-glow">Meme Launched! 🎉</CardTitle>
          <CardDescription className="text-base">{launchSuccess.name} (${launchSuccess.symbol}) is now live</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Token Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-foreground flex-1 truncate">{launchSuccess.tokenAddress}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(launchSuccess.tokenAddress)}>
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" asChild className="w-full"><a href={`${BASESCAN_URL}/tx/${launchSuccess.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center"><ExternalLink className="h-4 w-4 mr-2" />View TX</a></Button>
            <Button variant="outline" asChild className="w-full"><a href={`${UNISWAP_URL}/#/swap?chain=base_sepolia&outputCurrency=${launchSuccess.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center"><ExternalLink className="h-4 w-4 mr-2" />Trade</a></Button>
          </div>
          <Button variant="purple" className="w-full" onClick={handleShare}><Share2 className="h-4 w-4 mr-2" />Share on X</Button>
          <Button variant="glass" className="w-full" onClick={handleNewLaunch}>Launch Another Meme</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl sm:text-2xl text-foreground">Launch Your Meme</CardTitle>
        <CardDescription className="text-sm sm:text-base">Create your token and add liquidity in one transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Token Name</label><Input placeholder="DogeMoon" value={name} onChange={(e) => setName(e.target.value)} maxLength={32} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Symbol</label><Input placeholder="DOGEM" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} maxLength={10} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Total Supply</label><Input type="number" placeholder="1000000000" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Liquidity %</label><Input type="number" placeholder="20" min="1" max="100" value={liquidityPercent} onChange={(e) => setLiquidityPercent(e.target.value)} /></div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">ETH to Send</label>
          <Input type="number" step="0.01" placeholder="0.1" min={minEth} value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
          <p className="text-xs text-muted-foreground">Minimum: {minEth} ETH</p>
        </div>
        {ethValue > 0 && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Launch Fee (1%)</span><span className="text-foreground font-mono">{launchFee.toFixed(4)} ETH</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Net Liquidity</span><span className="text-primary font-mono font-medium">{netLiquidity.toFixed(4)} ETH</span></div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">💡 1% launch fee supports Base builders</p>
          </div>
        )}
        {!isConnected ? <p className="text-center text-sm text-muted-foreground py-2">Connect your wallet to launch</p> : (
          <Button variant="glow" size="xl" className="w-full" onClick={handleLaunch} disabled={!isValidForm || isPending || isConfirming}>
            {isPending || isConfirming ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />{isConfirming ? 'Confirming...' : 'Launching...'}</> : <><Rocket className="h-5 w-5 mr-2" />Launch Meme 🚀</>}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
