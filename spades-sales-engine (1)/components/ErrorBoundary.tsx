import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary component to catch and handle frontend errors gracefully.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  public readonly props: Readonly<Props>;

  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FRONTEND ERROR]', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-md">
                <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
                <p className="text-zinc-400 text-sm mb-4">The application encountered an unexpected error.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white text-zinc-900 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
                >
                    Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}