import React from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps extends Readonly<Options> {
    className?: string;
}

export function MarkdownRenderer({ children, className, ...props }: MarkdownRendererProps) {
    return (
        <div className={cn("prose dark:prose-invert max-w-none text-sm text-muted-foreground", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                {...props}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
