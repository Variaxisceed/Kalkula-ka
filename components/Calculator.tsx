import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { DeleteIcon, SparklesIcon, HistoryIcon } from './Icons';
import { CalculatorState, HistoryItem, Operator } from '../types';
import { solveMathWithGemini } from '../services/geminiService';

export const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    currentValue: '0',
    previousValue: null,
    operator: null,
    history: [],
    isNewEntry: true,
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of history when added
  useEffect(() => {
    if (showHistory && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.history, showHistory]);

  const handleNumber = (num: string) => {
    setState(prev => {
      if (prev.isNewEntry) {
        return { ...prev, currentValue: num, isNewEntry: false };
      }
      return { ...prev, currentValue: prev.currentValue === '0' ? num : prev.currentValue + num };
    });
  };

  const handleDecimal = () => {
    setState(prev => {
      if (prev.isNewEntry) {
        return { ...prev, currentValue: '0.', isNewEntry: false };
      }
      if (!prev.currentValue.includes('.')) {
        return { ...prev, currentValue: prev.currentValue + '.' };
      }
      return prev;
    });
  };

  const handleOperator = (op: Operator) => {
    setState(prev => {
      if (prev.operator && !prev.isNewEntry && prev.previousValue) {
        // Calculate intermediate result
        const result = calculate(prev.previousValue, prev.currentValue, prev.operator);
        return {
          ...prev,
          previousValue: result.toString(),
          currentValue: result.toString(),
          operator: op,
          isNewEntry: true,
        };
      }
      return {
        ...prev,
        previousValue: prev.currentValue,
        operator: op,
        isNewEntry: true,
      };
    });
  };

  const calculate = (a: string, b: string, op: Operator): number => {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    switch (op) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '*': return num1 * num2;
      case '/': return num2 !== 0 ? num1 / num2 : 0;
      case '%': return (num1 * num2) / 100;
      default: return num2;
    }
  };

  const handleEqual = () => {
    setState(prev => {
      if (!prev.operator || !prev.previousValue) return prev;
      
      const result = calculate(prev.previousValue, prev.currentValue, prev.operator);
      const expression = `${prev.previousValue} ${prev.operator} ${prev.currentValue}`;
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression,
        result: result.toString(),
        timestamp: Date.now(),
      };

      return {
        ...prev,
        currentValue: result.toString(),
        previousValue: null,
        operator: null,
        isNewEntry: true,
        history: [newHistoryItem, ...prev.history].slice(0, 50), // Keep last 50
      };
    });
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      currentValue: '0',
      previousValue: null,
      operator: null,
      isNewEntry: true,
    }));
  };

  const handleBackspace = () => {
    setState(prev => {
      if (prev.isNewEntry) return prev;
      const newVal = prev.currentValue.slice(0, -1);
      return { ...prev, currentValue: newVal === '' ? '0' : newVal };
    });
  };

  const handlePercentage = () => {
     handleOperator('%');
  };

  const handleNegate = () => {
    setState(prev => ({
        ...prev,
        currentValue: (parseFloat(prev.currentValue) * -1).toString()
    }));
  };

  // AI Logic
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    const result = await solveMathWithGemini(aiPrompt);
    setIsAiLoading(false);

    if (result) {
        // Improved parsing to extract numbers from potential strings like "x = 5" or "100 Kč"
        // Matches integers or decimals, possibly negative
        const numericMatch = result.answer.match(/-?[\d\s]+([.,]\d+)?/);
        
        let numericAnswer = NaN;
        if (numericMatch) {
             // Replace decimal comma with dot if present and remove spaces
             const normalized = numericMatch[0].replace(/\s/g, '').replace(',', '.');
             numericAnswer = parseFloat(normalized);
        }

        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            expression: aiPrompt,
            result: result.answer,
            timestamp: Date.now(),
            isAi: true
        };

        setState(prev => ({
            ...prev,
            currentValue: !isNaN(numericAnswer) ? numericAnswer.toString() : prev.currentValue,
            isNewEntry: true,
            history: [newHistoryItem, ...prev.history].slice(0, 50)
        }));
        setAiPrompt('');
        setShowAiInput(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-center p-4 min-h-[600px] w-full max-w-5xl mx-auto">
      
      {/* Main Calculator */}
      <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-sm flex flex-col gap-4 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

        {/* Display */}
        <div className="relative z-10 bg-slate-950/50 rounded-2xl p-6 mb-2 flex flex-col items-end justify-end h-32 break-all shadow-inner border border-slate-800/50">
          <div className="text-slate-400 text-sm h-6 mb-1">
            {state.previousValue} {state.operator}
          </div>
          <div className={`text-4xl font-bold tracking-tight text-white transition-all ${state.currentValue.length > 10 ? 'text-2xl' : 'text-4xl'}`}>
            {state.currentValue}
          </div>
        </div>

        {/* AI Toggle Bar */}
        <div className="flex gap-2 z-10">
            <button 
                onClick={() => setShowAiInput(!showAiInput)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${showAiInput ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                <SparklesIcon className="w-4 h-4" />
                AI Asistent
            </button>
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${showHistory ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                <HistoryIcon className="w-4 h-4" />
                Historie
            </button>
        </div>

        {/* AI Input Panel (Collapsible) */}
        {showAiInput && (
             <form onSubmit={handleAiSubmit} className="relative z-20 flex gap-2 animate-in slide-in-from-top-4 duration-200">
                <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Např. 15% z 850..."
                    className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                />
                <button 
                    type="submit" 
                    disabled={isAiLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 transition-colors"
                >
                    {isAiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                </button>
             </form>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3 relative z-10">
            <Button label="C" onClick={handleClear} variant="danger" />
            <Button label="+/-" onClick={handleNegate} variant="secondary" />
            <Button label="%" onClick={handlePercentage} variant="secondary" />
            <Button label={<span className="text-xl">÷</span>} onClick={() => handleOperator('/')} variant="accent" />

            <Button label="7" onClick={() => handleNumber('7')} />
            <Button label="8" onClick={() => handleNumber('8')} />
            <Button label="9" onClick={() => handleNumber('9')} />
            <Button label={<span className="text-xl">×</span>} onClick={() => handleOperator('*')} variant="accent" />

            <Button label="4" onClick={() => handleNumber('4')} />
            <Button label="5" onClick={() => handleNumber('5')} />
            <Button label="6" onClick={() => handleNumber('6')} />
            <Button label={<span className="text-xl">-</span>} onClick={() => handleOperator('-')} variant="accent" />

            <Button label="1" onClick={() => handleNumber('1')} />
            <Button label="2" onClick={() => handleNumber('2')} />
            <Button label="3" onClick={() => handleNumber('3')} />
            <Button label={<span className="text-xl">+</span>} onClick={() => handleOperator('+')} variant="accent" />

            <Button label="0" onClick={() => handleNumber('0')} double />
            <Button label="." onClick={handleDecimal} />
            <Button label={<span className="text-xl">=</span>} onClick={handleEqual} variant="primary" />
        </div>
      </div>

      {/* History Panel (Responsive) */}
      {showHistory && (
          <div className="w-full md:w-72 bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl h-[500px] flex flex-col animate-in slide-in-from-right-10 duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Historie</h3>
                <button onClick={() => setState(s => ({...s, history: []}))} className="text-xs text-red-400 hover:text-red-300">Vymazat</button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                {state.history.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">Žádná historie</div>
                ) : (
                    state.history.map((item) => (
                        <div key={item.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                            <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                                <span>{item.isAi && <SparklesIcon className="w-3 h-3 inline mr-1 text-indigo-400" />} {item.expression}</span>
                            </div>
                            <div className="text-right text-lg font-medium text-slate-200">{item.result}</div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
          </div>
      )}

    </div>
  );
};