import { useState, useRef, useEffect } from 'react';
import { ChecklistItem } from '@/types';
import { Plus, X, ListTodo, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface ChecklistProps {
    items: ChecklistItem[];
    onChange: (items: ChecklistItem[]) => void;
    readonly?: boolean;
}

export function Checklist({ items, onChange, readonly = false }: ChecklistProps) {
    // Ensure there is always an empty item at the end if not readonly
    useEffect(() => {
        if (!readonly) {
            if (items.length === 0 || items[items.length - 1].text !== '') {
                onChange([...items, { id: uuidv4(), text: '', completed: false }]);
            }
        }
    }, [items, readonly, onChange]);

    const handleChange = (id: string, text: string) => {
        const newItems = items.map(item => item.id === id ? { ...item, text } : item);
        onChange(newItems);
    };

    const handleToggle = (id: string) => {
        if (readonly) return;
        const item = items.find(i => i.id === id);
        if (item && item.text.trim() === '') return; // Cannot check empty item

        const newItems = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
        onChange(newItems);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // If current item is the last one and is empty, do nothing
            if (index === items.length - 1 && items[index].text === '') return;

            const nextIndex = index + 1;

            // If next item exists and is empty, just focus it
            if (items[nextIndex] && items[nextIndex].text === '') {
                setTimeout(() => {
                    const inputs = document.querySelectorAll<HTMLInputElement>('input[data-checklist-input]');
                    if (inputs[nextIndex]) inputs[nextIndex].focus();
                }, 0);
                return;
            }

            // Otherwise, insert new item below (e.g. between two tasks)
            const newItem = { id: uuidv4(), text: '', completed: false };
            const newItems = [...items];
            newItems.splice(nextIndex, 0, newItem);
            onChange(newItems);

            setTimeout(() => {
                const inputs = document.querySelectorAll<HTMLInputElement>('input[data-checklist-input]');
                if (inputs[nextIndex]) inputs[nextIndex].focus();
            }, 0);
        } else if (e.key === 'Backspace' && items[index].text === '') {
            // Cannot delete the last item if it's the only one or the trailing empty one
            if (index === items.length - 1) return;

            e.preventDefault();
            const newItems = items.filter((_, i) => i !== index);
            onChange(newItems);

            setTimeout(() => {
                const inputs = document.querySelectorAll<HTMLInputElement>('input[data-checklist-input]');
                if (inputs[index - 1]) {
                    inputs[index - 1].focus();
                } else if (inputs[index]) {
                    inputs[index].focus();
                }
            }, 0);
        }
    };

    const handleDelete = (id: string) => {
        const index = items.findIndex(i => i.id === id);
        if (index === items.length - 1) return; // Cannot delete last item manually either

        const newItems = items.filter(item => item.id !== id);
        onChange(newItems);
    };

    if (readonly && items.length === 0) return null;

    // Filter out trailing empty item for read-only view
    const displayItems = readonly ? items.filter(i => i.text.trim() !== '') : items;

    return (
        <div className="space-y-3">
            {!readonly && (
                <div className="flex items-center gap-2 text-primary font-medium text-sm w-full">
                    <ListTodo size={14} />
                    <span>Plan your steps</span>
                </div>
            )}

            <div className="space-y-2">
                {displayItems.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isEmpty = item.text.trim() === '';

                    return (
                        <div key={item.id} className="group flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            {isEmpty ? (
                                <div className="mt-1 w-5 h-5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleToggle(item.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                        item.completed
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : "border-white/20 bg-black/20",
                                        !item.completed && !readonly && "hover:border-emerald-500/50",
                                    )}
                                    disabled={readonly}
                                >
                                    {item.completed && <Check size={14} strokeWidth={3} />}
                                </button>
                            )}

                            <div className="flex-1 relative">
                                <input
                                    data-checklist-input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => handleChange(item.id, e.target.value)}
                                    onKeyDown={(e) => !readonly && handleKeyDown(e, index)}
                                    placeholder={index === 0 && items.length === 1 ? "Step 1: Define the goal..." : "Next step..."}
                                    className={cn(
                                        "w-full bg-transparent border-none p-0 focus:ring-0 text-sm placeholder:text-muted-foreground/40",
                                        item.completed && "text-muted-foreground line-through decoration-emerald-500/50 decoration-2"
                                    )}
                                    readOnly={readonly}
                                    disabled={readonly}
                                />
                            </div>

                            {!readonly && !isLast && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    className={cn(
                                        "text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100",
                                    )}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
