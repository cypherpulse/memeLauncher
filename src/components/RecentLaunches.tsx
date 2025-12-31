import { useReadContract } from 'wagmi';
import { LAUNCHER_ADDRESS, LAUNCHER_ABI, BASESCAN_URL, UNISWAP_URL } from '@/lib/contract';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function RecentLaunches() {
  const { data: launchedTokens, isLoading } = useReadContract({
    address: LAUNCHER_ADDRESS,
    abi: LAUNCHER_ABI,
    functionName: 'getAllLaunchedTokens',
  });

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Recent Launches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!launchedTokens || launchedTokens.length === 0) {
    return (
      <section className="w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Recent Launches</h2>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-muted-foreground">No memes launched yet. Be the first! 🚀</p>
        </div>
      </section>
    );
  }

  // Show most recent first, limit to 6
  const recentTokens = [...launchedTokens].reverse().slice(0, 6);

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Recent Launches</h2>
        <span className="text-sm text-muted-foreground">{launchedTokens.length} total</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentTokens.map((tokenAddress, index) => (
          <div
            key={tokenAddress}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Token #{launchedTokens.length - index}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(tokenAddress)}
                  >
                    {copiedAddress === tokenAddress ? (
                      <Check className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="font-mono text-sm text-foreground mb-3">{truncateAddress(tokenAddress)}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  asChild
                >
                  <a
                    href={`${BASESCAN_URL}/token/${tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Basescan
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  asChild
                >
                  <a
                    href={`${UNISWAP_URL}/#/swap?chain=base_sepolia&outputCurrency=${tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Swap
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
