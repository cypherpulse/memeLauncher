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
      <section className="w-full px-4 sm:px-0">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">Recent Launches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      <section className="w-full px-4 sm:px-0">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">Recent Launches</h2>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">No memes launched yet. Be the first! 🚀</p>
        </div>
      </section>
    );
  }

  // Show most recent first, limit to 6
  const recentTokens = [...launchedTokens].reverse().slice(0, 6);

  return (
    <section className="w-full px-4 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Recent Launches</h2>
          <p className="text-sm text-muted-foreground mt-1">See what the community is building</p>
        </div>
        <div className="text-right">
          <span className="text-xs sm:text-sm text-muted-foreground">{launchedTokens.length} total</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {recentTokens.map((tokenAddress, index) => (
          <div
            key={tokenAddress}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">#{launchedTokens.length - index}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Token #{launchedTokens.length - index}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => copyToClipboard(tokenAddress)}
                  >
                    {copiedAddress === tokenAddress ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                  <code className="text-xs font-mono text-foreground break-all leading-relaxed">
                    {truncateAddress(tokenAddress)}
                  </code>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs"
                    asChild
                  >
                    <a
                      href={`${BASESCAN_URL}/address/${tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs"
                    asChild
                  >
                    <a
                      href={`${UNISWAP_URL}/#/swap?chain=base_sepolia&outputCurrency=${tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Trade
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
