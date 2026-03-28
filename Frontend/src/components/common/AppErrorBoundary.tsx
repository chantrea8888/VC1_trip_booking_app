import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
  stack?: string;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message, stack: error instanceof Error ? error.stack : undefined };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
        <div className="max-w-3xl mx-auto border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 rounded-2xl p-5">
          <h1 className="text-lg font-extrabold">App crashed</h1>
          <p className="mt-2 text-sm break-words">{this.state.message}</p>
          {this.state.stack && (
            <pre className="mt-4 text-xs whitespace-pre-wrap break-words opacity-80">{this.state.stack}</pre>
          )}
          <p className="mt-4 text-xs opacity-80">Open DevTools Console to see the full error and file/line.</p>
        </div>
      </div>
    );
  }
}

