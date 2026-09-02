interface NewsArticle {
  id: number;
  datetime: number;
  headline: string;
  source: string;
  summary: string;
  url: string;
  image: string;
  sentiment: {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    score: number;
  };
}

export function NewsCard({ article }: { article: NewsArticle }) {
  const date = new Date(article.datetime * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sentimentConfig = {
    POSITIVE: {
      label: 'Positive',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    NEGATIVE: {
      label: 'Negative',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
    },
    NEUTRAL: {
      label: 'Neutral',
      className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    },
  };

  const config = sentimentConfig[article.sentiment.sentiment];

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
    >
      {article.image ? (
        <img
          src={article.image}
          alt=""
          className="hidden h-24 w-24 shrink-0 rounded-lg object-cover sm:block"
        />
      ) : (
        <div className="hidden h-24 w-24 shrink-0 rounded-lg bg-muted sm:block" />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {article.source}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        </div>

        <h3 className="font-semibold leading-snug transition-colors group-hover:text-primary line-clamp-2">
          {article.headline}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
      </div>
    </a>
  );
}