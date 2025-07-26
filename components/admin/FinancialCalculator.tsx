"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';

interface CalculatorProps {
  type: 'compound_interest' | 'mortgage' | 'investment_return' | 'budget';
  title?: string;
  description?: string;
}

export default function FinancialCalculator({ type, title, description }: CalculatorProps) {
  const [results, setResults] = useState<any>(null);

  switch (type) {
    case 'compound_interest':
      return <CompoundInterestCalculator title={title} description={description} />;
    case 'mortgage':
      return <MortgageCalculator title={title} description={description} />;
    case 'investment_return':
      return <InvestmentReturnCalculator title={title} description={description} />;
    case 'budget':
      return <BudgetCalculator title={title} description={description} />;
    default:
      return <div>Unknown calculator type</div>;
  }
}

function CompoundInterestCalculator({ title = "Compound Interest Calculator", description }: { title?: string; description?: string }) {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('1');
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseInt(frequency);

    if (p && r && t && n) {
      const amount = p * Math.pow(1 + r / n, n * t);
      const interest = amount - p;
      
      setResults({
        principal: p,
        interest: interest,
        total: amount,
        breakdown: Array.from({ length: Math.min(10, Math.ceil(t)) }, (_, i) => {
          const year = i + 1;
          const yearAmount = p * Math.pow(1 + r / n, n * year);
          return { year, amount: yearAmount, interest: yearAmount - p };
        })
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="principal">Principal Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="time">Time (Years)</Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="10"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Compounding Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Annually</SelectItem>
                <SelectItem value="2">Semi-annually</SelectItem>
                <SelectItem value="4">Quarterly</SelectItem>
                <SelectItem value="12">Monthly</SelectItem>
                <SelectItem value="365">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculate} className="w-full">
          Calculate
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Principal</div>
                  <div className="text-2xl font-bold">${results.principal.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Interest Earned</div>
                  <div className="text-2xl font-bold text-green-600">${results.interest.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">${results.total.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year-by-Year Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.breakdown.map((year: any) => (
                    <div key={year.year} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Year {year.year}</span>
                      <div className="text-right">
                        <div className="font-medium">${year.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">+${year.interest.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MortgageCalculator({ title = "Mortgage Payment Calculator", description }: { title?: string; description?: string }) {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment || '0');
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;

    if (principal && rate && term) {
      const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      const totalPayment = monthlyPayment * term;
      const totalInterest = totalPayment - principal;

      setResults({
        monthlyPayment,
        totalPayment,
        totalInterest,
        principal,
        downPayment: parseFloat(downPayment || '0'),
        loanAmount: parseFloat(loanAmount)
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loan-amount">Loan Amount ($)</Label>
            <Input
              id="loan-amount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="300000"
            />
          </div>
          <div>
            <Label htmlFor="down-payment">Down Payment ($)</Label>
            <Input
              id="down-payment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="60000"
            />
          </div>
          <div>
            <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="4.5"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="loan-term">Loan Term (Years)</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculate} className="w-full">
          Calculate
        </Button>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Monthly Payment</div>
                <div className="text-2xl font-bold">${results.monthlyPayment.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Interest</div>
                <div className="text-2xl font-bold text-red-600">${results.totalInterest.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Payment</div>
                <div className="text-2xl font-bold">${results.totalPayment.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Down Payment</div>
                <div className="text-2xl font-bold">${results.downPayment.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvestmentReturnCalculator({ title = "Investment Return Calculator", description }: { title?: string; description?: string }) {
  const [initialInvestment, setInitialInvestment] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const initial = parseFloat(initialInvestment);
    const final = parseFloat(finalValue);
    const time = parseFloat(timePeriod);

    if (initial && final && time) {
      const totalReturn = final - initial;
      const percentageReturn = (totalReturn / initial) * 100;
      const annualizedReturn = (Math.pow(final / initial, 1 / time) - 1) * 100;

      setResults({
        totalReturn,
        percentageReturn,
        annualizedReturn,
        initial,
        final,
        time
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="initial-investment">Initial Investment ($)</Label>
            <Input
              id="initial-investment"
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              placeholder="10000"
            />
          </div>
          <div>
            <Label htmlFor="final-value">Final Value ($)</Label>
            <Input
              id="final-value"
              type="number"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              placeholder="15000"
            />
          </div>
          <div>
            <Label htmlFor="time-period">Time Period (Years)</Label>
            <Input
              id="time-period"
              type="number"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              placeholder="5"
              step="0.1"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full">
          Calculate
        </Button>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Return</div>
                <div className="text-2xl font-bold text-green-600">${results.totalReturn.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Percentage Return</div>
                <div className="text-2xl font-bold">{results.percentageReturn.toFixed(2)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Annualized Return</div>
                <div className="text-2xl font-bold">{results.annualizedReturn.toFixed(2)}%</div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetCalculator({ title = "Budget Calculator", description }: { title?: string; description?: string }) {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([
    { category: 'Housing', amount: '' },
    { category: 'Transportation', amount: '' },
    { category: 'Food', amount: '' },
    { category: 'Utilities', amount: '' },
    { category: 'Entertainment', amount: '' },
    { category: 'Healthcare', amount: '' },
    { category: 'Savings', amount: '' },
    { category: 'Other', amount: '' }
  ]);
  const [results, setResults] = useState<any>(null);

  const updateExpense = (index: number, amount: string) => {
    const newExpenses = [...expenses];
    newExpenses[index].amount = amount;
    setExpenses(newExpenses);
  };

  const calculate = () => {
    const monthlyIncome = parseFloat(income);
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
    const remaining = monthlyIncome - totalExpenses;
    const savingsRate = (remaining / monthlyIncome) * 100;

    setResults({
      income: monthlyIncome,
      totalExpenses,
      remaining,
      savingsRate,
      expenses: expenses.filter(e => parseFloat(e.amount || '0') > 0)
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="income">Monthly Income ($)</Label>
          <Input
            id="income"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="5000"
          />
        </div>

        <div className="space-y-2">
          <Label>Monthly Expenses</Label>
          {expenses.map((expense, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={expense.amount}
                onChange={(e) => updateExpense(index, e.target.value)}
                placeholder="0"
                type="number"
                className="flex-1"
              />
              <div className="w-32 text-sm text-muted-foreground flex items-center">
                {expense.category}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={calculate} className="w-full">
          Calculate Budget
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Income</div>
                  <div className="text-2xl font-bold text-green-600">${results.income.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-600">${results.totalExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold">${results.remaining.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.expenses.map((expense: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{expense.category}</span>
                      <span className="font-medium">${parseFloat(expense.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 